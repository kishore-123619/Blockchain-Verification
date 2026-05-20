import React from "react";
import { 
  LogOut, 
  Home, 
  ShieldCheck, 
  UserCircle, 
  Search, 
  UserPlus,
  Sparkles
} from "lucide-react";
import "./Navbar.css";

const ProjectLogo = () => (
  <div className="nav-logo-container">
    <div className="nav-logo-icon">
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        {/* Graduation Cap Base */}
        <path d="M5 15L20 8L35 15L20 22L5 15Z" fill="white" />
        <path d="M10 18V25C10 25 15 28 20 28C25 28 30 25 30 25V18" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* Blockchain Link / Seal */}
        <circle cx="20" cy="22" r="6" fill="#fbbf24" stroke="#020617" strokeWidth="2" />
        <path d="M18 22L20 24L23 20" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <div className="nav-logo-text">
      <span className="brand-name">AcademicChain</span>
      <span className="brand-tag">Verification Portal</span>
    </div>
  </div>
);

export const Navbar = ({ view, setView, currentUser, onLogout }) => {
  const goHome = () => setView("landing");
  const goAdmin = () => {
    if (currentUser?.role === "admin") {
      setView("admin");
    } else {
      setView("portal");
    }
  };
  const goStudent = () => {
    if (currentUser?.role === "student") {
      setView("student-dashboard");
    } else {
      setView("portal");
    }
  };
  const goVerifier = () => setView("verifier");
  const goRegisterStudent = () => setView("register-student");
  const goPortal = () => setView("portal");

  const isActive = (v) => {
    if (v === 'home') return view === 'landing';
    if (v === 'admin') return view.includes('admin');
    if (v === 'student') return view.includes('student');
    if (v === 'verifier') return view === 'verifier';
    return false;
  };

  return (
    <div className="nav-wrapper">
      <nav className="nav-main">
        {/* Brand - Left Side */}
        <div className="nav-brand" onClick={goHome}>
          <ProjectLogo />
        </div>

        {/* Navigation & Actions - Right Side */}
        <div className="nav-right-group">
          <div className="nav-links">
            <button className={`nav-item ${isActive('home') ? 'active' : ''}`} onClick={goHome}>
              <Home className="nav-item-icon" />
              <span className="nav-item-label">Home</span>
            </button>
            
            <button className={`nav-item ${isActive('admin') ? 'active' : ''}`} onClick={goAdmin}>
              <ShieldCheck className="nav-item-icon" />
              <span className="nav-item-label">Admin</span>
            </button>

            <button className={`nav-item ${isActive('student') ? 'active' : ''}`} onClick={goStudent}>
              <UserCircle className="nav-item-icon" />
              <span className="nav-item-label">Student</span>
            </button>

            <button className={`nav-item ${isActive('verifier') ? 'active' : ''}`} onClick={goVerifier}>
              <Search className="nav-item-icon" />
              <span className="nav-item-label">Verifier</span>
            </button>

            {currentUser?.role === "admin" && (
              <>
                <button 
                  className={`nav-item ${view === 'register-student' ? 'active' : ''}`} 
                  onClick={goRegisterStudent}
                >
                  <UserPlus className="nav-item-icon" />
                  <span className="nav-item-label">Register Student</span>
                </button>
                <button 
                  className={`nav-item ${view === 'approve-admins' ? 'active' : ''}`} 
                  onClick={() => setView('approve-admins')}
                >
                  <ShieldCheck className="nav-item-icon" />
                  <span className="nav-item-label">Admin Approval</span>
                </button>
              </>
            )}
          </div>

          <div className="nav-auth-section">
            {currentUser ? (
              <div className="nav-user-profile">
                <div className="nav-user-info">
                  <span className="nav-user-name">{currentUser.name || currentUser.email}</span>
                  <span className="nav-user-role">{currentUser.role}</span>
                </div>
                <div className="user-avatar">
                  {currentUser.name?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase() || "U"}
                </div>
                <button className="nav-logout-circle" onClick={onLogout} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="nav-cta-btn" onClick={goPortal}>
                <Sparkles size={16} />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};
