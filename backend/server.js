require("dotenv").config();
const app = require("./src/app"); // Import the app we configured in src/app.js
const runMigrations = require("./src/utils/initDb");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Wait for Database to be ready and run migrations
  await runMigrations();

  // 2. Start the Express server
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
};

startServer();
