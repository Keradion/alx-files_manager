const express = require('express');
const routes = require('./routes/index.js'); // Load all the routes 

// Get the port number from the environment variable or use default port number 5000

const PORT = process.env.PORT || 5000;

// Get an express server instance

const app = express();

app.use(express.json());

app.use('/', routes);


app.listen(PORT, 'localhost', () => {
	console.log(`Server is listening ON PORT ${PORT}.... `);
});
