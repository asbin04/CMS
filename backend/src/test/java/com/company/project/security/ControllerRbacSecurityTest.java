package com.company.project.security;

import com.company.project.security.entity.AppUser;
import com.company.project.security.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ControllerRbacSecurityTest {

    static {
        File[] envFiles = new File[] { new File(".env"), new File("backend/.env"), new File("../.env") };
        for (File envFile : envFiles) {
            if (envFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#"))
                            continue;
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
                } catch (Exception ignored) {
                }
                break;
            }
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String readOnlyToken;

    @BeforeEach
    void setUp() {
        AppUser viewer = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase("viewer.user", "viewer.user@kalpanaaa.in")
                .orElseGet(() -> AppUser.builder()
                        .username("viewer.user")
                        .email("viewer.user@kalpanaaa.in")
                        .passwordHash(passwordEncoder.encode("ViewerPass@123"))
                        .displayName("Viewer User")
                        .role("CEO")
                        .status("ACTIVE")
                        .passwordChangedAt(Instant.now())
                        .build());
        viewer.setRole("CEO");
        viewer.setStatus("ACTIVE");
        userRepository.save(viewer);

        readOnlyToken = "Bearer " + jwtTokenProvider.generateToken("viewer.user", "CEO");
    }

    @Test
    @DisplayName("AttendanceController: POST /api/v1/attendance returns 403 Forbidden for read-only user")
    void testAttendanceWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "employeeId": "EMP-001",
                    "employeeName": "Test Employee",
                    "attendanceDate": "31 Oct 2026",
                    "status": "Present"
                }
                """;
        mockMvc.perform(post("/api/v1/attendance")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ClientController: POST /api/v1/clients returns 403 Forbidden for read-only user")
    void testClientWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "clientName": "Test Client",
                    "companyName": "Test Co",
                    "industry": "IT",
                    "contactPerson": "Alice",
                    "email": "alice@test.com",
                    "phone": "+91 98765 43210",
                    "country": "India",
                    "city": "Bengaluru",
                    "clientType": "Standard",
                    "accountOwner": "Admin",
                    "status": "Active"
                }
                """;
        mockMvc.perform(post("/api/v1/clients")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CollectionsController: POST /api/v1/collections/invoices returns 403 Forbidden for read-only user")
    void testCollectionsWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "client": "Acme Corp",
                    "invoiceDate": "01 Jan 2026",
                    "dueDate": "15 Jan 2026",
                    "outstanding": 5000.00
                }
                """;
        mockMvc.perform(post("/api/v1/collections/invoices")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ApprovalController: POST /api/v1/approvals/employee returns 403 Forbidden for read-only user")
    void testApprovalWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "employee_name": "Test Emp",
                    "employee_code": "EMP-001",
                    "request_type": "Sick Leave",
                    "from_date": "01 Nov 2026",
                    "to_date": "02 Nov 2026",
                    "duration": "2 days",
                    "status": "Pending"
                }
                """;
        mockMvc.perform(post("/api/v1/approvals/employee")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ContractController: POST /api/v1/contracts returns 403 Forbidden for read-only user")
    void testContractWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "clientId": "CLI-001",
                    "contractType": "Service",
                    "startDate": "01 Jan 2026",
                    "endDate": "31 Dec 2026",
                    "contractValue": 100000.00
                }
                """;
        mockMvc.perform(post("/api/v1/contracts")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DashboardController: PUT /api/v1/dashboard/ceo returns 403 Forbidden for read-only user")
    void testDashboardWriteForbiddenForReadOnly() throws Exception {
        mockMvc.perform(put("/api/v1/dashboard/ceo")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("EmployeeMasterController: POST /api/v1/employees returns 403 Forbidden for read-only user")
    void testEmployeeMasterWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "fullName": "Test Employee",
                    "workEmail": "test.emp@company.internal",
                    "phone": "+919876543210",
                    "department": "Engineering",
                    "designation": "Developer",
                    "joiningDate": "01 Jan 2026",
                    "monthlyCtc": 50000.00
                }
                """;
        mockMvc.perform(post("/api/v1/employees")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("FollowUpController: PUT /api/v1/follow-up-queue/1/toggle-done returns 403 Forbidden for read-only user")
    void testFollowUpWriteForbiddenForReadOnly() throws Exception {
        mockMvc.perform(put("/api/v1/follow-up-queue/1/toggle-done")
                .header("Authorization", readOnlyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("OpportunityController: POST /api/v1/opportunities returns 403 Forbidden for read-only user")
    void testOpportunityWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "clientId": "CLI-001",
                    "opportunityName": "Test Opportunity",
                    "ownerId": "EMP-001",
                    "serviceId": "SRV-001",
                    "stage": "Lead",
                    "probability": 50,
                    "estimatedValue": 10000.00,
                    "status": "Open"
                }
                """;
        mockMvc.perform(post("/api/v1/opportunities")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("LeaveController: POST /api/v1/leaves returns 403 Forbidden for read-only user")
    void testLeaveWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "employeeId": "EMP-001",
                    "employeeName": "Test Employee",
                    "leaveType": "Sick Leave",
                    "fromDate": "2026-11-01",
                    "toDate": "2026-11-02",
                    "days": 2
                }
                """;
        mockMvc.perform(post("/api/v1/leaves")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("NotificationController: POST /api/v1/notifications/read-all returns 403 Forbidden for read-only user")
    void testNotificationWriteForbiddenForReadOnly() throws Exception {
        mockMvc.perform(post("/api/v1/notifications/read-all")
                .header("Authorization", readOnlyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ProposalController: PATCH /api/v1/proposals/P-2025-001/status returns 403 Forbidden for read-only user")
    void testProposalWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "status": "Approved"
                }
                """;
        mockMvc.perform(patch("/api/v1/proposals/P-2025-001/status")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("LeadController: POST /api/v1/leads returns 403 Forbidden for read-only user")
    void testLeadWriteForbiddenForReadOnly() throws Exception {
        String body = """
                {
                    "company": "Acme Corp",
                    "contactName": "John Doe",
                    "email": "john@acme.com",
                    "phone": "+919876543210",
                    "source": "Website",
                    "serviceInterest": "Consulting",
                    "country": "India",
                    "city": "Mumbai",
                    "ownerId": "EMP-001",
                    "stage": "New",
                    "status": "New"
                }
                """;
        mockMvc.perform(post("/api/v1/leads")
                .header("Authorization", readOnlyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Non-admin user receives 403 Forbidden even on GET requests (ADMIN-only panel)")
    void testReadOnlyUserCannotPerformGet() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/ceo")
                .header("Authorization", readOnlyToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to protected endpoint returns 401 Unauthorized")
    void testUnauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/ceo"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Reset endpoints strictly require ADMIN role for single and nested paths")
    void testResetEndpointsForbiddenForReadOnlyUser() throws Exception {
        mockMvc.perform(post("/api/v1/approvals/reset")
                        .header("Authorization", readOnlyToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/nested/scope/reset")
                        .header("Authorization", readOnlyToken))
                .andExpect(status().isForbidden());
    }
}
