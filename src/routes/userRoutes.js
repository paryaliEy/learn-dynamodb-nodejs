import express from "express";
import usersController from "../controller/usersController.js";
import multer from "multer";
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed"), false);
    }
  },
});
// Route to get all users
router.get("/users", usersController.getAllUsers);
router.post("/users", usersController.createUser);
router.post(
  "/users/bulk-upload",
  upload.single("file"),
  usersController.bulkUploadUsers
);

// router.get("/download/:filename", usersController.downloadExcel);

router.get("/users/:id", usersController.getUserById);
router.put("/users/:id", usersController.updateUser);
router.delete("/users/:id", usersController.deleteUser);

export default router;
