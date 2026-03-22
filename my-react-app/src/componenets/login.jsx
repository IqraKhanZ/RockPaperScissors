import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'
import googleLogo from '../assets/googleLogo.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rock-paper-scissors-backend.vercel.app'

function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleLogin = async (e) => {
		e.preventDefault()
		try {
			setIsLoading(true)
			const response = await fetch(`${API_BASE_URL}/user/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			const result = await response.json()

			if (!response.ok || !result.success) {
				const firstValidationError = result?.errors?.[0]
				handleError(firstValidationError || result.message || 'Login failed')
				return
			}

			localStorage.setItem('accessToken', result.accessToken)
			localStorage.setItem('token', result.accessToken)
			localStorage.setItem('loggedInUser', result?.user?.name || result?.user?.username || 'User')
			localStorage.setItem('loggedInUserEmail', result?.user?.email || '')
			handleSuccess(result.message || 'Login successful')
			navigate('/home')
		} catch (error) {
			handleError('Unable to connect to backend. Start your backend and try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="auth-card">
			<h1>Login</h1>
			<form onSubmit={handleLogin}>
				<div>
					<label htmlFor="email">Email</label>
					<input
						type="email"
						name="email"
						id="email"
						placeholder="Enter your email"
						value={formData.email}
						onChange={handleChange}
						required
					/>
				</div>

				<div>
					<div className="auth-inline-row">
						<label htmlFor="password">Password</label>
						<Link className="auth-inline-link" to="/forgot-password">Forgot password?</Link>
					</div>
					<div className="password-field-wrap">
						<input
							type={showPassword ? 'text' : 'password'}
							name="password"
							id="password"
							placeholder="Enter your password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
						<button
							type="button"
							className="password-toggle-btn"
							onClick={() => setShowPassword((prev) => !prev)}
						>
							{showPassword ? 'Hide' : 'Show'}
						</button>
					</div>
				</div>

				<button type="submit" disabled={isLoading}>
					{isLoading ? 'Logging in...' : 'Login'}
				</button>

				<button
					type="button"
					className="auth-secondary-btn"
					onClick={() => window.open(`${API_BASE_URL}/auth/google`, '_self')}
				>
					<span className="google-btn-content">
						<img src={googleLogo} alt="Google" className="google-btn-logo" />
						Login with Google
					</span>
				</button>

				<span>
					Don&apos;t have an account? <Link to="/signup">Signup</Link>
				</span>
			</form>
			<ToastContainer />
		</div>
	)
}

export default Login
