import { MongoClient } from 'mongodb'


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

		try {
			this.mongoclient.connect();
			this.mongoclient.isalive = true;
		} catch (error) {
			console.log(error);
			this.mongoclient.isalive = false;
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

}

const dbclient = new DBClient();

export default dbclient;


