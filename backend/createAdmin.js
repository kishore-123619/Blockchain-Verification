import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Student from "./src/models/Student.js";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@university.edu";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_ROLL = process.env.ADMIN_ROLL || "ADMIN001";

const createAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/blockchain-certificates",
    );

    const adminExists = await Student.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists", adminExists.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await Student.create({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      name: "Administrator",
      rollNumber: ADMIN_ROLL,
      department: "Administration",
      year: new Date().getFullYear(),
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin created successfully:", admin.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
