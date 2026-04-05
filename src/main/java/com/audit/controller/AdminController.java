package com.audit.controller;

import com.audit.model.AuditRecord;
import com.audit.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuditService auditService;

    public AdminController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/audits")
    public ResponseEntity<List<AuditRecord>> getAllAudits(
            @RequestParam(required = false) AuditRecord.RiskLevel riskLevel) {
        if (riskLevel != null)
            return ResponseEntity.ok(auditService.getByRiskLevel(riskLevel));
        return ResponseEntity.ok(auditService.getAllAudits());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(auditService.getAdminStats());
    }
}
