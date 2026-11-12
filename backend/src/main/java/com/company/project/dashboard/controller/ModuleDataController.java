package com.company.project.dashboard.controller;

import com.company.project.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/modules/{moduleKey}")
@RequiredArgsConstructor
@Tag(name = "Dynamic Modules", description = "Dynamic module data engine for enterprise modules")
public class ModuleDataController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/summary")
    @Operation(summary = "Get dynamic KPI summary metrics for any module")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getModuleSummary(@PathVariable String moduleKey) {
        String key = moduleKey.toLowerCase();
        Map<String, Object> summary = new HashMap<>();

        try {
            if ("leads".equals(key)) {
                Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM leads", Long.class);
                Long active = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM leads WHERE LOWER(status) NOT LIKE '%lost%'", Long.class);
                summary.put("total", total != null ? total : 0);
                summary.put("primaryLabel", "Total Leads");
                summary.put("active", active != null ? active : 0);
                summary.put("activeLabel", "Active Leads");
                summary.put("secondary", 12);
                summary.put("secondaryLabel", "Follow-Ups Pending");
                summary.put("metricValFormatted", "₹ 1.84 Cr");
            } else if ("proposals".equals(key)) {
                Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM proposals", Long.class);
                Long active = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM proposals WHERE LOWER(status) = 'sent' OR LOWER(status) = 'accepted'", Long.class);
                summary.put("total", total != null ? total : 0);
                summary.put("primaryLabel", "Total Proposals");
                summary.put("active", active != null ? active : 0);
                summary.put("activeLabel", "Active Proposals");
                summary.put("secondary", active != null ? active : 0);
                summary.put("secondaryLabel", "Pipeline Value");
                summary.put("metricValFormatted", "₹ 2.45 Cr");
            } else if ("clients".equals(key) || "clients-list".equals(key) || "client-dashboard".equals(key)) {
                Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM clients", Long.class);
                Long active = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM clients WHERE LOWER(status) = 'active'", Long.class);
                summary.put("total", total != null ? total : 0);
                summary.put("primaryLabel", "Total Clients");
                summary.put("active", active != null ? active : 0);
                summary.put("activeLabel", "Active Accounts");
                summary.put("secondary", active != null ? Math.round(active * 0.45) : 0);
                summary.put("secondaryLabel", "Enterprise Tier");
                summary.put("metricValFormatted", "₹ 4.85 Cr");
            } else {
                Long total = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM dynamic_module_records WHERE module_key = ?",
                        Long.class, key
                );
                Long active = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM dynamic_module_records WHERE module_key = ? AND LOWER(status) IN ('active', 'approved', 'in progress', 'allocated', 'processed', 'resolved', 'released')",
                        Long.class, key
                );
                summary.put("total", total != null ? total : 0);
                summary.put("primaryLabel", "Total Records");
                summary.put("active", active != null ? active : 0);
                summary.put("activeLabel", "Active / Ongoing");
                summary.put("secondary", Math.max(1, (total != null ? total : 0) - (active != null ? active : 0)));
                summary.put("secondaryLabel", "Total Volume");
                summary.put("metricValFormatted", "₹ 12,45,000");
            }
            summary.put("trend", "↑ 12% vs last month");
        } catch (Exception e) {
            summary.put("total", 0);
            summary.put("primaryLabel", "Total Records");
            summary.put("active", 0);
            summary.put("activeLabel", "Active");
            summary.put("secondary", 0);
            summary.put("secondaryLabel", "Pending");
            summary.put("metricValFormatted", "₹ 0");
            summary.put("trend", "↑ 0%");
        }

        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping
    @Operation(summary = "Get dynamic records list for any module")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getModuleRecords(@PathVariable String moduleKey) {
        String key = moduleKey.toLowerCase();
        List<Map<String, Object>> records = new ArrayList<>();

        try {
            if ("leads".equals(key)) {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM leads ORDER BY created_at DESC LIMIT 200");
                for (Map<String, Object> r : rows) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", r.get("id"));
                    item.put("code", r.get("id"));
                    item.put("title", r.get("company"));
                    item.put("subtitle", r.get("contact_name") + " • " + (r.get("email") != null ? r.get("email") : ""));
                    item.put("category", r.get("service_interest") != null ? r.get("service_interest") : "Lead");
                    item.put("status", r.get("status") != null ? r.get("status") : "Open");
                    item.put("priority", "Normal");
                    item.put("assignee", r.get("owner_id") != null ? r.get("owner_id") : "Akshit Ujjain");
                    item.put("value", r.get("estimated_value") != null ? r.get("estimated_value") : "₹ 0");
                    item.put("date", r.get("lead_date") != null ? r.get("lead_date") : "Recent");
                    item.put("details", r.get("notes") != null ? r.get("notes") : "");
                    records.add(item);
                }
            } else if ("proposals".equals(key)) {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM proposals ORDER BY created_at DESC LIMIT 200");
                for (Map<String, Object> r : rows) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", r.get("id"));
                    item.put("code", r.get("id"));
                    item.put("title", r.get("title"));
                    item.put("subtitle", r.get("client_name"));
                    item.put("category", r.get("service_name") != null ? r.get("service_name") : "Enterprise");
                    item.put("status", r.get("status") != null ? r.get("status") : "Sent");
                    item.put("priority", r.get("version") != null ? r.get("version") : "v1.0");
                    item.put("assignee", r.get("owner_name") != null ? r.get("owner_name") : "Akshit Ujjain");
                    item.put("value", r.get("total_amount") != null ? "₹ " + r.get("total_amount") : "₹ 0");
                    item.put("date", r.get("proposal_date") != null ? String.valueOf(r.get("proposal_date")) : "Recent");
                    item.put("details", r.get("description") != null ? r.get("description") : "");
                    records.add(item);
                }
            } else if ("clients".equals(key) || "clients-list".equals(key) || "client-dashboard".equals(key)) {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM clients ORDER BY created_at DESC LIMIT 200");
                for (Map<String, Object> r : rows) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", r.get("id"));
                    item.put("code", r.get("client_code") != null ? r.get("client_code") : r.get("id"));
                    item.put("title", r.get("client_name"));
                    item.put("subtitle", r.get("industry") + " • " + (r.get("city") != null ? r.get("city") : "India"));
                    item.put("category", r.get("client_type") != null ? r.get("client_type") : "Corporate");
                    item.put("status", r.get("status") != null ? r.get("status") : "Active");
                    item.put("priority", "Standard");
                    item.put("assignee", r.get("account_owner") != null ? r.get("account_owner") : "Akshit Ujjain");
                    item.put("value", r.get("credit_limit") != null ? r.get("credit_limit") : "—");
                    item.put("date", r.get("onboarding_date") != null ? r.get("onboarding_date") : "Active");
                    item.put("details", r.get("notes") != null ? r.get("notes") : "");
                    records.add(item);
                }
            } else {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                        "SELECT * FROM dynamic_module_records WHERE module_key = ? ORDER BY order_index ASC, id ASC",
                        key
                );
                for (Map<String, Object> r : rows) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", r.get("id"));
                    item.put("code", r.get("record_id"));
                    item.put("title", r.get("title"));
                    item.put("subtitle", r.get("subtitle") != null ? r.get("subtitle") : "");
                    item.put("category", r.get("category") != null ? r.get("category") : "Standard");
                    item.put("status", r.get("status") != null ? r.get("status") : "Active");
                    item.put("priority", r.get("priority") != null ? r.get("priority") : "Normal");
                    item.put("assignee", r.get("assignee") != null ? r.get("assignee") : "Akshit Ujjain");
                    item.put("value", r.get("numeric_value") != null ? "₹ " + r.get("numeric_value") : "-");
                    item.put("date", r.get("date_value") != null ? r.get("date_value") : "Active");
                    item.put("details", r.get("subtitle") != null ? r.get("subtitle") : "");
                    records.add(item);
                }
            }
        } catch (Exception e) {
            // fallback empty list
        }

        return ResponseEntity.ok(ApiResponse.success(records));
    }
}

