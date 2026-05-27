import { request, USE_MOCKS } from './api'

export const authService = {
  async login(email, password) {
    if (USE_MOCKS) {
      if (email === 'demo@spyzer.com' && password === 'admin123') {
        return { token: 'mock-jwt-token', nombre: 'Admin', rol: 'ADMIN', email: 'demo@spyzer.com' }
      }
      throw new Error('Credenciales inválidas')
    }
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
}
