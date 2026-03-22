import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleError, handleSuccess } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function Signup() {
	const [formData, setFormData] = useState({
		username: '',
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

	const handleSignup = async (e) => {
		e.preventDefault()
		try {
			setIsLoading(true)
			const response = await fetch(`${API_BASE_URL}/user/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			const result = await response.json()

			if (!response.ok || !result.success) {
				const firstValidationError = result?.errors?.[0]
				handleError(firstValidationError || result.message || 'Signup failed')
				return
			}

			handleSuccess(result.message || 'Signup successful')
			navigate('/verify-email')
		} catch (_error) {
			handleError('Unable to connect to backend. Start your backend and try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="auth-card">
			<h1>Create Account</h1>
			<form onSubmit={handleSignup}>
				<div>
					<label htmlFor="username">Username</label>
					<input
						type="text"
						name="username"
						id="username"
						placeholder="Enter your username"
						value={formData.username}
						onChange={handleChange}
						required
					/>
				</div>
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
					<label htmlFor="password">Password</label>
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
					{isLoading ? 'Creating account...' : 'Signup'}
				</button>

				<span>
					Already have an account? <Link to="/login">Login</Link>
				</span>
			</form>
			<ToastContainer />
		</div>
	)
}

export default Signup
