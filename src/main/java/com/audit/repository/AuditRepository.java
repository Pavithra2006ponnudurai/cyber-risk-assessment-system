package com.audit.repository;

import com.audit.model.AuditRecord;
import com.audit.model.AuditRecord.RiskLevel;
import com.audit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface AuditRepository extends JpaRepository<AuditRecord, Long> {
    List<AuditRecord> findByUser(User user);
    List<AuditRecord> findByRiskLevel(RiskLevel riskLevel);
    List<AuditRecord> findAllByOrderBySubmittedAtDesc();

    @Query("SELECT a.riskLevel, COUNT(a) FROM AuditRecord a GROUP BY a.riskLevel")
    List<Object[]> countByRiskLevel();

    @Query("SELECT AVG(a.riskScore) FROM AuditRecord a")
    Double averageRiskScore();
}
