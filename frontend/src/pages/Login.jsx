import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { saveAuth, getToken } from '../utils/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getToken()) {
      api.get('/audits').then(() => navigate('/app')).catch(() => {})
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      saveAuth(data)
      navigate('/app')
    } catch (err) {
      setError(err)
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div className="text-center mb-4">
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h4 style={{ color: '#f1f5f9', fontWeight: 800 }}>AuditPro</h4>
          <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligent Audit Management</p>
        </div>

        {error && <div className="alert alert-danger py-2 px-3" style={{ fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Username</label>
            <input className="form-control" style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)', color: '#f1f5f9' }}
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="Enter username" required />
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Password</label>
            <input type="password" className="form-control" style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)', color: '#f1f5f9' }}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn w-100 fw-bold" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '12px' }} disabled={loading}>
            {loading ? <><span className="spinner me-2" />Signing in...</> : 'Sign In'}
          </button>
        </form>

        <hr style={{ borderColor: 'rgba(148,163,184,0.1)', margin: '20px 0' }} />

        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 10, padding: 14, fontSize: '0.75rem', color: '#64748b', lineHeight: 2 }}>
          <strong style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Demo Credentials</strong>
          Admin: <code style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '1px 6px', borderRadius: 4 }}>admin</code> / <code style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '1px 6px', borderRadius: 4 }}>admin123</code><br />
          Auditor: <code style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '1px 6px', borderRadius: 4 }}>auditor1</code> / <code style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '1px 6px', borderRadius: 4 }}>audit123</code><br />
          Client: <code style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '1px 6px', borderRadius: 4 }}>client1</code> / <code style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '1px 6px', borderRadius: 4 }}>client123</code>
        </div>

        <div className="text-center mt-3" style={{ fontSize: '0.85rem', color: '#64748b' }}>
          No account? <Link to="/register" style={{ color: '#818cf8' }}>Create one</Link>
        </div>
      </div>
    </div>
  )
}
