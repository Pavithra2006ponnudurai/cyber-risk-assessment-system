import axios from 'axios'
import { getToken, logout } from './auth'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const t = getToken()
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    const url = err.config?.url || ''
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register')
    if (!isAuthRoute && (err.response?.status === 401 || err.response?.status === 403)) logout()
    return Promise.reject(err.response?.data?.error || err.message || 'Request failed')
  }
)

export default api
