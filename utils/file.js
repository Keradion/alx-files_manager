const fs = require('fs').promises
const dbClient = require('./db.js');
const uuid = require('uuid');
const path = process.env.FOLDER_PATH || '/tmp/files_manager'; // Root folder path

// destruction used in the paramater since the file object is passed by reference
// avoiding mutating of the file object accidently

const saveFileToDisk = async (file) => {

	// destruction used since the file object is passed by reference
	// avoiding mutating of the file object accidently
	
	const { data, type, parentId } = { ...file  };

	console.log(data)

	// Path where the file stores.

	let filePath;

	// Decode the file from base64 to the appropirate format
	// raw file to string, image to bytes that is what type indicate file | image

	const fileContent =  decodeFile(data, type); 

	console.log(fileContent);

	// here the actual disk saving begins
	
	// Saving the file inside the root folder. parentId 0 inidcates that.
	// parent id may not be set that means its null or same ast to set to 0.
	
	if (parentId === 0 || parentId === null || parentId === undefined){

		// Produce localpath for the file

		filePath = uuid.v4();

		// lets confirm if the root folder exist otherwise create 

		console.log(path)

		try {
			await fs.access(path); // Folder exist?
		} catch {
			await fs.mkdir(path, { recursive: true });
		}

		// Store the file inside the path
		
		console.log(filePath);

		filePath = `${path}/${filePath}`;

		await fs.writeFile(filePath, fileContent);
	}

	// Handle the case when the file should be saved inside a folder
	// parent id > 0 indicates that.
	
	if (parentId > 0 && parenId !== null || parentId !== undefined ) {

		// new file name as uuid 
		
		filePath = uuid.v4();

		// Get the folder associated with the given folder id ?
		
		const folder  = await dbClient.findFileByParentId(parentId);

		console.log(folder);

		// Get the localPath of the folder

		const folderLocalPath = folder['localPath'];

	        // Construct the path the new file must be saved insider the folder

		console.log(folderLocalPath);

		filePath = `${folderLocalPath}/${filePath}`;

		// Save the file inside the folder

		await fs.writeFile(filePath, fileContent);

		console.log(filePath);

	}

	return filePath;
}

const saveFolderToDisk = async (folder) => {

	let folderPath;

	const { name, parentId } = {  ...folder };

	// Creates a folder inside the root folder
	
	if (parentId === 0 || parentId === null || parentId === undefined){

		// Produce localpath for the folder

		folderPath = uuid.v4();

		console.log(folderPath);
		
		try {
			await fs.access(path); // Folder exist?

		} catch {
			
			await fs.mkdir(path, { recursive: true }); // create root folder
		}

		// create  the folder in the right folder path

		folderPath = `${path}/${folderPath}`;

		await  fs.mkdir(folderPath, { recursive: true });
	}

	return folderPath;
}


const decodeFile = (data, type) => {

	let fileContent;

	// Reserve a memory space for a base64 string
	// so the buffer holds the raw bytes of the file content 
	// converting it from base64 into binary

	const buffer = Buffer.from(data, 'base64');

	// now we store the file inside a buffer as a byte
	
	if (type === 'file') {

		// convert the binary inside the buffer to string 
		// utf-8 as charachter set for conversion for text files 

		fileContent = buffer.toString('utf-8');

	}

	// Image conversion to string will affect the encoding 
	// so we store the image in byte format no string conversion needed here.
	
	if (type === 'image') {

		fileContent = buffer;

	}

	return fileContent;
}




module.exports = {
	saveFileToDisk,
	saveFolderToDisk
}
