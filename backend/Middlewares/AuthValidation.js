const Joi = require('joi');

const signupSchema = Joi.object({
	name: Joi.string().trim().min(3).max(100).required(),
	email: Joi.string().trim().email().required(),
	password: Joi.string().min(6).max(100).required()
});

const loginSchema = Joi.object({
	email: Joi.string().trim().email().required(),
	password: Joi.string().min(6).max(100).required()
});

const signupValidation = (req, res, next) => {
	const { error } = signupSchema.validate(req.body, { abortEarly: true });
	if (error) {
		return res.status(400).json({
			success: false,
			message: 'Bad request.',
			error: error.details[0].message
		});
	}

	return next();
};

const loginValidation = (req, res, next) => {
	const { error } = loginSchema.validate(req.body, { abortEarly: true });
	if (error) {
		return res.status(400).json({
			success: false,
			message: 'Bad request.',
			error: error.details[0].message
		});
	}

	return next();
};

module.exports = {
	signupValidation,
	loginValidation
};
