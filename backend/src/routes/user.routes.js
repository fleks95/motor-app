const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Routes
router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateCurrentUser);
router.get('/:id', userController.getUserById);

module.exports = router;
