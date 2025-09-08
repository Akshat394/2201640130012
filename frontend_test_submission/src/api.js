export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}


