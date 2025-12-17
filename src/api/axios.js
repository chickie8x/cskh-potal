import axios from 'axios'
import { useAuthStore } from '../store/authstore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const api = axios.create({
  baseURL: API_BASE_URL,
})

let isRefreshing = false
let refreshQueue = []
let authstore = null

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  refreshQueue = []
}

export const setAuthStoreInstance = () => {
  authstore = useAuthStore()
}

const currentAccessToken = () => authstore?.accessToken ?? ''
const currentRefreshToken = () => authstore?.refreshToken ?? ''

const refreshAccessToken = async () => {
  const refreshToken = currentRefreshToken()
  if (!refreshToken) {
    throw new Error('Missing refresh token')
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
  const { token } = response.data.data

  if (!token) {
    throw new Error('Refresh response did not include an access token')
  }

  authstore?.setAccessToken(token)

  return token
}

api.interceptors.request.use((config) => {
  const token = currentAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const token = await refreshAccessToken()
        processQueue(null, token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        authstore?.clear()
        window.location.href = '/login'
        throw refreshError
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
