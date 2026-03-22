const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			trim: true
		},
		name: {
			type: String,
			trim: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true
		},
		password: {
			type: String
		},
		googleId: {
			type: String
		},
		avatar: {
			type: String
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		isLoggedIn: {
			type: Boolean,
			default: false
		},
		token: {
			type: String,
			default: null
		},
		otp: {
			type: String,
			default: null
		},
		otpExpiry: {
			type: Date,
			default: null
		}
	},
	{
		timestamps: true
	}
);

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;
