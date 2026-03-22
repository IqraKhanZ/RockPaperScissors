const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	{ timestamps: true }
);

const SessionModel = mongoose.model('Session', sessionSchema);

module.exports = SessionModel;