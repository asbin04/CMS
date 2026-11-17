package com.company.project.sales;

import com.company.project.sales.dto.CreateLeadRequest;
import com.company.project.sales.dto.LeadResponse;
import com.company.project.sales.repository.LeadRepository;
import com.company.project.sales.service.LeadService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class LeadConcurrencyTest {

    static {
        File[] envFiles = new File[]{ new File(".env"), new File("backend/.env"), new File("../.env") };
        for (File envFile : envFiles) {
            if (envFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }
        }
    }

    @Autowired
    private LeadService leadService;

    @Autowired
    private LeadRepository leadRepository;

    private final List<String> createdLeadIds = Collections.synchronizedList(new ArrayList<>());

    @AfterEach
    void tearDown() {
        for (String id : createdLeadIds) {
            try {
                leadRepository.deleteById(id);
            } catch (Exception ignored) {}
        }
        createdLeadIds.clear();
    }

    @Test
    @DisplayName("Should concurrently create 20 leads in parallel with zero duplicate IDs")
    void testConcurrentLeadCreationWithNoDuplicates() throws InterruptedException, ExecutionException {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        List<Future<LeadResponse>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                // Wait for all threads to be ready to execute at the exact same moment
                startLatch.await();

                CreateLeadRequest request = CreateLeadRequest.builder()
                        .company("Concurrent Company " + index)
                        .contactName("Contact Person " + (char)('A' + (index % 26)))
                        .email("concurrent" + index + "@test.com")
                        .phone("98765432" + String.format("%02d", index % 100))
                        .source("Website")
                        .serviceInterest("Cloud Services")
                        .country("India")
                        .city("Bangalore")
                        .ownerId("EMP-001")
                        .stage("New")
                        .status("Open")
                        .estimatedValue(BigDecimal.valueOf(100000 + index * 1000))
                        .leadScore(85)
                        .leadDate(LocalDate.now())
                        .build();

                return leadService.createLead(request);
            }));
        }

        // Wait for all threads to be spawned and ready
        readyLatch.await(10, TimeUnit.SECONDS);
        // Release all threads simultaneously
        startLatch.countDown();

        Set<String> generatedIds = new HashSet<>();
        for (Future<LeadResponse> future : futures) {
            LeadResponse response = future.get();
            assertNotNull(response);
            assertNotNull(response.getId());
            createdLeadIds.add(response.getId());
            boolean isUnique = generatedIds.add(response.getId());
            assertTrue(isUnique, "Duplicate lead ID generated: " + response.getId());
        }

        assertEquals(threadCount, generatedIds.size(), "All 20 concurrently created leads must have distinct unique IDs");
        assertEquals(threadCount, createdLeadIds.size());

        executor.shutdown();
        assertTrue(executor.awaitTermination(10, TimeUnit.SECONDS));
    }
}

