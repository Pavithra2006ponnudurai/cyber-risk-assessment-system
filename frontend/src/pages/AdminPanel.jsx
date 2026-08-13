import { useEffect, useState } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import api from '../utils/api'

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' }

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [audits, setAudits] = useState([])
  const [filter, setFilter] = useState(null)

  useEffect(() => { load() }, [])

  async function load(level) {
    try {
      const [s, a] = await Promise.all([
        api.get('/admin/stats'),
        api.get(level ? `/admin/audits?riskLevel=${level}` : '/admin/audits')
      ])
      setStats(s.data); setAudits(a.data)
    } catch (e) { console.error(e) }
  }

  function applyFilter(level) { setFilter(level); load(level) }

  async function dlPdf(id) {
    const res = await fetch(`/api/audits/${id}/report`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `audit-report-${id}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  const dist = stats?.riskDistribution || {}
  const labels = ['LOW','MEDIUM','HIGH','CRITICAL'].filter(k => dist[k])
  const values = labels.map(k => dist[k])

  const kpis = [
    { label: 'Total Audits',   value: stats?.total ?? '—',                          gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
    { label: 'Avg Risk Score', value: stats ? Math.round(stats.avgRiskScore) : '—', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)' },
    { label: 'Critical',       value: dist.CRITICAL ?? 0,                           gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    { label: 'High Risk',      value: dist.HIGH ?? 0,                               gradient: 'linear-gradient(135deg,#f97316,#ea580c)' },
  ]

  return (
    <>
      <div className="row g-3 mb-4">
        {kpis.map(k => (
          <div className="col-6 col-md-3" key={k.label}>
            <div className="kpi-card" style={{ background: k.gradient }}>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{k.value}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="chart-card">
            <div className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Risk Distribution</div>
            {values.length ? <Doughnut data={{ labels, datasets: [{ data: values, backgroundColor: labels.map(l => COLORS[l]), borderColor: '#0f172a', borderWidth: 3 }] }} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, cutout: '68%' }} /> : <p style={{ color: 'var(--text3)' }}>No data</p>}
          </div>
        </div>
        <div className="col-md-6">
          <div className="chart-card">
            <div className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Risk Levels</div>
            {values.length ? <Bar data={{ labels, datasets: [{ label: 'Audits', data: values, backgroundColor: labels.map(l => COLORS[l] + 'cc'), borderColor: labels.map(l => COLORS[l]), borderWidth: 2, borderRadius: 6 }] }} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' }, beginAtZero: true } } }} /> : <p style={{ color: 'var(--text3)' }}>No data</p>}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h6 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>All Audits</h6>
          <div className="d-flex gap-2 flex-wrap">
            {[null,'LOW','MEDIUM','HIGH','CRITICAL'].map(l => (
              <button key={l ?? 'all'} className="btn btn-sm" onClick={() => applyFilter(l)}
                style={{ background: filter === l ? 'var(--primary)' : 'var(--surface2)', color: filter === l ? '#fff' : 'var(--text2)', border: 'none', borderRadius: 6 }}>
                {l ?? 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0" style={{ '--bs-table-bg': 'transparent', '--bs-table-hover-bg': 'rgba(99,102,241,0.08)' }}>
            <thead>
              <tr style={{ color: 'var(--text3)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th>Company</th><th>Type</th><th>User</th><th>Risk Score</th><th>Risk Level</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {audits.map(a => (
                <tr key={a.id} style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                  <td>{a.companyName}</td>
                  <td>{a.auditType}</td>
                  <td>{a.user?.username ?? '—'}</td>
                  <td><strong>{a.riskScore}</strong><span style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>/100</span></td>
                  <td><span className={`risk-badge risk-${a.riskLevel}`}>{a.riskLevel}</span></td>
                  <td>{new Date(a.submittedAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-sm btn-outline-secondary" onClick={() => dlPdf(a.id)}>PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
