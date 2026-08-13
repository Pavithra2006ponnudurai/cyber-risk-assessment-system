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
    if (err.response?.status === 401) logout()
    return Promise.reject(err.response?.data?.error || err.message || 'Request failed')
  }
)

export default api
