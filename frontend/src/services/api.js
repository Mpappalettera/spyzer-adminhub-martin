export const BASE_URL = import.meta.env.VITE_API_URL ?? ''
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

if (!BASE_URL) {
  console.error('[api] VITE_API_URL no está definida — revisa tu .env (dev) o las variables de Railway (prod).')
}

// Helper unificado para peticiones HTTP
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('spyzer_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Credenciales incorrectas.')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error en la petición: ${response.status}`)
  }

  // Si la respuesta es un PDF (para la descarga del dashboard)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/pdf')) {
    return response.blob()
  }

  return response.json()
}
