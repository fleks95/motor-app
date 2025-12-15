const routeService = require('../services/route.service');
const googleMapsParser = require('../services/googleMaps.service');

// Create a new route
exports.createRoute = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const routeData = req.body;

    // Validate required fields
    if (!routeData.name) {
      return res.status(400).json({
        error: { message: 'Route name is required' },
      });
    }

    if (!routeData.waypoints || routeData.waypoints.length < 2) {
      return res.status(400).json({
        error: { message: 'Route must have at least 2 waypoints' },
      });
    }

    const route = await routeService.createRoute(userId, routeData);

    res.status(201).json({
      data: route,
      message: 'Route created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get all routes (with filters)
exports.getRoutes = async (req, res, next) => {
  try {
    const { user_id, is_public, difficulty, limit, offset } = req.query;

    const filters = {
      userId: user_id,
      isPublic: is_public === 'true' ? true : is_public === 'false' ? false : undefined,
      difficulty,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    };

    const routes = await routeService.getRoutes(filters);

    res.json({
      data: routes,
      count: routes.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get route by ID
exports.getRouteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const route = await routeService.getRouteById(id, userId);

    if (!route) {
      return res.status(404).json({
        error: { message: 'Route not found or you do not have permission to view it' },
      });
    }

    res.json({ data: route });
  } catch (error) {
    next(error);
  }
};

// Update route
exports.updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin || false;
    const updateData = req.body;

    const route = await routeService.updateRoute(id, userId, isAdmin, updateData);

    res.json({
      data: route,
      message: 'Route updated successfully',
    });
  } catch (error) {
    if (error.message === 'Unauthorized to update this route') {
      return res.status(403).json({ error: { message: error.message } });
    }
    next(error);
  }
};

// Delete route
exports.deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin || false;

    await routeService.deleteRoute(id, userId, isAdmin);

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    if (error.message === 'Unauthorized to delete this route') {
      return res.status(403).json({ error: { message: error.message } });
    }
    next(error);
  }
};

// Export route as GPX
exports.exportGPX = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const gpx = await routeService.exportToGPX(id, userId);

    res.setHeader('Content-Type', 'application/gpx+xml');
    res.setHeader('Content-Disposition', `attachment; filename="route-${id}.gpx"`);
    res.send(gpx);
  } catch (error) {
    if (error.message === 'Route not found') {
      return res.status(404).json({ error: { message: error.message } });
    }
    next(error);
  }
};

// Get user's own routes
exports.getMyRoutes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset } = req.query;

    const filters = {
      userId,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    };

    const routes = await routeService.getRoutes(filters);

    res.json({
      data: routes,
      count: routes.length,
    });
  } catch (error) {
    next(error);
  }
};

// Import route from Google Maps URL
exports.importFromGoogleMaps = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { url, name, description, difficulty, road_type, is_public } = req.body;

    if (!url) {
      return res.status(400).json({
        error: { message: 'Google Maps URL is required' },
      });
    }

    if (!name) {
      return res.status(400).json({
        error: { message: 'Route name is required' },
      });
    }

    // Parse waypoints from Google Maps URL
    const waypoints = await googleMapsParser.parseUrl(url);

    // Validate waypoints
    googleMapsParser.validateWaypoints(waypoints);

    // Create route with parsed waypoints
    const routeData = {
      name,
      description: description || `Imported from Google Maps`,
      difficulty: difficulty || 'moderate',
      road_type: road_type || 'mixed',
      is_public: is_public !== undefined ? is_public : false,
      waypoints,
    };

    const route = await routeService.createRoute(userId, routeData);

    res.status(201).json({
      data: route,
      message: 'Route imported successfully from Google Maps',
    });
  } catch (error) {
    if (error.message.includes('parse') || error.message.includes('waypoints')) {
      return res.status(400).json({
        error: { message: error.message },
      });
    }
    next(error);
  }
};
