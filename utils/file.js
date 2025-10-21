const fs = require('fs').promises
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

		await fs.writeFile(`${path}/${filePath}`, fileContent);
	}

	return filePath;
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


module.exports = saveFileToDisk;
