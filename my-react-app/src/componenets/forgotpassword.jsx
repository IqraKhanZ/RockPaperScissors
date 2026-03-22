import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rock-paper-scissors-backend.vercel.app'

function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			setIsLoading(true)
			const response = await fetch(`${API_BASE_URL}/user/forgot-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})

			const result = await response.json()
			if (!response.ok || !result.success) {
				handleError(result?.errors?.[0] || result.message || 'Unable to send OTP')
				return
			}

			handleSuccess(result.message || 'OTP sent successfully')
			navigate(`/verify-otp/${encodeURIComponent(email)}`)
		} catch (_error) {
			handleError('Unable to connect to backend. Start your backend and try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="auth-card">
			<h1>Forgot Password</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="email">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Sending OTP...' : 'Send OTP'}
				</button>
				<span>
					Remember your password? <Link to="/login">Login</Link>
				</span>
			</form>
			<ToastContainer />
		</div>
	)
}

export default ForgotPassword
