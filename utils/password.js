const SHA1 = require('./sha1-es');

const hashPassword = async (password) => {
	
	// hash the password.

	return SHA1.hash(password);
}

const validateHashPassword = async (password, hash) => {

	// hash the password again and compare it with the hash.
	
	const hashedPassword = await hashPassword(password);
	return hashedPassword === hash;
}

module.exports = { hashPassword, validateHashPassword }
