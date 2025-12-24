// backend/server.js
const app = require("./src/app");
const pool = require("./src/config/db").pool;
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Test DB Connection before starting server
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  } else {
    console.log("Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
});
