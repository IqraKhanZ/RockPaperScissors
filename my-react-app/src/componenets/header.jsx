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

            <p className="docs-lead">Welcome! Before you start playing, please take a moment to review these instructions for the best experience:</p>

            <h3 className="docs-subtitle">📷 Camera &amp; Setup</h3>
            <ul className="docs-list">
              <li>Ensure your camera permission is <strong>allowed</strong> when prompted. The game will not function without it.</li>
              <li>If the camera does not start on the first attempt, click <strong>Open Camera</strong> again.</li>
            </ul>

            <h3 className="docs-subtitle">✋ Hand Positioning</h3>
            <ul className="docs-list">
              <li>Keep your hand <strong>clearly visible within the frame</strong> at all times.</li>
              <li>Make sure your hand is well-lit and not blurred for accurate gesture detection.</li>
            </ul>

            <h3 className="docs-subtitle">🪨📄✂️ Supported Gestures</h3>
            <ul className="docs-list">
              <li>The system recognizes only <strong>Rock</strong>, <strong>Paper</strong>, and <strong>Scissors</strong>.</li>
              <li>Any other gesture may result in <strong>No Hand Detected</strong>.</li>
            </ul>

            <h3 className="docs-subtitle">▶️ Starting the Game</h3>
            <ul className="docs-list">
              <li>First, position your hand properly inside the frame.</li>
              <li>Then click <strong>Play</strong> to begin.</li>
              <li>Starting without showing your hand may cause detection issues.</li>
            </ul>

            <h3 className="docs-subtitle">⚠️ Notes &amp; Feedback</h3>
            <ul className="docs-list">
              <li>This application is currently in the <strong>testing phase</strong>.</li>
              <li>Minor glitches or detection errors may occur.</li>
              <li>Your feedback is valuable—please report any issues to help us improve the experience.</li>
            </ul>

            <p className="docs-footnote">✨ Tip: For best results, play in a well-lit environment with a plain background.</p>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
