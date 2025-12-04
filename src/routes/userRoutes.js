import express from "express";
import usersController from "../controller/usersController.js";
const router = express.Router();

// Route to get all users
router.get("/users", usersController.getAllUsers);
router.post("/users/create", usersController.createUser);

router.get("/users/view/:id", usersController.getUserById);

export default router;
