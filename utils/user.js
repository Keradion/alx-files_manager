const dbClient = require('./db.js');
const redisClient = require('./redis.js');

const getUser = async (authToken) => {

	// get the user id from redis
	
	const userId = await getUserIdFromRedis(authToken);

	// get the user from DB 
	
	const user = await dbClient.findUserById(userId);

	console.log(user);

	return user;
}

const getUserIdFromRedis = async (token) => {

	// construct the key && get the user id from redis
	
	const redisKey = `auth_${token}`;

	const userId = await redisClient.get(redisKey);

	console.log(userId)

	return userId;
}

const disconnectUser = async (token) => {

	const userId = await getUserIdFromRedis(token);


	if (!userId) return false;

	const redisKey = `auth_${token}`;

	try {
		return await redisClient.del(redisKey) > 0;

	} catch (error) {
		console.log(error);
		return false
	}

}
module.exports = {
	getUser, 
	disconnectUser
}
