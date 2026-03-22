import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rock-paper-scissors-backend.vercel.app'

function VerifyOtp() {
	const { email } = useParams()
	const decodedEmail = decodeURIComponent(email || '')
	const navigate = useNavigate()
	const [otp, setOtp] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			setIsLoading(true)
			const response = await fetch(`${API_BASE_URL}/user/verify-otp/${encodeURIComponent(decodedEmail)}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ otp }),
			})

			const result = await response.json()
			if (!response.ok || !result.success) {
				handleError(result?.errors?.[0] || result.message || 'OTP verification failed')
				return
			}

			handleSuccess(result.message || 'OTP verified')
			navigate(`/change-password/${encodeURIComponent(decodedEmail)}`)
		} catch (_error) {
			handleError('Unable to connect to backend. Start your backend and try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="auth-card">
			<h1>Verify OTP</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="otp">OTP</label>
					<input
						type="text"
						id="otp"
						name="otp"
						maxLength={6}
						placeholder="Enter 6-digit OTP"
						value={otp}
						onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
						required
					/>
				</div>
				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Verifying OTP...' : 'Verify OTP'}
				</button>
				<span>
					Wrong email? <Link to="/forgot-password">Go back</Link>
				</span>
			</form>
			<ToastContainer />
		</div>
	)
}

export default VerifyOtp
