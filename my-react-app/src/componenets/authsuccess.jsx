import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rock-paper-scissors-backend.vercel.app'

function AuthSuccess() {
	const navigate = useNavigate()

	useEffect(() => {
		const handleAuth = async () => {
			const params = new URLSearchParams(window.location.search)
			const token = params.get('token')

			if (!token) {
				handleError('Missing authentication token')
				navigate('/login')
				return
			}

			localStorage.setItem('accessToken', token)
			localStorage.setItem('token', token)

			try {
				const response = await fetch(`${API_BASE_URL}/auth/me`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				const result = await response.json()

				if (!response.ok || !result.success) {
					handleError(result.message || 'Google login failed')
					navigate('/login')
					return
				}

				localStorage.setItem('loggedInUser', result?.user?.name || result?.user?.username || '')
				localStorage.setItem('loggedInUserEmail', result?.user?.email || '')
				handleSuccess('Login successful')
				navigate('/home')
			} catch (_error) {
				handleError('Unable to complete Google login')
				navigate('/login')
			}
		}

		handleAuth()
	}, [navigate])

	return (
		<div className="auth-card">
			<h1>Logging in...</h1>
			<p className="auth-message">Please wait while we finish Google authentication.</p>
			<ToastContainer />
		</div>
	)
}

export default AuthSuccess
