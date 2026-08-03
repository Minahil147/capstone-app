require("dotenv").config();
const express = require("express");
const issueRoutes = require("./routes/issueRoutes");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");

const app = express();
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({ message: "DevFlow AI backend is running" });
});

app.use("/api/issues", issueRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
