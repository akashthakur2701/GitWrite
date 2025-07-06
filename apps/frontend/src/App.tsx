import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Blog } from './pages/Blog'
import { Blogs } from './pages/Blogs'
import { Publish } from './pages/Publish'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { UserProfile } from './pages/UserProfile'
import { ErrorBoundary } from './components/ErrorBoundary'
import { tokenUtils } from './utils/api'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = tokenUtils.isValid();
  return isAuthenticated ? <>{children}</> : <Navigate to="/landing" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = tokenUtils.isValid();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/signin" element={
            <PublicRoute>
              <Signin />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blogs" 
            element={
              <ProtectedRoute>
                <Blogs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog/:id" 
            element={
              <ProtectedRoute>
                <Blog />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/publish" 
            element={
              <ProtectedRoute>
                <Publish />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/:userId" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Root route - redirect based on authentication */}
          <Route 
            path="/" 
            element={
              tokenUtils.isValid() ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/landing" replace />
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App