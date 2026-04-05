package com.audit;

import com.audit.model.AuditRecord;
import com.audit.model.AuditRecord.*;
import com.audit.model.User;
import com.audit.repository.AuditRepository;
import com.audit.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AuditApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuditApplication.class, args);
    }

    @Bean
    CommandLineRunner seedData(UserRepository userRepo, AuditRepository auditRepo,
                               PasswordEncoder encoder) {
        return args -> {
            // Seed users
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@auditpro.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            userRepo.save(admin);

            User auditor = new User();
            auditor.setUsername("auditor1");
            auditor.setEmail("auditor@auditpro.com");
            auditor.setPassword(encoder.encode("audit123"));
            auditor.setRole(User.Role.AUDITOR);
            userRepo.save(auditor);

            User client = new User();
            client.setUsername("client1");
            client.setEmail("client@company.com");
            client.setPassword(encoder.encode("client123"));
            client.setRole(User.Role.CLIENT);
            userRepo.save(client);

            // Seed sample audits
            seedAudit(auditRepo, admin, "TechCorp Solutions", AuditType.SECURITY,
                    250, false, true, false, false, true,
                    ComplianceLevel.LOW, DataSensitivity.HIGH, UpdateFrequency.MONTHLY);

            seedAudit(auditRepo, auditor, "FinanceHub Ltd", AuditType.FINANCIAL,
                    80, true, true, true, true, false,
                    ComplianceLevel.HIGH, DataSensitivity.CRITICAL, UpdateFrequency.WEEKLY);

            seedAudit(auditRepo, client, "RetailMax Inc", AuditType.COMPLIANCE,
                    500, false, false, false, false, true,
                    ComplianceLevel.LOW, DataSensitivity.MEDIUM, UpdateFrequency.RARELY);

            seedAudit(auditRepo, admin, "MedData Systems", AuditType.SECURITY,
                    120, true, true, true, false, false,
                    ComplianceLevel.MEDIUM, DataSensitivity.CRITICAL, UpdateFrequency.WEEKLY);
        };
    }

    private void seedAudit(AuditRepository repo, User user, String company, AuditType type,
                            int employees, boolean fw, boolean av, boolean enc, boolean mfa,
                            boolean incidents, ComplianceLevel comp, DataSensitivity sens,
                            UpdateFrequency freq) {
        AuditRecord r = new AuditRecord();
        r.setUser(user);
        r.setCompanyName(company);
        r.setAuditType(type);
        r.setNumberOfEmployees(employees);
        r.setHasFirewall(fw);
        r.setHasAntivirus(av);
        r.setHasEncryption(enc);
        r.setHasMfa(mfa);
        r.setPreviousIncidents(incidents);
        r.setComplianceLevel(comp);
        r.setDataSensitivity(sens);
        r.setUpdateFrequency(freq);

        // Compute risk inline for seeded data
        int score = 0;
        if (!fw) score += 10; if (!av) score += 8; if (!enc) score += 12; if (!mfa) score += 10;
        if (incidents) score += 20;
        score += switch (comp) { case LOW -> 15; case MEDIUM -> 8; case HIGH -> 0; };
        score += switch (sens) { case CRITICAL -> 15; case HIGH -> 10; case MEDIUM -> 5; case LOW -> 0; };
        score += switch (freq) { case RARELY -> 10; case MONTHLY -> 6; case WEEKLY -> 2; case DAILY -> 0; };
        if (employees > 500) score += 5;
        score = Math.min(score, 100);

        r.setRiskScore(score);
        r.setRiskLevel(score >= 75 ? AuditRecord.RiskLevel.CRITICAL :
                       score >= 50 ? AuditRecord.RiskLevel.HIGH :
                       score >= 25 ? AuditRecord.RiskLevel.MEDIUM : AuditRecord.RiskLevel.LOW);
        r.setRecommendations("Review security controls||Conduct regular audits");
        repo.save(r);
    }
}
