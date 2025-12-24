const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // FIX: Added space below ⬇️
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return res.status(401).json({ success: false, message: "No token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      decoded.userId,
    ]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: "User not found" });

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
};
