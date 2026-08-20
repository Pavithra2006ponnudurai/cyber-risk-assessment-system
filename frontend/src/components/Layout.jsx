import { Outlet, NavLink } from 'react-router-dom'
import { getUser, isAdmin, logout } from '../utils/auth'
import { useState, useEffect } from 'react'

export default function Layout() {
  const user = getUser()
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light' : ''
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div style={{ display: 'flex' }}>
      <aside className="sidebar">
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>AuditPro</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>Management System</div>
            </div>
          </div>
        </div>

        <nav className="p-2 flex-grow-1">
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px 4px' }}>Overview</div>
          <NavLink to="/app" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </NavLink>

          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px 4px' }}>Audits</div>
          <NavLink to="/app/audit" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            New Audit
          </NavLink>
          <NavLink to="/app/history" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            My Audits
          </NavLink>

          {isAdmin() && <>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px 4px' }}>Admin</div>
            <NavLink to="/app/admin" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Admin Panel
            </NavLink>
          </>}
        </nav>

        <div className="p-3 border-top" style={{ borderColor: 'var(--border)' }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{user?.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{user?.role}</div>
            </div>
          </div>
          <button className="nav-btn w-100" onClick={logout} style={{ color: '#ef4444' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-area w-100">
        <div className="topbar">
          <h5 className="mb-0 fw-bold" style={{ color: 'var(--text)' }}>AuditPro</h5>
          <div className="d-flex align-items-center gap-3">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
              {theme === 'dark'
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{user?.username}</span>
          </div>
        </div>
        <div className="page-body">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
