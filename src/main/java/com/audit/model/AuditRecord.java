package com.audit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_records")
public class AuditRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // ── Section 1: Organisation ──────────────────────────────────────
    private String companyName;
    @Enumerated(EnumType.STRING)
    private AuditType auditType;
    private Integer numberOfEmployees;
    @Enumerated(EnumType.STRING)
    private ComplianceLevel complianceLevel;
    @Enumerated(EnumType.STRING)
    private DataSensitivity dataSensitivity;
    @Enumerated(EnumType.STRING)
    private UpdateFrequency updateFrequency;
    private boolean previousIncidents;

    // ── Section 2: Core Security Controls ───────────────────────────
    private boolean hasFirewall;
    private boolean hasAntivirus;
    private boolean hasEncryption;
    private boolean hasMfa;
    private boolean hasRbac;
    private boolean strongPasswords;
    private boolean networkMonitoring;
    private boolean idsIps;

    // ── Section 3: Access & Identity ────────────────────────────────
    private boolean inactiveAccountsRemoved;
    private boolean adminActivitiesLogged;
    private boolean privilegeEscalationMonitored;

    // ── Section 4: Patch Management ─────────────────────────────────
    private boolean patchesAppliedImmediately;
    private boolean automatedUpdates;

    // ── Section 5: Incident History ─────────────────────────────────
    private String incidentCount;
    private boolean hasIncidentResponsePlan;
    private boolean incidentsDocumented;

    // ── Section 6: Data Protection ──────────────────────────────────
    private boolean regularBackups;
    private boolean backupsEncrypted;
    private boolean dataRetentionPolicy;

    // ── Section 7: Network ──────────────────────────────────────────
    private boolean networkSegmentation;
    private boolean vpnRemoteAccess;
    private boolean openPortsAudited;

    // ── Section 8: Monitoring ───────────────────────────────────────
    private boolean siemTools;
    private boolean realtimeLogMonitoring;

    // ── Section 9: Vulnerability ────────────────────────────────────
    private boolean vulnerabilityScanning;
    private boolean penetrationTesting;

    // ── Section 10: Compliance ──────────────────────────────────────
    @Column(length = 100)
    private String complianceStandards;
    private boolean regularAudits;
    private boolean securityTraining;

    // ── Computed ─────────────────────────────────────────────────────
    private Integer riskScore;
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @Column(length = 4000)
    private String recommendations;

    private LocalDateTime submittedAt = LocalDateTime.now();

    public enum AuditType      { FINANCIAL, SECURITY, COMPLIANCE }
    public enum ComplianceLevel { LOW, MEDIUM, HIGH }
    public enum DataSensitivity { LOW, MEDIUM, HIGH, CRITICAL }
    public enum UpdateFrequency { RARELY, MONTHLY, WEEKLY, DAILY }
    public enum RiskLevel       { LOW, MEDIUM, HIGH, CRITICAL }

    public AuditRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String v) { this.companyName = v; }
    public AuditType getAuditType() { return auditType; }
    public void setAuditType(AuditType v) { this.auditType = v; }
    public Integer getNumberOfEmployees() { return numberOfEmployees; }
    public void setNumberOfEmployees(Integer v) { this.numberOfEmployees = v; }
    public ComplianceLevel getComplianceLevel() { return complianceLevel; }
    public void setComplianceLevel(ComplianceLevel v) { this.complianceLevel = v; }
    public DataSensitivity getDataSensitivity() { return dataSensitivity; }
    public void setDataSensitivity(DataSensitivity v) { this.dataSensitivity = v; }
    public UpdateFrequency getUpdateFrequency() { return updateFrequency; }
    public void setUpdateFrequency(UpdateFrequency v) { this.updateFrequency = v; }
    public boolean isPreviousIncidents() { return previousIncidents; }
    public void setPreviousIncidents(boolean v) { this.previousIncidents = v; }
    public boolean isHasFirewall() { return hasFirewall; }
    public void setHasFirewall(boolean v) { this.hasFirewall = v; }
    public boolean isHasAntivirus() { return hasAntivirus; }
    public void setHasAntivirus(boolean v) { this.hasAntivirus = v; }
    public boolean isHasEncryption() { return hasEncryption; }
    public void setHasEncryption(boolean v) { this.hasEncryption = v; }
    public boolean isHasMfa() { return hasMfa; }
    public void setHasMfa(boolean v) { this.hasMfa = v; }
    public boolean isHasRbac() { return hasRbac; }
    public void setHasRbac(boolean v) { this.hasRbac = v; }
    public boolean isStrongPasswords() { return strongPasswords; }
    public void setStrongPasswords(boolean v) { this.strongPasswords = v; }
    public boolean isNetworkMonitoring() { return networkMonitoring; }
    public void setNetworkMonitoring(boolean v) { this.networkMonitoring = v; }
    public boolean isIdsIps() { return idsIps; }
    public void setIdsIps(boolean v) { this.idsIps = v; }
    public boolean isInactiveAccountsRemoved() { return inactiveAccountsRemoved; }
    public void setInactiveAccountsRemoved(boolean v) { this.inactiveAccountsRemoved = v; }
    public boolean isAdminActivitiesLogged() { return adminActivitiesLogged; }
    public void setAdminActivitiesLogged(boolean v) { this.adminActivitiesLogged = v; }
    public boolean isPrivilegeEscalationMonitored() { return privilegeEscalationMonitored; }
    public void setPrivilegeEscalationMonitored(boolean v) { this.privilegeEscalationMonitored = v; }
    public boolean isPatchesAppliedImmediately() { return patchesAppliedImmediately; }
    public void setPatchesAppliedImmediately(boolean v) { this.patchesAppliedImmediately = v; }
    public boolean isAutomatedUpdates() { return automatedUpdates; }
    public void setAutomatedUpdates(boolean v) { this.automatedUpdates = v; }
    public String getIncidentCount() { return incidentCount; }
    public void setIncidentCount(String v) { this.incidentCount = v; }
    public boolean isHasIncidentResponsePlan() { return hasIncidentResponsePlan; }
    public void setHasIncidentResponsePlan(boolean v) { this.hasIncidentResponsePlan = v; }
    public boolean isIncidentsDocumented() { return incidentsDocumented; }
    public void setIncidentsDocumented(boolean v) { this.incidentsDocumented = v; }
    public boolean isRegularBackups() { return regularBackups; }
    public void setRegularBackups(boolean v) { this.regularBackups = v; }
    public boolean isBackupsEncrypted() { return backupsEncrypted; }
    public void setBackupsEncrypted(boolean v) { this.backupsEncrypted = v; }
    public boolean isDataRetentionPolicy() { return dataRetentionPolicy; }
    public void setDataRetentionPolicy(boolean v) { this.dataRetentionPolicy = v; }
    public boolean isNetworkSegmentation() { return networkSegmentation; }
    public void setNetworkSegmentation(boolean v) { this.networkSegmentation = v; }
    public boolean isVpnRemoteAccess() { return vpnRemoteAccess; }
    public void setVpnRemoteAccess(boolean v) { this.vpnRemoteAccess = v; }
    public boolean isOpenPortsAudited() { return openPortsAudited; }
    public void setOpenPortsAudited(boolean v) { this.openPortsAudited = v; }
    public boolean isSiemTools() { return siemTools; }
    public void setSiemTools(boolean v) { this.siemTools = v; }
    public boolean isRealtimeLogMonitoring() { return realtimeLogMonitoring; }
    public void setRealtimeLogMonitoring(boolean v) { this.realtimeLogMonitoring = v; }
    public boolean isVulnerabilityScanning() { return vulnerabilityScanning; }
    public void setVulnerabilityScanning(boolean v) { this.vulnerabilityScanning = v; }
    public boolean isPenetrationTesting() { return penetrationTesting; }
    public void setPenetrationTesting(boolean v) { this.penetrationTesting = v; }
    public String getComplianceStandards() { return complianceStandards; }
    public void setComplianceStandards(String v) { this.complianceStandards = v; }
    public boolean isRegularAudits() { return regularAudits; }
    public void setRegularAudits(boolean v) { this.regularAudits = v; }
    public boolean isSecurityTraining() { return securityTraining; }
    public void setSecurityTraining(boolean v) { this.securityTraining = v; }
    public Integer getRiskScore() { return riskScore; }
    public void setRiskScore(Integer v) { this.riskScore = v; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel v) { this.riskLevel = v; }
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String v) { this.recommendations = v; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime v) { this.submittedAt = v; }
}
