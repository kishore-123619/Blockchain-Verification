import crypto from "crypto";
import Certificate from "../models/Certificate.js";
import Student from "../models/Student.js";
import VerificationLog from "../models/VerificationLog.js";
import nodemailer from "nodemailer";

const generateHash = (dataString) => {
  return "0x" + crypto.createHash("sha256").update(dataString).digest("hex");
};

export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (error) {
    console.error("Error loading certificates:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to load certificates" });
  }
};

export const issueCertificate = async (req, res) => {
  try {
    const {
      studentName,
      rollNumber,
      department,
      percentage,
      passingYear,
      classDivision,
    } = req.body;

    console.log("[Issue Certificate] Received data:", {
      studentName,
      rollNumber,
      department,
      percentage,
      passingYear,
      classDivision,
    });
    console.log("[Issue Certificate] Files:", req.files);

    // Get files from request (multer stores them as arrays)
    const certificateFileArray = req.files?.certificateFile;
    const studentPhotoArray = req.files?.studentPhoto;

    const certificateFile = certificateFileArray?.[0];
    const studentPhoto = studentPhotoArray?.[0];

    if (
      !studentName ||
      !rollNumber ||
      !department ||
      !percentage ||
      !passingYear ||
      !classDivision
    ) {
      return res
        .status(400)
        .json({ message: "All certificate fields are required" });
    }

    if (!certificateFile) {
      return res
        .status(400)
        .json({ message: "Certificate PDF file is required" });
    }

    if (!studentPhoto) {
      return res.status(400).json({ message: "Student photo is required" });
    }

    // Check if student exists
    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase().trim(),
    });
    if (!student) {
      return res
        .status(400)
        .json({ message: "Student with this roll number does not exist" });
    }

    // Generate certificate hash for blockchain
    const dataString =
      studentName + rollNumber + department + Date.now().toString();
    const hash = generateHash(dataString);
    const transactionHash = "Pending Blockchain Transaction";

    // Create file URLs for public access through /uploads
    const certificateFileUrl = `/uploads/certificates/${certificateFile.filename}`;
    const studentPhotoUrl = `/uploads/photos/${studentPhoto.filename}`;

    const certificate = await Certificate.create({
      studentName,
      rollNumber,
      department,
      percentage,
      passingYear,
      classDivision,
      certificateFileUrl,
      studentPhotoUrl,
      issueDate: new Date(),
      hash,
      transactionHash,
    });

    console.log("✅ Certificate issued successfully:", certificate._id);

    // --- EMAIL NOTIFICATION LOGIC ---
    try {
      const normalizedRollNumber = rollNumber.toUpperCase();
      const student = await Student.findOne({
        $or: [{ rollNumber: normalizedRollNumber }, { rollNumber }],
      });

      if (student && student.email) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
          port: Number(process.env.EMAIL_PORT) || 2525,
          secure:
            process.env.EMAIL_SECURE?.toLowerCase() === "true" ||
            Number(process.env.EMAIL_PORT) === 465,
          auth: {
            user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
          },
        });

        if (
          (process.env.EMAIL_USERNAME || process.env.EMAIL_USER) &&
          (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS)
        ) {
          const protocol = req.headers["x-forwarded-proto"] || req.protocol;
          const hostUrl = protocol + "://" + req.get("host");
          const certLink = certificateFileUrl.startsWith("/")
            ? `${hostUrl}${certificateFileUrl}`
            : certificateFileUrl;

          await transporter.sendMail({
            from:
              process.env.EMAIL_FROM ||
              '"Certificate Portal" <noreply@university.edu>',
            to: student.email,
            subject: "🎓 Your Digital Certificate has been Issued",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #2563eb; margin: 0; font-size: 24px;">Congratulations, ${studentName}!</h2>
                  </div>
                  
                  <p style="font-size: 16px;">Your digital certificate for <strong>${department}</strong> (Class of ${passingYear}) has been officially issued and secured on the blockchain.</p>
                  
                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <h3 style="margin-top: 0; color: #0f172a; font-size: 18px;">Certificate Details</h3>
                    <p style="margin: 8px 0;"><strong>Roll Number:</strong> ${rollNumber}</p>
                    <p style="margin: 8px 0;"><strong>Class/Division:</strong> ${classDivision}</p>
                    <p style="margin: 8px 0;"><strong>Grade/Percentage:</strong> ${percentage}</p>
                  </div>

                  <div style="margin-bottom: 20px;">
                    <strong style="color: #475569; display: block; margin-bottom: 8px;">Unique Blockchain Hash:</strong>
                    <div style="background: #eef2ff; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 13px; color: #4338ca; border: 1px solid #c7d2fe;">
                      ${hash}
                    </div>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${certLink}" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">View & Download Certificate</a>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  
                  <p style="margin-top: 20px; font-size: 12px; color: #64748b; text-align: center;">
                    This is an automated notification. Please do not reply to this email.<br/>
                    Secured by Blockchain Technology
                  </p>
                </div>
              `,
          });
          console.log("✅ Email notification sent to:", student.email);
        } else {
          console.log(
            "⚠️ SMTP credentials not configured. Email notification skipped.",
          );
        }
      }
    } catch (emailError) {
      console.error("❌ Failed to send email notification:", emailError);
      // We don't fail the certificate issuance if the email fails, just log it.
    }
    // --- END EMAIL NOTIFICATION LOGIC ---

    res.status(201).json(certificate);
  } catch (error) {
    console.error("Error issuing certificate:", error);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Certificate hash already exists" });
    }

    res
      .status(500)
      .json({ message: error.message || "Failed to issue certificate" });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json(certificate);
  } catch (error) {
    console.error("Error loading certificate:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to load certificate" });
  }
};

export const verifyCertificateByHash = async (req, res) => {
  try {
    const { hash } = req.body;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown";

    if (!hash) {
      return res.status(400).json({ message: "Certificate hash is required" });
    }

    const certificate = await Certificate.findOne({ hash });

    if (!certificate) {
      await VerificationLog.create({ hash, ipAddress, result: "Not Found" });
      return res.json({ verified: false });
    }

    if (certificate.isRevoked) {
      await VerificationLog.create({
        hash,
        ipAddress,
        result: "Revoked",
        details: { reason: certificate.revocationReason },
      });
      return res.json({
        verified: true,
        revoked: true,
        revocationReason: certificate.revocationReason,
        studentName: certificate.studentName,
        rollNumber: certificate.rollNumber,
        department: certificate.department,
        hash: certificate.hash,
      });
    }

    await VerificationLog.create({ hash, ipAddress, result: "Verified" });

    res.json({
      verified: true,
      revoked: false,
      studentName: certificate.studentName,
      department: certificate.department,
      passingYear: certificate.passingYear,
      issueDate: certificate.issueDate,
      transactionHash: certificate.transactionHash,
      classDivision: certificate.classDivision,
      percentage: certificate.percentage,
      rollNumber: certificate.rollNumber,
      hash: certificate.hash,
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ message: error.message || "Verification failed" });
  }
};

export const revokeCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findByIdAndUpdate(
      id,
      { isRevoked: true, revocationReason: reason || "No reason provided" },
      { new: true },
    );

    if (!certificate)
      return res.status(404).json({ message: "Certificate not found" });

    res.json({ message: "Certificate revoked successfully", certificate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransactionHash = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({ message: "transactionHash is required" });
    }

    const certificate = await Certificate.findByIdAndUpdate(
      id,
      { transactionHash },
      { new: true },
    );

    if (!certificate)
      return res.status(404).json({ message: "Certificate not found" });

    res.json({ message: "Transaction hash updated successfully", certificate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyCertificatePage = async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).send("Certificate hash is required.");
    }

    const certificate = await Certificate.findOne({ hash });

    if (!certificate) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Certificate Not Found</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 2rem; background:#f4f7fb; color:#1f2937; }
              .card { max-width:700px; margin:auto; background:white; padding:2rem; border-radius:1rem; box-shadow:0 20px 45px rgba(15,23,42,0.08); }
              h1 { color:#ef4444; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Certificate not found</h1>
              <p>The scanned QR code does not match any record in our system.</p>
            </div>
          </body>
        </html>
      `);
    }

    const hostUrl = `${req.protocol}://${req.get("host")}`;
    const certificateFileLink = certificate.certificateFileUrl?.startsWith("/")
      ? `${hostUrl}${certificate.certificateFileUrl}`
      : certificate.certificateFileUrl;
    const photoLink = certificate.studentPhotoUrl?.startsWith("/")
      ? `${hostUrl}${certificate.studentPhotoUrl}`
      : certificate.studentPhotoUrl;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Certificate Verification</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #eff6ff; color: #0f172a; }
            .page { max-width: 760px; margin: 2rem auto; padding: 1.5rem; background: #ffffff; border-radius: 1rem; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); }
            .header { display: flex; flex-direction: column; gap: 0.5rem; }
            h1 { margin: 0; font-size: 2rem; color: #2563eb; }
            .badge { display: inline-flex; padding: 0.4rem 0.8rem; border-radius: 9999px; background: #d1fae5; color: #065f46; font-weight: 700; }
            .field { margin-top: 1rem; }
            .field strong { display: block; color: #475569; margin-bottom: 0.25rem; }
            .actions { margin-top: 2rem; display: grid; gap: 0.75rem; }
            .button { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.9rem 1rem; border-radius: 0.9rem; text-decoration: none; color: white; font-weight: 700; }
            .button.primary { background: #2563eb; }
            .button.secondary { background: #0f172a; }
            .image-preview { width: 100%; max-height: 320px; object-fit: cover; border-radius: 1rem; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <span class="badge">Verified Certificate</span>
              <h1>${certificate.studentName}</h1>
              <p>Roll no: ${certificate.rollNumber} | Department: ${certificate.department}</p>
            </div>

            <div class="field"><strong>Year / Class</strong>${certificate.passingYear} / ${certificate.classDivision}</div>
            <div class="field"><strong>CGPA / Percentage</strong>${certificate.percentage}</div>
            <div class="field"><strong>Hash</strong>${certificate.hash}</div>
            <div class="field"><strong>Transaction</strong>${certificate.transactionHash}</div>
            <div class="field"><strong>Issued on</strong>${new Date(certificate.issueDate).toLocaleDateString()}</div>

            ${photoLink ? `<img class="image-preview" src="${photoLink}" alt="Student photo" />` : ""}

            <div class="actions">
              ${certificateFileLink ? `<a class="button primary" href="${certificateFileLink}" target="_blank" rel="noreferrer">Download Certificate PDF</a>` : ""}
              <a class="button secondary" href="${hostUrl}/">Go to Portal</a>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error loading verification page:", error);
    res.status(500).send("Server error loading certificate details.");
  }
};

// ✅ EXPORT CERTIFICATE RECORDS (CSV)
export const exportCertificateRecords = async (req, res) => {
  try {
    const certificates = await Certificate.find();

    // Simple CSV conversion
    const headers = [
      "Student Name",
      "Roll Number",
      "Department",
      "Percentage",
      "Passing Year",
      "Class/Division",
      "Issue Date",
      "Hash",
    ];
    const rows = certificates.map((c) => [
      c.studentName,
      c.rollNumber,
      c.department,
      c.percentage,
      c.passingYear,
      c.classDivision,
      new Date(c.issueDate).toLocaleDateString(),
      c.hash,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=certificates.csv",
    );
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
