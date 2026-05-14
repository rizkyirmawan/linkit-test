import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api

export const authAPI = {
  register: (data: { username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
}

export const coffeeAPI = {
  getAll: () => api.get('/coffees'),
  getById: (id: number) => api.get(`/coffees/${id}`),
  create: (data: any) => api.post('/coffees', data),
  update: (id: number, data: any) => api.put(`/coffees/${id}`, data),
  delete: (id: number) => api.delete(`/coffees/${id}`),
}

export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: number, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: number) => api.delete(`/orders/${id}`),
}

export const syncAPI = {
  sync: () => api.post('/sync'),
}

export const logAPI = {
  getAll: () => api.get('/logs'),
}

export const healthAPI = {
  check: () => api.get('/health'),
}
