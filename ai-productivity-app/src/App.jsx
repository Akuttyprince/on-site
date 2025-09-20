import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import ChannelPage from './pages/ChannelPage'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <GoogleOAuthProvider clientId="270773180558-2273iilq25se4n7hdq2m7vn76kd55b9m.apps.googleusercontent.com">
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/profile-setup" 
                element={
                  <ProtectedRoute>
                    <ProfileSetup />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/channel/:channelId" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <ChannelPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/channel/:channelId/chat" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <ChannelPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
