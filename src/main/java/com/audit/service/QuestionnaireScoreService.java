package com.audit.service;

import com.audit.model.QuestionnaireResponse;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class QuestionnaireScoreService {

    public void computeAndApply(QuestionnaireResponse r) {
        Map<String, int[]> sections = new LinkedHashMap<>();

        // ── Security Controls (max 30) ───────────────────────────────────
        int s2 = 0;
        if (!r.isHasFirewall())       s2 += 5;
        if (!r.isHasAntivirus())      s2 += 4;
        if (!r.isHasMfa())            s2 += 6;
        if (!r.isHasEncryption())     s2 += 5;
        if (!r.isStrongPasswords())   s2 += 3;
        if (!r.isHasRbac())           s2 += 4;
        if (!r.isNetworkMonitoring()) s2 += 3;
        sections.put("Security Controls", new int[]{s2, 30});

        // ── Access & Identity (max 12) ───────────────────────────────────
        int s3 = 0;
        if (!r.isInactiveAccountsRemoved())     s3 += 4;
        if (!r.isAdminActivitiesLogged())        s3 += 4;
        if (!r.isPrivilegeEscalationMonitored()) s3 += 4;
        sections.put("Access & Identity", new int[]{s3, 12});

        // ── Patch Management (max 12) ────────────────────────────────────
        int s4 = 0;
        s4 += switch (r.getUpdateFrequency() != null ? r.getUpdateFrequency() : "RARELY") {
            case "DAILY" -> 0; case "WEEKLY" -> 1; case "MONTHLY" -> 3; default -> 5;
        };
        if (!r.isPatchesAppliedImmediately()) s4 += 4;
        if (!r.isAutomatedUpdates())          s4 += 3;
        sections.put("Patch Management", new int[]{s4, 12});

        // ── Incident History (max 22) ────────────────────────────────────
        int s5 = 0;
        if (r.isHadBreaches()) s5 += 8;
        s5 += switch (r.getIncidentCount() != null ? r.getIncidentCount() : "NONE") {
            case "FEW" -> 3; case "MANY" -> 6; default -> 0;
        };
        if (!r.isHasIncidentResponsePlan()) s5 += 5;
        if (!r.isIncidentsDocumented())     s5 += 3;
        sections.put("Incident History", new int[]{s5, 22});

        // ── Data Sensitivity (max 17) ────────────────────────────────────
        int s6 = 0;
        s6 += switch (r.getDataClassification() != null ? r.getDataClassification() : "PUBLIC") {
            case "INTERNAL" -> 2; case "CONFIDENTIAL" -> 5; case "HIGHLY_SENSITIVE" -> 8; default -> 0;
        };
        if (!r.isRegularBackups())      s6 += 4;
        if (!r.isBackupsEncrypted())    s6 += 3;
        if (!r.isDataRetentionPolicy()) s6 += 2;
        sections.put("Data Sensitivity", new int[]{s6, 17});

        // ── Compliance & Governance (max 13) ────────────────────────────
        int s7 = 0;
        String std = r.getComplianceStandards();
        if (std == null || std.isEmpty() || std.contains("NONE")) s7 += 6;
        if (!r.isRegularAudits())    s7 += 3;
        if (!r.isSecurityTraining()) s7 += 4;
        sections.put("Governance", new int[]{s7, 13});

        // ── Network & Infrastructure (max 15) ───────────────────────────
        int s8 = 0;
        if (!r.isNetworkSegmentation()) s8 += 4;
        if (!r.isIdsIps())              s8 += 4;
        if (!r.isOpenPortsAudited())    s8 += 3;
        if (!r.isVpnRemoteAccess())     s8 += 4;
        sections.put("Network", new int[]{s8, 15});

        // ── Advanced Security (max 11) ───────────────────────────────────
        int s9 = 0;
        if (!r.isVulnerabilityScanning())  s9 += 3;
        if (!r.isPenetrationTesting())     s9 += 3;
        if (!r.isRealtimeLogMonitoring())  s9 += 3;
        if (!r.isSiemTools())              s9 += 2;
        sections.put("Advanced Security", new int[]{s9, 11});

        // ── Org modifier (max 5) ─────────────────────────────────────────
        int orgMod = 0;
        if ("LARGE".equals(r.getEmployeeCount()))          orgMod += 3;
        if ("ON_PREM".equals(r.getItInfrastructure()))     orgMod += 2;

        int rawTotal  = sections.values().stream().mapToInt(v -> v[0]).sum() + orgMod;
        int maxTotal  = sections.values().stream().mapToInt(v -> v[1]).sum() + 5;
        int riskScore = (int) Math.min(Math.round(rawTotal * 100.0 / maxTotal), 100);

        r.setRiskScore(riskScore);
        r.setRiskLevel(riskScore >= 75 ? "CRITICAL"
                     : riskScore >= 50 ? "HIGH"
                     : riskScore >= 25 ? "MEDIUM" : "LOW");

        // ── ISO 27001 Score (0–100, higher = better) ────────────────────
        int isoOk = bool(r.isIsoSecurityPolicy()) + bool(r.isIsoAssetManagement())
                  + bool(r.isIsoAccessControl())  + bool(r.isIsoIncidentHandling());
        // bonus from existing controls
        isoOk += bool(r.isHasRbac()) + bool(r.isAdminActivitiesLogged())
               + bool(r.isRegularAudits()) + bool(r.isHasEncryption());
        int isoScore = Math.min((isoOk * 100) / 8, 100);
        r.setIsoScore(isoScore);

        // ── NIST Score ───────────────────────────────────────────────────
        int nistOk = bool(r.isNistIdentify()) + bool(r.isNistProtect())
                   + bool(r.isNistDetect())   + bool(r.isNistRespond()) + bool(r.isNistRecover());
        // bonus from existing controls
        nistOk += bool(r.isVulnerabilityScanning()) + bool(r.isHasIncidentResponsePlan())
                + bool(r.isRealtimeLogMonitoring())  + bool(r.isRegularBackups());
        int nistScore = Math.min((nistOk * 100) / 9, 100);
        r.setNistScore(nistScore);

        // ── GDPR Score ───────────────────────────────────────────────────
        int gdprOk = bool(r.isGdprDataEncrypted())    + bool(r.isGdprConsentCollected())
                   + bool(r.isGdprDataMinimized())    + bool(r.isGdprRightToDelete());
        // bonus from existing controls
        gdprOk += bool(r.isHasEncryption()) + bool(r.isDataRetentionPolicy())
                + bool(r.isRegularBackups());
        int gdprScore = Math.min((gdprOk * 100) / 7, 100);
        r.setGdprScore(gdprScore);

        // ── Overall Compliance Score ─────────────────────────────────────
        r.setComplianceScore((isoScore + nistScore + gdprScore) / 3);

        // ── Section Scores JSON ──────────────────────────────────────────
        StringBuilder sb = new StringBuilder("[");
        sections.forEach((name, vals) -> {
            double pct = vals[1] > 0 ? (vals[0] * 100.0 / vals[1]) : 0;
            String lvl = pct >= 75 ? "CRITICAL" : pct >= 50 ? "HIGH" : pct >= 25 ? "MEDIUM" : "LOW";
            sb.append(String.format("{\"section\":\"%s\",\"score\":%d,\"max\":%d,\"pct\":%.1f,\"level\":\"%s\"},",
                    name, vals[0], vals[1], pct, lvl));
        });
        if (sb.charAt(sb.length() - 1) == ',') sb.deleteCharAt(sb.length() - 1);
        sb.append("]");
        r.setSectionScores(sb.toString());

        r.setRecommendations(String.join("||", buildRecommendations(r)));
    }

    private int bool(boolean v) { return v ? 1 : 0; }

    private List<String> buildRecommendations(QuestionnaireResponse r) {
        List<String> recs = new ArrayList<>();

        // ── CRITICAL ────────────────────────────────────────────────────
        if (!r.isHasMfa())
            recs.add("CRITICAL: Enable Multi-Factor Authentication (MFA) — prevents 99% of account compromise attacks.");
        if (!r.isHasEncryption() && isSensitive(r.getDataClassification()))
            recs.add("CRITICAL: Implement end-to-end encryption immediately — sensitive data is currently exposed.");
        if (r.isHadBreaches() && !r.isHasIncidentResponsePlan())
            recs.add("CRITICAL: You have experienced breaches but lack an Incident Response Plan — create one immediately.");
        if ("HIGHLY_SENSITIVE".equals(r.getDataClassification()) && !r.isRegularBackups())
            recs.add("CRITICAL: Highly sensitive data has no regular backups — implement automated daily backups now.");
        if (!r.isGdprDataEncrypted() && !r.isGdprConsentCollected())
            recs.add("CRITICAL: GDPR violations detected — personal data is neither encrypted nor consent-collected. Legal risk is severe.");
        if (!r.isIsoSecurityPolicy())
            recs.add("CRITICAL: No Information Security Policy defined — ISO 27001 Clause 5.2 requires a documented policy.");

        // ── HIGH ─────────────────────────────────────────────────────────
        if (!r.isHasFirewall())
            recs.add("HIGH: Deploy a network firewall to protect against external threats and unauthorized access.");
        if (!r.isHasAntivirus())
            recs.add("HIGH: Install enterprise-grade antivirus/EDR solution across all endpoints.");
        if (!r.isHasRbac())
            recs.add("HIGH: Implement Role-Based Access Control (RBAC) to enforce least-privilege principles.");
        if (r.isHadBreaches())
            recs.add("HIGH: Conduct a thorough post-incident review and implement a corrective action plan.");
        if ("RARELY".equals(r.getUpdateFrequency()))
            recs.add("HIGH: Establish a regular patch management schedule — unpatched systems are the #1 attack vector.");
        if (!r.isNetworkSegmentation())
            recs.add("HIGH: Implement network segmentation (VLANs/DMZ) to contain breaches and limit lateral movement.");
        if (!r.isVpnRemoteAccess())
            recs.add("HIGH: Enforce VPN or Zero Trust Network Access for all remote connections.");
        if (!r.isSecurityTraining())
            recs.add("HIGH: Implement mandatory security awareness training — human error causes 82% of breaches.");
        if (!r.isAdminActivitiesLogged())
            recs.add("HIGH: Enable comprehensive admin activity logging with tamper-proof audit trails.");
        if (!r.isIdsIps())
            recs.add("HIGH: Deploy IDS/IPS systems to detect and block malicious network activity in real-time.");
        if (!r.isNistIdentify())
            recs.add("HIGH: NIST Identify function gap — document all assets, risks, and threat landscape.");
        if (!r.isNistProtect())
            recs.add("HIGH: NIST Protect function gap — implement safeguards including access controls and training.");
        if (!r.isIsoAssetManagement())
            recs.add("HIGH: ISO 27001 A.8 — Implement a formal asset inventory and classification process.");
        if (!r.isGdprConsentCollected())
            recs.add("HIGH: GDPR Article 7 — Implement explicit user consent collection for all data processing activities.");

        // ── MEDIUM ───────────────────────────────────────────────────────
        if (!r.isStrongPasswords())
            recs.add("MEDIUM: Enforce password complexity, minimum length (12+ chars), and rotation policies.");
        if (!r.isNetworkMonitoring())
            recs.add("MEDIUM: Deploy network monitoring tools to detect anomalous traffic patterns.");
        if (!r.isInactiveAccountsRemoved())
            recs.add("MEDIUM: Implement automated account lifecycle management to disable inactive accounts.");
        if (!r.isPrivilegeEscalationMonitored())
            recs.add("MEDIUM: Implement PAM (Privileged Access Management) to monitor privilege escalation.");
        if ("MONTHLY".equals(r.getUpdateFrequency()))
            recs.add("MEDIUM: Increase patch update frequency to weekly to reduce vulnerability exposure windows.");
        if (!r.isPatchesAppliedImmediately())
            recs.add("MEDIUM: Implement an emergency patch process for critical CVEs with SLA under 24 hours.");
        if (!r.isBackupsEncrypted())
            recs.add("MEDIUM: Encrypt all backups and store copies in geographically separate, secure locations.");
        if (!r.isRegularAudits())
            recs.add("MEDIUM: Schedule annual external audits and quarterly internal security reviews.");
        if (!r.isOpenPortsAudited())
            recs.add("MEDIUM: Conduct regular port scans and close all unnecessary open ports and services.");
        if (!r.isVulnerabilityScanning())
            recs.add("MEDIUM: Schedule automated vulnerability scans weekly and remediate critical findings within 72 hours.");
        if (!r.isNistDetect())
            recs.add("MEDIUM: NIST Detect function gap — implement continuous monitoring and anomaly detection.");
        if (!r.isNistRespond())
            recs.add("MEDIUM: NIST Respond function gap — develop and test incident response procedures.");
        if (!r.isNistRecover())
            recs.add("MEDIUM: NIST Recover function gap — establish and test business continuity and recovery plans.");
        if (!r.isGdprDataMinimized())
            recs.add("MEDIUM: GDPR Article 5(1)(c) — Apply data minimization principles, collect only what is necessary.");
        if (!r.isIsoIncidentHandling())
            recs.add("MEDIUM: ISO 27001 A.16 — Establish a formal incident management and reporting procedure.");

        // ── LOW ──────────────────────────────────────────────────────────
        if (!r.isAutomatedUpdates())
            recs.add("LOW: Deploy automated patch management tools to reduce manual overhead and human error.");
        if (!r.isIncidentsDocumented())
            recs.add("LOW: Establish a lessons-learned process to improve security posture after each incident.");
        if (!r.isDataRetentionPolicy())
            recs.add("LOW: Define and enforce data retention schedules with secure disposal procedures.");
        if (!r.isPenetrationTesting())
            recs.add("LOW: Engage a qualified third-party for annual penetration testing.");
        if (!r.isRealtimeLogMonitoring())
            recs.add("LOW: Implement real-time log monitoring with automated alerting for suspicious events.");
        if (!r.isSiemTools())
            recs.add("LOW: Consider deploying a SIEM solution for centralized threat detection and correlation.");
        if (!r.isGdprRightToDelete())
            recs.add("LOW: GDPR Article 17 — Implement a Right to Erasure (Right to be Forgotten) process.");

        // ── GOOD (positive feedback) ─────────────────────────────────────
        if (r.isHasFirewall())
            recs.add("GOOD: Firewall is properly configured — network perimeter protection is active.");
        if (r.isHasMfa())
            recs.add("GOOD: Multi-Factor Authentication is enabled — account security is significantly strengthened.");
        if (r.isHasEncryption())
            recs.add("GOOD: Data encryption is implemented — sensitive data is protected at rest and in transit.");
        if (r.isHasIncidentResponsePlan())
            recs.add("GOOD: Incident Response Plan is in place — your organization is prepared to handle security events.");

        if (recs.stream().noneMatch(s -> s.startsWith("CRITICAL") || s.startsWith("HIGH")))
            recs.add(0, "GOOD: Excellent security posture. Continue regular audits and maintain current controls.");

        return recs;
    }

    private boolean isSensitive(String dc) {
        return "CONFIDENTIAL".equals(dc) || "HIGHLY_SENSITIVE".equals(dc);
    }
}
