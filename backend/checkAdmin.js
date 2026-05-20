import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./src/models/Student.js";

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/blockchain-certificates",
    );

    const admin = await Student.findOne({ email: "admin@university.edu" });
    if (admin) {
      console.log("Admin found:", {
        email: admin.email,
        role: admin.role,
        name: admin.name,
      });
    } else {
      console.log("Admin not found");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkAdmin();
