import logo from '../assets/logo.svg'
import { useEffect, useRef, useState } from 'react'

function Header({ theme, onToggleTheme, onLogout, currentUser }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = (currentUser?.username || 'U').trim().charAt(0).toUpperCase()

  const handleLogoutClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsProfileOpen(false)
    onLogout()
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-wrap">
          <img src={logo} alt="Game logo" className="brand-logo" />
          <h1 className="brand-title">Rock Paper Scissors</h1>
        </div>
        <div className="header-actions">
          <button className="header-btn" type="button" onClick={onToggleTheme} aria-label="Toggle theme" title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            {theme === 'dark' ? '☀' : '☾'}
          </button>

          <div className="profile-wrap" ref={profileRef}>
            <button
              className="header-btn profile-btn"
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="Profile"
              title="Profile"
            >
              {initials}
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <p className="profile-name">{currentUser?.username || 'User'}</p>
                <p className="profile-email">{currentUser?.email || 'No email'}</p>
                <button
                  className="profile-logout-btn"
                  type="button"
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
