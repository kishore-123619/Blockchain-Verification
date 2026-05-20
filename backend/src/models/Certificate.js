import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    percentage: {
      type: String,
      required: true,
    },
    passingYear: {
      type: String,
      required: true,
    },
    classDivision: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },
    certificateFileUrl: {
      type: String,
    },
    studentPhotoUrl: {
      type: String,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revocationReason: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Certificate", certificateSchema);
