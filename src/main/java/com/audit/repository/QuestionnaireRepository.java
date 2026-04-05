package com.audit.repository;

import com.audit.model.QuestionnaireResponse;
import com.audit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface QuestionnaireRepository extends JpaRepository<QuestionnaireResponse, Long> {
    List<QuestionnaireResponse> findByUserOrderBySubmittedAtDesc(User user);
    List<QuestionnaireResponse> findAllByOrderBySubmittedAtDesc();

    @Query("SELECT q.riskLevel, COUNT(q) FROM QuestionnaireResponse q GROUP BY q.riskLevel")
    List<Object[]> countByRiskLevel();

    @Query("SELECT AVG(q.riskScore) FROM QuestionnaireResponse q")
    Double averageRiskScore();
}
