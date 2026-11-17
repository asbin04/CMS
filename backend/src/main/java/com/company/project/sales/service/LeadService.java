package com.company.project.sales.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.common.util.TrendCalculationUtil;
import com.company.project.sales.dto.*;
import com.company.project.sales.entity.LeadEntity;
import com.company.project.sales.repository.LeadRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.company.project.notification.service.NotificationService;

import java.math.BigDecimal;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadIdGeneratorService leadIdGeneratorService;
    private final NotificationService notificationService;

    public LeadService(
            LeadRepository leadRepository,
            LeadIdGeneratorService leadIdGeneratorService,
            @Nullable NotificationService notificationService) {
        this.leadRepository = leadRepository;
        this.leadIdGeneratorService = leadIdGeneratorService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<LeadResponse> getLeads(
            Pageable pageable,
            String search,
            String stage,
            String status,
            String ownerId,
            String source
    ) {
        Specification<LeadEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                Predicate companyMatch = cb.like(cb.lower(root.get("company")), searchLower);
                Predicate contactMatch = cb.like(cb.lower(root.get("contactName")), searchLower);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchLower);
                Predicate idMatch = cb.like(cb.lower(root.get("id")), searchLower);
                predicates.add(cb.or(companyMatch, contactMatch, emailMatch, idMatch));
            }

            if (stage != null && !stage.isBlank() && !"All".equalsIgnoreCase(stage)) {
                predicates.add(cb.equal(cb.lower(root.get("stage")), stage.trim().toLowerCase()));
            }

            if (status != null && !status.isBlank() && !"All".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            if (ownerId != null && !ownerId.isBlank() && !"All".equalsIgnoreCase(ownerId)) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId.trim()));
            }

            if (source != null && !source.isBlank() && !"All".equalsIgnoreCase(source)) {
                predicates.add(cb.equal(cb.lower(root.get("source")), source.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<LeadEntity> pageResult = leadRepository.findAll(spec, pageable);
        List<LeadResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.<LeadResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<LeadResponse> getAllLeadsUnpaged(
            String search,
            String stage,
            String status,
            String ownerId,
            String source
    ) {
        Specification<LeadEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                Predicate companyMatch = cb.like(cb.lower(root.get("company")), searchLower);
                Predicate contactMatch = cb.like(cb.lower(root.get("contactName")), searchLower);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchLower);
                Predicate idMatch = cb.like(cb.lower(root.get("id")), searchLower);
                predicates.add(cb.or(companyMatch, contactMatch, emailMatch, idMatch));
            }

            if (stage != null && !stage.isBlank() && !"All".equalsIgnoreCase(stage)) {
                predicates.add(cb.equal(cb.lower(root.get("stage")), stage.trim().toLowerCase()));
            }

            if (status != null && !status.isBlank() && !"All".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.lower(root.get("status")), status.trim().toLowerCase()));
            }

            if (ownerId != null && !ownerId.isBlank() && !"All".equalsIgnoreCase(ownerId)) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId.trim()));
            }

            if (source != null && !source.isBlank() && !"All".equalsIgnoreCase(source)) {
                predicates.add(cb.equal(cb.lower(root.get("source")), source.trim().toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return leadRepository.findAll(spec).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(String id) {
        LeadEntity entity = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        return mapToResponse(entity);
    }

    private static final String COMPANY_REGEX = "^(?=.*[\\p{L}])[\\p{L}0-9\\s.'&/()#,-]+$";
    private static final String CONTACT_NAME_REGEX = "^(?=[^0-9]*$)(?=[\\s.'-]*\\p{L})[\\p{L}\\s.'-]+$";
    private static final String EMAIL_REGEX = "^(?!.*\\.\\.)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\.[a-zA-Z]{2,}$";
    private static final String PHONE_REGEX = "^[6-9]\\d{9}$";

    public static final Map<String, String> EMAIL_DOMAIN_TYPOS = Map.ofEntries(
            Map.entry("gmil.com", "gmail.com"),
            Map.entry("gmial.com", "gmail.com"),
            Map.entry("gmai.com", "gmail.com"),
            Map.entry("gamil.com", "gmail.com"),
            Map.entry("gmaill.com", "gmail.com"),
            Map.entry("gmal.com", "gmail.com"),
            Map.entry("gmaik.com", "gmail.com"),
            Map.entry("gemail.com", "gmail.com"),
            Map.entry("gil.com", "gmail.com"),
            Map.entry("gmail.con", "gmail.com"),
            Map.entry("gmail.co", "gmail.com"),
            Map.entry("gmail.cm", "gmail.com"),
            Map.entry("gmaio.com", "gmail.com"),
            Map.entry("gmaol.com", "gmail.com"),
            Map.entry("gmeil.com", "gmail.com"),
            Map.entry("gmsil.com", "gmail.com"),
            Map.entry("gml.com", "gmail.com"),
            Map.entry("gml.co", "gmail.com"),
            Map.entry("gmaill.con", "gmail.com"),
            Map.entry("gmai.con", "gmail.com"),
            Map.entry("gmil.con", "gmail.com"),
            Map.entry("yaho.com", "yahoo.com"),
            Map.entry("yahooo.com", "yahoo.com"),
            Map.entry("yaho.co", "yahoo.com"),
            Map.entry("yaho.in", "yahoo.in"),
            Map.entry("yahoo.con", "yahoo.com"),
            Map.entry("yaho.con", "yahoo.com"),
            Map.entry("yahoou.com", "yahoo.com"),
            Map.entry("hotmial.com", "hotmail.com"),
            Map.entry("hotmai.com", "hotmail.com"),
            Map.entry("hotamail.com", "hotmail.com"),
            Map.entry("hotmail.con", "hotmail.com"),
            Map.entry("outlok.com", "outlook.com"),
            Map.entry("outloo.com", "outlook.com"),
            Map.entry("ootlook.com", "outlook.com"),
            Map.entry("outlook.con", "outlook.com"),
            Map.entry("iclud.com", "icloud.com"),
            Map.entry("iclou.com", "icloud.com"),
            Map.entry("icloud.con", "icloud.com")
    );

    public static int calculateLevenshteinDistance(String a, String b) {
        if (a == null || b == null) return 999;
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = (a.charAt(i - 1) == b.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
            }
        }
        return dp[a.length()][b.length()];
    }

    public static String getEmailDomainSuggestion(String domain) {
        if (domain == null || domain.isBlank()) {
            return null;
        }
        String clean = domain.trim().toLowerCase();
        if (EMAIL_DOMAIN_TYPOS.containsKey(clean)) {
            return EMAIL_DOMAIN_TYPOS.get(clean);
        }
        List<String> majorDomains = List.of("gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com");
        for (String major : majorDomains) {
            if (clean.equals(major)) {
                return null;
            }
            if (clean.equals(major.replace(".com", ".con"))) {
                return major;
            }
            if (calculateLevenshteinDistance(clean, major) == 1) {
                return major;
            }
        }
        return null;
    }

    private static final Set<String> WELL_KNOWN_VALID_DOMAINS = Set.of(
            "gmail.com",
            "googlemail.com",
            "yahoo.com",
            "yahoo.co.in",
            "yahoo.in",
            "hotmail.com",
            "outlook.com",
            "live.com",
            "msn.com",
            "icloud.com",
            "me.com",
            "aol.com",
            "zoho.com",
            "proton.me",
            "protonmail.com"
    );

    public static boolean isDomainReachable(String domain) {
        if (domain == null || domain.isBlank()) {
            return false;
        }
        String cleanDomain = domain.trim().toLowerCase();
        if (getEmailDomainSuggestion(cleanDomain) != null) {
            return false;
        }
        if (WELL_KNOWN_VALID_DOMAINS.contains(cleanDomain)) {
            return true;
        }

        // Domain verification only if technically supported and enabled
        if (!Boolean.getBoolean("app.email.dns-verification.enabled") &&
            !"true".equalsIgnoreCase(System.getenv("ENABLE_EMAIL_DNS_VERIFICATION"))) {
            return true;
        }

        try {
            return CompletableFuture.supplyAsync(() -> checkDnsRecords(cleanDomain))
                    .get(800, TimeUnit.MILLISECONDS);
        } catch (TimeoutException te) {
            // DNS resolution timed out or network isolated:
            // Gracefully permit custom corporate domains
            return true;
        } catch (Exception ex) {
            Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
            if (cause instanceof javax.naming.NameNotFoundException || cause instanceof UnknownHostException) {
                return false;
            }
            return true;
        }
    }

    private static boolean checkDnsRecords(String cleanDomain) {
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            env.put("java.naming.provider.url", "dns:");
            env.put("com.sun.jndi.dns.timeout.initial", "500");
            env.put("com.sun.jndi.dns.timeout.retries", "1");
            DirContext ictx = new InitialDirContext(env);
            Attributes attrs = ictx.getAttributes(cleanDomain, new String[]{"MX"});
            Attribute attr = attrs.get("MX");
            if (attr != null && attr.size() > 0) {
                return true;
            }
            attrs = ictx.getAttributes(cleanDomain, new String[]{"A", "AAAA"});
            if ((attrs.get("A") != null && attrs.get("A").size() > 0) ||
                (attrs.get("AAAA") != null && attrs.get("AAAA").size() > 0)) {
                return true;
            }
            return false;
        } catch (javax.naming.NameNotFoundException e) {
            return false;
        } catch (Exception e) {
            try {
                InetAddress.getByName(cleanDomain);
                return true;
            } catch (UnknownHostException uhe) {
                return false;
            } catch (Exception ex) {
                return true;
            }
        }
    }

    public void validateEmail(String email) {
        validateEmail(email, false);
    }

    public void validateEmail(String email, Boolean confirmTypoDomain) {
        if (email == null || email.isBlank()) {
            throw new BusinessValidationException("Email is required");
        }
        String trimmed = email.trim();
        if (!trimmed.matches(EMAIL_REGEX)) {
            throw new BusinessValidationException("Enter a valid email address.");
        }
        String[] parts = trimmed.split("@");
        if (parts.length != 2) {
            throw new BusinessValidationException("Enter a valid email address.");
        }
        String domain = parts[1].toLowerCase();
        String suggestedDomain = getEmailDomainSuggestion(domain);
        if (suggestedDomain != null && !Boolean.TRUE.equals(confirmTypoDomain)) {
            throw new BusinessValidationException("Did you mean " + suggestedDomain + "?");
        }
        if (!isDomainReachable(domain) && !Boolean.TRUE.equals(confirmTypoDomain)) {
            throw new BusinessValidationException("Enter a valid email address.");
        }
    }

    private void validateLeadFields(String company, String contactName, String email, String phone) {
        validateLeadFields(company, contactName, email, phone, false);
    }

    private void validateLeadFields(String company, String contactName, String email, String phone, Boolean confirmTypoDomain) {
        if (company == null || company.isBlank()) {
            throw new BusinessValidationException("Company name is required");
        }
        if (!company.matches(COMPANY_REGEX)) {
            throw new BusinessValidationException("Enter a valid company name containing letters.");
        }
        if (contactName == null || contactName.isBlank()) {
            throw new BusinessValidationException("Contact name is required");
        }
        if (!contactName.matches(CONTACT_NAME_REGEX)) {
            throw new BusinessValidationException("Enter a valid contact person name.");
        }
        validateEmail(email, confirmTypoDomain);
        if (phone == null || phone.isBlank()) {
            throw new BusinessValidationException("Phone number is required");
        }
        if (!phone.matches(PHONE_REGEX)) {
            throw new BusinessValidationException("Enter a valid 10-digit Indian mobile number.");
        }
    }

    @Transactional
    public LeadResponse createLead(CreateLeadRequest request) {
        validateLeadFields(request.getCompany(), request.getContactName(), request.getEmail(), request.getPhone(), request.getConfirmTypoDomain());

        int year = request.getLeadDate() != null ? request.getLeadDate().getYear() : LocalDate.now().getYear();
        String generatedId = leadIdGeneratorService.generateAndAllocateNextLeadId(year);

        BigDecimal dealValue = request.getExpectedValue() != null
                ? request.getExpectedValue()
                : request.getEstimatedValue();

        LeadEntity entity = LeadEntity.builder()
                .id(generatedId)
                .leadDate(request.getLeadDate() != null ? request.getLeadDate() : LocalDate.now())
                .company(request.getCompany().trim())
                .contactName(request.getContactName().trim())
                .email(request.getEmail().trim())
                .phone(request.getPhone().trim())
                .source(request.getSource())
                .serviceInterest(request.getServiceInterest())
                .country(request.getCountry())
                .city(request.getCity())
                .ownerId(request.getOwnerId())
                .stage(request.getStage() != null ? request.getStage() : "New")
                .status(request.getStatus() != null ? request.getStatus() : "Open")
                .nextFollowUp(request.getNextFollowUp())
                .estimatedValue(dealValue)
                .leadScore(request.getLeadScore())
                .expectedValue(dealValue)
                .expectedCloseDate(request.getExpectedCloseDate())
                .lostReason(request.getLostReason())
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        LeadEntity saved = leadRepository.save(entity);
        if (notificationService != null) {
            notificationService.createNotification(
                    "New Lead Created",
                    "Lead " + saved.getId() + " (" + saved.getCompany() + ") registered under stage " + saved.getStage() + ".",
                    "LEAD",
                    "/sales/leads"
            );
        }
        return mapToResponse(saved);
    }

    @Transactional
    public LeadResponse updateLead(String id, UpdateLeadRequest request) {
        LeadEntity existing = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        if (request.getLeadDate() != null) existing.setLeadDate(request.getLeadDate());
        if (request.getCompany() != null) {
            if (request.getCompany().isBlank() || !request.getCompany().matches(COMPANY_REGEX)) {
                throw new BusinessValidationException("Enter a valid company name containing letters.");
            }
            existing.setCompany(request.getCompany().trim());
        }
        if (request.getContactName() != null) {
            if (request.getContactName().isBlank() || !request.getContactName().matches(CONTACT_NAME_REGEX)) {
                throw new BusinessValidationException("Enter a valid contact person name.");
            }
            existing.setContactName(request.getContactName().trim());
        }
        if (request.getEmail() != null) {
            validateEmail(request.getEmail(), request.getConfirmTypoDomain());
            existing.setEmail(request.getEmail().trim());
        }
        if (request.getPhone() != null) {
            if (request.getPhone().isBlank() || !request.getPhone().matches(PHONE_REGEX)) {
                throw new BusinessValidationException("Enter a valid 10-digit Indian mobile number.");
            }
            existing.setPhone(request.getPhone().trim());
        }
        if (request.getSource() != null) existing.setSource(request.getSource());
        if (request.getServiceInterest() != null) existing.setServiceInterest(request.getServiceInterest());
        if (request.getCountry() != null) existing.setCountry(request.getCountry());
        if (request.getCity() != null) existing.setCity(request.getCity());
        if (request.getOwnerId() != null) existing.setOwnerId(request.getOwnerId());
        if (request.getStage() != null) existing.setStage(request.getStage());
        if (request.getStatus() != null) existing.setStatus(request.getStatus());
        if (request.getNextFollowUp() != null) existing.setNextFollowUp(request.getNextFollowUp());
        if (request.getExpectedValue() != null) {
            existing.setExpectedValue(request.getExpectedValue());
            if (request.getEstimatedValue() == null) {
                existing.setEstimatedValue(request.getExpectedValue());
            }
        }
        if (request.getEstimatedValue() != null) {
            existing.setEstimatedValue(request.getEstimatedValue());
            if (request.getExpectedValue() == null) {
                existing.setExpectedValue(request.getEstimatedValue());
            }
        }
        if (request.getLeadScore() != null) existing.setLeadScore(request.getLeadScore());
        if (request.getExpectedCloseDate() != null) existing.setExpectedCloseDate(request.getExpectedCloseDate());
        if (request.getLostReason() != null) existing.setLostReason(request.getLostReason());
        if (request.getNotes() != null) existing.setNotes(request.getNotes());
        existing.setUpdatedAt(LocalDateTime.now());

        LeadEntity saved = leadRepository.save(existing);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Lead Updated",
                    "Lead " + saved.getId() + " (" + saved.getCompany() + ") moved to " + saved.getStage() + ".",
                    "LEAD",
                    "/sales/leads"
            );
        }
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteLead(String id) {
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lead not found with id: " + id);
        }
        leadRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public LeadSummaryDto getSummary() {
        LocalDate today = LocalDate.now();
        LocalDate startOfThisMonth = today.withDayOfMonth(1);
        LocalDate endOfThisMonth = today.withDayOfMonth(today.lengthOfMonth());

        LocalDate startOfPrevMonth = startOfThisMonth.minusMonths(1);
        LocalDate endOfPrevMonth = startOfPrevMonth.withDayOfMonth(startOfPrevMonth.lengthOfMonth());

        long totalLeads = leadRepository.count();
        long newThisMonth = leadRepository.countLeadsBetween(startOfThisMonth, endOfThisMonth);
        long followUpsDue = leadRepository.countFollowUpsDue(today);
        long convertedLeads = leadRepository.countConvertedLeads();

        // Month-over-month baseline comparisons
        long newLastMonth = leadRepository.countLeadsBetween(startOfPrevMonth, endOfPrevMonth);
        long followUpsDueLastMonth = leadRepository.countFollowUpsDueBetween(startOfPrevMonth, endOfPrevMonth);
        long convertedLastMonth = leadRepository.countConvertedLeadsBetween(startOfPrevMonth, endOfPrevMonth);
        long totalLeadsBeforeThisMonth = leadRepository.countLeadsBefore(startOfThisMonth);

        Double totalLeadsMoM = TrendCalculationUtil.calculateMoMPercentage(totalLeads, totalLeadsBeforeThisMonth);
        Double newLeadsMoM = TrendCalculationUtil.calculateMoMPercentage(newThisMonth, newLastMonth);
        Double followUpsDueMoM = TrendCalculationUtil.calculateMoMPercentage(followUpsDue, followUpsDueLastMonth);
        Double convertedMoM = TrendCalculationUtil.calculateMoMPercentage(convertedLeads, convertedLastMonth);

        String lastUpdated = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

        return LeadSummaryDto.builder()
                .totalLeads(totalLeads)
                .newThisMonth(newThisMonth)
                .followUpsDue(followUpsDue)
                .convertedLeads(convertedLeads)
                .totalLeadsMoM(totalLeadsMoM)
                .newLeadsMoM(newLeadsMoM)
                .followUpsDueMoM(followUpsDueMoM)
                .convertedMoM(convertedMoM)
                .lastUpdated(lastUpdated)
                .build();
    }

    public LeadResponse mapToResponse(LeadEntity entity) {
        if (entity == null) return null;
        return LeadResponse.builder()
                .id(entity.getId())
                .leadDate(entity.getLeadDate())
                .company(entity.getCompany())
                .contactName(entity.getContactName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .source(entity.getSource())
                .serviceInterest(entity.getServiceInterest())
                .country(entity.getCountry())
                .city(entity.getCity())
                .ownerId(entity.getOwnerId())
                .stage(entity.getStage())
                .status(entity.getStatus())
                .nextFollowUp(entity.getNextFollowUp())
                .estimatedValue(entity.getEstimatedValue())
                .leadScore(entity.getLeadScore())
                .expectedValue(entity.getExpectedValue())
                .expectedCloseDate(entity.getExpectedCloseDate())
                .lostReason(entity.getLostReason())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
