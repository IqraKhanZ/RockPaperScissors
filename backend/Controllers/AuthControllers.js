const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../Models/User');
const SessionModel = require('../Models/Session');
const { sendOtpMail } = require('../emailVerify/sendOtpMail');
const { verifyMail } = require('../emailVerify/verifyMail');

const getSecret = () => process.env.JWT_SECRET || process.env.SECRET_KEY;

const buildToken = (payload, expiresIn = '24h') => {
	const secret = getSecret();
	if (!secret) throw new Error('JWT secret is not configured');
	return jwt.sign(payload, secret, { expiresIn });
};

const registerUser = async (req, res) => {
	try {
		const { username, name, email, password } = req.body;
		const displayName = username || name;
		const normalizedEmail = email?.toLowerCase().trim();

		if (!displayName || !normalizedEmail || !password) {
			return res.status(400).json({
				success: false,
				message: 'All fields are required'
			});
		}

		const existingUser = await UserModel.findOne({ email: normalizedEmail });
		if (existingUser?.isVerified) {
			return res.status(409).json({
				success: false,
				message: 'User already exists'
			});
		}

		if (existingUser && !existingUser.isVerified) {
			await UserModel.deleteOne({ _id: existingUser._id });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const token = buildToken(
			{
				type: 'email_verification',
				pendingUser: {
					username: displayName,
					name: displayName,
					email: normalizedEmail,
					password: hashedPassword
				}
			},
			'10m'
		);

		await verifyMail(token, normalizedEmail);

		return res.status(201).json({
			success: true,
			message: 'User registered successfully. Please verify your email.',
			data: {
				email: normalizedEmail,
				isVerified: false
			}
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

const verification = async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		const bearerMatch =
			typeof authHeader === 'string'
				? authHeader.trim().match(/^Bearer\s+(.+)$/i)
				: null;

		if (!bearerMatch?.[1]) {
			return res.status(401).json({
				success: false,
				message: 'Authorization token is missing or invalid'
			});
		}

		let token = String(bearerMatch[1]).trim();

		try {
			token = decodeURIComponent(token);
		} catch (_error) {
			// keep raw token if decoding fails
		}

		const secret = getSecret();
		let decoded;

		try {
			decoded = jwt.verify(token, secret);
		} catch (err) {
			if (err.name === 'TokenExpiredError') {
				return res.status(400).json({
					success: false,
					message: 'The registration token has expired'
				});
			}
			return res.status(400).json({
				success: false,
				message: 'Token verification failed'
			});
		}

		if (decoded?.type === 'email_verification' && decoded?.pendingUser?.email) {
			const pendingUser = decoded.pendingUser;
			const pendingEmail = String(pendingUser.email).toLowerCase().trim();

			const existingVerified = await UserModel.findOne({
				email: pendingEmail,
				isVerified: true
			});

			if (existingVerified) {
				return res.status(409).json({
					success: false,
					message: 'User already exists'
				});
			}

			await UserModel.deleteMany({ email: pendingEmail, isVerified: false });

			await UserModel.create({
				username: pendingUser.username || pendingUser.name,
				name: pendingUser.name || pendingUser.username,
				email: pendingEmail,
				password: pendingUser.password,
				isVerified: true,
				token: null
			});

			return res.status(200).json({
				success: true,
				message: 'Email verified successfully'
			});
		}

		const user = await UserModel.findById(decoded.id);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		user.token = null;
		user.isVerified = true;
		await user.save();

		return res.status(200).json({
			success: true,
			message: 'Email verified successfully'
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'All fields are required'
			});
		}

		const user = await UserModel.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized access'
			});
		}

		if (!user.password) {
			return res.status(400).json({
				success: false,
				message: 'This account uses Google login. Use Google sign-in.'
			});
		}

		const passwordCheck = await bcrypt.compare(password, user.password);
		if (!passwordCheck) {
			return res.status(401).json({
				success: false,
				message: 'Incorrect password'
			});
		}

		if (!user.isVerified) {
			return res.status(403).json({
				success: false,
				message: 'Verify your account before login'
			});
		}

		await SessionModel.deleteMany({ userId: user._id });
		await SessionModel.create({ userId: user._id });

		const accessToken = buildToken({ id: user._id, email: user.email }, '10d');
		const refreshToken = buildToken({ id: user._id }, '30d');

		user.isLoggedIn = true;
		await user.save();

		return res.status(200).json({
			success: true,
			message: `Welcome back ${user.name || user.username}`,
			accessToken,
			refreshToken,
			user
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

const logoutUser = async (req, res) => {
	try {
		const userId = req.userId || req.user?._id || req.user?.id || req.user?.sub;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized'
			});
		}

		await SessionModel.deleteMany({ userId });
		await UserModel.findByIdAndUpdate(userId, { isLoggedIn: false });

		return res.status(200).json({
			success: true,
			message: 'Logged out successfully'
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({
				success: false,
				message: 'Email is required'
			});
		}

		const user = await UserModel.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const expiry = new Date(Date.now() + 10 * 60 * 1000);

		user.otp = otp;
		user.otpExpiry = expiry;
		await user.save();

		await sendOtpMail(user.email, otp);
		return res.status(200).json({
			success: true,
			message: 'OTP sent successfully'
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

const verifyOTP = async (req, res) => {
	const { otp } = req.body;
	const email = req.params.email;

	if (!otp) {
		return res.status(400).json({
			success: false,
			message: 'OTP is required'
		});
	}

	try {
		const user = await UserModel.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		if (!user.otp || !user.otpExpiry) {
			return res.status(400).json({
				success: false,
				message: 'OTP not generated or already verified'
			});
		}

		if (user.otpExpiry < new Date()) {
			return res.status(400).json({
				success: false,
				message: 'OTP has expired. Please request a new one'
			});
		}

		if (otp !== user.otp) {
			return res.status(400).json({
				success: false,
				message: 'Invalid OTP'
			});
		}

		user.otp = null;
		user.otpExpiry = null;
		await user.save();

		return res.status(200).json({
			success: true,
			message: 'OTP verified successfully'
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Internal server error'
		});
	}
};

const changePassword = async (req, res) => {
	const { newPassword, confirmPassword } = req.body;
	const email = req.params.email;

	if (!newPassword || !confirmPassword) {
		return res.status(400).json({
			success: false,
			message: 'All fields are required'
		});
	}

	if (newPassword !== confirmPassword) {
		return res.status(400).json({
			success: false,
			message: 'Passwords do not match'
		});
	}

	try {
		const user = await UserModel.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;
		user.otp = null;
		user.otpExpiry = null;
		await user.save();

		return res.status(200).json({
			success: true,
			message: 'Password changed successfully'
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Internal server error'
		});
	}
};

const signup = registerUser;
const login = loginUser;

module.exports = {
	signup,
	login,
	registerUser,
	verification,
	loginUser,
	logoutUser,
	forgotPassword,
	verifyOTP,
	changePassword
};
