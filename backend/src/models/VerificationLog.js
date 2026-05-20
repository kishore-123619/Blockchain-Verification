import mongoose from "mongoose";

const verificationLogSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    result: {
      type: String, // "Verified", "Not Found", "Revoked"
      required: true,
    },
    details: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.model("VerificationLog", verificationLogSchema);
