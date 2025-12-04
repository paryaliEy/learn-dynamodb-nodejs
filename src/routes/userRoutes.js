const express = require("express");
const UsersController = require("../controller/usersController");
const router = express.Router();

// Route to get all users
router.get("/users", UsersController.getAllUsers);

module.exports = router;
