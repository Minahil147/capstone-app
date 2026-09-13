require("dotenv").config();
const express = require("express");
const issueRoutes = require("./routes/issueRoutes");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "DevFlow AI backend is running" });
});

app.use("/api/issues", issueRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

app.use(errorHandler);

module.exports = app;