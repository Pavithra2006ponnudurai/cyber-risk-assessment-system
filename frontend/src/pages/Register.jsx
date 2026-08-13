import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'CLIENT' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await api.post('/auth/register', form)
      setSuccess('Account created! Redirecting...')
      setTimeout(() => navigate('/'), 1500)
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
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Create your account</p>
        </div>

        {error   && <div className="alert alert-danger  py-2 px-3" style={{ fontSize: '0.85rem' }}>{error}</div>}
        {success && <div className="alert alert-success py-2 px-3" style={{ fontSize: '0.85rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Username', key: 'username', type: 'text', placeholder: 'Choose a username' },
            { label: 'Email',    key: 'email',    type: 'email', placeholder: 'your@email.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 6 characters' },
          ].map(f => (
            <div className="mb-3" key={f.key}>
              <label className="form-label" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{f.label}</label>
              <input type={f.type} className="form-control" style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)', color: '#f1f5f9' }}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required />
            </div>
          ))}
          <div className="mb-3">
            <label className="form-label" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Account Type</label>
            <select className="form-select" style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)', color: '#f1f5f9' }}
              value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="CLIENT">Client</option>
              <option value="AUDITOR">Auditor</option>
            </select>
          </div>
          <button type="submit" className="btn w-100 fw-bold" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '12px' }} disabled={loading}>
            {loading ? <><span className="spinner me-2" />Creating...</> : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Already have an account? <Link to="/" style={{ color: '#818cf8' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
