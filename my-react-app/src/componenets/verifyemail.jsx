import { Link } from 'react-router-dom'

function VerifyEmail() {
	return (
		<div className="auth-card">
			<h1>Check Your Email</h1>
			<p className="auth-message">
				We have sent a verification link to your email. Open it and verify your account to continue.
			</p>
			<span>
				Already verified? <Link to="/login">Go to Login</Link>
			</span>
		</div>
	)
}

export default VerifyEmail
