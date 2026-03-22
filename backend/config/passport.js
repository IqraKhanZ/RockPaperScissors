const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const UserModel = require('../Models/User');

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if (googleClientId && googleClientSecret) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: googleClientId,
				clientSecret: googleClientSecret,
				callbackURL: '/auth/google/callback'
			},
			async (_accessToken, _refreshToken, profile, done) => {
				try {
					let user = await UserModel.findOneAndUpdate(
						{ googleId: profile.id },
						{ isLoggedIn: true },
						{ new: true }
					);

					if (!user) {
						const email = profile.emails?.[0]?.value?.toLowerCase();
						const avatar = profile.photos?.[0]?.value;
						const username = profile.displayName;

						user = await UserModel.findOne({ email });
						if (user) {
							user.googleId = profile.id;
							user.avatar = avatar;
							user.isLoggedIn = true;
							user.isVerified = true;
							if (!user.username) user.username = username;
							if (!user.name) user.name = username;
							await user.save();
						} else {
							user = await UserModel.create({
								googleId: profile.id,
								username,
								name: username,
								email,
								avatar,
								isLoggedIn: true,
								isVerified: true
							});
						}
					}

					return done(null, user);
				} catch (error) {
					return done(error, null);
				}
			}
		)
	);
}

module.exports = passport;
