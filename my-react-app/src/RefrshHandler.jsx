import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function RefrshHandler({ setIsAuthenticated }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    const publicRoutes = [
      '/',
      '/login',
      '/signup',
      '/verify-email',
      '/forgot-password',
      '/auth-success',
    ]
    const isDynamicPublicRoute =
      location.pathname.startsWith('/verify/') ||
      location.pathname.startsWith('/verify-otp/') ||
      location.pathname.startsWith('/change-password/')

    if (token) {
      setIsAuthenticated(true)
      if (publicRoutes.includes(location.pathname) || isDynamicPublicRoute) {
        navigate('/home', { replace: true })
      }
      return
    }

    setIsAuthenticated(false)
    if (!publicRoutes.includes(location.pathname) && !isDynamicPublicRoute) {
      navigate('/login', { replace: true })
    }
  }, [location.pathname, navigate, setIsAuthenticated])

  return null
}

export default RefrshHandler
