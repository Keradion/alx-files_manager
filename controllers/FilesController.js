const validate = require('../utils/validation.js');
const User = require('../utils/user.js');
const dbClient = require('../utils/db.js');
const saveFile = require('../utils/file.js');
const mime = require('mime-types');
const fs = require('fs');
const { ObjectId } = require('mongodb');


class FilesController {
	
	/** 
	 * Creates a new file in DB and disk 
	 * 
	 * @param request - an http request object.
	 * @param response - an http response object.
	 * @returns 
	 *
	 */
	
	static async files(request, response) {

		// Fetch the user authentication token from the request header.
		
		const token = request.headers['x-token'];

		// Fetch the file data object from the request object.

		console.log(request.body);

		const file = request.body 

		// Fetch the user associated with the provided token

		const user = await User.getUser(token);

		if (!user) {
			response.status(401).json({ 'error': 'Unauthorized' });
			return; // Stop furthur code execution
		}

		// lets validate if the user provided all the data values of the file
		// name, type (folder, file, image)
		// parentId | optional, isPublic | optional
		// data only for file | image as Base64 of the content

		const { isValid, error } = await validate.validateFile(file);

		// Bad Request - 400

		if (!isValid) {
			response.status(400).json({ 'error': error });
			return;
		}

		// handle the case when the file type is file

		if (file.type === 'file' || file.type === 'image') {

			// Save the new file content in the local disk

			const filePath = await saveFile.saveFileToDisk(file);

			// Append the user Id to the new file object
			
			const newFile= {
				name: file.name,
				type: file.type,
				userId: user._id, 
				isPublic: file.isPublic || false,
				parentId: file.parentId || 0,
				localPath: filePath
			}

			console.log(newFile);

			// Save the new file in the database

			let savedFile = await dbClient.saveFile(newFile);

			// Respond with the saved file
			
			savedFile = savedFile.ops[0];

			response.status(201).json({
				id: savedFile._id,
				userId: savedFile.userId,
				name: savedFile.name,
				type: savedFile.type,
				isPublic: savedFile.isPublic,
				parentId: savedFile.parentId
			});
		}

		// handle the case when the file type is Folder

		if (file.type === 'folder') {

			console.log('folder');

			// Save the new folder in the local disk
			
			const folderPath = await saveFile.saveFolderToDisk(file);

			// Append the user Id to the new file object

			const folder  = {
				name: file.name,
				type: file.type,
				userId: user._id,
				isPublic: file.isPublic || false, 
				parentId: file.parentId || 0,
				localPath: folderPath
			};

			// Save the new folder metadata in the database
			
			let savedFolder = await dbClient.saveFolder(folder);

			console.log(folder);

			// Respond with the saved folder 

			savedFolder = savedFolder.ops[0];


			response.status(201).json({
				id: savedFolder._id,
                                userId: savedFolder.userId,
                                name: savedFolder.name,
                                type: savedFolder.type,
                                isPublic: savedFolder.isPublic,
                                parentId: savedFolder.parentId
			});
	}

	}
	
	static async putPublish(request, response) {
		
		// Fetch the user authentication token from the request header.
		
		const token = request.headers['x-token'];

		// Fetch the user associated with the provided token

		const user = await User.getUser(token);

		if (!user) {
			response.status(401).json({ 'error': 'Unauthorized' });
			return;
		}

		// Get the requested file id from the request parameter

		const fileId = request.params.id

		const file = await dbClient.findFileByParentId(fileId);

		// Verify if the file has associated with the user Id
		

		if (!file) {
			response.status(404).json({ 'error': 'Not found' });
			return;
		}

		if (!(user._id.equals(file.userId))) {
                        response.status(404).json({ 'error': 'Not found' });
			return;
                }

		// Update the file isPublic key to true

		let updatedFile = await dbClient.updateFileMetaData(file._id, 'isPublic', true)
		
		// Get the file 

		updatedFile = await dbClient.findFileByParentId(fileId);

		// Respond 

		response.status(200).json(updatedFile)

	}

	static async putUnpublish(request, response) {
		
		// Fetch the user authentication token from the request header.

                const token = request.headers['x-token'];

                // Fetch the user associated with the provided token

                const user = await User.getUser(token);

                if (!user) {
                        response.status(401).json({ 'error': 'Unauthorized' });
                        return;
                }

                // Get the requested file id from the request parameter

                const fileId = request.params.id

                const file = await dbClient.findFileByParentId(fileId);

                // Verify if the file has associated with the user Id


		if (!file) {
                        response.status(404).json({ 'error': 'Not found' });
			return;
                }
                
		if (!user._id.equals(file.userId)) {
                        response.status(404).json({ 'error': 'Not found' });
			return;
                }

                // Update the file isPublic key to false

                let updatedFile = await dbClient.updateFileMetaData(file._id, 'isPublic', false)

                // Get the file

                updatedFile = await dbClient.findFileByParentId(fileId);

                // Respond

                response.status(200).json(updatedFile)

        }

	static async getFile(request, response) {

		// Fetch the user authentication token from the request header.

                const token = request.headers['x-token'];

                // Fetch the user associated with the provided token

                const user = await User.getUser(token);

		// Get the requested file id from the request parameter

                const fileId = request.params.id

                const file = await dbClient.findFileByParentId(fileId);

                if (!file) {
                        response.status(404).json({ 'error': 'Not found' });
                        return;
                }

		// Verify the file ownwership
		// If the requested file is priavte the only person allowed is the owner
		
	
		if ( file.isPublic === false) {
			
                        // File is private and user is not authorized

                        if (!(user)) {
				response.status(404).json({ 'error': 'Not found' });
				return;
			}

			// File is private user is authorized but user is not owner of the file.

			if (!file.userId.equals(user._id)) {
                                response.status(404).json({ 'error': 'Not found' });
                                return;
                        }
		}

		// Folder has no content

		if (file.type === 'folder') {
                        response.status(400).json({ 'error': "A folder doesn't have content" });
                        return;
                }

		// Prepare the http response header and set proper mime type before piping 
		
		const fileMimeType = mime.lookup(file.name);

		response.setHeader('Content-Type', fileMimeType);

		// Create a readStream to read the file content in a chunk and store each in buffer

                const readStream = fs.createReadStream(file.localPath);

		// lets handle errors when the file does not exist
                // since readStream emits error events lets handle that

                readStream.on('error', () => {
                        response.status(500).json({ 'error': 'Can not read the file' });
                });
		
		// Pipe the readStrem with the writeStream which is the response http object
		// Pipe will calls response.end() when the readStream completes and the buffer is empty.

		readStream.pipe(response);

	}

	static async getShow(request, response) {

		// Fetch the user authentication token from the request header.

                const token = request.headers['x-token'];

                // Fetch the user associated with the provided token

                const user = await User.getUser(token);

		if(!user) {
			response.status(401).json({ 'error': 'Unauthorized' });
			return;
		}

                // Get the requested file id from the request parameter

                const fileId = request.params.id

                const file = await dbClient.findFileByParentId(fileId);

                if (!file || (!(file.userId.equals(user._id)))) {
                        response.status(404).json({ 'error': 'Not found' });
                        return;
                }

		// send response 
		 response.status(200).json({
                                id: file._id,
                                userId: file.userId,
                                name: file.name,
                                type: file.type,
                                isPublic: file.isPublic,
                                parentId: file.parentId
                        });
	}

	static async getIndex(request, response) {

		const token = request.headers['x-token'];

		const user = await User.getUser(token);

		if(!user) {
			response.status(401).json({ error: 'Unauthorized' });
			return;
		}

		// Read the parentId and the page from the query string 
		
		let parentId = request.query.parentId ;

		if (parentId == '0') {
			parentId = parseInt(request.query.parentId)
		}

		if (parentId === undefined) {
			parentId = 0;
		}

		const page = parseInt(request.query.page) || 0;

		// Pagination skip and page size

		const pageSize = 20
		const skip = page * pageSize;


		// Get all files inside the db that matches the user Id and parentId
		// the function has skip and pageSize values to perform pagination 
		
		const allUserFiles = await dbClient.getFilesByUserandParentId(user._id, parentId, skip, pageSize);

		console.log(allUserFiles.length);

		const result = allUserFiles.map((file) => 
			({
				id: file._id.toString(),
				userId: file.userId,
				name: file.name,
				type: file.type,
				isPublic: file.isPublic,
				parentId: file.parentId ? file.parentId.toString() : '0'

			})
		);

		response.status(200).json(result);
	}
}

module.exports = FilesController;
