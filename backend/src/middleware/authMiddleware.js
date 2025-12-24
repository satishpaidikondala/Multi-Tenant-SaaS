// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

// 1. Verify Token (Authentication)
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split("")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. Please login.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const query =
      "SELECT id, email, full_name, role, tenant_id FROM users WHERE id = $1";
    const result = await pool.query(query, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    // Attach user to request object
    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route. Invalid token.",
    });
  }
};

// 2. Restrict by Role (Authorization)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['super_admin', 'tenant_admin']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
