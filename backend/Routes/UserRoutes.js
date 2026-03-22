const router = require('express').Router();
const ensureAuthenticated = require('../Middlewares/Auth');
const {
	registerUser,
	verification,
	loginUser,
	logoutUser,
	forgotPassword,
	verifyOTP,
	changePassword
} = require('../Controllers/AuthControllers');
const {
	userSchema,
	loginSchema,
	emailSchema,
	otpSchema,
	changePasswordSchema,
	validateUser
} = require('../validators/uservalidate');

router.post('/register', validateUser(userSchema), registerUser);
router.post('/verify', verification);
router.post('/login', validateUser(loginSchema), loginUser);
router.post('/logout', ensureAuthenticated, logoutUser);
router.post('/forgot-password', validateUser(emailSchema), forgotPassword);
router.post('/verify-otp/:email', validateUser(otpSchema), verifyOTP);
router.post('/change-password/:email', validateUser(changePasswordSchema), changePassword);

module.exports = router;
