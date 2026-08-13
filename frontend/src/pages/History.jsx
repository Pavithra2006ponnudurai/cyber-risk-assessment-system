import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function History() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { const { data } = await api.get('/audits'); setAudits(data) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function dlPdf(id) {
    const res = await fetch(`/api/audits/${id}/report`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `audit-report-${id}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="chart-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0" style={{ color: 'var(--text)' }}>Audit History</h6>
        <button className="btn btn-sm btn-outline-secondary" onClick={load}>↻ Refresh</button>
      </div>
      {loading ? <p style={{ color: 'var(--text3)' }}>Loading...</p> : audits.length === 0 ? <p style={{ color: 'var(--text3)' }}>No audits found.</p> : (
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0" style={{ '--bs-table-bg': 'transparent', '--bs-table-hover-bg': 'rgba(99,102,241,0.08)' }}>
            <thead>
              <tr style={{ color: 'var(--text3)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th>Company</th><th>Type</th><th>Risk Score</th><th>Risk Level</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {audits.map(a => (
                <tr key={a.id} style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                  <td>{a.companyName}</td>
                  <td>{a.auditType}</td>
                  <td><strong>{a.riskScore}</strong><span style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>/100</span></td>
                  <td><span className={`risk-badge risk-${a.riskLevel}`}>{a.riskLevel}</span></td>
                  <td>{new Date(a.submittedAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-sm btn-outline-secondary" onClick={() => dlPdf(a.id)}>PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
