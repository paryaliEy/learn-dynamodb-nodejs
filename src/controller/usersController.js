const userService = require("../services/userServices");

class UsersController {
  // get all users
  static async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        status: true,
        data: users,
        message: "Users retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        status: false,
        message: "Failed to retrieve users",
      });
    }
  }
}

module.exports = new UsersController();
