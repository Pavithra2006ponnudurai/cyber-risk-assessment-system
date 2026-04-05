package com.audit.controller;

import com.audit.model.QuestionnaireResponse;
import com.audit.service.QuestionnaireService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questionnaire")
public class QuestionnaireController {

    private final QuestionnaireService service;

    public QuestionnaireController(QuestionnaireService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<QuestionnaireResponse> submit(@RequestBody QuestionnaireResponse response) {
        return ResponseEntity.ok(service.submit(response));
    }

    @GetMapping
    public ResponseEntity<List<QuestionnaireResponse>> myResponses() {
        return ResponseEntity.ok(service.getMyResponses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionnaireResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<QuestionnaireResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(service.getStats());
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) throws Exception {
        byte[] pdf = service.generatePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=questionnaire-report-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
