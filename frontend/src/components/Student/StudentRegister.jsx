import React, { useState } from "react";
import {
  Shield,
  ChevronLeft,
  User,
  Lock,
  Mail,
  BookOpen,
  Calendar,
  ArrowRight,
} from "lucide-react";
import "./StudentLogin.css";

export const StudentRegister = ({
  setView,
  handleStudentRegister,
  loading,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    rollNumber: "",
    department: "",
    year: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "rollNumber") {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const year = parseInt(formData.year, 10);

    if (!formData.username || formData.username.length < 3) {
      alert("Username must be at least 3 characters long");
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    if (!formData.name || formData.name.length < 2) {
      alert("Full name must be at least 2 characters long");
      return;
    }

    if (!formData.rollNumber) {
      alert("Roll number is required");
      return;
    }

    if (!formData.department) {
      alert("Department is required");
      return;
    }

    if (!year || year < 2000 || year > new Date().getFullYear() + 10) {
      alert("Please enter a valid graduation year");
      return;
    }

    const registrationData = {
      ...formData,
      year,
    };

    handleStudentRegister(registrationData);
  };

  return (
    <div className="admin-login-section">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <button
            type="button"
            onClick={() => setView("student")}
            className="admin-login-back-btn"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>

          <h2 className="admin-login-title">Student Registration</h2>
          <p className="admin-login-note">
            Create your account to access certificates
          </p>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="admin-login-form"
          >
            {/* Username */}
            <div className="admin-login-input-group">
              <label>Username</label>
              <div className="admin-login-input-wrapper">
                <User className="admin-login-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="admin-login-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength="3"
                  maxLength="50"
                />
              </div>
            </div>

            {/* Email */}
            <div className="admin-login-input-group">
              <label>Email</label>
              <div className="admin-login-input-wrapper">
                <Mail className="admin-login-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  className="admin-login-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="admin-login-input-group">
              <label>Password</label>
              <div className="admin-login-input-wrapper">
                <Lock className="admin-login-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="admin-login-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="admin-login-input-group">
              <label>Full Name</label>
              <div className="admin-login-input-wrapper">
                <User className="admin-login-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="admin-login-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Roll Number */}
            <div className="admin-login-input-group">
              <label>Roll Number</label>
              <div className="admin-login-input-wrapper">
                <BookOpen className="admin-login-icon" />
                <input
                  type="text"
                  name="rollNumber"
                  placeholder="Roll Number"
                  className="admin-login-input"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                  style={{ textTransform: "uppercase" }}
                />
              </div>
            </div>

            {/* Department */}
            <div className="admin-login-input-group">
              <label>Department</label>
              <div className="admin-login-input-wrapper">
                <BookOpen className="admin-login-icon" />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  className="admin-login-input"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Year */}
            <div className="admin-login-input-group">
              <label>Year</label>
              <div className="admin-login-input-wrapper">
                <Calendar className="admin-login-icon" />
                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  className="admin-login-input"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="2000"
                  max={new Date().getFullYear() + 10}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="admin-login-submit-btn"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setView("student")}
              className="admin-login-link"
            >
              Already have an account? Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
