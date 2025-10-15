const express = require('express');
const router = express.Router();

const AppController = require('../controllers/AppController'); // Expose getStatus and getStats methods.

// Redirecting /status and /stats endpoint requests into the corresponding handlers.

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Exposing router to other modules requiring it.
module.exports = router;
