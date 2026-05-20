import express from "express";
import {
  getCertificates,
  issueCertificate,
  getCertificateById,
  verifyCertificateByHash,
  verifyCertificatePage,
  exportCertificateRecords,
  revokeCertificate,
  updateTransactionHash
} from "../controllers/certificateController.js";
import upload from "../middleware/upload.js";
import { authenticateJWT, authorizeAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateJWT, authorizeAdmin, getCertificates);
router.get("/export", authenticateJWT, authorizeAdmin, exportCertificateRecords);
router.put("/revoke/:id", authenticateJWT, authorizeAdmin, revokeCertificate);
router.put("/:id/txhash", authenticateJWT, authorizeAdmin, updateTransactionHash);
router.post(
  "/",
  authenticateJWT,
  authorizeAdmin,
  upload.fields([
    { name: "certificateFile", maxCount: 1 },
    { name: "studentPhoto", maxCount: 1 },
  ]),
  issueCertificate,
);
router.get("/verify/:hash", verifyCertificatePage);
router.get("/:id", authenticateJWT, authorizeAdmin, getCertificateById);
router.post("/verify-hash", verifyCertificateByHash);

export default router;
