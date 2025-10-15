const dbClient = require('./db.js');

const validate = async (userData) {

	// retrieve the user email and password
	
	const email = userData['email'];
	const password = userData['password'];

	// handle missing email
	
	if (!email) {
		return {
			isValid: false,
			error: 'Missing email'
		};
	}
	
	// handle missing password 
	
	if (!password) {
		return {
			isValid: false,
			error: 'Missing password'
		};

	}

	// handle email already exist
	
	if(await findUserByEmail(email)){
		return {
			isValid: false,
			error: 'Already exist'
		};
	}

	return {
		isValid: true,
		error: ''
	};

}

module.exports = validate;
