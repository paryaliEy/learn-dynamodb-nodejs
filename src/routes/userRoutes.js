import express from "express";
import usersController from "../controller/usersController.js";
const router = express.Router();

// Route to get all users
router.get("/users", usersController.getAllUsers);
router.get("/users/create", usersController.createUser);

export default router;
