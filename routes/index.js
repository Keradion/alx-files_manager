const express = require('express');
const router = express.Router();

const AppController = require('../controllers/AppController'); // Expose getStatus and getStats methods.

const UserController = require('../controllers/UsersController');

const AuthController = require('../controllers/AuthController');

const FilesController = require('../controllers/FilesController');

// Redirecting /status and /stats endpoint requests into the corresponding handlers.

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Redirecting /users endpoint requests into the corresponding handler.

router.post('/users', UserController.postNew);
router.get('/users/me', UserController.getMe);

// Redirecting /connect / disconnect endpoint request into the corresponding handler.

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.disconnect);

// Redirecting /files endpoint request into the corresponding handler.
router.post('/files', FilesController.files)

// 

router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

// Redirecting /files/:id/publish and /files/:id/unpublish endpoint requests to the corresponding handlers

router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

// Redirecting /files/:id/data endpoint request to the corresponding handler.

router.get('/files/:id/data', FilesController.getFile);

// Exposing router to other modules requiring it.

module.exports = router;
