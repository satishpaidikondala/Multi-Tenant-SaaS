const express = require("express");
const cors = require("cors");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Middleware
app.use(express.json()); // Missing in previous version!
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes); // Note: projectRoutes should handle POST /:projectId/tasks
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/tasks", taskRoutes);

// Health Check
app.get("/api/health", async (req, res) => {
  const { pool } = require("./config/db");
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

module.exports = app;
