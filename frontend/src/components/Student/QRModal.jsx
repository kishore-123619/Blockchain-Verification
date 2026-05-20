import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, CheckCircle, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { certificateAPI } from "../../services/api";
import "./QRModal.css";

export const QRModal = ({ qrModalHash, setQrModalHash }) => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const hostOverride =
    import.meta.env.VITE_QR_HOST || import.meta.env.VITE_HOST_URL;

  const resolveHost = (url) => {
    try {
      const resolved = new URL(url, window.location.origin);
      return resolved.origin;
    } catch (error) {
      return null;
    }
  };

  const apiHost =
    resolveHost(import.meta.env.VITE_API_BASE_URL || "/api") ||
    "http://localhost:5000";

  const serviceHost = hostOverride ? hostOverride.replace(/\/$/, "") : apiHost;

  const verificationLink = qrModalHash
    ? `${serviceHost}/api/certificates/verify/${encodeURIComponent(
        qrModalHash,
      )}`
    : "";

  const isLocalHostLink =
    serviceHost.includes("localhost") || serviceHost.includes("127.0.0.1");

  const handleOpenVerificationLink = () => {
    if (verificationLink) {
      window.open(verificationLink, "_blank");
    }
  };

  const handleCopyVerificationLink = async () => {
    if (!verificationLink) return;
    try {
      await navigator.clipboard.writeText(verificationLink);
      alert("Verification link copied to clipboard.");
    } catch (error) {
      console.error(error);
      alert("Unable to copy link. Please copy it manually.");
    }
  };

  const closeModal = () => {
    setQrModalHash(null);
    setVerificationResult(null);
    setVerifyError("");
  };

  React.useEffect(() => {
    setVerificationResult(null);
    setVerifyError("");
  }, [qrModalHash]);

  const handleVerify = async () => {
    if (!qrModalHash) {
      return;
    }

    setVerifying(true);
    setVerifyError("");

    try {
      const response = await certificateAPI.verifyHash(qrModalHash);
      setVerificationResult(response.data);
    } catch (error) {
      setVerificationResult({ verified: false });
      setVerifyError(error.response?.data?.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {qrModalHash && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className="modal-card"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button className="modal-close-btn" onClick={closeModal}>
              <X className="w-6 h-6" />
            </button>

            {/* QR Code */}
            <div className="qr-wrapper-modal">
              <div className="qr-card">
                <QRCodeSVG value={verificationLink} size={200} />
              </div>
            </div>

            {/* Title */}
            <h3 className="modal-title">Certificate QR Code</h3>

            {/* Description */}
            <p className="modal-desc">
              Scan this QR code with any mobile device to open the verification
              page and see the certificate details immediately.
            </p>
            {verificationLink && (
              <>
                <p className="modal-desc">
                  Or open directly:{" "}
                  <a href={verificationLink} target="_blank" rel="noreferrer">
                    Open verification page
                  </a>
                </p>
                <p className="modal-desc">
                  Generated QR URL: <code>{verificationLink}</code>
                </p>
              </>
            )}

            {isLocalHostLink && !hostOverride && (
              <div className="modal-warning">
                <strong>Warning:</strong> your current QR link uses
                <code>localhost</code>. Mobile devices cannot reach the backend
                through <code>localhost</code>. Set
                <code>VITE_QR_HOST</code> to your machine's LAN IP in
                <code>frontend/.env</code> and rebuild.
              </div>
            )}

            {verificationResult && (
              <div
                className={`verification-result-card ${
                  verificationResult.verified ? "verified" : "failed"
                }`}
              >
                {verificationResult.verified ? (
                  <>
                    <CheckCircle className="verification-icon" />
                    <p className="verification-text">Certificate verified.</p>
                    <p className="verification-subtext">
                      {verificationResult.studentName} |{" "}
                      {verificationResult.department}
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="verification-icon" />
                    <p className="verification-text">Verification failed.</p>
                    <p className="verification-subtext">
                      {verifyError || "The provided hash could not be found."}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="modal-grid">
              <button
                type="button"
                className="modal-download-btn"
                onClick={handleCopyVerificationLink}
              >
                <Download className="w-5 h-5" />
                Copy Link
              </button>

              <button
                type="button"
                className="modal-share-btn"
                onClick={handleOpenVerificationLink}
              >
                <Share2 className="w-5 h-5" />
                Open Page
              </button>

              <button
                type="button"
                className="modal-verify-btn"
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
