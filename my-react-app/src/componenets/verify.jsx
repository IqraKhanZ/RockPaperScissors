import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Verify() {
	const { token } = useParams()
	const [status, setStatus] = useState('Verifying your email...')
	const navigate = useNavigate()

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/user/verify`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				const result = await response.json()
				if (!response.ok || !result.success) {
					setStatus('Verification failed')
					handleError(result.message || result?.errors?.[0] || 'Verification failed')
					return
				}

				setStatus('Email verified successfully')
				handleSuccess(result.message || 'Email verified successfully')
				setTimeout(() => navigate('/login'), 1200)
			} catch (_error) {
				setStatus('Verification failed')
				handleError('Verification failed. Please try again.')
			}
		}

		verifyEmail()
	}, [token, navigate])

	return (
		<div className="auth-card">
			<h1>Email Verification</h1>
			<p className="auth-message">{status}</p>
			<ToastContainer />
		</div>
	)
}

export default Verify
