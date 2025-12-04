require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api", userRoutes);
