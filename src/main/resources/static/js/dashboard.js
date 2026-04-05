// ── Guard ────────────────────────────────────────────────────────────
if (!Auth.isLoggedIn()) window.location.href = '/';

// ── Init Sidebar ─────────────────────────────────────────────────────
(function () {
  const u = Auth.user;
  if (!u) return;
  ['sb-username','top-username'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = u.username; });
  ['user-av','top-av'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = u.username[0].toUpperCase(); });
  const roleEl = document.getElementById('sb-role');
  if (roleEl) roleEl.textContent = u.role;
  if (u.role === 'ADMIN' || u.role === 'AUDITOR') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
  }
})();

// ── Theme ─────────────────────────────────────────────────────────────
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  document.body.classList.toggle('dark-mode', !isLight);
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.replace('dark-mode', 'light-mode');
}

// ── Navigation ────────────────────────────────────────────────────────
const pageTitles = { 'pg-home':'Dashboard', 'pg-audit':'New Audit', 'pg-history':'My Audits', 'pg-admin':'Admin Panel' };
let currentAuditId = null;
let homeDonut = null, homeBar = null, admDonut = null, admBar = null, auditBarChart = null;

function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId)?.classList.add('active');
  document.querySelectorAll('.nav-btn[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === pageId));
  const t = document.getElementById('page-title');
  if (t) t.textContent = pageTitles[pageId] || 'Dashboard';
  if (pageId === 'pg-home')    loadHome();
  if (pageId === 'pg-history') loadHistory();
  if (pageId === 'pg-admin')   loadAdmin();
}

// ── HOME ──────────────────────────────────────────────────────────────
async function loadHome() {
  try {
    let audits, stats;
    if (Auth.isAuditor()) {
      [audits, stats] = await Promise.all([API.get('/admin/audits'), API.get('/admin/stats')]);
    } else {
      audits = await API.get('/audits');
      stats  = buildStats(audits);
    }
    const dist = stats.riskDistribution || {};
    document.getElementById('kpi-total').textContent    = stats.total ?? audits.length;
    document.getElementById('kpi-avg').textContent      = stats.avgRiskScore != null ? Math.round(stats.avgRiskScore) : '—';
    document.getElementById('kpi-critical').textContent = dist.CRITICAL ?? 0;
    document.getElementById('kpi-low').textContent      = dist.LOW ?? 0;
    renderHomeCharts(dist, audits);
  } catch (e) { console.error('Home error:', e); }
}

function buildStats(audits) {
  const dist = {};
  let total = 0;
  audits.forEach(a => { dist[a.riskLevel] = (dist[a.riskLevel] || 0) + 1; total += a.riskScore || 0; });
  return { total: audits.length, avgRiskScore: audits.length ? total / audits.length : 0, riskDistribution: dist };
}

function renderHomeCharts(dist, audits) {
  const order  = ['LOW','MEDIUM','HIGH','CRITICAL'];
  const labels = order.filter(k => dist[k]);
  const values = labels.map(k => dist[k]);
  const colors = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };

  if (homeDonut) homeDonut.destroy();
  homeDonut = makeDonut('home-donut', labels, values, labels.map(l => colors[l]));

  if (homeBar) homeBar.destroy();
  homeBar = makeBar('home-bar', labels, [{
    label:'Audits', data: values,
    backgroundColor: labels.map(l => colors[l] + 'cc'),
    borderColor: labels.map(l => colors[l]),
    borderWidth: 2, borderRadius: 6
  }]);

  const el = document.getElementById('recent-list');
  const recent = [...audits].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0,6);
  el.innerHTML = recent.length ? recent.map(a => `
    <div class="recent-item">
      <div>
        <div class="recent-company">${escHtml(a.companyName)}</div>
        <div class="recent-meta">${a.auditType} · ${UI.formatDate(a.submittedAt)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="recent-score">${a.riskScore}</span>
        ${UI.riskBadge(a.riskLevel)}
      </div>
    </div>`).join('') : '<div class="empty-state">No audits yet. Submit your first audit!</div>';
}

// ── FORM HELPERS ──────────────────────────────────────────────────────
function togglePill(label) {
  const cb = label.querySelector('input[type="checkbox"]');
  cb.checked = !cb.checked;
  label.classList.toggle('on', cb.checked);
}

function cb(id) { return document.getElementById(id)?.checked || false; }
function val(id) { return document.getElementById(id)?.value || ''; }

// ── AUDIT FORM SUBMIT ─────────────────────────────────────────────────
document.getElementById('audit-form').addEventListener('submit', async e => {
  e.preventDefault();
  UI.clearAlert('audit-alert');
  const btn = document.getElementById('audit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin" style="border-top-color:#fff;display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;margin-right:8px"></span> Analysing...';

  const empMap = { '1': 25, '100': 150, '1000': 1000 };

  const payload = {
    // Section 1 — Organisation
    companyName:       val('f-company').trim(),
    auditType:         val('f-type'),
    numberOfEmployees: empMap[val('f-employees')] || 50,
    complianceLevel:   val('f-compliance'),
    dataSensitivity:   val('f-sensitivity'),
    updateFrequency:   val('f-frequency'),
    previousIncidents: val('f-incidents') === 'true',
    // Section 2 — Core Security
    hasFirewall:       cb('f-firewall'),
    hasAntivirus:      cb('f-antivirus'),
    hasEncryption:     cb('f-encryption'),
    hasMfa:            cb('f-mfa'),
    hasRbac:           cb('f-rbac'),
    strongPasswords:   cb('f-strong-pwd'),
    networkMonitoring: cb('f-net-monitor'),
    idsIps:            cb('f-ids-ips'),
    // Section 3 — Access & Identity
    inactiveAccountsRemoved:      cb('f-inactive-acc'),
    adminActivitiesLogged:         cb('f-admin-log'),
    privilegeEscalationMonitored:  cb('f-priv-esc'),
    // Section 4 — Patch
    patchesAppliedImmediately: cb('f-patch-immed'),
    automatedUpdates:          cb('f-auto-update'),
    // Section 5 — Incidents
    incidentCount:           val('f-inc-count'),
    hasIncidentResponsePlan: cb('f-irp'),
    incidentsDocumented:     cb('f-inc-doc'),
    // Section 6 — Data
    regularBackups:      cb('f-backups'),
    backupsEncrypted:    cb('f-backup-enc'),
    dataRetentionPolicy: cb('f-retention'),
    // Section 7 — Network
    networkSegmentation: cb('f-net-seg'),
    vpnRemoteAccess:     cb('f-vpn'),
    openPortsAudited:    cb('f-ports'),
    // Section 8 — Monitoring
    siemTools:            cb('f-siem'),
    realtimeLogMonitoring: cb('f-rt-log'),
    // Section 9 — Vulnerability
    vulnerabilityScanning: cb('f-vuln-scan'),
    penetrationTesting:    cb('f-pen-test'),
    // Section 10 — Compliance
    complianceStandards: val('f-std'),
    regularAudits:       cb('f-reg-audit'),
    securityTraining:    cb('f-training'),
  };

  try {
    const result = await API.post('/audits', payload);
    currentAuditId = result.id;
    showAuditResult(result);
  } catch (err) {
    UI.alert('audit-alert', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Analyse &amp; Generate Full Report`;
  }
});

// ── SHOW RESULT ───────────────────────────────────────────────────────
function showAuditResult(audit) {
  document.getElementById('audit-form-wrap').style.display = 'none';
  const wrap = document.getElementById('audit-result-wrap');
  wrap.style.display = 'block';

  document.getElementById('result-title').textContent = escHtml(audit.companyName) + ' — Risk Report';

  // Risk meter
  drawRiskMeter(audit.riskScore, 'audit-risk-meter');
  document.getElementById('audit-risk-badge').innerHTML = UI.riskBadge(audit.riskLevel);

  // Controls grid — show all key controls
  const controls = [
    { name:'Firewall',    ok: audit.hasFirewall },
    { name:'Antivirus',   ok: audit.hasAntivirus },
    { name:'Encryption',  ok: audit.hasEncryption },
    { name:'MFA',         ok: audit.hasMfa },
    { name:'RBAC',        ok: audit.hasRbac },
    { name:'Passwords',   ok: audit.strongPasswords },
    { name:'Net Monitor', ok: audit.networkMonitoring },
    { name:'IDS/IPS',     ok: audit.idsIps },
  ];
  document.getElementById('controls-status').innerHTML = controls.map(c => `
    <div class="ctrl-item ${c.ok ? 'ok' : 'bad'}">
      <div class="ctrl-dot"></div>
      <span>${c.name}</span>
      <span style="margin-left:auto;font-size:.75rem;font-weight:700">${c.ok ? '✓' : '✗'}</span>
    </div>`).join('');

  // Bar chart
  if (auditBarChart) auditBarChart.destroy();
  setTimeout(() => {
    const implemented = controls.map(c => c.ok ? 1 : 0);
    const missing     = controls.map(c => c.ok ? 0 : 1);
    auditBarChart = makeBar('audit-bar-chart',
      controls.map(c => c.name),
      [
        { label:'Implemented', data: implemented, backgroundColor:'rgba(34,197,94,.7)', borderColor:'#22c55e', borderWidth:2, borderRadius:5 },
        { label:'Missing',     data: missing,     backgroundColor:'rgba(239,68,68,.7)', borderColor:'#ef4444', borderWidth:2, borderRadius:5 }
      ]);
  }, 80);

  // Recommendations
  renderRecs(audit.recommendations);
  wrap.scrollIntoView({ behavior:'smooth' });
}

// ── RECOMMENDATIONS ───────────────────────────────────────────────────
let allRecs = [];

function renderRecs(recsStr) {
  allRecs = recsStr ? recsStr.split('||') : [];
  displayRecs('ALL');
}

function filterRecs(level, btn) {
  document.querySelectorAll('.rec-filters .rf').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  displayRecs(level);
}

function displayRecs(level) {
  const el = document.getElementById('recs-list');
  if (!el) return;
  const filtered = level === 'ALL' ? allRecs : allRecs.filter(r => r.startsWith(level) || (level === 'LOW' && r.startsWith('GOOD')));
  el.innerHTML = filtered.map(rec => {
    const sev  = rec.startsWith('CRITICAL') ? 'CRITICAL' : rec.startsWith('HIGH') ? 'HIGH' : rec.startsWith('MEDIUM') ? 'MEDIUM' : rec.startsWith('GOOD') ? 'GOOD' : 'LOW';
    const text = rec.replace(/^(CRITICAL|HIGH|MEDIUM|LOW|GOOD):\s*/, '');
    return `<li class="rec-item">
      <span class="rec-sev sev-${sev}">${sev}</span>
      <span class="rec-text">${escHtml(text)}</span>
    </li>`;
  }).join('') || '<li class="rec-item"><span class="rec-text" style="color:var(--text3)">No items in this category.</span></li>';
}

// ── RESET FORM ────────────────────────────────────────────────────────
function resetAuditForm() {
  document.getElementById('audit-form-wrap').style.display = 'block';
  document.getElementById('audit-result-wrap').style.display = 'none';
  document.getElementById('audit-form').reset();
  document.querySelectorAll('.check-pill').forEach(p => p.classList.remove('on'));
  currentAuditId = null;
  if (auditBarChart) { auditBarChart.destroy(); auditBarChart = null; }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── PDF DOWNLOAD ──────────────────────────────────────────────────────
async function downloadAuditPdf() {
  if (!currentAuditId) return;
  try {
    const res = await fetch(`/api/audits/${currentAuditId}/report`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Failed to generate PDF');
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `audit-report-${currentAuditId}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch (err) { alert('PDF error: ' + err.message); }
}

// ── HISTORY ───────────────────────────────────────────────────────────
async function loadHistory() {
  const el = document.getElementById('history-body');
  el.innerHTML = '<div class="loading-state"><div class="spin"></div> Loading...</div>';
  try {
    const audits = await API.get('/audits');
    renderTable(el, audits, false);
  } catch (err) {
    el.innerHTML = `<div class="empty-state">Error: ${escHtml(err.message)}</div>`;
  }
}

function renderTable(container, audits, showUser) {
  if (!audits.length) {
    container.innerHTML = '<div class="empty-state">No audits found.</div>';
    return;
  }
  container.innerHTML = `
    <table>
      <thead><tr>
        <th>Company</th><th>Type</th>
        ${showUser ? '<th>User</th>' : ''}
        <th>Risk Score</th><th>Risk Level</th><th>Date</th><th>Actions</th>
      </tr></thead>
      <tbody>
        ${audits.map(a => `<tr>
          <td>${escHtml(a.companyName)}</td>
          <td>${a.auditType}</td>
          ${showUser ? `<td>${a.user?.username ?? '—'}</td>` : ''}
          <td><strong>${a.riskScore}</strong><span style="color:var(--text3);font-size:.75rem">/100</span></td>
          <td>${UI.riskBadge(a.riskLevel)}</td>
          <td>${UI.formatDate(a.submittedAt)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn-outline sm" onclick="viewAudit(${a.id})">View</button>
            <button class="btn-outline sm" onclick="dlPdf(${a.id})">PDF</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

async function viewAudit(id) {
  try {
    const audit = await API.get(`/audits/${id}`);
    currentAuditId = id;
    navigate('pg-audit');
    setTimeout(() => showAuditResult(audit), 100);
  } catch (err) { alert('Error: ' + err.message); }
}

async function dlPdf(id) {
  try {
    const res = await fetch(`/api/audits/${id}/report`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `audit-report-${id}.pdf`; a.click();
    URL.revokeObjectURL(url);
  } catch (err) { alert('Error: ' + err.message); }
}

// ── ADMIN ─────────────────────────────────────────────────────────────
async function loadAdmin() {
  try {
    const [stats, audits] = await Promise.all([API.get('/admin/stats'), API.get('/admin/audits')]);
    const dist = stats.riskDistribution || {};
    document.getElementById('adm-total').textContent    = stats.total ?? 0;
    document.getElementById('adm-avg').textContent      = stats.avgRiskScore != null ? Math.round(stats.avgRiskScore) : '—';
    document.getElementById('adm-critical').textContent = dist.CRITICAL ?? 0;
    document.getElementById('adm-high').textContent     = dist.HIGH ?? 0;

    const order  = ['LOW','MEDIUM','HIGH','CRITICAL'];
    const labels = order.filter(k => dist[k]);
    const values = labels.map(k => dist[k]);
    const colors = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };

    if (admDonut) admDonut.destroy();
    admDonut = makeDonut('adm-donut', labels, values, labels.map(l => colors[l]));

    if (admBar) admBar.destroy();
    admBar = makeBar('adm-bar', labels, [{
      label:'Audits', data: values,
      backgroundColor: labels.map(l => colors[l] + 'cc'),
      borderColor: labels.map(l => colors[l]),
      borderWidth: 2, borderRadius: 6
    }]);

    renderTable(document.getElementById('admin-table-body'), audits, true);
  } catch (err) { console.error('Admin error:', err); }
}

async function adminFilter(level, btn) {
  document.querySelectorAll('.table-card-header .rf').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('admin-table-body');
  el.innerHTML = '<div class="loading-state"><div class="spin"></div> Loading...</div>';
  try {
    const audits = await API.get(level ? `/admin/audits?riskLevel=${level}` : '/admin/audits');
    renderTable(el, audits, true);
  } catch (err) {
    el.innerHTML = `<div class="empty-state">Error: ${escHtml(err.message)}</div>`;
  }
}

// ── BOOT ──────────────────────────────────────────────────────────────
loadHome();
