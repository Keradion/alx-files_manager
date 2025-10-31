// importing the necessary utilities
const dbClient = require('../utils/db.js');
const Password = require('../utils/password.js');
const validate = require('../utils/validation.js');
const User = require('../utils/user.js');
const bull = require('../utils/queue.js');

class UserController{
        
	static async postNew(request, response){

                // handle the case when either an email or password is miss.
		
		const { email, password } = request.body;

		const { isValid, error} = await validate.validateUser(email, password);

		if (!isValid) {
			response.status(400).json({
				'error': error
			});
			return;
		}

                // Get hashed format of the user password

                const hashedPassword = await Password.hashPassword(password);

                // Insert the new user into the database
                // mongo returns an object including uuid filed

                const newUser = await dbClient.insertUserToDB({
                        'email': email,
                        'password': hashedPassword
                });

		// Add a new Job to userQueue to send an email to the newly registered user 

		bull.userQueue.add('Email', {
			userId: newUser['insertedId']
		});

                // Retrurn id and email of the new user saved in DB
                
		response.status(201).json({
                        'id': newUser['insertedId'],
			'email': email
		});
	}

	static async getMe(request, response) {

		// Read the token from the request
	
		const token = request.headers['x-token'];

		// Fetch the user id associated with the token from redis and the user from DB?
	
		const user = await User.getUser(token);

		if (!user) {
			response.status(401).json({ 'error': 'Unauthorized' });
			return;
		};

		console.log(user);

		response.status(200).json({
			'email': user.email,
			'id': user._id
		});
	}


}

module.exports = UserController;
