import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import api from '../utils/api'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const INIT = {
  companyName:'', auditType:'', numberOfEmployees:'', complianceLevel:'', dataSensitivity:'', updateFrequency:'', previousIncidents:'',
  hasFirewall:false, hasAntivirus:false, hasEncryption:false, hasMfa:false, hasRbac:false, strongPasswords:false, networkMonitoring:false, idsIps:false,
  inactiveAccountsRemoved:false, adminActivitiesLogged:false, privilegeEscalationMonitored:false,
  patchesAppliedImmediately:false, automatedUpdates:false,
  incidentCount:'', hasIncidentResponsePlan:false, incidentsDocumented:false,
  regularBackups:false, backupsEncrypted:false, dataRetentionPolicy:false,
  networkSegmentation:false, vpnRemoteAccess:false, openPortsAudited:false,
  siemTools:false, realtimeLogMonitoring:false,
  vulnerabilityScanning:false, penetrationTesting:false,
  complianceStandards:'', regularAudits:false, securityTraining:false,
}

function Pill({ label, icon, field, form, setForm }) {
  return (
    <div
      className={`check-pill ${form[field] ? 'on' : ''}`}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
    >
      <span>{icon}</span><span>{label}</span>
    </div>
  )
}

function RiskMeter({ score }) {
  const color = score >= 75 ? '#ef4444' : score >= 50 ? '#f97316' : score >= 25 ? '#f59e0b' : '#22c55e'
  const pct = score / 100
  const angle = pct * 180 - 180
  return (
    <div className="text-center py-3">
      <svg viewBox="0 0 200 110" style={{ width: 200, height: 110 }}>
        <defs>
          <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e"/>
            <stop offset="33%" stopColor="#f59e0b"/>
            <stop offset="66%" stopColor="#f97316"/>
            <stop offset="100%" stopColor="#ef4444"/>
          </linearGradient>
        </defs>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="18" strokeLinecap="round"/>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#mg)" strokeWidth="18" strokeLinecap="round"
          strokeDasharray={`${pct*251.2} 251.2`}/>
        <g transform={`rotate(${angle},100,100)`}>
          <line x1="100" y1="100" x2="100" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round"/>
        </g>
        <circle cx="100" cy="100" r="7" fill={color}/>
        <text x="20" y="108" fill="#64748b" fontSize="9" fontFamily="sans-serif">0</text>
        <text x="170" y="108" fill="#64748b" fontSize="9" fontFamily="sans-serif">100</text>
      </svg>
      <div style={{ fontSize: '2.8rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Risk Score / 100</div>
    </div>
  )
}

export default function NewAudit() {
  const [form, setForm] = useState(INIT)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recFilter, setRecFilter] = useState('ALL')

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    const empMap = { '1': 25, '100': 150, '1000': 1000 }
    const payload = {
      ...form,
      numberOfEmployees: empMap[form.numberOfEmployees] || 50,
      previousIncidents: form.previousIncidents === 'true',
      auditType:         form.auditType         || null,
      complianceLevel:   form.complianceLevel   || null,
      dataSensitivity:   form.dataSensitivity   || null,
      updateFrequency:   form.updateFrequency   || null,
      complianceStandards: form.complianceStandards || null,
      incidentCount:     form.incidentCount     || null,
    }
    try {
      const { data } = await api.post('/audits', payload)
      setResult(data)
    } catch (err) { setError(err) }
    finally { setLoading(false) }
  }

  async function downloadPdf() {
    const res = await fetch(`/api/audits/${result.id}/report`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `audit-report-${result.id}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  function resetForm() { setForm(INIT); setResult(null); setError('') }

  const controls = result ? [
    { name:'Firewall', ok: result.hasFirewall }, { name:'Antivirus', ok: result.hasAntivirus },
    { name:'Encryption', ok: result.hasEncryption }, { name:'MFA', ok: result.hasMfa },
    { name:'RBAC', ok: result.hasRbac }, { name:'Passwords', ok: result.strongPasswords },
    { name:'Net Monitor', ok: result.networkMonitoring }, { name:'IDS/IPS', ok: result.idsIps },
  ] : []

  const allRecs = result?.recommendations ? result.recommendations.split('||') : []
  const filteredRecs = recFilter === 'ALL' ? allRecs : allRecs.filter(r => r.startsWith(recFilter))

  if (result) return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>{result.companyName} — Risk Report</h5>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={downloadPdf}>⬇ Download PDF</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={resetForm}>+ New Audit</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="chart-card text-center">
            <div className="fw-bold mb-2" style={{ color: 'var(--text)' }}>Overall Risk Score</div>
            <RiskMeter score={result.riskScore} />
            <span className={`risk-badge risk-${result.riskLevel}`}>{result.riskLevel}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="chart-card">
            <div className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Security Controls</div>
            {controls.map(c => (
              <div key={c.name} className="d-flex align-items-center gap-2 mb-2">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.ok ? '#22c55e' : '#ef4444', flexShrink: 0 }}/>
                <span style={{ fontSize: '0.85rem', color: 'var(--text)', flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.ok ? '#22c55e' : '#ef4444' }}>{c.ok ? '✓' : '✗'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-4">
          <div className="chart-card">
            <div className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Controls Analysis</div>
            <Bar data={{
              labels: controls.map(c => c.name),
              datasets: [
                { label: 'Implemented', data: controls.map(c => c.ok ? 1 : 0), backgroundColor: 'rgba(34,197,94,0.7)', borderColor: '#22c55e', borderWidth: 2, borderRadius: 5 },
                { label: 'Missing',     data: controls.map(c => c.ok ? 0 : 1), backgroundColor: 'rgba(239,68,68,0.7)',  borderColor: '#ef4444', borderWidth: 2, borderRadius: 5 },
              ]
            }} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(148,163,184,0.1)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' }, beginAtZero: true } } }} />
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <span className="fw-bold" style={{ color: 'var(--text)' }}>Smart Recommendations</span>
          <div className="d-flex gap-2 flex-wrap">
            {['ALL','CRITICAL','HIGH','MEDIUM','LOW'].map(l => (
              <button key={l} className="btn btn-sm" onClick={() => setRecFilter(l)}
                style={{ background: recFilter === l ? 'var(--primary)' : 'var(--surface2)', color: recFilter === l ? '#fff' : 'var(--text2)', border: 'none', borderRadius: 6, fontSize: '0.75rem' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <ul className="list-unstyled mb-0">
          {filteredRecs.length ? filteredRecs.map((rec, i) => {
            const sev = rec.startsWith('CRITICAL') ? 'CRITICAL' : rec.startsWith('HIGH') ? 'HIGH' : rec.startsWith('MEDIUM') ? 'MEDIUM' : rec.startsWith('GOOD') ? 'GOOD' : 'LOW'
            const text = rec.replace(/^(CRITICAL|HIGH|MEDIUM|LOW|GOOD):\s*/, '')
            return <li key={i} className="rec-item"><span className={`rec-sev sev-${sev}`}>{sev}</span><span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{text}</span></li>
          }) : <li style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>No items in this category.</li>}
        </ul>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <h5 className="fw-bold mb-1" style={{ color: 'var(--text)' }}>Security Audit Assessment</h5>
        <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginBottom: 0 }}>Answer all sections to generate a comprehensive risk score and recommendations</p>
      </div>

      {/* Section 1 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">1</span> Organisation Details</div>
        <div className="row g-3">
          {[
            { label:'Company Name', key:'companyName', type:'text', placeholder:'e.g. Acme Corporation' },
          ].map(f => (
            <div className="col-md-6" key={f.key}>
              <label className="form-label" style={{ color:'var(--text2)', fontSize:'0.8rem' }}>{f.label}</label>
              <input type={f.type} className="form-control" style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required />
            </div>
          ))}
          {[
            { label:'Audit Type', key:'auditType', opts:[['','Select...'],['FINANCIAL','Financial'],['SECURITY','Security'],['COMPLIANCE','Compliance']] },
            { label:'Employees',  key:'numberOfEmployees', opts:[['','Select...'],['1','Small (1–50)'],['100','Medium (51–500)'],['1000','Large (500+)']] },
            { label:'Data Sensitivity', key:'dataSensitivity', opts:[['','Select...'],['LOW','Low'],['MEDIUM','Medium'],['HIGH','High'],['CRITICAL','Critical']] },
            { label:'Compliance Level',  key:'complianceLevel',  opts:[['','Select...'],['LOW','Low'],['MEDIUM','Medium'],['HIGH','High']] },
            { label:'Update Frequency',  key:'updateFrequency',  opts:[['','Select...'],['DAILY','Daily'],['WEEKLY','Weekly'],['MONTHLY','Monthly'],['RARELY','Rarely']] },
            { label:'Previous Incidents',key:'previousIncidents',opts:[['','Select...'],['false','No'],['true','Yes']] },
          ].map(f => (
            <div className="col-md-6" key={f.key}>
              <label className="form-label" style={{ color:'var(--text2)', fontSize:'0.8rem' }}>{f.label}</label>
              <select className="form-select" style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required>
                {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">2</span> Core Security Controls</div>
        <div className="row g-2">
          {[['hasFirewall','🔥','Firewall'],['hasAntivirus','🛡️','Antivirus / EDR'],['hasEncryption','🔐','Data Encryption'],['hasMfa','📱','MFA Enabled'],['hasRbac','👥','RBAC / Least Privilege'],['strongPasswords','🔑','Strong Password Policy'],['networkMonitoring','📡','Network Monitoring'],['idsIps','🚨','IDS / IPS']].map(([f,i,l]) => (
            <div className="col-6 col-md-3" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 3 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">3</span> Access & Identity Management</div>
        <div className="row g-2">
          {[['inactiveAccountsRemoved','🗑️','Inactive Accounts Removed'],['adminActivitiesLogged','📋','Admin Activities Logged'],['privilegeEscalationMonitored','⚠️','Privilege Escalation Monitored']].map(([f,i,l]) => (
            <div className="col-6 col-md-4" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 4 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">4</span> Patch & Update Management</div>
        <div className="row g-2">
          {[['patchesAppliedImmediately','⚡','Critical Patches Applied Immediately'],['automatedUpdates','🤖','Automated Patch Management']].map(([f,i,l]) => (
            <div className="col-6 col-md-4" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 5 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">5</span> Incident History & Response</div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label" style={{ color:'var(--text2)', fontSize:'0.8rem' }}>Incidents in Past 12 Months</label>
            <select className="form-select" style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}
              value={form.incidentCount} onChange={e => setForm({ ...form, incidentCount: e.target.value })} required>
              <option value="">Select...</option>
              <option value="NONE">0 — None</option>
              <option value="FEW">1–3 incidents</option>
              <option value="MANY">4 or more</option>
            </select>
          </div>
        </div>
        <div className="row g-2">
          {[['hasIncidentResponsePlan','📄','Incident Response Plan Exists'],['incidentsDocumented','📝','Incidents Documented & Reviewed']].map(([f,i,l]) => (
            <div className="col-6 col-md-4" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 6 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">6</span> Data Protection & Backup</div>
        <div className="row g-2">
          {[['regularBackups','💾','Regular Backups'],['backupsEncrypted','🔒','Backups Encrypted'],['dataRetentionPolicy','📅','Data Retention Policy']].map(([f,i,l]) => (
            <div className="col-6 col-md-4" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 7 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">7</span> Network & Infrastructure Security</div>
        <div className="row g-2">
          {[['networkSegmentation','🔀','Network Segmentation'],['vpnRemoteAccess','🌐','VPN / Zero Trust'],['openPortsAudited','🚪','Open Ports Audited']].map(([f,i,l]) => (
            <div className="col-6 col-md-4" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 8 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">8</span> Monitoring, Logging & Detection</div>
        <div className="row g-2">
          {[['siemTools','🖥️','SIEM Tools'],['realtimeLogMonitoring','⏱️','Real-time Log Monitoring']].map(([f,i,l]) => (
            <div className="col-6 col-md-4" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 9 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">9</span> Vulnerability Management & Testing</div>
        <div className="row g-2">
          {[['vulnerabilityScanning','🔍','Vulnerability Scanning'],['penetrationTesting','🧪','Penetration Testing (Annual)']].map(([f,i,l]) => (
            <div className="col-6 col-md-4" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 10 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">10</span> Compliance & Governance</div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label" style={{ color:'var(--text2)', fontSize:'0.8rem' }}>Compliance Standards</label>
            <select className="form-select" style={{ background:'var(--surface2)', border:'1px solid var(--border)', color:'var(--text)' }}
              value={form.complianceStandards} onChange={e => setForm({ ...form, complianceStandards: e.target.value })} required>
              <option value="">Select...</option>
              {[['ISO27001','ISO 27001'],['NIST','NIST CSF'],['GDPR','GDPR'],['SOC2','SOC 2'],['HIPAA','HIPAA'],['PCI_DSS','PCI-DSS'],['NONE','None']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="row g-2">
          {[['regularAudits','🔎','Regular Audits Conducted'],['securityTraining','🎓','Security Awareness Training']].map(([f,i,l]) => (
            <div className="col-6 col-md-4" key={f}><Pill field={f} icon={i} label={l} form={form} setForm={setForm} /></div>
          ))}
        </div>
      </div>

      {/* Section 11 */}
      <div className="audit-section">
        <div className="audit-section-title"><span className="sec-num">11</span> Physical & Endpoint Security</div>
        <p style={{ color:'var(--text3)', fontSize:'0.85rem' }}>Physical security controls are assessed based on your organisation profile above.</p>
      </div>

      {error && <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize:'0.85rem' }}>{error}</div>}

      <button type="submit" className="btn w-100 fw-bold py-3" style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', borderRadius:12, fontSize:'1rem' }} disabled={loading}>
        {loading ? <><span className="spinner me-2"/>Analysing...</> : '✓ Analyse & Generate Full Report'}
      </button>
    </form>
  )
}
