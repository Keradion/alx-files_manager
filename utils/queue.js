const Queue = require('bull');

// Create a new queue called 'fileQueue'
// add Jobs to the queue
// workers fetch jobs from the queue and process it

// Jobs stored in redis the default setup is localhost:6379

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');
// Exposing the queue so that jobs can be added 

module.exports = {
	fileQueue,
	userQueue
};
