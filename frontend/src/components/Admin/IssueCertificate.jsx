import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle, Upload, Camera } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import "./AdminForms.css";

export const IssueCertificate = ({
  setView,
  newCert,
  setNewCert,
  handleIssueCertificate,
  issueSuccess,
  setIssueSuccess,
}) => {
  const [certificateFile, setCertificateFile] = useState(null);
  const [studentPhoto, setStudentPhoto] = useState(null);

  const hostOverride =
    import.meta.env.VITE_QR_HOST || import.meta.env.VITE_HOST_URL;

  const resolveUrl = (url) => {
    try {
      return new URL(url, window.location.origin);
    } catch (error) {
      return null;
    }
  };

  const apiUrl = import.meta.env.VITE_API_BASE_URL || "/api";
  const apiUrlObject = resolveUrl(apiUrl);
  const apiOrigin = apiUrlObject?.origin || window.location.origin;
  const apiPort = apiUrlObject?.port ? `:${apiUrlObject.port}` : "";
  const isLocalApiHost =
    apiOrigin.includes("localhost") || apiOrigin.includes("127.0.0.1");

  const inferredHost =
    isLocalApiHost &&
    window.location.hostname &&
    !window.location.hostname.match(/^(localhost|127\.0\.0\.1)$/)
      ? `${window.location.protocol}//${window.location.hostname}${apiPort}`
      : apiOrigin;

  const serviceHost = hostOverride
    ? hostOverride.replace(/\/$/, "")
    : inferredHost;

  const verificationLink = issueSuccess
    ? `${serviceHost}/api/certificates/verify/${encodeURIComponent(
        issueSuccess.hash,
      )}`
    : "";

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "certificate") {
      // Validate PDF file
      if (file && file.type === "application/pdf") {
        setCertificateFile(file);
      } else {
        alert("Please select a valid PDF file");
        setCertificateFile(null);
      }
    } else if (type === "photo") {
      // Validate image file
      if (file && file.type.startsWith("image/")) {
        setStudentPhoto(file);
      } else {
        alert("Please select a valid image file");
        setStudentPhoto(null);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all required fields
    if (
      !newCert.studentName ||
      !newCert.rollNumber ||
      !newCert.department ||
      !newCert.percentage ||
      !newCert.passingYear ||
      !newCert.classDivision
    ) {
      alert("Please fill in all required certificate fields");
      return;
    }

    if (!certificateFile) {
      alert("Please upload certificate PDF file");
      return;
    }

    if (!studentPhoto) {
      alert("Please upload student photo");
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("studentName", newCert.studentName);
    formData.append("rollNumber", newCert.rollNumber);
    formData.append("department", newCert.department);
    formData.append("percentage", newCert.percentage);
    formData.append("passingYear", newCert.passingYear);
    formData.append("classDivision", newCert.classDivision);
    formData.append("certificateFile", certificateFile);
    formData.append("studentPhoto", studentPhoto);

    handleIssueCertificate(formData);
  };

  return (
    <div className="form-section">
      <div className="form-container">
        <button onClick={() => setView("admin")} className="form-back-btn">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </button>
        <h2 className="form-title">Issue New Certificate</h2>

        <div className="form-card" style={{ backgroundColor: "#9333ea" }}>
          <h3 className="form-card-title">Certificate Details</h3>

          {issueSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="success-card">
                <CheckCircle className="success-icon" />
                <h4 className="success-title">Issuance Successful!</h4>
                <p className="success-text">
                  The certificate has been registered on the blockchain.
                </p>
              </div>
              <div className="space-y-4">
                <div className="hash-wrapper">
                  <p className="hash-label">Certificate Hash (ID):</p>
                  <p className="hash-value">{issueSuccess.hash}</p>
                </div>
                <div className="hash-wrapper">
                  <p className="hash-label">Transaction Hash:</p>
                  <p className="hash-value">{issueSuccess.transactionHash}</p>
                </div>
              </div>
              <div className="qr-wrapper">
                <div className="qr-card">
                  <QRCodeSVG value={verificationLink} size={120} />
                </div>
              </div>
              {verificationLink && (
                <>
                  <p className="qr-info">
                    This QR code links to the live verification page for this
                    certificate.
                  </p>
                  <div className="qr-link-box">
                    <label>Actual verification URL:</label>
                    <p className="qr-link-text">{verificationLink}</p>
                  </div>
                  {verificationLink.includes("localhost") && (
                    <p className="qr-warning-text">
                      The generated QR code currently uses <code>localhost</code>.
                      Mobile devices cannot reach your PC using localhost.
                      Set <code>VITE_QR_HOST</code> in
                      <code>frontend/.env</code> to your machine's LAN IP and
                      restart the frontend.
                    </p>
                  )}
                </>
              )}
              <button
                onClick={() => {
                  setIssueSuccess(null);
                  setNewCert({
                    studentName: "",
                    rollNumber: "",
                    department: "",
                    percentage: "",
                    passingYear: "",
                    classDivision: "",
                  });
                  setCertificateFile(null);
                  setStudentPhoto(null);
                  setView("admin");
                }}
                className="done-btn"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Student Name"
                  required
                  className="form-input"
                  value={newCert.studentName}
                  onChange={(e) =>
                    setNewCert({ ...newCert, studentName: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Student ID / Roll Number"
                  required
                  className="form-input"
                  value={newCert.rollNumber}
                  onChange={(e) =>
                    setNewCert({ ...newCert, rollNumber: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Department"
                  required
                  className="form-input"
                  value={newCert.department}
                  onChange={(e) =>
                    setNewCert({ ...newCert, department: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Percentage / GPA"
                  required
                  className="form-input"
                  value={newCert.percentage}
                  onChange={(e) =>
                    setNewCert({ ...newCert, percentage: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Year of Passing"
                  required
                  className="form-input"
                  value={newCert.passingYear}
                  onChange={(e) =>
                    setNewCert({ ...newCert, passingYear: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Class / Division"
                  required
                  className="form-input"
                  value={newCert.classDivision}
                  onChange={(e) =>
                    setNewCert({ ...newCert, classDivision: e.target.value })
                  }
                />
                <div className="upload-wrapper">
                  <p className="upload-label">
                    Certificate PDF File (REQUIRED)
                  </p>
                  <div className="upload-input-wrapper">
                    <label className="upload-input">
                      <Upload className="w-5 h-5" /> Choose File
                      <input
                        type="file"
                        style={{ display: "none" }}
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, "certificate")}
                      />
                    </label>
                    <span className="upload-text">
                      {certificateFile ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />{" "}
                          {certificateFile.name}
                        </>
                      ) : (
                        "No file chosen"
                      )}
                    </span>
                  </div>
                </div>
                <div className="upload-wrapper">
                  <p className="upload-label">Student Photo (REQUIRED)</p>
                  <div className="upload-input-wrapper">
                    <label className="upload-input">
                      <Camera className="w-5 h-5" /> Choose Photo
                      <input
                        type="file"
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "photo")}
                      />
                    </label>
                    <span className="upload-text">
                      {studentPhoto ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />{" "}
                          {studentPhoto.name}
                        </>
                      ) : (
                        "No photo chosen"
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="form-submit-btn"
                style={{ backgroundColor: "#f43f5e", color: "white" }}
              >
                Issue Certificate & Register Hash
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
