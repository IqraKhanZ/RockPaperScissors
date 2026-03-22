const jwt = require('jsonwebtoken');
const UserModel = require('../Models/User');

const ensureAuthenticated = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		const bearerMatch =
			typeof authHeader === 'string'
				? authHeader.trim().match(/^Bearer\s+(.+)$/i)
				: null;

		if (!bearerMatch?.[1]) {
			return res.status(401).json({
				success: false,
				message: 'Access token is missing or invalid'
			});
		}

		let token = bearerMatch[1].trim();

		try {
			token = decodeURIComponent(token);
		} catch (_error) {
			// keep raw token if decoding fails
		}

		token = token.replace(/^['"]+|['"]+$/g, '').trim();

		if (!token) {
			return res.status(401).json({
				success: false,
				message: 'Access token is missing or invalid'
			});
		}

		const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
		if (!secret) {
			return res.status(500).json({
				success: false,
				message: 'JWT secret is not configured'
			});
		}

		jwt.verify(token, secret, async (err, decoded) => {
			if (err) {
				if (err.name === 'TokenExpiredError') {
					return res.status(400).json({
						success: false,
						message: 'Access token has expired'
					});
				}
				return res.status(400).json({
					success: false,
					message: 'Access token is missing or invalid'
				});
			}

			const userId = decoded.id || decoded.sub;
			const user = await UserModel.findById(userId);
			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'User not found'
				});
			}

			req.user = user;
			req.userId = user._id;
			next();
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message
		});
	}
};

module.exports = ensureAuthenticated;
