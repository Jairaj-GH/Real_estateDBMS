import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import bgImage from '../assets/login-bg.png'

const ROLE_REDIRECTS = {
  office: '/office',
  agent: '/agent',
  customer: '/marketplace',
  admin: '/admin',
}

const QUICK_LOGINS = [
  { label: 'Office', email: 'office@realestate.com', icon: '🏢' },
  { label: 'Agent', email: 'agent1@realestate.com', icon: '🤝' },
  { label: 'Customer', email: 'buyer1@example.com', icon: '👤' },
  { label: 'Admin', email: 'admin@realestate.com', icon: '🛡️' },
]

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

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
        'Access denied. Please verify your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Glass Card */}
      <div className="card" style={{ 
        width: '90%', 
        maxWidth: 420, 
        padding: '50px 40px',
        textAlign: 'center',
        animation: 'fadeIn 1.2s ease-out'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: 40, letterSpacing: '-0.02em', color: '#fff' }}>Login</h1>

        {error && (
          <div style={{ background: 'rgba(220, 38, 38, 0.2)', padding: '12px', borderRadius: 12, marginBottom: 30, fontSize: '0.85rem', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#fff' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.7, marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>Select Role Credentials</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {QUICK_LOGINS.map(role => (
              <button
                key={role.label}
                onClick={() => setEmail(role.email)}
                type="button"
                className="btn login-btn-jelly"
                style={{
                  padding: '8px 16px',
                  background: email === role.email ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  borderColor: email === role.email ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'
                }}
              >
                <span>{role.icon}</span>
                <span>{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Email / Username Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              className="form-control"
              placeholder="Username / Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', height: 60, paddingLeft: 52, borderRadius: 50 }}
            />
            <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }}>
              <UserIcon />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', height: 60, paddingLeft: 52, borderRadius: 50 }}
            />
            <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)' }}>
              <LockIcon />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary login-btn-jelly"
            style={{ padding: '16px', borderRadius: 50, marginTop: 10, width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-btn-jelly {
          animation: none !important;
        }
        .login-btn-jelly:hover {
          animation: none !important;
        }
        .login-btn-jelly:active {
          animation: jelly 0.6s ease-out both !important;
        }
      `}</style>
    </div>
  )
}
