
const otp = require('otp-generator')


// Generates 5 charachters long OTP Code 

const generateOtp = () => {
	return otp.generate(5, {
	digits: true,
	alphabets: false,
	upperCase: true,
	specialChars: false
})
};

module.exports = {
	generateOtp 
};
