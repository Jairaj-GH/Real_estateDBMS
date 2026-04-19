import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DEMO_ACCOUNTS = [
  { label: 'Office Staff', role: 'office', email: 'office@realestate.com', password: 'office123', icon: '🏢' },
  { label: 'Agent Portal', role: 'agent', email: 'agent1@realestate.com', password: 'agent123', icon: '🤝' },
  { label: 'Customer', role: 'customer', email: 'buyer1@example.com', password: 'customer123', icon: '🏠' },
  { label: 'Admin Hub', role: 'admin', email: 'admin@realestate.com', password: 'admin123', icon: '🛡️' },
]

const ROLE_REDIRECTS = {
  office: '/office',
  agent: '/agent',
  customer: '/marketplace',
  admin: '/admin',
}

const ROLE_COLORS = {
  office: '#10b981',
  agent: '#4f46e5',
  customer: '#f59e0b',
  admin: '#ef4444',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(ROLE_REDIRECTS[user.role] || '/marketplace')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid credentials. Please verify your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async acc => {
    setError('')
    setLoading(true)
    try {
      const user = await login(acc.email, acc.password)
      navigate(ROLE_REDIRECTS[user.role] || '/marketplace')
    } catch (err) {
      setEmail(acc.email)
      setPassword(acc.password)
      setError(`Authentication failed for ${acc.label}.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--peach) 0%, var(--brown-warm) 100%)',
      padding: 'var(--page-padding)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />

      <div style={{ 
        display: 'flex', 
        gap: 'clamp(20px, 4vw, 40px)', 
        width: '100%', 
        maxWidth: 1200, 
        height: 'min(800px, 90vh)',
        flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 1s cubic-bezier(0.23, 1, 0.32, 1)',
      }}>
        {/* Main Login Card */}
        <div className="card" style={{ 
          flex: '2 1 450px', 
          height: '100%',
          padding: 'clamp(24px, 4vw, 48px)', 
          borderRadius: 40, 
          background: 'rgba(255,255,255,0.7)', 
          backdropFilter: 'blur(40px)', 
          border: '1px solid rgba(255,255,255,0.8)', 
          boxShadow: '0 80px 150px -40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 40px)' }}>
            <div style={{ fontSize: 'clamp(2rem, 5vh, 3rem)', marginBottom: 12 }}>🏛️</div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vh, 2.5rem)', fontWeight: 900, color: '#1c1917', marginBottom: 4 }}>Vantage Point</h1>
            <p style={{ color: '#78350f', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>Elite Real Estate Governance</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(153, 27, 27, 0.1)', color: '#991b1b', padding: '16px 24px', borderRadius: 16, marginBottom: 32, fontSize: '0.8rem', fontWeight: 800, textAlign: 'center', border: '1px solid rgba(153, 27, 27, 0.2)' }}>
               {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>ELECTRONIC MAIL</label>
              <input
                type="email"
                className="form-control"
                style={{ border: 'none', background: 'rgba(255,255,255,0.5)', height: 60, borderRadius: 16, textAlign: 'center', fontSize: '1rem' }}
                placeholder="Ex: executive@vantage.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ fontSize: '0.6rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.2em', marginBottom: 12, display: 'block' }}>SECURITY CIPHER</label>
              <input
                type="password"
                className="form-control"
                style={{ border: 'none', background: 'rgba(255,255,255,0.5)', height: 60, borderRadius: 16, textAlign: 'center', fontSize: '1rem' }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ height: 64, fontSize: '0.9rem', width: '100%', marginTop: 8 }}
            >
              {loading ? 'AUTHORIZING…' : 'AUTHORIZE ACCESS'}
            </button>
          </form>
        </div>

        {/* Quick Protocol Card */}
        <div className="card" style={{ 
          flex: '1 1 300px', 
          height: '100%',
          padding: 'clamp(20px, 3vw, 32px)', 
          borderRadius: 40, 
          background: 'rgba(255,255,255,0.4)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255,255,255,0.5)', 
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 2vw, 24px)' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 900, color: '#1c1917', marginBottom: 4 }}>Rapid Protocols</h3>
            <p style={{ color: '#78350f', fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>Instant bypass for authorized roles</p>
          </div>

          <div style={{ display: 'grid', gap: 12, overflowY: 'auto', paddingRight: 8, scrollbarWidth: 'none' }}>
            <style>{`.protocol-grid::-webkit-scrollbar { display: none; }`}</style>
            <div className="protocol-grid" style={{ display: 'grid', gap: 12 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                className="btn"
                onClick={() => quickLogin(acc)}
                disabled={loading}
                style={{ 
                  background: '#fff', 
                  color: '#1c1917', 
                  height: 60, 
                  borderRadius: 16, 
                  border: '1px solid rgba(0,0,0,0.05)',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0 24px'
                }}
              >
                <span style={{ fontSize: '1.4rem', marginRight: 16 }}>{acc.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.75rem' }}>{acc.role.toUpperCase()}</div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 700 }}>{acc.label}</div>
                </div>
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
