package com.audit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "questionnaire_responses")
public class QuestionnaireResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // ── Section 1: Organization ──────────────────────────────────────────
    private String companyName;
    private String industryType;
    private String employeeCount;
    private String itInfrastructure;

    // ── Section 2: Security Controls ────────────────────────────────────
    private boolean hasFirewall;
    private boolean hasAntivirus;
    private boolean hasMfa;
    private boolean hasEncryption;
    private boolean strongPasswords;
    private boolean hasRbac;
    private boolean networkMonitoring;

    // ── Section 3: Access & Identity ────────────────────────────────────
    private boolean inactiveAccountsRemoved;
    private boolean adminActivitiesLogged;
    private boolean privilegeEscalationMonitored;

    // ── Section 4: Patch Management ─────────────────────────────────────
    private String updateFrequency;
    private boolean patchesAppliedImmediately;
    private boolean automatedUpdates;

    // ── Section 5: Incident History ─────────────────────────────────────
    private boolean hadBreaches;
    private String incidentCount;
    private boolean hasIncidentResponsePlan;
    private boolean incidentsDocumented;

    // ── Section 6: Data Sensitivity ─────────────────────────────────────
    private String dataClassification;
    private boolean regularBackups;
    private boolean backupsEncrypted;
    private boolean dataRetentionPolicy;

    // ── Section 7: Compliance & Governance ──────────────────────────────
    @Column(length = 500)
    private String complianceStandards;
    private boolean regularAudits;
    private boolean securityTraining;

    // ── Section 8: Network & Infrastructure ─────────────────────────────
    private boolean networkSegmentation;
    private boolean idsIps;
    private boolean openPortsAudited;
    private boolean vpnRemoteAccess;

    // ── Section 9: Advanced Security ────────────────────────────────────
    private boolean vulnerabilityScanning;
    private boolean penetrationTesting;
    private boolean realtimeLogMonitoring;
    private boolean siemTools;

    // ── Section 10: ISO 27001 Compliance ────────────────────────────────
    private boolean isoSecurityPolicy;
    private boolean isoAssetManagement;
    private boolean isoAccessControl;
    private boolean isoIncidentHandling;

    // ── Section 11: NIST Framework ──────────────────────────────────────
    private boolean nistIdentify;
    private boolean nistProtect;
    private boolean nistDetect;
    private boolean nistRespond;
    private boolean nistRecover;

    // ── Section 12: GDPR Compliance ─────────────────────────────────────
    private boolean gdprDataEncrypted;
    private boolean gdprConsentCollected;
    private boolean gdprDataMinimized;
    private boolean gdprRightToDelete;

    // ── Computed Results ─────────────────────────────────────────────────
    private Integer riskScore;
    private String  riskLevel;
    private Integer isoScore;
    private Integer nistScore;
    private Integer gdprScore;
    private Integer complianceScore;

    @Column(length = 6000)
    private String recommendations;

    @Column(length = 6000)
    private String sectionScores;

    private LocalDateTime submittedAt = LocalDateTime.now();

    public QuestionnaireResponse() {}

    // ── Getters & Setters ────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String v) { this.companyName = v; }

    public String getIndustryType() { return industryType; }
    public void setIndustryType(String v) { this.industryType = v; }

    public String getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(String v) { this.employeeCount = v; }

    public String getItInfrastructure() { return itInfrastructure; }
    public void setItInfrastructure(String v) { this.itInfrastructure = v; }

    public boolean isHasFirewall() { return hasFirewall; }
    public void setHasFirewall(boolean v) { this.hasFirewall = v; }

    public boolean isHasAntivirus() { return hasAntivirus; }
    public void setHasAntivirus(boolean v) { this.hasAntivirus = v; }

    public boolean isHasMfa() { return hasMfa; }
    public void setHasMfa(boolean v) { this.hasMfa = v; }

    public boolean isHasEncryption() { return hasEncryption; }
    public void setHasEncryption(boolean v) { this.hasEncryption = v; }

    public boolean isStrongPasswords() { return strongPasswords; }
    public void setStrongPasswords(boolean v) { this.strongPasswords = v; }

    public boolean isHasRbac() { return hasRbac; }
    public void setHasRbac(boolean v) { this.hasRbac = v; }

    public boolean isNetworkMonitoring() { return networkMonitoring; }
    public void setNetworkMonitoring(boolean v) { this.networkMonitoring = v; }

    public boolean isInactiveAccountsRemoved() { return inactiveAccountsRemoved; }
    public void setInactiveAccountsRemoved(boolean v) { this.inactiveAccountsRemoved = v; }

    public boolean isAdminActivitiesLogged() { return adminActivitiesLogged; }
    public void setAdminActivitiesLogged(boolean v) { this.adminActivitiesLogged = v; }

    public boolean isPrivilegeEscalationMonitored() { return privilegeEscalationMonitored; }
    public void setPrivilegeEscalationMonitored(boolean v) { this.privilegeEscalationMonitored = v; }

    public String getUpdateFrequency() { return updateFrequency; }
    public void setUpdateFrequency(String v) { this.updateFrequency = v; }

    public boolean isPatchesAppliedImmediately() { return patchesAppliedImmediately; }
    public void setPatchesAppliedImmediately(boolean v) { this.patchesAppliedImmediately = v; }

    public boolean isAutomatedUpdates() { return automatedUpdates; }
    public void setAutomatedUpdates(boolean v) { this.automatedUpdates = v; }

    public boolean isHadBreaches() { return hadBreaches; }
    public void setHadBreaches(boolean v) { this.hadBreaches = v; }

    public String getIncidentCount() { return incidentCount; }
    public void setIncidentCount(String v) { this.incidentCount = v; }

    public boolean isHasIncidentResponsePlan() { return hasIncidentResponsePlan; }
    public void setHasIncidentResponsePlan(boolean v) { this.hasIncidentResponsePlan = v; }

    public boolean isIncidentsDocumented() { return incidentsDocumented; }
    public void setIncidentsDocumented(boolean v) { this.incidentsDocumented = v; }

    public String getDataClassification() { return dataClassification; }
    public void setDataClassification(String v) { this.dataClassification = v; }

    public boolean isRegularBackups() { return regularBackups; }
    public void setRegularBackups(boolean v) { this.regularBackups = v; }

    public boolean isBackupsEncrypted() { return backupsEncrypted; }
    public void setBackupsEncrypted(boolean v) { this.backupsEncrypted = v; }

    public boolean isDataRetentionPolicy() { return dataRetentionPolicy; }
    public void setDataRetentionPolicy(boolean v) { this.dataRetentionPolicy = v; }

    public String getComplianceStandards() { return complianceStandards; }
    public void setComplianceStandards(String v) { this.complianceStandards = v; }

    public boolean isRegularAudits() { return regularAudits; }
    public void setRegularAudits(boolean v) { this.regularAudits = v; }

    public boolean isSecurityTraining() { return securityTraining; }
    public void setSecurityTraining(boolean v) { this.securityTraining = v; }

    public boolean isNetworkSegmentation() { return networkSegmentation; }
    public void setNetworkSegmentation(boolean v) { this.networkSegmentation = v; }

    public boolean isIdsIps() { return idsIps; }
    public void setIdsIps(boolean v) { this.idsIps = v; }

    public boolean isOpenPortsAudited() { return openPortsAudited; }
    public void setOpenPortsAudited(boolean v) { this.openPortsAudited = v; }

    public boolean isVpnRemoteAccess() { return vpnRemoteAccess; }
    public void setVpnRemoteAccess(boolean v) { this.vpnRemoteAccess = v; }

    public boolean isVulnerabilityScanning() { return vulnerabilityScanning; }
    public void setVulnerabilityScanning(boolean v) { this.vulnerabilityScanning = v; }

    public boolean isPenetrationTesting() { return penetrationTesting; }
    public void setPenetrationTesting(boolean v) { this.penetrationTesting = v; }

    public boolean isRealtimeLogMonitoring() { return realtimeLogMonitoring; }
    public void setRealtimeLogMonitoring(boolean v) { this.realtimeLogMonitoring = v; }

    public boolean isSiemTools() { return siemTools; }
    public void setSiemTools(boolean v) { this.siemTools = v; }

    // ISO 27001
    public boolean isIsoSecurityPolicy() { return isoSecurityPolicy; }
    public void setIsoSecurityPolicy(boolean v) { this.isoSecurityPolicy = v; }

    public boolean isIsoAssetManagement() { return isoAssetManagement; }
    public void setIsoAssetManagement(boolean v) { this.isoAssetManagement = v; }

    public boolean isIsoAccessControl() { return isoAccessControl; }
    public void setIsoAccessControl(boolean v) { this.isoAccessControl = v; }

    public boolean isIsoIncidentHandling() { return isoIncidentHandling; }
    public void setIsoIncidentHandling(boolean v) { this.isoIncidentHandling = v; }

    // NIST
    public boolean isNistIdentify() { return nistIdentify; }
    public void setNistIdentify(boolean v) { this.nistIdentify = v; }

    public boolean isNistProtect() { return nistProtect; }
    public void setNistProtect(boolean v) { this.nistProtect = v; }

    public boolean isNistDetect() { return nistDetect; }
    public void setNistDetect(boolean v) { this.nistDetect = v; }

    public boolean isNistRespond() { return nistRespond; }
    public void setNistRespond(boolean v) { this.nistRespond = v; }

    public boolean isNistRecover() { return nistRecover; }
    public void setNistRecover(boolean v) { this.nistRecover = v; }

    // GDPR
    public boolean isGdprDataEncrypted() { return gdprDataEncrypted; }
    public void setGdprDataEncrypted(boolean v) { this.gdprDataEncrypted = v; }

    public boolean isGdprConsentCollected() { return gdprConsentCollected; }
    public void setGdprConsentCollected(boolean v) { this.gdprConsentCollected = v; }

    public boolean isGdprDataMinimized() { return gdprDataMinimized; }
    public void setGdprDataMinimized(boolean v) { this.gdprDataMinimized = v; }

    public boolean isGdprRightToDelete() { return gdprRightToDelete; }
    public void setGdprRightToDelete(boolean v) { this.gdprRightToDelete = v; }

    // Computed
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer v) { this.riskScore = v; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String v) { this.riskLevel = v; }

    public Integer getIsoScore() { return isoScore; }
    public void setIsoScore(Integer v) { this.isoScore = v; }

    public Integer getNistScore() { return nistScore; }
    public void setNistScore(Integer v) { this.nistScore = v; }

    public Integer getGdprScore() { return gdprScore; }
    public void setGdprScore(Integer v) { this.gdprScore = v; }

    public Integer getComplianceScore() { return complianceScore; }
    public void setComplianceScore(Integer v) { this.complianceScore = v; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String v) { this.recommendations = v; }

    public String getSectionScores() { return sectionScores; }
    public void setSectionScores(String v) { this.sectionScores = v; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime v) { this.submittedAt = v; }
}
