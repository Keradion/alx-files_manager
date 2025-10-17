const uuid = require('uuid');
const redisClient = require('./redis.js')

const decodeAuthToken = (token) => {

        const base64String = token;

        const buffer = Buffer.from(base64String, "base64");

        const decodedString = buffer.toString('utf-8');

	// email:password
	
	const [ email, password ] = decodedString.split(':');

	return email;
}

const generateAuthToken = async (userId) => {

	// generate token
	const token = uuid.v4();
	
	const redisKey = `auth_<${token}>`

	// save token in redis for 24 hr 
	await redisClient.set(redisKey, userId, 86400);

	return token;

}

console.log(decodeAuthToken('Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE='));

module.exports = { decodeAuthToken, generateAuthToken }
