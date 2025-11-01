const mailer = require('nodemailer');

// Configure nodemailer transporter which exposes methods to send emails

const transporter = mailer.createTransport({
        service: 'gmail',
	auth: {
		user: 'danielshitaye10@gmail.com',
		pass: 'iosk dgym wcko vorp'
	}	
})


// send the welcome email when a new user register

const sendWelcomeEmail = (userEmail) => {

	transporter.sendMail({
        from: '"File Manager App" <danielshitaye10@gmail.com>',
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
}
