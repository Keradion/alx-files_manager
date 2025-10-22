const dbClient = require('./db.js');

const validateUser = async (email, password) => {

	// handle missing email
	
	if (!email) {
		return { isValid: false, error: 'Missing email' };
	}
	
	// handle missing password 
	
	if (!password) {
		return { isValid: false, error: 'Missing password'};

	}

	// handle email already exist
	
	if(await dbClient.findUserByEmail(email)){
		return { isValid: false, error: 'Already exist' };
	}

	return { isValid: true, error: '' };

}

const validateFile = async (file) => {
	
	if (!(file.name)) {
		return { isValid: false, error: 'Missing name' };
	}

	if (!(file.type === 'folder' || file.type === 'file' || file.type === 'image')){
		return { isValid: false, error: 'Missing type' };
	}

	if (!(file.data) && (file.type !== 'folder')) {
		return { isValid: false, error: 'Missing data' };
	}

	// Assume the user is uploading a file and a parentId is specified
	// so we need to check if there is a folder with the given parentId
	
	console.log(file);

	if (file.parentId) {
		
		// Fetch the file if any exist under the given parentId

		const parentFile = await dbClient.findFileByParentId(file.parentId);

		console.log(parentFile);

		// If file exist but it is not a folder 
		// that means we can not have a reference of a file by another file

		if (parentFile && parentFile.type !== 'folder') {

			return { isValid: false, error: 'Parent is not a folder' };

		} 

		// If no file exist in DB

		if (!(parentFile)) {

			return { isValid: false, error: 'Parent not found' };

		}

	}

	console.log('valid ');

	return { isValid: true, error: ''}; // All validation has passed
}
module.exports = { validateUser, validateFile };
