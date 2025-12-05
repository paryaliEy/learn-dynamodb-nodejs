import serverlessExpress from "@vendia/serverless-express";
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

const app = express();

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

export const handler = serverlessExpress({ app });
