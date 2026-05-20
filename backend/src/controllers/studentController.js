import Student from "../models/Student.js";
import Certificate from "../models/Certificate.js";
import VerificationLog from "../models/VerificationLog.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";
import csv from "csv-parser";
import crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import passport from "../config/passport.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.EMAIL_PORT) || 2525,
  secure: Number(process.env.EMAIL_PORT) === 465, // Use SSL only for port 465
  auth: {
    user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ✅ REGISTER STUDENT
export const registerStudent = async (req, res) => {
  try {
    const { username, email, name, rollNumber, department, year, password } =
      req.body;

    console.log(
      `[Registration Attempt] User: ${username}, Email: ${email}, Roll: ${rollNumber}`,
    );

    if (
      !username ||
      !email ||
      !name ||
      !rollNumber ||
      !department ||
      !year ||
      !password
    ) {
      console.log("[Registration] Missing fields:", {
        username: !!username,
        email: !!email,
        name: !!name,
        roll: !!rollNumber,
        dept: !!department,
        year: !!year,
        pass: !!password,
      });
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRollNumber = rollNumber.toUpperCase().trim();

    const existingEmail = await Student.findOne({ email: normalizedEmail });
    if (existingEmail) {
      console.log(
        `[Registration] Email already registered: ${normalizedEmail}`,
      );
      return res.status(400).json({ message: "Email is already registered" });
    }

    const existingRoll = await Student.findOne({
      rollNumber: normalizedRollNumber,
    });
    if (existingRoll) {
      console.log(
        `[Registration] Roll number already registered: ${normalizedRollNumber}`,
      );
      return res
        .status(400)
        .json({ message: "Roll number is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    const student = await Student.create({
      username,
      email: normalizedEmail,
      name,
      rollNumber: normalizedRollNumber,
      department,
      year: Number(year),
      password: hashedPassword,
      role: "student",
      emailVerificationToken,
    });

    console.log(
      `[Registration] Successfully created student: ${normalizedEmail}`,
    );

    // Send Verification Email with credentials
    try {
      const verificationLink = `${FRONTEND_URL}/verify-email/${emailVerificationToken}`;

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
        port: Number(process.env.EMAIL_PORT) || 2525,
        secure: Number(process.env.EMAIL_PORT) === 465, // Use SSL only for port 465
        auth: {
          user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
        },
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          '"Certificate Portal" <noreply@university.edu>',
        to: normalizedEmail,
        subject: "Welcome! Your Account Details & Email Verification",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563eb;">Welcome to the Certificate Portal, ${name}!</h2>
            <p>Your student account has been successfully created. Here are your login details:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email ID:</strong> ${normalizedEmail}</p>
              <p style="margin: 5px 0;"><strong>Initial Password:</strong> ${password}</p>
            </div>
            <p><strong>Step 1:</strong> Please verify your email by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="font-size: 0.9em; color: #666;">If the button doesn't work, copy and paste this link into your browser: <br>${verificationLink}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #999;">Please do not share your password with anyone. We recommend changing it after your first login.</p>
          </div>
        `,
      });
      console.log(
        `[Registration] Verification email sent to: ${normalizedEmail}`,
      );
    } catch (emailError) {
      console.error("[Registration] Email Sending Failed:", emailError.message);
      // We don't fail the registration if only the email fails
    }

    const token = jwt.sign(
      { id: student._id, email: student.email, role: student.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Student registered. Please verify your email.",
      token,
      user: {
        id: student._id,
        username: student.username,
        email: student.email,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        year: student.year,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("[Backend Registration Error]:", error);

    // Handle MongoDB Duplicate Key Error (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "Field";
      const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
      return res.status(400).json({
        message: `${formattedField} is already registered. Please use a different one.`,
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN STUDENT (with 2FA)
export const loginStudent = async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const student = await Student.findOne({ email: normalizedEmail });

    if (!student) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (student.isTwoFactorEnabled) {
      if (!twoFactorToken) {
        return res.status(200).json({ twoFactorRequired: true });
      }
      const verified = speakeasy.totp.verify({
        secret: student.twoFactorSecret,
        encoding: "base32",
        token: twoFactorToken,
      });
      if (!verified)
        return res.status(400).json({ message: "Invalid 2FA token" });
    }

    const token = jwt.sign(
      { id: student._id, email: student.email, role: student.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: student._id,
        username: student.username,
        email: student.email,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        year: student.year,
        role: student.role,
        isTwoFactorEnabled: student.isTwoFactorEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN SIGNUP
export const adminSignup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const existingAdmin = await Student.findOne({
      email: normalizedEmail,
      role: "admin",
    });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationProofPath = req.file
      ? req.file.path.replace(/\\/g, "/")
      : undefined;

    const admin = await Student.create({
      username: email.split("@")[0],
      email: normalizedEmail,
      name,
      rollNumber: `ADMIN-${Date.now()}`,
      department: "Administration",
      year: new Date().getFullYear(),
      password: hashedPassword,
      role: "admin",
      isVerified: false,
      verificationProof: verificationProofPath,
    });

    res
      .status(201)
      .json({ message: "Admin account created. Pending approval." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN ADMIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Student.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    });

    if (!admin) return res.status(400).json({ message: "Admin not found" });
    if (!admin.isVerified)
      return res.status(403).json({ message: "Account pending approval." });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET STUDENTS
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ role: "student" }).select(
      "-password",
    );
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET STUDENT BY ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    const certificates = await Certificate.find({
      rollNumber: student.rollNumber,
    });
    res.json({ ...student._doc, id: student._id, certificates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE STUDENT
export const updateStudent = async (req, res) => {
  try {
    const { name, email, department, year, password } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (name) student.name = name;
    if (department) student.department = department;
    if (year) student.year = year;
    if (email) student.email = email.toLowerCase();
    if (password) student.password = await bcrypt.hash(password, 10);

    if (req.file) {
      student.profilePhoto =
        req.file.path.replace(/\\/g, "/").split("backend/")[1] ||
        req.file.path.replace(/\\/g, "/");
      // If the above split doesn't work as expected, we might need a better way to get the relative path from 'uploads/'
      // Actually, server.js serves 'uploads' as static from __dirname/uploads
      // So we want the path relative to 'uploads' parent, or just the 'uploads/...' part.

      const relativePath = req.file.path.replace(/\\/g, "/");
      const uploadsIndex = relativePath.indexOf("uploads/");
      if (uploadsIndex !== -1) {
        student.profilePhoto = relativePath.substring(uploadsIndex);
      }
    }

    await student.save();
    res.json({ message: "Profile updated successfully", user: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE STUDENT
export const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ PENDING ADMINS
export const getPendingAdmins = async (req, res) => {
  try {
    const pending = await Student.find({
      role: "admin",
      isVerified: false,
    }).select("-password");
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ APPROVE ADMIN
export const approveAdmin = async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isVerified: true });
    res.json({ message: "Admin approved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ REJECT ADMIN
export const rejectAdmin = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin application rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN STATS
export const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ role: "student" });
    const totalCertificates = await Certificate.countDocuments();
    const pendingAdmins = await Student.countDocuments({
      role: "admin",
      isVerified: false,
    });
    const totalVerifications = await VerificationLog.countDocuments();

    // Department breakdown
    let deptStats = [];
    try {
      deptStats = await Certificate.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
    } catch (err) {
      console.log("Certificate collection not found for dept stats");
    }

    // Year-wise trend
    let yearStats = [];
    try {
      yearStats = await Certificate.aggregate([
        { $group: { _id: "$passingYear", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
    } catch (err) {
      console.log("Certificate collection not found for year stats");
    }

    res.json({
      totalStudents,
      totalCertificates,
      pendingAdmins,
      totalVerifications,
      deptStats: deptStats.map((d) => ({ name: d._id, value: d.count })),
      yearStats: yearStats.map((y) => ({ year: y._id, count: y.count })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ FORGOT PASSWORD (OTP)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    student.resetPasswordToken = otp;
    student.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await student.save();

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        '"Certificate Portal" <noreply@university.edu>',
      to: student.email,
      subject: "Reset Password OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const student = await Student.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!student)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    student.password = await bcrypt.hash(newPassword, 10);
    student.resetPasswordToken = undefined;
    student.resetPasswordExpire = undefined;
    await student.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ BULK REGISTER STUDENTS
export const bulkRegisterStudents = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Please upload a CSV file" });
    const students = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => students.push(data))
      .on("end", async () => {
        for (const s of students) {
          const hashedPassword = await bcrypt.hash(s.password, 10);
          await Student.create({
            ...s,
            password: hashedPassword,
            role: "student",
          });
        }
        fs.unlinkSync(req.file.path);
        res.json({ message: "Bulk registration complete" });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ EXPORT STUDENT RECORDS
export const exportStudentRecords = async (req, res) => {
  try {
    const students = await Student.find({ role: "student" }).select(
      "-password",
    );
    const csvContent =
      "Name,Email,Roll Number,Department,Year\n" +
      students
        .map(
          (s) =>
            `${s.name},${s.email},${s.rollNumber},${s.department},${s.year}`,
        )
        .join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=students.csv");
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const student = await Student.findOne({
      emailVerificationToken: req.params.token,
    });
    if (!student) return res.status(400).json({ message: "Invalid token" });
    student.isEmailVerified = true;
    student.emailVerificationToken = undefined;
    await student.save();
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 2FA GENERATE
export const generate2FA = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    const secret = speakeasy.generateSecret({
      name: `CertificatePortal:${student.email}`,
    });
    student.twoFactorSecret = secret.base32;
    await student.save();
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ secret: secret.base32, qrCode: qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 2FA ENABLE
export const enable2FA = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    const verified = speakeasy.totp.verify({
      secret: student.twoFactorSecret,
      encoding: "base32",
      token: req.body.token,
    });
    if (!verified) return res.status(400).json({ message: "Invalid token" });
    student.isTwoFactorEnabled = true;
    await student.save();
    res.json({ message: "2FA enabled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 2FA DISABLE
export const disable2FA = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    student.isTwoFactorEnabled = false;
    student.twoFactorSecret = undefined;
    await student.save();
    res.json({ message: "2FA disabled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ OAUTH (Build User) - Helper for OAuth controllers
export const buildOAuthUser = async ({ email, name }) => {
  // This is typically called by the OAuth callback controllers
  // For simplicity, let's keep it minimal
  return null;
};

// Google OAuth controllers
export const googleAuthRedirect = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${FRONTEND_URL}/portal?error=google-auth-failed`);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    res.redirect(`${FRONTEND_URL}/?token=${token}`);
  })(req, res, next);
};
export const facebookAuthRedirect = (req, res) =>
  res.status(501).send("Not Implemented");
export const facebookAuthCallback = (req, res) =>
  res.status(501).send("Not Implemented");
export const oauthDebugPage = (req, res) =>
  res.status(501).send("Not Implemented");
