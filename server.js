const express = require('express');
const routes = require('./routes/index.js'), // Load all the routes
  // Get the port number from the environment variable or use default port number 5000

  PORT = process.env.PORT || 5000,
  // Get an express server instance

  app = express();

app.use(express.json());

app.use('/', routes);

app.listen(PORT, '0.0.0.0', () => {
  // Consider binding to 0.0.0.0 instead of 'localhost' so the server can accept connections from Docker containers or external clients. Using 'localhost' restricts access to only the local machine.
  console.log(`Server is listening ON PORT ${PORT}.... `);
});
