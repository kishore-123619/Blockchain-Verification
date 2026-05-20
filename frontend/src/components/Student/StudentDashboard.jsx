import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  QrCode,
  ShieldCheck,
  Download,
  ImageIcon,
  Edit,
  Loader,
  Lock,
  ShieldAlert,
  ShieldCheck as ShieldIcon,
  X,
  User,
  Shield,
  Award,
  Camera,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { studentAPI } from "../../services/api";
import "./StudentDashboard.css";

export const StudentDashboard = ({
  currentUser = {},
  studentCertificates = [],
  setQrModalHash,
  onUpdateProfile,
  setView,
}) => {
  const [activeTab, setActiveTab] = useState("records"); // 'records', 'profile', 'security'
  const [twoFactorData, setTwoFactorData] = useState({ secret: "", qrCode: "" });
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(null);
  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
    department: currentUser.department || "",
    year: currentUser.year || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);

  const certRefs = useRef({});

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") ||
    "http://localhost:5000";

  const setup2FA = async () => {
    setIs2FALoading(true);
    try {
      const response = await studentAPI.generate2FA();
      setTwoFactorData(response.data);
    } catch (err) {
      alert("Failed to initialize 2FA");
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      await studentAPI.enable2FA(twoFactorToken);
      alert("2FA enabled successfully");
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.message || "Invalid 2FA token");
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA?")) return;
    try {
      await studentAPI.disable2FA();
      alert("2FA disabled successfully");
      window.location.reload();
    } catch (err) {
      alert("Failed to disable 2FA");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateStatus("loading");

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("department", formData.department);
    submitData.append("year", formData.year);
    if (selectedFile) {
      submitData.append("studentPhoto", selectedFile);
    }

    const success = await onUpdateProfile(currentUser.id || currentUser._id, submitData);
    if (success) {
      setUpdateStatus("success");
      setTimeout(() => setUpdateStatus(null), 3000);
    } else {
      setUpdateStatus("error");
    }
  };

  const buildFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const normalizedPath = path.replace(/^\/+/, "");
    if (normalizedPath.startsWith("uploads/")) {
      return `${baseUrl}/${normalizedPath}`;
    }

    if (
      normalizedPath.startsWith("certificates/") ||
      normalizedPath.startsWith("photos/")
    ) {
      return `${baseUrl}/uploads/${normalizedPath}`;
    }

    return `${baseUrl}/${normalizedPath}`;
  };

  const handleGeneratePDF = async (certId, filename) => {
    const element = certRefs.current[certId];
    if (!element) return;

    setGeneratingPDF(certId);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${filename || "certificate"}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Falling back to direct download.");
    } finally {
      setGeneratingPDF(null);
    }
  };

  const studentInitials = (currentUser?.name || "Student")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const primaryPhotoPath =
    currentUser?.profilePhoto ||
    currentUser?.photoUrl ||
    currentUser?.photo ||
    currentUser?.profilePhotoUrl ||
    studentCertificates.find(
      (cert) => cert.studentPhotoUrl || cert.studentPhoto,
    )?.studentPhotoUrl ||
    studentCertificates.find(
      (cert) => cert.studentPhotoUrl || cert.studentPhoto,
    )?.studentPhoto ||
    null;

  const primaryPhotoUrl = buildFileUrl(primaryPhotoPath);

  return (
    <div className="student-section">
      <div className="student-container">
        {/* Back Button */}
        <div className="student-back-nav">
          <button onClick={() => setView("landing")} className="student-back-btn">
            <ChevronLeft size={18} />
            Back to Home
          </button>
        </div>

        {/* SaaS Style Header */}
        <div className="student-header">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="student-welcome">Identity Dashboard</p>
            <h1 className="student-title">Academic Hub</h1>
            <p className="student-subtitle">
              Securely manage your verified credentials and maintain your digital academic profile.
            </p>
          </motion.div>
        </div>

        {/* Profile/Identity Overview Card */}
        <motion.div 
          className="student-profile-card mini"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="profile-card-avatar-block">
            {primaryPhotoUrl ? (
              <img
                src={primaryPhotoUrl}
                alt={currentUser?.name || "Student"}
                className="profile-card-photo"
              />
            ) : (
              <div className="profile-card-avatar">{studentInitials}</div>
            )}
          </div>

          <div className="profile-card-main">
            <h2 className="profile-card-title">
              {currentUser?.name || "Student"}
            </h2>
            <p className="profile-card-role">
              {currentUser?.department || "N/A"} • {currentUser?.rollNumber || "No Roll ID"}
            </p>
          </div>

          <div className="profile-card-summary">
            <span>Verified Records</span>
            <strong>{studentCertificates.length}</strong>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            <Award size={18} />
            My Certificates
          </button>
          <button 
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} />
            Profile Settings
          </button>
          <button 
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield size={18} />
            Security
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "records" && (
            <motion.div
              key="records"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <div className="student-grid">
                {studentCertificates.length > 0 ? (
                  studentCertificates.map((cert, index) => {
                    const uniqueId = cert._id || cert.id || `index-${index}`;
                    const issuedOn = cert.issueDate
                      ? new Date(cert.issueDate).toLocaleDateString()
                      : cert.issuedDate
                        ? new Date(cert.issuedDate).toLocaleDateString()
                        : "N/A";

                    return (
                      <motion.div
                        key={uniqueId}
                        ref={(el) => (certRefs.current[uniqueId] = el)}
                        className="cert-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="cert-header">
                          <div className="cert-badge">Blockchain Verified</div>
                          <h3 className="cert-title">{cert.studentName || "Academic Certificate"}</h3>
                          <p className="cert-subtitle">Anchored on {issuedOn}</p>
                        </div>

                        <div className="cert-body">
                          <div className="cert-grid">
                            <div>
                              <p className="cert-label">Faculty Dept</p>
                              <p className="cert-value">{cert.department || "N/A"}</p>
                            </div>
                            <div>
                              <p className="cert-label">Result / GPA</p>
                              <p className="cert-value">{cert.percentage || cert.cgpa || "N/A"}%</p>
                            </div>
                          </div>

                          <div>
                            <p className="cert-label">Immutable Hash (CID)</p>
                            <div className="cert-hash-wrapper">
                              {cert.hash?.substring(0, 32)}...
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                            <ShieldCheck size={16} />
                            CRYPTOGRAPHIC RECORD SECURED
                          </div>
                        </div>

                        <div className="cert-footer">
                          <button
                            className="pdf-btn"
                            disabled={generatingPDF === uniqueId}
                            onClick={() => handleGeneratePDF(uniqueId, cert.studentName)}
                          >
                            {generatingPDF === uniqueId ? "..." : <Download size={18} />}
                            <span>{generatingPDF === uniqueId ? "Generating" : "Download"}</span>
                          </button>

                          {cert.studentPhotoUrl || cert.studentPhoto ? (
                            <button
                              className="photo-btn"
                              onClick={() => {
                                const photoUrl = buildFileUrl(cert.studentPhotoUrl || cert.studentPhoto);
                                if (photoUrl) window.open(photoUrl, "_blank");
                              }}
                            >
                              <ImageIcon size={18} />
                              <span>Photo</span>
                            </button>
                          ) : null}

                          <button
                            className="qr-btn"
                            onClick={() => setQrModalHash(cert.hash)}
                          >
                            <QrCode size={18} />
                            <span>QR Code</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <FileText size={48} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '0.5rem' }}>Vault Empty</h3>
                    <p>No anchored records detected. New certificates will appear here once registered on the blockchain.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <div className="settings-card">
                <div className="settings-header">
                  <h2 className="settings-title">Profile Information</h2>
                  <p className="settings-subtitle">Update your personal details and academic identity.</p>
                </div>

                <form onSubmit={handleSubmit} className="settings-form">
                  <div className="photo-upload-section">
                    <div className="photo-preview-wrapper">
                      {previewUrl || primaryPhotoUrl ? (
                        <img src={previewUrl || primaryPhotoUrl} alt="Preview" className="photo-preview" />
                      ) : (
                        <div className="photo-preview-placeholder">{studentInitials}</div>
                      )}
                      <label htmlFor="photo-upload" className="photo-upload-label">
                        <Camera size={16} />
                        <input 
                          type="file" 
                          id="photo-upload" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                    <div className="photo-info">
                      <h3>Profile Photo</h3>
                      <p>JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Business Administration">Business Administration</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Graduation Year</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        placeholder="e.g. 2024"
                        required
                      />
                    </div>
                  </div>

                  <div className="settings-actions">
                    <button 
                      type="submit" 
                      className={`save-settings-btn ${updateStatus === 'success' ? 'success' : ''}`}
                      disabled={updateStatus === 'loading'}
                    >
                      {updateStatus === 'loading' ? (
                        <Loader size={18} className="animate-spin" />
                      ) : updateStatus === 'success' ? (
                        <CheckCircle size={18} />
                      ) : (
                        "Save Changes"
                      )}
                      {updateStatus === 'success' ? " Updated" : ""}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="tab-content"
            >
              <div className="settings-card">
                <div className="settings-header">
                  <h2 className="settings-title">Security Settings</h2>
                  <p className="settings-subtitle">Enhance your account security with two-factor authentication.</p>
                </div>

                <div className="security-section">
                  <div className="security-item">
                    <div className="security-info">
                      <div className="security-icon-wrapper">
                        <Lock size={24} />
                      </div>
                      <div>
                        <h3>Two-Factor Authentication (2FA)</h3>
                        <p>Adds an extra layer of security to your account.</p>
                      </div>
                    </div>
                    
                    {currentUser?.isTwoFactorEnabled ? (
                      <button className="disable-2fa-btn" onClick={handleDisable2FA}>
                        Disable 2FA
                      </button>
                    ) : (
                      !twoFactorData.qrCode && (
                        <button className="enable-2fa-btn" onClick={setup2FA} disabled={is2FALoading}>
                          {is2FALoading ? <Loader size={18} className="animate-spin" /> : "Configure 2FA"}
                        </button>
                      )
                    )}
                  </div>

                  {twoFactorData.qrCode && !currentUser?.isTwoFactorEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="tfa-setup-inline"
                    >
                      <div className="tfa-qr-block">
                        <img src={twoFactorData.qrCode} alt="2FA QR" />
                        <div className="tfa-instructions">
                          <p>1. Scan this QR code with your Google Authenticator or Authy app.</p>
                          <p>2. Enter the 6-digit code from the app below.</p>
                        </div>
                      </div>

                      <div className="tfa-verify-block">
                        <div className="form-group">
                          <label>Enter 6-digit Code</label>
                          <input
                            type="text"
                            maxLength="6"
                            placeholder="000000"
                            value={twoFactorToken}
                            onChange={(e) => setTwoFactorToken(e.target.value)}
                          />
                        </div>
                        <button 
                          className="verify-2fa-btn"
                          onClick={handleEnable2FA}
                          disabled={twoFactorToken.length !== 6}
                        >
                          Verify & Enable
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
