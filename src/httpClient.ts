import { config as dotenvConfig } from 'dotenv'
import axios from 'axios'

dotenvConfig()

const httpClient = axios.create({
  baseURL: process.env.REMOTE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to attach token
httpClient.interceptors.request.use(
  (config) => {
    const token = process.env.REMOTE_API_KEY

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - Token expired or invalid')
    }
    return Promise.reject(error)
  },
)

export default httpClient
