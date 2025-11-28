const userService = require('../services/user.service');

class UserController {
  async getCurrentUser(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCurrentUser(req, res, next) {
    try {
      const updates = req.body;
      const user = await userService.updateUser(req.user.id, updates);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
