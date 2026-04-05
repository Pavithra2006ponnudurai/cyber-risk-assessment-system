package com.audit.service;

import com.audit.model.QuestionnaireResponse;
import com.audit.model.User;
import com.audit.repository.QuestionnaireRepository;
import com.audit.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class QuestionnaireService {

    private final QuestionnaireRepository repo;
    private final UserRepository userRepo;
    private final QuestionnaireScoreService scorer;
    private final ReportService reportService;

    public QuestionnaireService(QuestionnaireRepository repo, UserRepository userRepo,
                                QuestionnaireScoreService scorer, ReportService reportService) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.scorer = scorer;
        this.reportService = reportService;
    }

    public QuestionnaireResponse submit(QuestionnaireResponse response) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByUsername(username).orElseThrow();
        response.setUser(user);
        scorer.computeAndApply(response);
        return repo.save(response);
    }

    public List<QuestionnaireResponse> getMyResponses() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByUsername(username).orElseThrow();
        return repo.findByUserOrderBySubmittedAtDesc(user);
    }

    public QuestionnaireResponse getById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public List<QuestionnaireResponse> getAll() {
        return repo.findAllByOrderBySubmittedAtDesc();
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", repo.count());
        stats.put("avgRiskScore", repo.averageRiskScore());
        Map<String, Long> dist = new HashMap<>();
        for (Object[] row : repo.countByRiskLevel())
            dist.put(row[0].toString(), (Long) row[1]);
        stats.put("riskDistribution", dist);
        return stats;
    }

    public byte[] generatePdf(Long id) throws Exception {
        QuestionnaireResponse qr = getById(id);
        return reportService.generateQuestionnairePdf(qr);
    }
}
