import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://7ml45f42-8080.asse.devtunnels.ms',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  
  // ✅ បន្ថែម x-api-key
  config.headers['x-api-key'] = import.meta.env.API_KEY_SECRET || 'X7mK9qR2vLp8Nf4TzY6cHd3WsAj5BuEeG1rQn8MxKp7Vt2CyL9sDf4JhUwZk3NaRb'

  // JWT Token (ប្រសិនបើមាន)
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const auth = useAuthStore()
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await auth.refresh()
        original.headers.Authorization = `Bearer ${auth.accessToken}`
        return api(original)
      } catch {
        auth.logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api