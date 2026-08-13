export const getToken = () => localStorage.getItem('token')
export const getUser  = () => JSON.parse(localStorage.getItem('user') || 'null')
export const isAdmin  = () => getUser()?.role === 'ADMIN'
export const isAuditor = () => ['ADMIN','AUDITOR'].includes(getUser()?.role)

export function saveAuth(data) {
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify({
    username: data.username, role: data.role, email: data.email
  }))
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/'
}
