import React from "react";
import { ChevronLeft } from "lucide-react";
import "./AdminForms.css";

export const RegisterStudent = ({
  setView,
  newStudent,
  setNewStudent,
  handleRegisterStudent,
}) => {
  // ======================
  // HANDLE INPUT CHANGE
  // ======================

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "rollNumber") {
      processedValue = value.toUpperCase();
    }

    setNewStudent({
      ...newStudent,
      [name]: processedValue,
    });
  };

  // ======================
  // HANDLE SUBMIT
  // ======================

  const handleSubmit = (e) => {
    e.preventDefault();

    // Trim and validate all inputs
    const username = (newStudent.username || "").trim();
    const email = (newStudent.email || "").trim();
    const name = (newStudent.name || "").trim();
    const rollNumber = (newStudent.rollNumber || "").trim();
    const department = (newStudent.department || "").trim();
    const graduationYear = (newStudent.graduationYear || "").toString().trim();
    const password = (newStudent.password || "").trim();

    if (!username || username.length < 3) {
      alert("Username must be at least 3 characters");
      return;
    }

    if (!email) {
      alert("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email");
      return;
    }

    if (!name || name.length < 2) {
      alert("Full name must be at least 2 characters");
      return;
    }

    if (!rollNumber) {
      alert("Roll number is required");
      return;
    }

    if (!department || department.length < 2) {
      alert("Department must be at least 2 characters");
      return;
    }

    if (!graduationYear) {
      alert("Graduation year is required");
      return;
    }

    const year = Number(graduationYear);
    const maxYear = new Date().getFullYear() + 10;

    if (isNaN(year) || year < 2000 || year > maxYear) {
      alert("Enter a valid graduation year (2000-" + maxYear + ")");
      return;
    }

    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    console.log("[RegisterStudent] Form validation passed");

    handleRegisterStudent({
      username,
      email,
      name,
      rollNumber,
      department,
      year,
      password,
    });
  };

  return (
    <div className="form-section">
      <div className="form-container">
        <button onClick={() => setView("admin")} className="form-back-btn">
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h2 className="form-title">New Student Registration</h2>

        <div className="form-card" style={{ backgroundColor: "#f43f5e" }}>
          <h3 className="form-card-title">Student Details</h3>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-grid">
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="form-input"
                value={newStudent.username || ""}
                onChange={handleChange}
                required
                minLength="3"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="form-input"
                value={newStudent.email || ""}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="form-input form-input-full"
                value={newStudent.name || ""}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="rollNumber"
                placeholder="Roll Number"
                className="form-input"
                value={newStudent.rollNumber || ""}
                onChange={handleChange}
                required
                style={{ textTransform: "uppercase" }}
              />

              <input
                type="text"
                name="department"
                placeholder="Department"
                className="form-input"
                value={newStudent.department || ""}
                onChange={handleChange}
                required
              />

              <input
                type="number"
                name="graduationYear"
                placeholder="Graduation Year"
                className="form-input"
                value={newStudent.graduationYear || ""}
                onChange={handleChange}
                min="2000"
                max={new Date().getFullYear() + 10}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Initial Password"
                className="form-input form-input-full"
                value={newStudent.password || ""}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="form-submit-btn"
              style={{
                backgroundColor: "#2563eb",
                color: "white",
              }}
            >
              Register Student Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
