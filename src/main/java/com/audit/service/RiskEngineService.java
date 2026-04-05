package com.audit.service;

import com.audit.model.AuditRecord;
import com.audit.model.AuditRecord.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class RiskEngineService {

    public int calculateRiskScore(AuditRecord a) {
        int score = 0;

        // ── Core Security (max 30) ───────────────────────────────────
        if (!a.isHasFirewall())       score += 5;
        if (!a.isHasAntivirus())      score += 4;
        if (!a.isHasMfa())            score += 6;
        if (!a.isHasEncryption())     score += 5;
        if (!a.isHasRbac())           score += 4;
        if (!a.isStrongPasswords())   score += 3;
        if (!a.isNetworkMonitoring()) score += 3;

        // ── Incidents (max 20) ───────────────────────────────────────
        if (a.isPreviousIncidents())  score += 10;
        score += switch (a.getIncidentCount() != null ? a.getIncidentCount() : "NONE") {
            case "FEW" -> 5; case "MANY" -> 10; default -> 0;
        };
        if (!a.isHasIncidentResponsePlan()) score += 5;

        // ── Compliance (max 15) ──────────────────────────────────────
        score += switch (a.getComplianceLevel() != null ? a.getComplianceLevel() : ComplianceLevel.LOW) {
            case LOW -> 10; case MEDIUM -> 5; case HIGH -> 0;
        };
        if (!a.isRegularAudits())    score += 3;
        if (!a.isSecurityTraining()) score += 4;

        // ── Data Sensitivity (max 12) ────────────────────────────────
        score += switch (a.getDataSensitivity() != null ? a.getDataSensitivity() : DataSensitivity.LOW) {
            case CRITICAL -> 12; case HIGH -> 8; case MEDIUM -> 4; case LOW -> 0;
        };
        if (!a.isRegularBackups())      score += 4;
        if (!a.isBackupsEncrypted())    score += 3;

        // ── Patch Management (max 10) ────────────────────────────────
        score += switch (a.getUpdateFrequency() != null ? a.getUpdateFrequency() : UpdateFrequency.RARELY) {
            case RARELY -> 8; case MONTHLY -> 4; case WEEKLY -> 1; case DAILY -> 0;
        };
        if (!a.isPatchesAppliedImmediately()) score += 4;

        // ── Network (max 10) ─────────────────────────────────────────
        if (!a.isNetworkSegmentation()) score += 4;
        if (!a.isVpnRemoteAccess())     score += 3;
        if (!a.isIdsIps())              score += 3;

        // ── Advanced (max 8) ─────────────────────────────────────────
        if (!a.isVulnerabilityScanning())  score += 3;
        if (!a.isPenetrationTesting())     score += 3;
        if (!a.isRealtimeLogMonitoring())  score += 2;
        if (!a.isSiemTools())              score += 2;

        // ── Org size modifier ────────────────────────────────────────
        if (a.getNumberOfEmployees() != null && a.getNumberOfEmployees() > 500) score += 3;

        return Math.min(score, 100);
    }

    public RiskLevel determineRiskLevel(int score) {
        if (score >= 75) return RiskLevel.CRITICAL;
        if (score >= 50) return RiskLevel.HIGH;
        if (score >= 25) return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }

    public List<String> generateRecommendations(AuditRecord a) {
        List<String> recs = new ArrayList<>();

        // ── CRITICAL ────────────────────────────────────────────────
        if (!a.isHasMfa())
            recs.add("CRITICAL: Enable Multi-Factor Authentication (MFA) — prevents 99% of account compromise attacks.");
        if (!a.isHasEncryption() && isSensitive(a.getDataSensitivity()))
            recs.add("CRITICAL: Implement end-to-end encryption immediately — sensitive data is currently exposed.");
        if (a.isPreviousIncidents() && !a.isHasIncidentResponsePlan())
            recs.add("CRITICAL: Breaches occurred but no Incident Response Plan exists — create and test one immediately.");
        if (a.getDataSensitivity() == DataSensitivity.CRITICAL && !a.isRegularBackups())
            recs.add("CRITICAL: Critical data has no regular backups — implement automated daily backups now.");

        // ── HIGH ─────────────────────────────────────────────────────
        if (!a.isHasFirewall())
            recs.add("HIGH: Deploy a network firewall to protect against external threats.");
        if (!a.isHasAntivirus())
            recs.add("HIGH: Install enterprise-grade antivirus/EDR across all endpoints.");
        if (!a.isHasRbac())
            recs.add("HIGH: Implement Role-Based Access Control (RBAC) to enforce least-privilege.");
        if (!a.isNetworkSegmentation())
            recs.add("HIGH: Implement network segmentation (VLANs/DMZ) to limit lateral movement.");
        if (!a.isVpnRemoteAccess())
            recs.add("HIGH: Enforce VPN or Zero Trust Network Access for all remote connections.");
        if (!a.isSecurityTraining())
            recs.add("HIGH: Implement mandatory security awareness training — human error causes 82% of breaches.");
        if (!a.isAdminActivitiesLogged())
            recs.add("HIGH: Enable comprehensive admin activity logging with tamper-proof audit trails.");
        if (!a.isIdsIps())
            recs.add("HIGH: Deploy IDS/IPS to detect and block malicious network activity in real-time.");
        if (a.getUpdateFrequency() == UpdateFrequency.RARELY)
            recs.add("HIGH: Establish a regular patch management schedule — unpatched systems are the #1 attack vector.");
        if (a.getComplianceLevel() == ComplianceLevel.LOW)
            recs.add("HIGH: Adopt a recognised security framework (ISO 27001 or NIST CSF) immediately.");
        if (a.isPreviousIncidents())
            recs.add("HIGH: Conduct a thorough post-incident review and implement a corrective action plan.");

        // ── MEDIUM ───────────────────────────────────────────────────
        if (!a.isStrongPasswords())
            recs.add("MEDIUM: Enforce password complexity, minimum 12 characters, and rotation policies.");
        if (!a.isNetworkMonitoring())
            recs.add("MEDIUM: Deploy network monitoring tools to detect anomalous traffic patterns.");
        if (!a.isInactiveAccountsRemoved())
            recs.add("MEDIUM: Implement automated account lifecycle management to disable inactive accounts.");
        if (!a.isPrivilegeEscalationMonitored())
            recs.add("MEDIUM: Implement PAM (Privileged Access Management) to monitor privilege escalation.");
        if (!a.isPatchesAppliedImmediately())
            recs.add("MEDIUM: Implement an emergency patch process for critical CVEs with SLA under 24 hours.");
        if (!a.isBackupsEncrypted())
            recs.add("MEDIUM: Encrypt all backups and store copies in geographically separate locations.");
        if (!a.isRegularAudits())
            recs.add("MEDIUM: Schedule annual external audits and quarterly internal security reviews.");
        if (!a.isOpenPortsAudited())
            recs.add("MEDIUM: Conduct regular port scans and close all unnecessary open ports.");
        if (!a.isVulnerabilityScanning())
            recs.add("MEDIUM: Schedule automated vulnerability scans weekly and remediate critical findings within 72 hours.");
        if (a.getUpdateFrequency() == UpdateFrequency.MONTHLY)
            recs.add("MEDIUM: Increase patch update frequency to weekly to reduce vulnerability windows.");

        // ── LOW ──────────────────────────────────────────────────────
        if (!a.isAutomatedUpdates())
            recs.add("LOW: Deploy automated patch management tools to reduce manual overhead.");
        if (!a.isIncidentsDocumented())
            recs.add("LOW: Establish a lessons-learned process to improve posture after each incident.");
        if (!a.isDataRetentionPolicy())
            recs.add("LOW: Define and enforce data retention schedules with secure disposal procedures.");
        if (!a.isPenetrationTesting())
            recs.add("LOW: Engage a qualified third-party for annual penetration testing.");
        if (!a.isRealtimeLogMonitoring())
            recs.add("LOW: Implement real-time log monitoring with automated alerting.");
        if (!a.isSiemTools())
            recs.add("LOW: Consider deploying a SIEM solution for centralised threat detection.");

        // ── GOOD ─────────────────────────────────────────────────────
        if (a.isHasFirewall())    recs.add("GOOD: Firewall is active — network perimeter is protected.");
        if (a.isHasMfa())         recs.add("GOOD: MFA is enabled — account security is significantly strengthened.");
        if (a.isHasEncryption())  recs.add("GOOD: Data encryption is implemented — data is protected at rest and in transit.");
        if (a.isHasIncidentResponsePlan()) recs.add("GOOD: Incident Response Plan is in place — your organisation is prepared.");

        if (recs.isEmpty())
            recs.add("GOOD: Excellent security posture. Continue regular audits and maintain current controls.");

        return recs;
    }

    private boolean isSensitive(DataSensitivity ds) {
        return ds == DataSensitivity.HIGH || ds == DataSensitivity.CRITICAL;
    }
}
