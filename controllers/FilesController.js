const validate = require('../utils/validation.js');
const User = require('../utils/user.js');
const dbClient = require('../utils/db.js');


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

		const { isValid, error } = validate.validateFile(file);

		console.log('valid')

		// Bad Request - 400

		// handle the case when the file type is file

		if (file.type === 'file') {

			// Append the user Id to the new file object
			
			const newFile= { ... file, 
				userId: user._id, 
				isPublic: file.isPublic || false,
				parentId: file.parentId || 0
			}

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
			
			try {
				// lets append the user id in the file object
				// and additional optional name value pairs 

				console.lgo('start');
				const File = { ...file, isPublic: file.isPublic || false, parentId: file.parentId || 0 };

				// save the folder in DB.

				const savedFolder = await dbClient.SaveFolder(File);
				console.log('folder saved')
				resposne.status(201).json(savedFolder);
			} catch (error) {
				response.status(500).json({ 'error': `${error}`});
			}

		// handle the case when the file type is File

	}
}
}

module.exports = FilesController;
