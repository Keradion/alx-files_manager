const queue = require('./utils/queue.js');
const dbClient = require('./utils/db.js');
const redisClient = require('./utils/redis.js');
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

		await email.sendWelcomeEmail(user.email);

		job.progress(100);

	} catch (error) {

		console.error(`${error.message}`);
		throw error; // Mark the job as failed
	}

});

// USER LOGIN OTP CODE SENDING PROCESSING 

queue.userQueue.process('Otp', async (job) => {

	const { userId, email, otp } = { ...job.data };

	if (!userId) throw new Error('Missing user Id');
	if (!email) throw new Error('Missing user email');
	if (!otp) throw new Error('Missing otp code');

	// verify if the email exists inside the database
	// and verify if the otp is in redis and associated with the user email
	
	try {
		const user = await dbClient.findUserById(userId);

                if(!user) throw new Error('User not found');

		// Verify otp in redis 

		const otpInRedis = await redisClient.get(`2fa:${otp}:${email}`);

		if (!otpInRedis) throw new Error('Opt has not been set in redis');

		job.progress(25);
		
		// Verify rate counter in redis
		
		const counterInRedis = await redisClient.get(`2fa:${otp}`);

		if (!counterInRedis) throw new Error('Rate Counter has not been set in redis');

		job.progress(50);

		// Send otp code 
	
                await  email.sendWelcomeEmail(user.email);
               
		job.progress(100);

	} catch (error) {
		console.error(`${error.message}`);
		throw error;
	}

});


queue.userQueue.on('progress', (job, progress) => {

	        console.log(`Sending a welcome email for ${JSON.stringify(job.data)} has been completed ${progress}%`);
});

queue.userQueue.on('failed', (job, error) => {

        console.error(`The job ${JSON.stringify(job.data)} has failed: ${error.message}`);

});

