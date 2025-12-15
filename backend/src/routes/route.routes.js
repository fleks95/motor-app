const express = require('express');
const router = express.Router();
const routeController = require('../controllers/route.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', routeController.getRoutes); // Get all public routes
router.get('/:id', routeController.getRouteById); // Get specific route (public or own)

// Protected routes (require authentication)
router.post('/', authenticate, routeController.createRoute); // Create route
router.post('/import/google-maps', authenticate, routeController.importFromGoogleMaps); // Import from Google Maps
router.get('/user/me', authenticate, routeController.getMyRoutes); // Get user's own routes
router.put('/:id', authenticate, routeController.updateRoute); // Update route
router.delete('/:id', authenticate, routeController.deleteRoute); // Delete route
router.get('/:id/export/gpx', routeController.exportGPX); // Export route as GPX

module.exports = router;
