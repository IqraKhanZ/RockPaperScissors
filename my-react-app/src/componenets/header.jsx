import logo from '../assets/logo.svg'
import { useEffect, useRef, useState } from 'react'

function Header({ theme, onToggleTheme, onLogout, currentUser }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isDocsOpen, setIsDocsOpen] = useState(false)
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

  const handleOpenDocs = () => {
    setIsProfileOpen(false)
    setIsDocsOpen(true)
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

          <button
            className="header-btn docs-btn"
            type="button"
            onClick={handleOpenDocs}
            aria-label="Documentation"
            title="How to play"
          >
            i
          </button>
        </div>
      </div>

      {isDocsOpen && (
        <div className="docs-backdrop" onClick={() => setIsDocsOpen(false)} role="presentation">
          <div className="docs-modal" role="dialog" aria-modal="true" aria-label="Game documentation" onClick={(event) => event.stopPropagation()}>
            <div className="docs-modal-header">
              <h2>Quick Game Guide</h2>
              <button className="docs-close-btn" type="button" onClick={() => setIsDocsOpen(false)} aria-label="Close documentation">
                ×
              </button>
            </div>

            <p className="docs-lead"><strong>No video is being recorded.</strong></p>
            <ul className="docs-list">
              <li>Please keep your hand clearly inside the frame to capture gestures properly.</li>
              <li>Only Rock, Paper, and Scissors gestures are detected. Any other gesture can show as no hand detected.</li>
              <li>First bring your hand into frame, then click Play. Otherwise it may show no hand detected.</li>
              <li>Please allow camera permission when prompted, otherwise the game cannot start.</li>
              <li>If Open Camera does not work on first click, try clicking it once again.</li>
            </ul>
            <p className="docs-footnote">This app is currently in testing phase. We would love to hear about flaws so we can improve and fix them.</p>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
