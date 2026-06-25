import axios from 'axios'

// Use VITE_API_BASE if provided, otherwise rely on the Vite dev proxy ("/api").
const baseURL = import.meta.env.VITE_API_BASE || ''

const api = axios.create({ baseURL })

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, drop the stale token so the UI can react.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(err)
  }
)

export default api
