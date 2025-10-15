const dbClient = require('./db.js');

const validate = async (email, password) => {

	// handle missing email
	
	if (!email) {
		return { isValid: false, error: 'Missing email' };
	}
	
	// handle missing password 
	
	if (!password) {
		return { isValid: false, error: 'Missing password'};

	}

	// handle email already exist
	
	if(await dbClient.findUserByEmail(email)){
		return { isValid: false, error: 'Already exist' };
	}

	return { isValid: true, error: '' };

}

module.exports = validate;
