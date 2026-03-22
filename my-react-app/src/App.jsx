import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AuthSuccess from './componenets/authsuccess.jsx'
import ChangePassword from './componenets/changepassword.jsx'
import Footer from './componenets/footer.jsx'
import ForgotPassword from './componenets/forgotpassword.jsx'
import Header from './componenets/header.jsx'
import Home from './componenets/home.jsx'
import Login from './componenets/login.jsx'
import RefrshHandler from './RefrshHandler.jsx'
import Signup from './componenets/signup.jsx'
import Verify from './componenets/verify.jsx'
import VerifyEmail from './componenets/verifyemail.jsx'
import VerifyOtp from './componenets/verifyotp.jsx'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rock-paper-scissors-backend.vercel.app'

function App() {
  const [theme, setTheme] = useState('dark')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState({
    username: localStorage.getItem('loggedInUser') || 'User',
    email: localStorage.getItem('loggedInUserEmail') || '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    if (!isAuthenticated || !token) return

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const result = await response.json()
        if (!response.ok || !result.success || !result.user) return

        const username = result.user.name || result.user.username || 'User'
        const email = result.user.email || ''

        localStorage.setItem('loggedInUser', username)
        localStorage.setItem('loggedInUserEmail', email)
        setCurrentUser({ username, email })
      } catch (_error) {
        // keep localStorage fallback
      }
    }

    fetchProfile()
  }, [isAuthenticated])

  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  const handleLogout = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')

    localStorage.removeItem('accessToken')
    localStorage.removeItem('token')
    localStorage.removeItem('loggedInUser')
    localStorage.removeItem('loggedInUserEmail')
    setCurrentUser({ username: 'User', email: '' })
    setIsAuthenticated(false)
    navigate('/login', { replace: true })

    if (token) {
      fetch(`${API_BASE_URL}/user/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {
        // ignore network/logout API failures after local logout
      })
    }
  }

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />
  }

  return (
    <div className="app-shell">
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<div className="auth-shell"><Login /></div>} />
        <Route path="/signup" element={<div className="auth-shell"><Signup /></div>} />
        <Route path="/verify/:token" element={<div className="auth-shell"><Verify /></div>} />
        <Route path="/verify-email" element={<div className="auth-shell"><VerifyEmail /></div>} />
        <Route path="/forgot-password" element={<div className="auth-shell"><ForgotPassword /></div>} />
        <Route path="/verify-otp/:email" element={<div className="auth-shell"><VerifyOtp /></div>} />
        <Route path="/change-password/:email" element={<div className="auth-shell"><ChangePassword /></div>} />
        <Route path="/auth-success" element={<div className="auth-shell"><AuthSuccess /></div>} />
        <Route
          path="/home"
          element={
            <PrivateRoute
              element={
                <>
                  <Header
                    theme={theme}
                    onToggleTheme={handleToggleTheme}
                    onLogout={handleLogout}
                    currentUser={currentUser}
                  />
                  <Home currentUser={currentUser} />
                  <Footer />
                </>
              }
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App
