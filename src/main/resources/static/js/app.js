// ===== API CLIENT =====
const API = {
  base: '/api',
  headers() {
    const t = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
  },
  async request(method, path, body) {
    const res = await fetch(this.base + path, {
      method, headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 401) { Auth.logout(); return; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  get:  (path)       => API.request('GET',  path),
  post: (path, body) => API.request('POST', path, body),
};

// ===== AUTH =====
const Auth = {
  user: null,
  init() {
    const s = localStorage.getItem('user');
    if (s) this.user = JSON.parse(s);
  },
  save(data) {
    localStorage.setItem('token', data.token);
    this.user = { username: data.username, role: data.role, email: data.email };
    localStorage.setItem('user', JSON.stringify(this.user));
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user = null;
    window.location.href = '/';
  },
  isLoggedIn() { return !!localStorage.getItem('token'); },
  isAdmin()    { return this.user?.role === 'ADMIN'; },
  isAuditor()  { return this.user?.role === 'AUDITOR' || this.isAdmin(); }
};

// ===== UI HELPERS =====
const UI = {
  show(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    document.querySelectorAll('.nav-item[data-page]').forEach(n =>
      n.classList.toggle('active', n.dataset.page === id));
  },
  alert(containerId, msg, type = 'error') {
    const el = document.getElementById(containerId);
    if (!el) return;
    const icon = type === 'error'
      ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
      : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
    el.innerHTML = `<div class="alert alert-${type}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg>
      ${msg}</div>`;
  },
  clearAlert(id) { const el = document.getElementById(id); if (el) el.innerHTML = ''; },
  setLoading(btnId, loading, label) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading ? '<span class="spinner"></span> Processing...' : (label || btn.dataset.label || btn.innerHTML);
  },
  riskBadge(level) {
    const colors = { LOW:'#22c55e', MEDIUM:'#f59e0b', HIGH:'#ef4444', CRITICAL:'#dc2626' };
    return `<span class="risk-badge risk-${level}">${level}</span>`;
  },
  formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  }
};

// ===== RISK METER =====
function drawRiskMeter(score, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const color = score >= 75 ? '#ef4444' : score >= 50 ? '#f97316' : score >= 25 ? '#f59e0b' : '#22c55e';
  const pct   = score / 100;
  const angle = pct * 180 - 180;
  el.innerHTML = `
    <div style="text-align:center;padding:16px 0">
      <div style="position:relative;width:200px;height:110px;margin:0 auto">
        <svg viewBox="0 0 200 110" style="width:100%;height:100%">
          <defs>
            <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stop-color="#22c55e"/>
              <stop offset="33%"  stop-color="#f59e0b"/>
              <stop offset="66%"  stop-color="#f97316"/>
              <stop offset="100%" stop-color="#ef4444"/>
            </linearGradient>
          </defs>
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#1e293b" stroke-width="18" stroke-linecap="round"/>
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#mg)" stroke-width="18"
            stroke-linecap="round" stroke-dasharray="${pct*251.2} 251.2"
            style="transition:stroke-dasharray 1.2s ease"/>
          <g transform="rotate(${angle},100,100)">
            <line x1="100" y1="100" x2="100" y2="28" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
          </g>
          <circle cx="100" cy="100" r="7" fill="${color}"/>
          <text x="20"  y="108" fill="#64748b" font-size="9" font-family="sans-serif">0</text>
          <text x="170" y="108" fill="#64748b" font-size="9" font-family="sans-serif">100</text>
        </svg>
      </div>
      <div style="font-size:2.8rem;font-weight:800;color:${color};line-height:1;margin-top:4px">${score}</div>
      <div style="font-size:0.75rem;color:#64748b;text-transform:uppercase;letter-spacing:.1em;margin-top:4px">Risk Score / 100</div>
    </div>`;
}

// ===== CHART HELPERS =====
const chartDefaults = {
  color: '#94a3b8',
  gridColor: 'rgba(148,163,184,0.1)',
  font: { family: "'Inter',sans-serif", size: 11 }
};

function makeDonut(canvasId, labels, data, colors) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#0f172a', borderWidth: 3 }] },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: '68%',
      plugins: { legend: { labels: { color: chartDefaults.color, font: chartDefaults.font, padding: 14 } } }
    }
  });
}

function makeBar(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      scales: {
        x: { ticks: { color: chartDefaults.color, font: chartDefaults.font }, grid: { color: chartDefaults.gridColor } },
        y: { ticks: { color: chartDefaults.color, font: chartDefaults.font }, grid: { color: chartDefaults.gridColor }, beginAtZero: true }
      },
      plugins: { legend: { labels: { color: chartDefaults.color, font: chartDefaults.font } } }
    }
  });
}

function makeRadar(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { color: chartDefaults.color, font: chartDefaults.font, stepSize: 25, backdropColor: 'transparent' },
          grid: { color: chartDefaults.gridColor },
          pointLabels: { color: chartDefaults.color, font: { ...chartDefaults.font, size: 10 } }
        }
      },
      plugins: { legend: { labels: { color: chartDefaults.color, font: chartDefaults.font } } }
    }
  });
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

Auth.init();
