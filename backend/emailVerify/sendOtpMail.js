const nodemailer = require('nodemailer');

const sendOtpMail = async (email, otp) => {
	const mailUser = process.env.MAIL_USER?.trim();
	const mailPass = process.env.MAIL_PASS?.replace(/\s+/g, '');
	const recipient = typeof email === 'string' ? email.trim().toLowerCase() : '';

	if (!mailUser || !mailPass) {
		throw new Error('MAIL_USER and MAIL_PASS must be set in environment variables');
	}

	if (!recipient) {
		throw new Error('Recipient email is required for OTP mail');
	}

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: mailUser,
			pass: mailPass
		}
	});

	const mailOptions = {
		from: mailUser,
		to: recipient,
		subject: 'Password reset OTP',
		html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 10 minutes.</p>`
	};

	await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpMail };
