import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const getJwtSecret = () => process.env.JWT_SECRET || "your-secret-key";

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await Student.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const authorizeStudentOrAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }

  if (
    req.user?.role === "student" &&
    req.user._id.toString() === req.params.id
  ) {
    return next();
  }

  return res.status(403).json({ message: "Access denied" });
};
