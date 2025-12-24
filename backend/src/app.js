// backend/src/app.js
const express = require("express");
const cors = require("cors");

// Import Routes (We will create these next)
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");
// const tenantRoutes = require('./routes/tenantRoutes'); // Uncomment later
// const userRoutes = require('./routes/userRoutes');     // Uncomment later
// const projectRoutes = require('./routes/projectRoutes'); // Uncomment later

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON bodies

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
// app.use('/api/tenants', tenantRoutes); // Uncomment later
// app.use('/api/users', userRoutes);     // Uncomment later
// app.use('/api/projects', projectRoutes); // Uncomment later

// Health Check (Required for Docker)
app.get("/api/health", async (req, res) => {
  const pool = require("./config/db").pool;
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
