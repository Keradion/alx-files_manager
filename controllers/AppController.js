const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');

class AppController{
	
	static getStatus(request, response) {
		
		// Get database status
		const dbStatus = dbClient.isAlive();
		
		// Get redis server status
		const redisStatus = redisClient.isAlive();

		const Status = { 
			'redis': redisStatus,
			'db': dbStatus
		}
		response.status(200).json(Status);
	}

	static getStats(request, response) {
	
		// Get number of users in db 
		const nbUsers = dbClient.nbUsers();

		// Get number of files in db
		const nbFiles = dbClient.nbFiles()

		const stat = {
			'users': nbUsers,
			'files': nbFiles
		}
		response.status(200).json(stat);
	}
}

module.exports = AppController;
