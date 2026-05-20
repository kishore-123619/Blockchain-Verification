import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./src/models/Student.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/blockchain-certificates",
    );
    const students = await Student.find().select(
      "email rollNumber role isVerified name",
    );
    console.log(JSON.stringify(students, null, 2));
  } catch (error) {
    console.error("DB error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
