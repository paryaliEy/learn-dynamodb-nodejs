import { id } from "zod/locales";
import EmployeeSchema from "../schema/Employees.js";
import userService from "../services/userServices.js";
import * as XLSX from "xlsx-color";
import moment from "moment";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { file } from "zod";
import s3service from "../services/s3service.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

function excelDateToJSDate(excelDate) {
  const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
  return moment(date).format("YYYY-MM-DD");
}
async function getAllUsers(req, res) {
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

// Bulk upload from excel
async function bulkUploadUsers(req, res) {
  try {
    console.log("Bulk upload request received");
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "No file uploaded",
      });
    }
    console.log(
      `File uploaded: ${req.file.originalname} Size: ${req.file.size} bytes`,
      ` Type: ${req.file.mimetype}`
    );
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    console.log("Excel file read successfully");
    const sheetName = workbook.SheetNames[0];
    console.log(`Processing sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    console.log("Worksheet extracted successfully");
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log("Excel data parsed to JSON successfully");

    console.log(`Rows found in Excel: ${data.length}`);

    if (!data || data.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Uploaded file is empty",
      });
    }

    const usersData = [];
    const errors = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const userData = {
        first_name: row["First Name"],
        last_name: row["Last Name"],
        position: row["Position"],
        department: row["Department"],
        salary: row["Salary"],
        hireDate: excelDateToJSDate(row["Date of Joining"]),
      };
      const validated = EmployeeSchema.safeParse(userData);
      if (!validated.success) {
        errors.push({
          row: i + 2,
          errors: JSON.parse(validated.error.message),
        });
      } else {
        usersData.push(userData);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Validation errors in uploaded file",
        errors: errors,
      });
    }

    console.log("Starting bulk user creation");
    const createdUsers = await userService.bulkCreateUsers(usersData);
    console.log(`Successfully created ${createdUsers.length} users`);

    const outputData = createdUsers.map((user) => ({
      "Employee ID": user.employee_id,
      "First Name": user.first_name,
      "Last Name": user.last_name,
      Position: user.position,
      Department: user.department,
      Salary: user.salary,
      "Date of Joining": user.hireDate,
      id: user.employee_id,
    }));

    const outputWorksheet = XLSX.utils.json_to_sheet(outputData);
    const outputWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      outputWorkbook,
      outputWorksheet,
      "Created Users"
    );
    const outputBuffer = XLSX.write(outputWorkbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    //save file to server (optional)
    const fileName = `created_users_${Date.now()}.xlsx`;
    let downloadUrl;

    const s3Key = await s3service.uploadFile(
      outputBuffer,
      fileName,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    downloadUrl = await s3service.getFileUrl(s3Key);
    // const uploadsDir = path.join(__dirname, "../../uploads");
    // const filePath = path.join(uploadsDir, fileName);
    // fs.writeFileSync(filePath, outputBuffer);
    // console.log(req);
    res.status(201).json({
      status: true,
      message: "Users bulk uploaded successfully",
      downloadLink: downloadUrl,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: false,
      message: "Failed to bulk upload users --",
      line: error,
    });
  }
}

// async function downloadExcel(req, res) {
//   try {
//     const fileName = req.params.filename;

//     if (fileName.includes("..") || fileName.includes("/")) {
//       return res.status(400).json({
//         status: false,
//         message: "Invalid file name",
//       });
//     }

//     const filePath = path.join(__dirname, "../../uploads", fileName);

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({
//         status: false,
//         message: "File not found",
//       });
//     }

//     res.download(filePath, fileName);
//   } catch (error) {
//     res.status(500).json({
//       error: error.message,
//       status: false,
//       message: "Failed to download file",
//     });
//   }
//   // Implementation for downloading the Excel file
// }

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

// update user by id
async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const validated = EmployeeSchema.partial().safeParse(updateData);
    if (!validated.success) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors: JSON.parse(validated.error.message),
      });
    }
    const updatedUser = await userService.updateUser(userId, updateData);
    res.status(200).json({
      status: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: false,
      message: "Failed to update user",
    });
  }
}

// delete user by id
async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    await userService.deleteUser(userId);
    res.status(200).json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: false,
      message: "Failed to delete user",
    });
  }
}

export default {
  getAllUsers,
  createUser,
  bulkUploadUsers,
  // downloadExcel,
  getUserById,
  updateUser,
  deleteUser,
};
