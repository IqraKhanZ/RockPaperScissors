const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const AuthRoutes = require('./Routes/AuthRoutes');
const UserRoutes = require('./Routes/UserRoutes');
const connectDatabase = require('./Models/db');
const ensureAuthenticated = require('./Middlewares/Auth');
require('./config/passport');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(passport.initialize());

app.use(
	cors({
		origin: process.env.CLIENT_URL || 'http://localhost:5173',
		credentials: true
	})
);

app.get('/ping', (_req, res) => {
	return res.status(200).send('PONG');
});

app.use(async (_req, res, next) => {
	try {
		await connectDatabase();
		return next();
	} catch (error) {
		console.error('Database connection error:', error.message);
		return res.status(500).json({
			success: false,
			message: 'Database connection failed. Please try again.'
		});
	}
});

app.use('/auth', AuthRoutes);
app.use('/user', UserRoutes);

app.get('/auth/me', ensureAuthenticated, (req, res) => {
	return res.status(200).json({
		success: true,
		user: req.user
	});
});

const startServer = async () => {
	try {
		if (!process.env.VERCEL) {
			await connectDatabase();
		}
		if (!process.env.VERCEL) {
			app.listen(PORT, () => {
				console.log(`Backend server running on port ${PORT}`);
			});
		}
	} catch (error) {
		console.error('Failed to start backend:', error.message);
		if (!process.env.VERCEL) {
			process.exit(1);
		}
	}
};

startServer();

module.exports = app;
