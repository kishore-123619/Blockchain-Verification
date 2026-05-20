import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  UserPlus,
  FileCheck,
  Database,
  ShieldCheck,
  TrendingUp,
  PieChart as PieIcon,
  Users,
  Award,
  CheckCircle2,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { adminAPI } from "../../services/api";
import "./AdminPanel.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const AdminPanel = ({ setView, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  const deptData = stats ? {
    labels: stats.deptStats.map(d => d.name),
    datasets: [{
      label: 'Certificates by Department',
      data: stats.deptStats.map(d => d.value),
      backgroundColor: [
        '#f43f5e', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'
      ],
      borderWidth: 1,
    }],
  } : null;

  const yearData = stats ? {
    labels: stats.yearStats.map(y => y.year),
    datasets: [{
      label: 'Certificates Issued by Year',
      data: stats.yearStats.map(y => y.count),
      backgroundColor: '#3b82f6',
      borderRadius: 8,
    }],
  } : null;

  const adminActions = [
    {
      title: "1. Register New Student",
      desc: "Create a secure login account and save the student's personal profile data.",
      icon: UserPlus,
      action: () => setView("register-student"),
      color: "#f43f5e",
    },
    {
      title: "2. Issue Certificate",
      desc: "Upload the PDF, calculate its hash, and register it on the blockchain.",
      icon: FileCheck,
      action: () => setView("issue-certificate"),
      color: "#10b981",
    },
    {
      title: "3. View All Records",
      desc: "Browse and manage all registered student and certificate records.",
      icon: Database,
      action: () => setView("view-records"),
      color: "#3b82f6",
    },
    {
      title: "4. Approve Admins",
      desc: "Review and verify new admin account requests and proofs.",
      icon: ShieldCheck,
      action: () => setView("approve-admins"),
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="admin-section">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <button onClick={() => setView("landing")} className="back-btn">
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <h2 className="admin-title">Certificate Admin Panel</h2>

          <button onClick={onLogout} className="logout-btn-admin">
            Logout
          </button>
        </div>

        {/* Analytics Dashboard */}
        <div className="admin-dashboard-overview">
          <div className="dashboard-stats-grid">
            <div className="stat-pill-card">
              <Users className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Total Students</span>
                <strong className="stat-value">{stats?.totalStudents || 0}</strong>
              </div>
            </div>
            <div className="stat-pill-card">
              <Award className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Issued Certificates</span>
                <strong className="stat-value">{stats?.totalCertificates || 0}</strong>
              </div>
            </div>
            <div className="stat-pill-card">
              <CheckCircle2 className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Verifications</span>
                <strong className="stat-value">{stats?.totalVerifications || 0}</strong>
              </div>
            </div>
            <div className="stat-pill-card warning">
              <ShieldCheck className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Pending Admins</span>
                <strong className="stat-value">{stats?.pendingAdmins || 0}</strong>
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-card">
              <div className="chart-header">
                <TrendingUp className="chart-title-icon" />
                <h4>Issuance Trends</h4>
              </div>
              <div className="chart-body">
                {yearData && <Bar data={yearData} options={{ responsive: true, maintainAspectRatio: false }} />}
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-header">
                <PieIcon className="chart-title-icon" />
                <h4>Department Breakdown</h4>
              </div>
              <div className="chart-body">
                {deptData && <Pie data={deptData} options={{ responsive: true, maintainAspectRatio: false }} />}
              </div>
            </div>
          </div>
        </div>

        <h3 className="admin-subtitle">Admin Actions</h3>

        {/* Cards */}
        <div className="admin-grid">
          {adminActions.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                className="admin-card"
                style={{ backgroundColor: item.color }}
                onClick={item.action}
              >
                <Icon className="admin-card-icon" />

                <h4 className="admin-card-title">{item.title}</h4>

                <p className="admin-card-desc">{item.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Note */}
        <div className="admin-note">
          <h4 className="admin-note-title">Important Note</h4>

          <p className="admin-note-text">
            You must <strong>Register a New Student</strong> before you can
            <strong> Issue a Certificate</strong> for that student.
          </p>
        </div>

        {/* Footer */}
        <div className="admin-footer">
          © 2025 Certificate Chain | Admin Access
        </div>
      </div>
    </div>
  );
};
