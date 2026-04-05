package com.audit.service;

import com.audit.model.AuditRecord;
import com.audit.model.User;
import com.audit.repository.AuditRepository;
import com.audit.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AuditService {

    private final AuditRepository auditRepository;
    private final UserRepository userRepository;
    private final RiskEngineService riskEngine;

    public AuditService(AuditRepository auditRepository, UserRepository userRepository,
                        RiskEngineService riskEngine) {
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
        this.riskEngine = riskEngine;
    }

    public AuditRecord submitAudit(AuditRecord record) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        record.setUser(user);

        int score = riskEngine.calculateRiskScore(record);
        record.setRiskScore(score);
        record.setRiskLevel(riskEngine.determineRiskLevel(score));
        record.setRecommendations(String.join("||", riskEngine.generateRecommendations(record)));

        return auditRepository.save(record);
    }

    public List<AuditRecord> getMyAudits() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        return auditRepository.findByUser(user);
    }

    public AuditRecord getById(Long id) {
        return auditRepository.findById(id).orElseThrow();
    }

    public List<AuditRecord> getAllAudits() {
        return auditRepository.findAllByOrderBySubmittedAtDesc();
    }

    public List<AuditRecord> getByRiskLevel(AuditRecord.RiskLevel level) {
        return auditRepository.findByRiskLevel(level);
    }

    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", auditRepository.count());
        stats.put("avgRiskScore", auditRepository.averageRiskScore());

        Map<String, Long> distribution = new HashMap<>();
        for (Object[] row : auditRepository.countByRiskLevel()) {
            distribution.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("riskDistribution", distribution);
        return stats;
    }
}
