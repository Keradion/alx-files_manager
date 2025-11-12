const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');
const Token = require('../utils/token.js');
const User = require('../utils/user.js');
const Password = require('../utils/password.js');
const otp = require('../utils/otp.js');
const bull = require('../utils/queue.js');

class AuthController{
	
	static async getConnect (request, response) {
		
		// Extract authorization token from the request object header
		// and get the user email and password. ?

		const authorizationToken = request.headers.authorization;
		const { email, password }  = await Token.decodeAuthToken(authorizationToken);
		
		// check if there is any user associated with the email provided

		const user = await dbClient.findUserByEmail(email);

		if (!user || !(await Password.validateHashPassword(password, user.password || ''))) {
			response.status(401).json({ 'error': 'Unauthorized' });
			return;
		}

		// User exist and its valid
		// send an email for the user containing the otp code
		// Store the opt code in redis under the key 2fa:otp:email for an expiration duration of 5 min.
		// Store another key in redis 2fa:otp that holdes a counter value for an expiration duration of 1hr. 
		// so that if there are multiple attempts excceded the counter limit they can regain access after 1hr to retry.

		const otpCode = otp.generateOtp();

		// Set the otp code in redis

		const redisOtpKey = `2fa:${otpCode}:${user.email}`;

		console.log(redisOtpKey);

		redisClient.set(redisOtpKey, otpCode, 300);

		// Set counter in redis 
		// check if there is an existing counter
		
		const redisCounterKey = `2fa:${otpCode}`;

		console.log(redisCounterKey);

		const counterExist = redisClient.get(redisCounterKey)

		if (!counterExist) {
			redisClient.set(redisCounterKey, 0, 3600);
		}

		redisClient.set(redisCounterKey, 0, 3600);

		// Send the otp code for the user email (use queue)

		bull.userQueue.add('Otp', {
			userId: user._id,
			email: user.email,
			otp: otpCode
		});

		// send back response

		response.status(200).json({ 'otp': `If the user email exists, an OTP code has been sent. please check your email and proceed to login. The code is valid for only 5 miniutes.`});

	}
	
	static async disconnect (request, response) {
		const token = request.headers['x-token'];

		// check if the user id and token has found 
		// remove the token from redis and return true.

		if (await User.disconnectUser(token)) {
			response.status(204).end();
			return;
		}

		response.status(401).json({
			'error': 'Unauthorized'
		});
	}

      

	static async verifyOTP(request, response) {

		// Read the otp code  and the user email from the request object
		
		const otp = request.params.otp;
		const email = request.params.email;

		// Verify if any user with the given email exists
		
		if (!user) {
			request.status(404).json({
				'error': 'User does not exist'
			});
		}

		// Check if the user has not passed the verification request limit by using the key 2fa:otp:email under redis.

		// Check if the OTPCODE given is valid and it is in redis
		
		// The user exist but the OTPCODE given is not valid
		// so Increment the counter in redis stored under the key 2fa:otp inside redis.
		
		// The user exist and the user has not passed the rate limit and the OTPCODE is valid 
		// Generate and provide Authentication Token
		// remove the key 2fa:otp and 2fa:otp:email from redis.
		


		// Get an authorization token and set in redis
                // so that we can keep track of the user.

                const authToken = await Token.generateAuthToken(user._id);

                // send back response

                response.status(200).json({ 'token': authToken });
	}

}


module.exports = AuthController;
