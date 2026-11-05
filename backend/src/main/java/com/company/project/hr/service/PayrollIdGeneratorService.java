package com.company.project.hr.service;

import com.company.project.hr.repository.PayrollRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollIdGeneratorService {

    private final JdbcTemplate jdbcTemplate;
    private final PayrollRecordRepository payrollRepository;

    public String getPrefixForMonth(String monthStr) {
        if (monthStr != null && monthStr.matches("(?i)^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s*\\d{4}$")) {
            String[] parts = monthStr.trim().split("\\s+");
            String m = parts[0].toUpperCase();
            String y = parts[1];
            String monthNum = switch (m) {
                case "JAN" -> "01";
                case "FEB" -> "02";
                case "MAR" -> "03";
                case "APR" -> "04";
                case "MAY" -> "05";
                case "JUN" -> "06";
                case "JUL" -> "07";
                case "AUG" -> "08";
                case "SEP" -> "09";
                case "OCT" -> "10";
                case "NOV" -> "11";
                case "DEC" -> "12";
                default -> "10";
            };
            return "PAY-" + y + monthNum;
        }
        return "PAY-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
    }

    @Transactional(readOnly = true)
    public String suggestNextPayrollId(String monthStr) {
        String prefix = getPrefixForMonth(monthStr);
        Long currentVal = null;
        try {
            currentVal = jdbcTemplate.queryForObject(
                    "SELECT current_val FROM public.hr_payroll_counters WHERE prefix = ?",
                    Long.class,
                    prefix
            );
        } catch (Exception ignored) {
        }

        if (currentVal == null) {
            try {
                String sql = "SELECT COALESCE(MAX(CASE WHEN payroll_id LIKE ? " +
                        "THEN substring(payroll_id from '[0-9]+$')::bigint ELSE 0 END), 0) " +
                        "FROM public.hr_payroll_records WHERE payroll_id LIKE ?";
                currentVal = jdbcTemplate.queryForObject(sql, Long.class, prefix + "-%", prefix + "-%");
            } catch (Exception ex) {
                currentVal = 0L;
            }
        }

        long candidateSeq = (currentVal != null ? currentVal : 0L) + 1;
        String candidateId = String.format("%s-%03d", prefix, candidateSeq);

        while (payrollRepository.existsByPayrollId(candidateId)) {
            candidateSeq++;
            candidateId = String.format("%s-%03d", prefix, candidateSeq);
        }

        return candidateId;
    }

    @Transactional
    public synchronized String generateNextPayrollId(String monthStr) {
        String prefix = getPrefixForMonth(monthStr);
        Long nextVal = null;

        try {
            String upsertSql =
                    "INSERT INTO public.hr_payroll_counters (prefix, current_val, updated_at) " +
                    "VALUES (?, 1, NOW()) " +
                    "ON CONFLICT (prefix) DO UPDATE " +
                    "SET current_val = public.hr_payroll_counters.current_val + 1, updated_at = NOW() " +
                    "RETURNING current_val";
            nextVal = jdbcTemplate.queryForObject(upsertSql, Long.class, prefix);
        } catch (Exception ex) {
            log.error("Failed counter upsert for {}: {}", prefix, ex.getMessage());
        }

        if (nextVal == null) {
            nextVal = 1L;
        }

        String payrollId = String.format("%s-%03d", prefix, nextVal);

        // Ensure collision safety
        while (payrollRepository.existsByPayrollId(payrollId)) {
            nextVal++;
            payrollId = String.format("%s-%03d", prefix, nextVal);
            try {
                jdbcTemplate.update(
                        "UPDATE public.hr_payroll_counters SET current_val = ?, updated_at = NOW() WHERE prefix = ?",
                        nextVal, prefix
                );
            } catch (Exception ignored) {
            }
        }

        return payrollId;
    }
}

