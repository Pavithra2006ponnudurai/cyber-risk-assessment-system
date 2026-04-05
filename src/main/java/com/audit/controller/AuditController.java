package com.audit.controller;

import com.audit.model.AuditRecord;
import com.audit.service.AuditService;
import com.audit.service.ReportService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audits")
public class AuditController {

    private final AuditService auditService;
    private final ReportService reportService;

    public AuditController(AuditService auditService, ReportService reportService) {
        this.auditService = auditService;
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<AuditRecord> submit(@RequestBody AuditRecord record) {
        return ResponseEntity.ok(auditService.submitAudit(record));
    }

    @GetMapping
    public ResponseEntity<List<AuditRecord>> myAudits() {
        return ResponseEntity.ok(auditService.getMyAudits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditRecord> getById(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getById(id));
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) throws Exception {
        AuditRecord audit = auditService.getById(id);
        byte[] pdf = reportService.generatePdf(audit);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=audit-report-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
