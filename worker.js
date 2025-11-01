const queue = require('./utils/queue.js');
const dbClient = require('./utils/db.js');
const email = require('./utils/email.js');

// IMAGE THUMBNAIL GENERATION PROCESSING 

// Process each job from the queue and perform the required operation
// job parameter represents the job data that the queue holds
// job is an object which has a key job.data and job.id

queue.fileQueue.process('ThumbnailGeneration', async (job) => {

	// Extract the userId and fileId and validate  fields 

	const { userId, fileId } = { ...job.data };

	if (!userId) throw new Error('Missing userId');
	if (!fileId) throw new Error('Missing fileId');

	try {

	} catch(error) {

		console.error(`${error.message}`);
	}

	job.progress(100);

});


// listener function runs every time 'progress' event emits

queue.fileQueue.on('progress', (job, progress) => {
	
	console.log(` The Job with a Job id of ${job.id} and job data ${JSON.stringify(job.data)} has been completed ${progress}%`);

});

// listener function runs every time a job fails

queue.fileQueue.on('failed', (job, error) => {

	console.error(`The job ${JSON.stringify(job.data)} has failed: ${error.message}`);

});

// NEW USER REGISTERATION EMAIL SENDING PROCESSING 

queue.userQueue.process('Email', async (job) => {

	const { userId } = { ...job.data };

	if (!userId) throw new Error('Missing userId');

	// Fetch the user associated with the userId from database
	
	try {
		const user = await dbClient.findUserById(userId);
		
		if(!user) throw new Error('User not found');

		job.progress(50);

		email.sendWelcomeEmail(user.email);

		job.progress(100);

	} catch (error) {

		console.error(`${error.message}`);
		throw error; // Mark the job as failed
	}

});


queue.userQueue.on('progress', (job, progress) => {

	        console.log(`Sending a welcome email for ${JSON.stringify(job.data)} has been completed ${progress}%`);
});

queue.userQueue.on('failed', (job, error) => {

        console.error(`The job ${JSON.stringify(job.data)} has failed: ${error.message}`);

});

