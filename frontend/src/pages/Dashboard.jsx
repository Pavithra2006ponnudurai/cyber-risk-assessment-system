import { useEffect, useState } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import api from '../utils/api'
import { isAdmin } from '../utils/auth'

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444' }

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    try {
      let audits, s
      if (isAdmin()) {
        const [a, st] = await Promise.all([api.get('/admin/audits'), api.get('/admin/stats')])
        audits = a.data; s = st.data
      } else {
        const a = await api.get('/audits')
        audits = a.data
        const dist = {}
        let total = 0
        audits.forEach(x => { dist[x.riskLevel] = (dist[x.riskLevel] || 0) + 1; total += x.riskScore || 0 })
        s = { total: audits.length, avgRiskScore: audits.length ? total / audits.length : 0, riskDistribution: dist }
      }
      setStats(s)
      setRecent([...audits].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 6))
    } catch (e) { console.error(e) }
  }

  const dist = stats?.riskDistribution || {}
  const labels = ['LOW','MEDIUM','HIGH','CRITICAL'].filter(k => dist[k])
  const values = labels.map(k => dist[k])

  const donutData = {
    labels,
    datasets: [{ data: values, backgroundColor: labels.map(l => COLORS[l]), borderColor: '#0f172a', borderWidth: 3 }]
  }
  const barData = {
    labels,
    datasets: [{ label: 'Audits', data: values, backgroundColor: labels.map(l => COLORS[l] + 'cc'), borderColor: labels.map(l => COLORS[l]), borderWidth: 2, borderRadius: 6 }]
  }
  const chartOpts = { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' }, beginAtZero: true } } }

  const kpis = [
    { label: 'Total Audits',   value: stats?.total ?? '—',                          gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
    { label: 'Avg Risk Score', value: stats ? Math.round(stats.avgRiskScore) : '—', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)' },
    { label: 'Critical Risks', value: dist.CRITICAL ?? 0,                           gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    { label: 'Low Risk',       value: dist.LOW ?? 0,                                gradient: 'linear-gradient(135deg,#22c55e,#16a34a)' },
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
        <div className="col-md-4">
          <div className="chart-card h-100">
            <div className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Risk Distribution</div>
            {values.length ? <Doughnut data={donutData} options={{ responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, cutout: '68%' }} /> : <p style={{ color: 'var(--text3)' }}>No data yet</p>}
          </div>
        </div>
        <div className="col-md-4">
          <div className="chart-card h-100">
            <div className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Risk by Level</div>
            {values.length ? <Bar data={barData} options={chartOpts} /> : <p style={{ color: 'var(--text3)' }}>No data yet</p>}
          </div>
        </div>
        <div className="col-md-4">
          <div className="chart-card h-100">
            <div className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Recent Audits</div>
            {recent.length ? recent.map(a => (
              <div key={a.id} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{a.companyName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{a.auditType} · {new Date(a.submittedAt).toLocaleDateString()}</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <strong style={{ color: 'var(--text)' }}>{a.riskScore}</strong>
                  <span className={`risk-badge risk-${a.riskLevel}`}>{a.riskLevel}</span>
                </div>
              </div>
            )) : <p style={{ color: 'var(--text3)' }}>No audits yet</p>}
          </div>
        </div>
      </div>
    </>
  )
}
