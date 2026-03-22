const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const verifyMail = async (token, email) => {
	const mailUser = process.env.MAIL_USER?.trim();
	const mailPass = process.env.MAIL_PASS?.replace(/\s+/g, '');
	const recipient = typeof email === 'string' ? email.trim().toLowerCase() : '';

	if (!mailUser || !mailPass) {
		throw new Error('MAIL_USER and MAIL_PASS must be set in environment variables');
	}

	if (!recipient) {
		throw new Error('Recipient email is required for verification mail');
	}

	const emailTemplateSource = fs.readFileSync(
		path.join(__dirname, 'template.hbs'),
		'utf-8'
	);

	const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
	const verifyUrl = `${clientUrl}/verify/${encodeURIComponent(token)}`;

	const template = handlebars.compile(emailTemplateSource);
	const htmlToSend = template({ verifyUrl });

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: mailUser,
			pass: mailPass
		}
	});

	const mailConfigurations = {
		from: mailUser,
		to: recipient,
		subject: 'Email Verification',
		html: htmlToSend
	};

	await transporter.sendMail(mailConfigurations);
};

module.exports = { verifyMail };
