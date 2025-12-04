import { config } from "dotenv";
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
config();

const app = express();
const PORT = process.env.PORT || 3000;
//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api", userRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("API is healthy");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

//Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
