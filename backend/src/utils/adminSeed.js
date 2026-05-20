import Student from "../models/Student.js";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase() || "admin@university.edu";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_ROLL = process.env.ADMIN_ROLL || "ADMIN001";

export const ensureDefaultAdmin = async () => {
  const existingAdmin = await Student.findOne({ email: ADMIN_EMAIL, role: "admin" });
  if (existingAdmin) {
    console.log(`Default admin already exists: ${existingAdmin.email}`);
    return existingAdmin;
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

  console.log(`Default admin created: ${admin.email}`);
  return admin;
};
