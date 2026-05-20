import express from "express";
import {
  registerStudent,
  adminSignup,
  loginStudent,
  loginAdmin,
  googleAuthRedirect,
  googleAuthCallback,
  facebookAuthRedirect,
  facebookAuthCallback,
  oauthDebugPage,
  forgotPassword,
  resetPassword,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getPendingAdmins,
  approveAdmin,
  rejectAdmin,
  getAdminStats,
  bulkRegisterStudents,
  exportStudentRecords,
  verifyEmail,
  generate2FA,
  enable2FA,
  disable2FA,
} from "../controllers/studentController.js";
import {
  authenticateJWT,
  authorizeAdmin,
  authorizeStudentOrAdmin,
} from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.post("/login", loginStudent);
router.post("/admin-login", loginAdmin);
router.post("/admin-signup", upload.single("verificationProof"), adminSignup);
router.post("/student-register", registerStudent);
router.get("/verify-email/:token", verifyEmail);
router.get("/auth/google", googleAuthRedirect);
router.get("/auth/google/callback", googleAuthCallback);
router.get("/facebook", facebookAuthRedirect);
router.get("/facebook/callback", facebookAuthCallback);
router.get("/debug", oauthDebugPage);
router.post("/forgotpassword", forgotPassword);
router.post("/forgot-password", forgotPassword);
router.post("/resetpassword", resetPassword);
router.post("/reset-password", resetPassword);

// 2FA routes (Protected)
router.get("/2fa/generate", authenticateJWT, generate2FA);
router.post("/2fa/enable", authenticateJWT, enable2FA);
router.post("/2fa/disable", authenticateJWT, disable2FA);

// Admin-only routes
router.post("/register", authenticateJWT, authorizeAdmin, registerStudent);
router.post("/bulk", authenticateJWT, authorizeAdmin, upload.single("file"), bulkRegisterStudents);
router.get("/export", authenticateJWT, authorizeAdmin, exportStudentRecords);
router.get("/pending-admins", authenticateJWT, authorizeAdmin, getPendingAdmins);
router.get("/stats", authenticateJWT, authorizeAdmin, getAdminStats);
router.put("/approve-admin/:id", authenticateJWT, authorizeAdmin, approveAdmin);
router.delete("/reject-admin/:id", authenticateJWT, authorizeAdmin, rejectAdmin);

// Protected routes
router.get("/", authenticateJWT, authorizeAdmin, getStudents);
router.get("/:id", authenticateJWT, authorizeStudentOrAdmin, getStudentById);
router.put("/:id", authenticateJWT, authorizeStudentOrAdmin, upload.single("studentPhoto"), updateStudent);
router.delete("/:id", authenticateJWT, authorizeAdmin, deleteStudent);

export default router;
