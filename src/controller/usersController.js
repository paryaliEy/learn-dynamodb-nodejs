import EmployeeSchema from "../schema/Employees.js";
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
    const validated = EmployeeSchema.safeParse(userData);
    if (!validated.success) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors: JSON.parse(validated.error.message),
      });
    }
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

// get user by id

async function getUserById(req, res) {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      status: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: false,
      message: "Failed to retrieve user",
    });
  }
}
export default { getAllUsers, createUser, getUserById };
