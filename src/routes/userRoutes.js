import express from "express";
import usersController from "../controller/usersController.js";
const router = express.Router();

// Route to get all users
router.get("/users", usersController.getAllUsers);
router.post("/users", usersController.createUser);

router.get("/users/:id", usersController.getUserById);
router.put("/users/:id", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);

export default router;
