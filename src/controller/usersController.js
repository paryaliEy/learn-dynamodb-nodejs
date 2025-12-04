import userService from "../services/userServices.js";

async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      status: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.log("Error retrieving users:", error);
    res.status(500).json({
      error: error.message,
      e: error,
      status: false,
      message: "Failed to retrieve users",
    });
  }
}

async function createUser(req, res) {
  // Implementation for creating a user
  try {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json({
      status: true,
      data: newUser,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: false,
      message: "Failed to create user",
    });
  }
}

export default { getAllUsers, createUser };
