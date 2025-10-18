const MongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectId;

// get environment variables

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

// construct a url for mongodb connection
const url = `mongodb://${host}:${port}`;


class DBClient{
	constructor() {
		this.mongoclient = new MongoClient(url, { 
			useUnifiedTopology: true 
		});

		this.mongoclient.isalive = false;

		try {
			this.mongoclient.connect();
			this.mongoclient.isalive = true;
		} catch (error) {
			console.log(error);
		}

	}

	isAlive() {
		return this.mongoclient.isalive;
	}

	async nbUsers() {
		return await this.mongoclient.db(database).collection('users').countDocuments({});
	}

	async nbFiles() {
		return await this.mongoclient.db(database).collection('files').countDocuments({});
	}

	async insertUserToDB(user) {
		return await this.mongoclient
			.db(database)
			.collection('users')
			.insertOne(user)
	}

	async findUserByEmail(email) {
		return await this.mongoclient
			.db(database)
			.collection('users')
			.findOne({ 'email': email }); 
	}

	async findUserById(id) {

		// construct the id for mongodb
		const _id = new objectId(id);

		return await this.mongoclient
			.db(database)
			.collection('users')
			.findOne({ _id });
	}

}

const dbclient = new DBClient();

module.exports = dbclient;
