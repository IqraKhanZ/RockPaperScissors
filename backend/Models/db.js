const mongoose = require('mongoose');

let cachedConnection = null;
let connectionPromise = null;

const connectDatabase = async () => {
	if (cachedConnection || mongoose.connection.readyState === 1) {
		cachedConnection = mongoose.connection;
		return cachedConnection;
	}

	const mongoUri = process.env.MONGO_CONN;

	if (!mongoUri) {
		throw new Error('MONGO_CONN is not set in environment variables.');
	}

	if (!connectionPromise) {
		connectionPromise = mongoose
			.connect(mongoUri, {
				serverSelectionTimeoutMS: 30000,
				maxPoolSize: 10
			})
			.then((connection) => {
				cachedConnection = connection.connection;
				console.log('MongoDB connected successfully.');
				return cachedConnection;
			})
			.catch((error) => {
				connectionPromise = null;
				throw error;
			});
	}

	return connectionPromise;
};

module.exports = connectDatabase;
