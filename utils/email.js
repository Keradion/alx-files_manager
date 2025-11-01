const mailer = require('nodemailer');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env')});

const GMAIL_ID= process.env.GMAIL_ID;
const GMAIL_PASSWORD = process.env.GMAIL_PASS;

// Configure nodemailer transporter which exposes methods to send emails

const transporter = mailer.createTransport({
        service: 'gmail',
	auth: {
		user: GMAIL_ID,
		pass: GMAIL_PASSWORD
	}	
})


// send the welcome email when a new user register

const sendWelcomeEmail = (userEmail) => {

	transporter.sendMail({
        from: `"File Manager App" <${GMAIL_ID}>`,
        to: userEmail,
        subject: 'Test email',
        text: `Welcome ${userEmail}`
}, (error, data) => {
	if (error) {
	console.error(error);
	}
})
};




module.exports = {
	sendWelcomeEmail
};
