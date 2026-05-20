import React, { useState, useEffect, useCallback } from "react";

import { Navbar } from "./components/Navbar";
import { Landing } from "./components/Landing";
import { Portal } from "./components/Portal";

import { AdminPanel } from "./components/Admin/AdminPanel";
import { AdminLogin } from "./components/Admin/AdminLogin";
import { AdminRegister } from "./components/Admin/AdminRegister";
import { RegisterStudent } from "./components/Admin/RegisterStudent";
import { IssueCertificate } from "./components/Admin/IssueCertificate";
import { ViewRecords } from "./components/Admin/ViewRecords";
import { ApproveAdmins } from "./components/Admin/ApproveAdmins";

import { Verifier } from "./components/Verifier/Verifier";

import { StudentLogin } from "./components/Student/StudentLogin";
import { StudentRegister } from "./components/Student/StudentRegister";
import { StudentDashboard } from "./components/Student/StudentDashboard";
import { EmailVerification } from "./components/Student/EmailVerification";
import { QRModal } from "./components/Student/QRModal";

import { authAPI, studentAPI, adminAPI, certificateAPI } from "./services/api";
import { issueCertificateOnBlockchain } from "./services/contract";

import "./App.css";

function App() {
  // Navigation
  const [view, setView] = useState("landing");
  const [verificationToken, setVerificationToken] = useState(null);

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  // Login errors
  const [studentLoginError, setStudentLoginError] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  // Loading
  const [loading, setLoading] = useState(false);

  // Verifier
  const [verifyHash, setVerifyHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  // QR Modal
  const [qrModalHash, setQrModalHash] = useState(null);

  // Admin Data
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // Student Certificates
  const [studentCertificates, setStudentCertificates] = useState([]);

  // Forms
  const [newStudent, setNewStudent] = useState({
    username: "",
    email: "",
    name: "",
    rollNumber: "",
    department: "",
    graduationYear: "",
    password: "",
  });

  const [newCert, setNewCert] = useState({
    studentName: "",
    rollNumber: "",
    department: "",
    percentage: "",
    passingYear: "",
    classDivision: "",
  });

  const [issueSuccess, setIssueSuccess] = useState(null);

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const saveRedirectToken = () => {
    const url = new URL(window.location.href);
    const receivedToken = url.searchParams.get("token");
    if (!receivedToken) return;

    localStorage.setItem("token", receivedToken);
    setToken(receivedToken);

    const payload = decodeJwt(receivedToken);
    if (payload?.id && payload?.email) {
      const currentUserPayload = {
        id: payload.id,
        email: payload.email,
        role: payload.role || "student",
      };
      localStorage.setItem("currentUser", JSON.stringify(currentUserPayload));
      setCurrentUser(currentUserPayload);
    }

    url.searchParams.delete("token");
    window.history.replaceState({}, document.title, url.pathname + url.search);
  };

  // ======================
  // EFFECTS
  // ======================

  useEffect(() => {
    document.title = "AcademicChain Verification Portal";
    saveRedirectToken();

    // Check for email verification token in URL
    const path = window.location.pathname;
    if (path.startsWith("/verify-email/")) {
      const vToken = path.split("/").pop();
      if (vToken) {
        setVerificationToken(vToken);
        setView("verify-email");
      }
    }

    if (token) {
      loadUserProfile();
    } else {
      if (!path.startsWith("/verify-email/")) {
        setView("landing");
      }
    }
  }, [token]);

  useEffect(() => {
    if (currentUser?.role === "student") {
      loadStudentCertificates();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const adminViews = [
      "admin",
      "register-student",
      "issue-certificate",
      "view-records",
      "approve-admins",
    ];
    const studentViews = ["student-dashboard"];

    if (adminViews.includes(view) && currentUser.role !== "admin") {
      setView("student-dashboard");
    }

    if (studentViews.includes(view) && currentUser.role !== "student") {
      setView("landing");
    }
  }, [view, currentUser]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");

    setToken(null);
    setCurrentUser(null);

    setEmail("");
    setPassword("");

    setView("portal");
  }, []);

  // Listen for token changes (when token expires)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem("token");
      if (!currentToken && token) {
        // Token was removed (expired)
        handleLogout();
      }
    };

    const handleTokenExpired = () => {
      handleLogout();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, [token, handleLogout]);

  // ======================
  // LOAD DATA
  // ======================

  const loadUserProfile = async () => {
    let storedUser = localStorage.getItem("currentUser");

    if (!storedUser && token) {
      const payload = decodeJwt(token);
      if (payload?.id && payload?.email) {
        const userFromToken = {
          id: payload.id,
          email: payload.email,
          role: payload.role || "student",
        };
        localStorage.setItem("currentUser", JSON.stringify(userFromToken));
        storedUser = JSON.stringify(userFromToken);
      }
    }

    if (!storedUser) {
      handleLogout();
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    console.log("Loading stored user profile:", parsedUser);

    if (parsedUser.role === "admin") {
      setCurrentUser(parsedUser);
      setView("admin");
      return;
    }

    try {
      const response = await studentAPI.getProfile(parsedUser.id);
      const profile = {
        ...response.data,
        role: parsedUser.role || "student",
      };

      setCurrentUser(profile);
      localStorage.setItem("currentUser", JSON.stringify(profile));
      setView("student-dashboard");
    } catch (error) {
      console.error("Profile load error:", error);
      // If profile fetch fails, keep the stored user as fallback but do not crash.
      setCurrentUser(parsedUser);
      setView("student-dashboard");
    }
  };

  const loadStudents = useCallback(async () => {
    try {
      const response = await adminAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error("Students load error:", error);
    }
  }, []);

  const loadCertificates = useCallback(async () => {
    try {
      const response = await adminAPI.getCertificates();
      setCertificates(response.data);
    } catch (error) {
      console.error("Certificates load error:", error);
    }
  }, []);

  const loadStudentCertificates = async () => {
    if (!currentUser) {
      setStudentCertificates([]);
      return;
    }

    if (currentUser.certificates) {
      setStudentCertificates(currentUser.certificates);
      return;
    }

    try {
      const response = await studentAPI.getProfile(currentUser.id);

      setStudentCertificates(response.data.certificates || []);
    } catch (error) {
      console.error("Student certificates error:", error);
      setStudentCertificates([]);
    }
  };

  // ======================
  // AUTH FUNCTIONS
  // ======================

  const handleStudentLogin = async ({
    identifier,
    password: loginPassword,
    twoFactorToken,
  }) => {
    setLoading(true);
    setStudentLoginError("");

    try {
      const loginIdentifier = identifier?.trim();
      if (!loginIdentifier || !loginPassword) {
        setStudentLoginError(
          "Please enter your email/roll number and password.",
        );
        return false;
      }

      const loginPayload = {
        email: loginIdentifier,
        password: loginPassword,
        twoFactorToken,
      };

      const response = await authAPI.login(loginPayload);

      if (response.data.twoFactorRequired) {
        return { twoFactorRequired: true };
      }

      const { token: userToken, user } = response.data;

      if (user.role === "admin") {
        setStudentLoginError("Admins should use the Admin Panel login.");
        return false;
      }

      localStorage.setItem("token", userToken);
      setToken(userToken);

      try {
        const profileResponse = await studentAPI.getProfile(user.id);
        const profile = {
          ...profileResponse.data,
          role: user.role || "student",
        };

        localStorage.setItem("currentUser", JSON.stringify(profile));
        setCurrentUser(profile);
        setStudentCertificates(profile.certificates || []);
        setView("student-dashboard");
      } catch (profileError) {
        console.error("Student profile load error after login:", profileError);

        const fallbackProfile = {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          rollNumber: user.rollNumber,
          department: user.department,
          year: user.year,
          role: "student",
        };

        localStorage.setItem("currentUser", JSON.stringify(fallbackProfile));
        setCurrentUser(fallbackProfile);
        setStudentCertificates([]);
        setView("student-dashboard");
      }

      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      setStudentLoginError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (adminEmail, adminPassword) => {
    setLoading(true);
    setAdminLoginError("");

    try {
      const emailValue = adminEmail.trim().toLowerCase();
      const response = await authAPI.adminLogin({
        email: emailValue,
        password: adminPassword,
      });

      const { token: userToken, user } = response.data;

      if (user.role !== "admin") {
        const message = "Not an admin";
        setAdminLoginError(message);
        return false;
      }

      localStorage.setItem("token", userToken);
      localStorage.setItem("currentUser", JSON.stringify(user));

      setToken(userToken);
      setCurrentUser(user);

      setView("admin");
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Admin login failed";
      setAdminLoginError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // ADMIN ACTIONS
  // ======================

  const handleStudentRegister = async (studentData) => {
    setLoading(true);

    try {
      // Validate all required fields
      if (!studentData.username || studentData.username.trim() === "") {
        throw new Error("Username is required");
      }
      if (!studentData.email || studentData.email.trim() === "") {
        throw new Error("Email is required");
      }
      if (!studentData.name || studentData.name.trim() === "") {
        throw new Error("Full name is required");
      }
      if (!studentData.rollNumber || studentData.rollNumber.trim() === "") {
        throw new Error("Roll number is required");
      }
      if (!studentData.department || studentData.department.trim() === "") {
        throw new Error("Department is required");
      }
      if (!studentData.year || studentData.year === "") {
        throw new Error("Graduation year is required");
      }
      if (!studentData.password || studentData.password.trim() === "") {
        throw new Error("Password is required");
      }

      const year = Number(studentData.year);
      const maxYear = new Date().getFullYear() + 10;
      if (isNaN(year) || year < 2000 || year > maxYear) {
        throw new Error("Graduation year must be between 2000 and " + maxYear);
      }

      const payload = {
        username: studentData.username.trim(),
        email: studentData.email.trim(),
        name: studentData.name.trim(),
        rollNumber: studentData.rollNumber.trim(),
        department: studentData.department.trim(),
        year,
        password: studentData.password.trim(),
      };

      console.log(
        "[Frontend] Student self-registration with payload:",
        payload,
      );

      const response = await authAPI.studentRegister(payload);

      console.log("[Frontend] Student registration successful:", response.data);

      alert("Registration Successful! Redirecting to login...");

      // Auto-login after successful registration
      const loginPayload = {
        identifier: payload.email,
        password: payload.password,
      };

      const loginResponse = await authAPI.login(loginPayload);
      const { token: userToken, user } = loginResponse.data;

      localStorage.setItem("token", userToken);
      setToken(userToken);

      try {
        const profileResponse = await studentAPI.getProfile(user.id);
        const profile = {
          ...profileResponse.data,
          role: user.role || "student",
        };

        localStorage.setItem("currentUser", JSON.stringify(profile));
        setCurrentUser(profile);
        setStudentCertificates(profile.certificates || []);
        setView("student-dashboard");
      } catch (profileError) {
        console.error("Profile load error after registration:", profileError);

        const fallbackProfile = {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          rollNumber: user.rollNumber,
          department: user.department,
          year: user.year,
          role: "student",
        };

        localStorage.setItem("currentUser", JSON.stringify(fallbackProfile));
        setCurrentUser(fallbackProfile);
        setStudentCertificates([]);
        setView("student-dashboard");
      }
    } catch (error) {
      console.error("[Frontend] Student registration error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "Unknown error";

      alert("Failed to register: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (formData) => {
    setLoading(true);

    try {
      // 1. Save data to backend and get hash
      const response = await adminAPI.issueCertificate(formData);
      const certificate = response.data;

      try {
        // 2. Submit hash to blockchain
        alert(
          "Please confirm the transaction in MetaMask to issue the certificate on the blockchain.",
        );
        const txHash = await issueCertificateOnBlockchain(certificate.hash);

        // 3. Update backend with real transaction hash
        const updateResponse = await adminAPI.updateTransactionHash(
          certificate._id,
          txHash,
        );

        setIssueSuccess(updateResponse.data.certificate);
        alert(
          "Certificate issued successfully and registered on the blockchain!",
        );
      } catch (bcError) {
        console.error("Blockchain error:", bcError);
        setIssueSuccess(certificate); // Still show success for backend part
        alert(
          "Certificate saved to database, but blockchain registration failed or was cancelled. Transaction hash is pending.",
        );
      }
    } catch (error) {
      console.error("Issue certificate error:", error);
      alert(
        "Certificate issuance failed: " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // VERIFIER
  // ======================

  const handleVerify = async () => {
    setLoading(true);

    try {
      const response = await certificateAPI.verifyHash(verifyHash);

      setVerificationResult(response.data);
    } catch {
      setVerificationResult({ verified: false });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (studentData) => {
    setLoading(true);

    try {
      // Validate all required fields before sending
      if (!studentData.username || studentData.username.trim() === "") {
        throw new Error("Username is required");
      }
      if (!studentData.email || studentData.email.trim() === "") {
        throw new Error("Email is required");
      }
      if (!studentData.name || studentData.name.trim() === "") {
        throw new Error("Full name is required");
      }
      if (!studentData.rollNumber || studentData.rollNumber.trim() === "") {
        throw new Error("Roll number is required");
      }
      if (!studentData.department || studentData.department.trim() === "") {
        throw new Error("Department is required");
      }
      if (!studentData.year || studentData.year === "") {
        throw new Error("Graduation year is required");
      }
      if (!studentData.password || studentData.password.trim() === "") {
        throw new Error("Password is required");
      }

      const year = Number(studentData.year);
      const maxYear = new Date().getFullYear() + 10;
      if (isNaN(year) || year < 2000 || year > maxYear) {
        throw new Error("Graduation year must be between 2000 and " + maxYear);
      }

      const payload = {
        username: studentData.username.trim(),
        email: studentData.email.trim(),
        name: studentData.name.trim(),
        rollNumber: studentData.rollNumber.trim(),
        department: studentData.department.trim(),
        year,
        password: studentData.password.trim(),
      };

      console.log(
        "[Frontend] Registering student via Admin with payload:",
        payload,
      );

      const response = await adminAPI.registerStudent(payload);

      console.log("[Frontend] Student registration successful:", response.data);

      alert(
        "Student Registered Successfully!\nUsername: " +
          payload.username +
          "\nEmail: " +
          payload.email,
      );

      // Reset form
      setNewStudent({
        username: "",
        email: "",
        name: "",
        rollNumber: "",
        department: "",
        graduationYear: "",
        password: "",
      });

      setView("admin");
    } catch (error) {
      console.error("[Frontend] Student registration error:", error);

      if (error.response?.status === 401) {
        alert("Session expired or unauthorized. Please log in again as admin.");
        handleLogout();
        setView("admin-login");
        return;
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "Unknown error";

      alert("Failed to register student: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (id, updatedData) => {
    setLoading(true);
    try {
      const response = await studentAPI.updateProfile(id, updatedData);
      const updatedUser = {
        ...response.data.user,
        role: currentUser.role,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.response?.data?.message || "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // UI
  // ======================

  return (
    <div className="app-main">
      <Navbar
        view={view}
        setView={setView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {view === "landing" && (
        <Landing setView={setView} currentUser={currentUser} />
      )}
      {view === "portal" && <Portal setView={setView} />}

      {view === "admin-login" && (
        <AdminLogin
          setView={setView}
          handleAdminLogin={handleAdminLogin}
          loading={loading}
          loginError={adminLoginError}
        />
      )}

      {view === "admin-register" && <AdminRegister setView={setView} />}

      {view === "admin" && (
        <AdminPanel setView={setView} onLogout={handleLogout} />
      )}

      {view === "register-student" && (
        <RegisterStudent
          setView={setView}
          newStudent={newStudent}
          setNewStudent={setNewStudent}
          handleRegisterStudent={handleRegisterStudent}
        />
      )}

      {view === "issue-certificate" && (
        <IssueCertificate
          setView={setView}
          newCert={newCert}
          setNewCert={setNewCert}
          handleIssueCertificate={handleIssueCertificate}
          issueSuccess={issueSuccess}
          setIssueSuccess={setIssueSuccess}
        />
      )}

      {view === "view-records" && (
        <ViewRecords
          setView={setView}
          students={students}
          certificates={certificates}
          loadStudents={loadStudents}
          loadCertificates={loadCertificates}
        />
      )}

      {view === "approve-admins" && <ApproveAdmins setView={setView} />}

      {view === "verifier" && <Verifier setView={setView} />}

      {view === "student" && (
        <StudentLogin
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleStudentLogin={handleStudentLogin}
          loading={loading}
          setView={setView}
          loginError={studentLoginError}
        />
      )}

      {view === "student-register" && (
        <StudentRegister
          setView={setView}
          handleStudentRegister={handleStudentRegister}
          loading={loading}
        />
      )}

      {view === "verify-email" && (
        <EmailVerification token={verificationToken} setView={setView} />
      )}

      {view === "student-dashboard" && (
        <StudentDashboard
          currentUser={currentUser}
          studentCertificates={studentCertificates}
          setQrModalHash={setQrModalHash}
          onUpdateProfile={handleUpdateProfile}
          setView={setView}
        />
      )}

      <QRModal qrModalHash={qrModalHash} setQrModalHash={setQrModalHash} />
    </div>
  );
}

export default App;
