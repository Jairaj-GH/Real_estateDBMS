import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    const payload = parseJwt(token)
    // Check expiry
    if (payload.exp * 1000 < Date.now()) {
      localStorage.clear()
      setLoading(false)
      return
    }
    setUser({
      id: payload.user_id,
      email: payload.email,
      full_name: payload.full_name,
      role: payload.role,
      agent_id: payload.agent_id,
    })
    setLoading(false)
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const { data } = await api.post('/token/', { username: email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const payload = parseJwt(data.access)
    const userObj = {
      id: payload.user_id,
      email: payload.email,
      full_name: payload.full_name,
      role: payload.role,
      agent_id: payload.agent_id,
    }
    setUser(userObj)
    return userObj
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
