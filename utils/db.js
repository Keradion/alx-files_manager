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
			.db(database).collection('users')
			.insertOne(user)
	}

	async findUserByEmail(email) {
		return await this.mongoclient
			.db(database).collection('users')
			.findOne({ 'email': email }); 
	}

	async findUserById(id) {

		// Construct the id to fit mongodb object id
		
		const _id = new objectId(id);

		return await this.mongoclient
			.db(database).collection('users')
			.findOne({ _id });
	}

	async findFileByParentId(parentId) {
                
		const _id = new objectId(parentId);
		
		return await this.mongoclient
			.db(database).collection('files')
			.findOne( { _id } );
	}

	async getFilesByUserandParentId(userId, parentId, skip, pageSize){

		console.log(userId);
		console.log(parentId);

		const query = { userId: userId, parentId: parentId };

		return await this.mongoclient
			.db(database).collection('files')
			.find(query)
			.skip(skip)
			.limit(pageSize)
			.toArray(); // Find returns cursor and we need the list so used to Array()

	}

	async saveFile(file) {
		
		return await this.mongoclient
			.db(database).collection('files')
			.insertOne(file);
	}

	async updateFileMetaData(fileId, key, value) {

                const _id = new objectId(fileId);

		await this.mongoclient
			.db(database)
			.collection('files')
			.updateOne({ _id }, { $set: { [key]: value }});

		// Return the updated file
		
		return await this.findFileByParentId(fileId);
	}

	async saveFolder(file) {
		return await this.mongoclient
			.db(database).collection('files')
			.insertOne(file);
	}
}

const dbclient = new DBClient();

module.exports = dbclient;
