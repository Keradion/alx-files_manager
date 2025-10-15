// importing the necessary utilities
const dbClient = require('../utils/db.js');
const Password = require('../utils/password.js');
const validate = require('../utils/validation.js');

class UserController{
        static async postNew(request, response){

                // handle the case when either an email or password is miss.
		
		const { email, password } = request.body;

		const { isValid, error} = await validate(email, password);

		if (!isValid) {
			response.status(400).json({
				'error': error
			});
			return;
		}

                // Get hashed format of the user password. ?

                const hashedPassword = await Password.hashPassword(password);

                // Insert the new user into the database.
                // mongo returns an object including uuid filed.

                const newUser = await dbClient.insertUserToDB({
                        'email': email,
                        'password': hashedPassword
                });

                // Retrurn id and email of the new user saved in DB.
                
		response.status(201).json({
                        'id': newUser['insertedId'],
			'email': email
		});

}
}

module.exports = UserController;
