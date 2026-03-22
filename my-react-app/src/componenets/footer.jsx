function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-col footer-tech">
          <p className="footer-title">Technologies used</p>
          <p className="footer-meta">React • Vite • MediaPipe • OpenCV • JavaScript • CSS</p>
        </div>

        <div className="footer-col footer-contact">
          <p className="footer-title">Connect</p>
          <div className="footer-icons">
            <a className="footer-icon-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.83v2.2h.06c.53-1 1.83-2.2 3.76-2.2C19.5 8 24 10.25 24 16.1V24h-4v-7.1c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.78V24h-4V8z" fill="currentColor"/>
              </svg>
            </a>
            <a className="footer-icon-link" href="mailto:iqrakhan30oct@gmail.com" aria-label="Email">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M2 5h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm10 7L3.7 7h16.6L12 12zm0 2L3 8v10h18V8l-9 6z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
