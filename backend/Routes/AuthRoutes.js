const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { signup, login } = require('../Controllers/AuthControllers');
const ensureAuthenticated = require('../Middlewares/Auth');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');

const isGoogleConfigured = () => {
	const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
	return !!clientId && !!clientSecret;
};

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);

router.get('/google', (req, res, next) => {
	if (!isGoogleConfigured()) {
		return res.status(503).json({
			success: false,
			message: 'Google OAuth is not configured'
		});
	}
	return passport.authenticate('google', { scope: ['profile', 'email'] })(
		req,
		res,
		next
	);
});

router.get(
	'/google/callback',
	(req, res, next) => {
		if (!isGoogleConfigured()) {
			return res.status(503).json({
				success: false,
				message: 'Google OAuth is not configured'
			});
		}
		return passport.authenticate('google', { session: false })(req, res, next);
	},
	(req, res) => {
		try {
			const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
			const token = jwt.sign(
				{ id: req.user._id, email: req.user.email },
				secret,
				{ expiresIn: '7d' }
			);
			const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
			res.redirect(`${clientUrl}/auth-success?token=${token}`);
		} catch (error) {
			const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
			res.redirect(`${clientUrl}/login?error=google_failed`);
		}
	}
);

router.get('/me', ensureAuthenticated, (req, res) => {
	return res.status(200).json({
		success: true,
		user: req.user
	});
});

module.exports = router;
