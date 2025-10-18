const dbClient = require('../utils/db.js');
const token = require('../utils/token.js');
const user = require('../utils//user.js');
	
class AuthController{
	
	static async getConnect (request, response) {
		
		// Extract authorization token from the request object header
		// and get the user email and password. ?

		const authorizationToken = request.headers.authorization;
		const email = await token.decodeAuthToken(authorizationToken);
		
		// check if there is any user associated with the email provided
		console.log(email.length, email);

		const user = await dbClient.findUserByEmail(email);

		console.log(user);

		if (!user) {
			response.status(401).json({ 'error': 'Unauthorized' });
			return;
		}

		// Get an authorization token and set in redis
		// so that we can keep track of the user ?

		const authToken = await token.generateAuthToken(user._id);

		// send back response

		response.status(200).json({ 'token': authToken });


	}
	
	static async disconnect (request, response) {
		const token = request.headers['x-token'];

		// check if the user id and token has found 
		// remove the token from redis and return true.

		if (await user.disconnectUser(token)) {
			response.status(204).end();
			return;
		}

		response.status(401).json({
			'error': 'Unauthorized'
		});

}
}


module.exports = AuthController;
