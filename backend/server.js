import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

import connectDB from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import certificateRoutes from "./src/routes/certificateRoutes.js";
import {
  forgotPassword,
  resetPassword,
} from "./src/controllers/studentController.js";
import { ensureDefaultAdmin } from "./src/utils/adminSeed.js";
import passport from "./src/config/passport.js";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();
};

// Connect to MongoDB and ensure default admin exists
startServer()
  .then(() => {
    // Middleware
    app.use((req, res, next) => {
      if (
        process.env.NODE_ENV === "production" &&
        req.headers["x-forwarded-proto"] !== "https"
      ) {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });

    app.use(cors());
    app.use(express.json());
    app.use(passport.initialize());

    app.get("/", (req, res) => {
      res.send("Backend API is running");
    });

    // Static folder for uploads
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Routes
    app.use("/api/students", studentRoutes);
    app.use("/api/auth", authRoutes);

    app.post("/api/auth/forgot-password", forgotPassword);
    app.post("/api/auth/forgotpassword", forgotPassword);

    app.post("/api/auth/reset-password", resetPassword);
    app.post("/api/auth/resetpassword", resetPassword);

    app.use("/api/admin/certificates", certificateRoutes);
    app.use("/api/certificates", certificateRoutes);

    // Multer error handling
    app.use((error, req, res, next) => {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    });

    // Use dynamic PORT (important)
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
