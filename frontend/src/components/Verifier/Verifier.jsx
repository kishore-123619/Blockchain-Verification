import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Loader,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  FileText,
  Clock,
  User,
  Hash,
  Award,
  AlertTriangle
} from "lucide-react";
import { certificateAPI } from "../../services/api";
import { verifyCertificateOnBlockchain } from "../../services/contract";
import "./Verifier.css";

export const Verifier = ({ setView }) => {
  const [hashes, setHashes] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleVerify = async () => {
    if (!hashes.trim()) return;

    setLoading(true);
    const hashArray = hashes.split(/[\n,]+/).map(h => h.trim()).filter(Boolean);
    const newResults = [];

    for (const hash of hashArray) {
      try {
        const response = await certificateAPI.verifyHash(hash);
        let result = { ...response.data, hash };
        
        // Blockchain verification step
        if (result.verified) {
            try {
                const isValidOnBlockchain = await verifyCertificateOnBlockchain(hash);
                if (!isValidOnBlockchain) {
                    result.verified = false;
                    result.errorMsg = "Failed Blockchain Validation (Tampered)";
                } else {
                    result.blockchainVerified = true;
                }
            } catch (bcError) {
                console.error("Blockchain verification error", bcError);
                // Optionally mark as unverified if the network is down, or just show a warning
                result.blockchainWarning = "Could not reach blockchain network";
            }
        }
        
        newResults.push(result);
      } catch (err) {
        newResults.push({ verified: false, hash, errorMsg: "Not found in database" });
      }
    }

    setResults(newResults);
    setLoading(false);
    setExpandedIndex(newResults.length > 0 ? 0 : null);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="verifier-section">
      <div className="verifier-top-nav">
        <button onClick={() => setView("landing")} className="verifier-back-btn">
          <ChevronLeft size={18} />
          Back to Dashboard
        </button>
      </div>
      {/* SaaS Style Hero */}
      <div className="verifier-hero">
        <motion.div 
          className="verifier-hero-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="verifier-badge">
            <ShieldCheck size={14} />
            <span>Public Trust Protocol</span>
          </div>
          <h2 className="verifier-title">
            Verify <span className="text-gradient">Authenticity</span>
          </h2>
          <p className="verifier-subtitle">
            Instantly validate academic credentials through our secure blockchain 
            network. Enter cryptographic hashes to begin auditing.
          </p>
        </motion.div>
      </div>

      <div className="verifier-container">
        {/* Input Card */}
        <motion.div 
          className="verifier-input-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="input-group-header">
            <h3 className="input-title">
              <Search size={20} />
              Credential Hashes
            </h3>
            {results.length > 0 && (
              <span className="input-count">{results.length} Records Audited</span>
            )}
          </div>

          <div className="batch-input-wrapper">
            <div className="textarea-container">
              <textarea
                className="verifier-textarea"
                placeholder="Paste certificate hashes here (one per line or comma separated)..."
                value={hashes}
                onChange={(e) => setHashes(e.target.value)}
              />
            </div>

            <div className="action-row">
              <p className="helper-text">
                Our network provides immutable proof of issuance. Each hash represents 
                 a unique academic record anchored to the decentralized ledger.
              </p>
              <button
                onClick={handleVerify}
                className="verify-btn"
                disabled={loading || !hashes.trim()}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Verify Credentials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h3>Verification Results</h3>
              <button className="clear-btn" onClick={() => setResults([])}>
                Reset Session
              </button>
            </div>

            <div className="results-list">
              <AnimatePresence mode="popLayout">
                {results.map((res, index) => (
                  <motion.div
                    key={`${res.hash}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`result-item-card ${res.verified ? (res.revoked ? "revoked" : "valid") : "invalid"}`}
                  >
                    <div
                      className="result-item-main"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className={`icon-circle ${res.verified ? (res.revoked ? "revoked" : "valid") : "invalid"}`}>
                        {res.verified ? (res.revoked ? <ShieldAlert size={24} /> : <CheckCircle size={24} />) : <XCircle size={24} />}
                      </div>
                      
                      <div className="result-summary">
                        <div>
                          <h4 className="result-status-text">
                            {res.verified 
                                ? (res.revoked ? "Credential Revoked" : "Authenticated & Blockchain Verified") 
                                : (res.errorMsg || "Record Not Found")}
                          </h4>
                          <span className="hash-text">{res.hash.substring(0, 32)}...</span>
                          {res.blockchainWarning && <div style={{color: 'orange', fontSize: '0.8rem'}}>{res.blockchainWarning}</div>}
                        </div>
                        
                        <div className="result-actions">
                          {res.verified && (
                            <div className="mini-details">
                              <span className="mini-label">Identity ID</span>
                              <span className="mini-value">{res.rollNumber || res.certificate?.rollNumber}</span>
                            </div>
                          )}
                          <div className="expand-trigger">
                            {expandedIndex === index ? <ChevronUp /> : <ChevronDown />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedIndex === index && res.verified && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="result-expanded-content"
                        >
                          <div className="details-grid">
                            <div className="detail-box">
                              <div className="detail-info">
                                <label>Subject Name</label>
                                <p>{res.studentName || res.certificate?.studentName}</p>
                              </div>
                            </div>
                            <div className="detail-box">
                              <div className="detail-info">
                                <label>Faculty / Dept</label>
                                <p>{res.department || res.certificate?.department}</p>
                              </div>
                            </div>
                            <div className="detail-box">
                              <div className="detail-info">
                                <label>Academic Result</label>
                                <p>{res.percentage || res.certificate?.percentage}% Aggregate</p>
                              </div>
                            </div>
                            <div className="detail-box">
                              <div className="detail-info">
                                <label>Anchored On</label>
                                <p>{res.createdAt || res.certificate?.createdAt ? new Date(res.createdAt || res.certificate?.createdAt).toLocaleDateString() : "Timestamped"}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="empty-results">
            <div className="empty-icon-stack" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Search size={40} color="#e2e8f0" />
            </div>
            <p>Waiting for certificate hashes to verify...</p>
          </div>
        )}
      </div>
    </div>
  );
};
