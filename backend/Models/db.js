const mongoose = require('mongoose');

const connectDatabase = async () => {
	const mongoUri = process.env.MONGO_CONN;

	if (!mongoUri) {
		throw new Error('MONGO_CONN is not set in environment variables.');
	}

	await mongoose.connect(mongoUri);
	console.log('MongoDB connected successfully.');
};

module.exports = connectDatabase;
