const yup = require('yup');

const userSchema = yup.object({
	username: yup
		.string()
		.trim()
		.min(3, 'Username must be atleast of 3 characters'),
	name: yup
		.string()
		.trim()
		.min(3, 'Name must be atleast of 3 characters'),
	email: yup
		.string()
		.trim()
		.email('The email is not valid one')
		.required('Email is required'),
	password: yup
		.string()
		.min(4, 'Password must be atleast 4 character')
		.required('Password is required')
}).test(
	'username-or-name',
	'Username or name is required',
	(value) => Boolean(value?.username?.trim() || value?.name?.trim())
);

const loginSchema = yup.object({
	email: yup
		.string()
		.trim()
		.email('The email is not valid one')
		.required('Email is required'),
	password: yup
		.string()
		.min(4, 'Password must be atleast 4 character')
		.required('Password is required')
});

const emailSchema = yup.object({
	email: yup
		.string()
		.trim()
		.email('The email is not valid one')
		.required('Email is required')
});

const otpSchema = yup.object({
	otp: yup
		.string()
		.trim()
		.length(6, 'OTP must be exactly 6 digits')
		.required('OTP is required')
});

const changePasswordSchema = yup.object({
	newPassword: yup
		.string()
		.min(4, 'Password must be atleast 4 character')
		.required('New password is required'),
	confirmPassword: yup
		.string()
		.oneOf([yup.ref('newPassword')], 'Passwords do not match')
		.required('Confirm password is required')
});

const validateUser = (schema) => async (req, res, next) => {
	try {
		await schema.validate(req.body, { abortEarly: false });
		next();
	} catch (err) {
		const errors = Array.isArray(err.errors)
			? [...new Set(err.errors)]
			: ['Validation failed'];
		return res.status(400).json({ errors });
	}
};

module.exports = {
	userSchema,
	loginSchema,
	emailSchema,
	otpSchema,
	changePasswordSchema,
	validateUser
};
