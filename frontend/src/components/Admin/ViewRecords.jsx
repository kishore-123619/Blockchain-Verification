import React, { useEffect, useState, useRef, useMemo } from "react";
import { ChevronLeft, User, FileText, AlertCircle, Loader, Search, Filter, Download, X, Upload, FileSpreadsheet, RefreshCw, FileUp, Users, ShieldCheck, Database, UserX } from "lucide-react";
import { adminAPI } from "../../services/api";
import "./ViewRecords.css";

export const ViewRecords = ({
  setView,
  students = [],
  certificates = [],
  loadStudents,
  loadCertificates,
}) => {
  // =========================
  // STATE MANAGEMENT
  // =========================
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasInitializedRef = useRef(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const fileInputRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:5000";

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof loadStudents === "function") {
        await loadStudents();
      }
      if (typeof loadCertificates === "function") {
        await loadCertificates();
      }
    } catch (err) {
      console.error("Error loading records:", err);
      setError("Failed to load records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch once on mount
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      loadData();
    }
  }, []);

  // =========================
  // BULK UPLOAD LOGIC
  // =========================

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert("Please upload a CSV file");
      return;
    }

    setBulkLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await adminAPI.bulkRegisterStudents(formData);
      alert(response.data.message);
      loadStudents(); // Refresh student list
    } catch (err) {
      console.error("Bulk upload error:", err);
      alert(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setBulkLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // =========================
  // EXPORT LOGIC (Backend)
  // =========================

  const handleExportStudents = async () => {
    try {
      const response = await adminAPI.exportStudents();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export students");
    }
  };

  const handleExportCertificates = async () => {
    try {
      const response = await adminAPI.exportCertificates();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificates_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export certificates");
    }
  };

  // =========================
  // FILTERING LOGIC
  // =========================

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        (s.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDept = !deptFilter || s.department === deptFilter;
      const matchesYear = !yearFilter || s.year?.toString() === yearFilter;

      return matchesSearch && matchesDept && matchesYear;
    });
  }, [students, searchTerm, deptFilter, yearFilter]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(c => {
      const matchesSearch = 
        (c.studentName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDept = !deptFilter || c.department === deptFilter;
      const matchesYear = !yearFilter || (c.passingYear?.toString() === yearFilter || c.year?.toString() === yearFilter);

      return matchesSearch && matchesDept && matchesYear;
    });
  }, [certificates, searchTerm, deptFilter, yearFilter]);

  // Derived options for filters
  const departments = useMemo(() => {
    const depts = new Set([...students.map(s => s.department), ...certificates.map(c => c.department)]);
    return Array.from(depts).filter(Boolean).sort();
  }, [students, certificates]);

  const years = useMemo(() => {
    const yrs = new Set([
      ...students.map(s => s.year?.toString()), 
      ...certificates.map(c => c.passingYear?.toString() || c.year?.toString())
    ]);
    return Array.from(yrs).filter(Boolean).sort((a, b) => b - a);
  }, [students, certificates]);

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDeptFilter("");
    setYearFilter("");
  };

  // =========================
  // RENDER LOADING STATE (only if no data)
  // =========================
  if (loading && students.length === 0 && certificates.length === 0) {
    return (
      <div className="records-section">
        <div className="records-container">
          <div className="records-header-row">
            <div className="records-title-box">
              <h2 className="records-title">Loading Records</h2>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", gap: "1rem" }}>
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-gray-600">Synchronizing registry...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="records-section">
      <div className="records-container">
        {/* Back Button */}
        <div className="records-back-row">
          <button onClick={() => setView("admin")} className="records-back-btn">
            <ChevronLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        {/* Modern SaaS Header */}
        <div className="records-header-row">
          <div className="records-title-box">
            <h2 className="records-title">Records Management</h2>
            <p className="records-subtitle">Audit and manage academic identities and anchored blockchain certificates.</p>
          </div>

          <div className="header-actions">
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".csv"
              onChange={handleBulkUpload}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="bulk-upload-btn"
              disabled={bulkLoading}
            >
              <FileUp size={18} />
              {bulkLoading ? "Uploading..." : "Bulk Import"}
            </button>
            <button
              onClick={loadData}
              className="refresh-btn"
              title="Sync Data"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Sync
            </button>
          </div>
        </div>

        {/* Advanced Controls Dashboard */}
        <div className="advanced-controls-card">
          <div className="controls-grid">
            <div className="control-group">
              <label><Search size={14} /> Search Records</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  placeholder="Name, Roll, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="control-group">
              <label><Filter size={14} /> Filter Faculty</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label><Filter size={14} /> Academic Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="clear-filters-btn"
              disabled={!searchTerm && !deptFilter && !yearFilter}
            >
              Reset View
            </button>
          </div>
        </div>

        <div className="records-grid">
          {/* Registered Identities */}
          <div className="records-card">
            <div className="records-card-header">
              <h3 className="records-card-title">
                <Users size={22} color="#6366f1" />
                Network Identities
              </h3>
              <button
                className="export-btn"
                onClick={handleExportStudents}
                disabled={students.length === 0}
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            <div className="records-list">
              {filteredStudents.length === 0 ? (
                <div className="empty-state-records">
                  <UserX size={40} />
                  <p>No identities found matching current filters.</p>
                </div>
              ) : (
                filteredStudents.map((s) => (
                  <div key={s._id} className="records-item">
                    <div className="item-header">
                      <h4 className="item-title">{s.name}</h4>
                      <span className="item-badge student-badge">Identity</span>
                    </div>
                    <div className="item-grid">
                      <div className="info-bit">
                        <span>Roll Number</span>
                        <strong>{s.rollNumber}</strong>
                      </div>
                      <div className="info-bit">
                        <span>Department</span>
                        <strong>{s.department}</strong>
                      </div>
                      <div className="info-bit">
                        <span>Class Year</span>
                        <strong>{s.year}</strong>
                      </div>
                      <div className="registration-bit info-bit">
                        <span>Official Communication</span>
                        <strong>{s.email}</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Anchored Certificates */}
          <div className="records-card">
            <div className="records-card-header">
              <h3 className="records-card-title">
                <ShieldCheck size={22} color="#10b981" />
                Anchored Records
              </h3>
              <button
                className="export-btn"
                style={{ color: "#10b981", background: "#f0fdf4" }}
                onClick={handleExportCertificates}
                disabled={certificates.length === 0}
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            <div className="records-list">
              {filteredCertificates.length === 0 ? (
                <div className="empty-state-records">
                  <Database size={40} />
                  <p>No anchored records found for this selection.</p>
                </div>
              ) : (
                filteredCertificates.map((c) => (
                  <div key={c._id} className="records-item">
                    <div className="item-header">
                      <h4 className="item-title">{c.studentName}</h4>
                      <span className="item-badge cert-badge">Blockchain</span>
                    </div>
                    <div className="item-content-flex">
                      <div className="cert-meta-grid item-grid">
                        <div className="info-bit">
                          <span>Identity ID</span>
                          <strong>{c.rollNumber}</strong>
                        </div>
                        <div className="info-bit">
                          <span>Faculty</span>
                          <strong>{c.department}</strong>
                        </div>
                        <div className="info-bit">
                          <span>Result</span>
                          <strong>{c.percentage}%</strong>
                        </div>
                      </div>
                      <div className="item-hash-block">
                        <span>Immutable Hash (CID)</span>
                        <code>{c.hash}</code>
                      </div>
                      <div className="cert-item-footer">
                        <span className="issue-date">Anchored: {new Date(c.createdAt).toLocaleDateString()}</span>
                        <a
                          href={`${baseUrl}/uploads/certificates/${c.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="view-cert-link"
                        >
                          Verify Source
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
