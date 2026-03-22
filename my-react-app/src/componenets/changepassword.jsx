import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rock-paper-scissors-backend.vercel.app'

function ChangePassword() {
	const { email } = useParams()
	const decodedEmail = decodeURIComponent(email || '')
	const navigate = useNavigate()

	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			setIsLoading(true)
			const response = await fetch(`${API_BASE_URL}/user/change-password/${encodeURIComponent(decodedEmail)}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ newPassword, confirmPassword }),
			})

			const result = await response.json()
			if (!response.ok || !result.success) {
				handleError(result?.errors?.[0] || result.message || 'Password change failed')
				return
			}

			handleSuccess(result.message || 'Password changed successfully')
			setTimeout(() => navigate('/login'), 1200)
		} catch (_error) {
			handleError('Unable to connect to backend. Start your backend and try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="auth-card">
			<h1>Change Password</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="newPassword">New Password</label>
					<input
						type="password"
						id="newPassword"
						name="newPassword"
						placeholder="Enter new password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor="confirmPassword">Confirm Password</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						placeholder="Confirm new password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>
				</div>
				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Updating...' : 'Change Password'}
				</button>
			</form>
			<ToastContainer />
		</div>
	)
}

export default ChangePassword
