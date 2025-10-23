const fs = require('fs');

console.log(fs.readFile('/tmp/files_manager/0d45fe40-1d89-4696-8be1-7c5d263593ac', 'utf-8', (err, data) => {
	console.log(data);
}));
