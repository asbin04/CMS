package com.company.project.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/collections/ping")
    public ResponseEntity<Map<String, Object>> collectionsPing() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Collections Service",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/admin/ping")
    public ResponseEntity<Map<String, Object>> adminPing() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Protected Admin Service"
        ));
    }
}
