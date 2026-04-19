import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import OfficeDashboard from './pages/OfficeDashboard'
import AgentDashboard from './pages/AgentDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Marketplace from './pages/Marketplace'
import About from './pages/About'
import Analytics from './pages/Analytics'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  const map = { office: '/office', agent: '/agent', customer: '/marketplace', admin: '/admin' }
  return <Navigate to={map[user.role] || '/marketplace'} replace />
}

function WrappedPage({ children }) {
  return (
    <Layout>
      {children}
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Common Authenticated Routes */}
          <Route path="/marketplace" element={
            <ProtectedRoute allowedRoles={['office', 'agent', 'customer', 'admin']}>
              <WrappedPage><Marketplace /></WrappedPage>
            </ProtectedRoute>
          } />

          <Route path="/about" element={
            <ProtectedRoute allowedRoles={['office', 'agent', 'customer', 'admin']}>
              <WrappedPage><About /></WrappedPage>
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['office', 'agent', 'admin']}>
              <WrappedPage><Analytics /></WrappedPage>
            </ProtectedRoute>
          } />

          {/* Office Routes (Nested) */}
          <Route path="/office/*" element={
            <ProtectedRoute allowedRoles={['office', 'admin']}>
              <WrappedPage><OfficeDashboard /></WrappedPage>
            </ProtectedRoute>
          } />

          {/* Agent Routes (Nested) */}
          <Route path="/agent/*" element={
            <ProtectedRoute allowedRoles={['agent', 'admin']}>
              <WrappedPage><AgentDashboard /></WrappedPage>
            </ProtectedRoute>
          } />

          {/* Customer Routes */}
          <Route path="/customer/*" element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <WrappedPage><CustomerDashboard /></WrappedPage>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <WrappedPage><AdminDashboard /></WrappedPage>
            </ProtectedRoute>
          } />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '4rem' }}>🚫</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Denied</h1>
              <p style={{ color: 'var(--text-muted)' }}>You don't have permission to view this page.</p>
              <button className="btn btn-primary" onClick={() => window.history.back()}>Go Back</button>
            </div>
          } />

          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
