import React from "react";
import { 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Lock, 
  Cpu, 
  Layers,
  FileCheck,
  Github,
  Twitter,
  Check,
  Users,
  ExternalLink,
  Mail,
  CheckCircle2
} from "lucide-react";
import "./Landing.css";

export const Landing = ({ setView, currentUser }) => {
  const handleStart = () => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        setView("admin");
      } else {
        setView("student-dashboard");
      }
    } else {
      setView("portal");
    }
  };

  const features = [
    {
      icon: Globe,
      title: "Global Mobility",
      desc: "Your credentials travel with you anywhere in the world, instantly verifiable by employers and institutions across borders.",
      count: "01"
    },
    {
      icon: Layers,
      title: "Radical Transparency",
      desc: "Open, auditable trails for every certificate issued, building a foundation of absolute trust in academic achievements.",
      count: "02"
    },
    {
      icon: FileCheck,
      title: "Verified Excellence",
      desc: "Showcase your hard-earned qualifications with the confidence that they can never be forged or misrepresented.",
      count: "03"
    },
    {
      icon: ShieldCheck,
      title: "Student Empowerment",
      desc: "You own your data. Our platform puts the power of credential sharing directly into the hands of the student.",
      count: "04"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section - Definitive Project Redesign */}
      <div className="hero-clean-container">
        <div className="hero-clean-content">
          <div className="hero-clean-text">
            <div className="trust-badge-mini">
              <ShieldCheck size={16} />
              <span>SECURE BLOCKCHAIN INFRASTRUCTURE</span>
            </div>
            
            <h1 className="hero-clean-title">
              Blockchain Based <br />
              <span className="text-gradient-authoritative">Academic Certificate</span> <br />
              Verification Portal
            </h1>

            <p className="hero-clean-subtitle">
              The gold standard in academic integrity. Issue, manage, and verify 
              educational credentials with <strong>absolute certainty</strong> through 
              decentralized cryptographic security.
            </p>

            <div className="hero-clean-actions">
              <button className="btn-action-primary" onClick={handleStart}>
                <span>{currentUser ? "Go to Dashboard" : "Get Started Now"}</span>
                <ArrowRight size={20} />
              </button>
              
              <button className="btn-action-secondary" onClick={() => setView("verifier")}>
                <Globe size={18} />
                <span>Verify a Certificate</span>
              </button>
            </div>

            <div className="hero-trust-metrics">
              <div className="trust-m-item">
                <div className="m-dot"></div>
                <span>100% Immutable</span>
              </div>
              <div className="trust-m-item">
                <div className="m-dot"></div>
                <span>E2E Encrypted</span>
              </div>
            </div>
          </div>

          <div className="hero-clean-visual">
            <div className="standalone-floating-object">
              <img 
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop" 
                alt="Verified Blockchain Certificate" 
                className="floating-project-asset" 
              />
              <div className="project-asset-reflection"></div>
              
              {/* Subtle background atmosphere */}
              <div className="ambient-glow ag-1"></div>
              <div className="ambient-glow ag-2"></div>
            </div>
          </div>
        </div>
        
        {/* Subtle background decoration */}
        <div className="authoritative-bg-mesh"></div>
      </div>

      {/* Signature Features Section */}
      <section className="features-modern">
        <div className="section-meta">
          <span className="meta-label">OUR MISSION</span>
          <h2 className="meta-title">The Future of Verification</h2>
        </div>
        
        <div className="features-tile-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-tile">
              <div className="tile-top">
                <span className="tile-number">{f.count}</span>
                <f.icon className="tile-icon" size={32} />
              </div>
              <h3 className="tile-title">{f.title}</h3>
              <p className="tile-desc">{f.desc}</p>
              <div className="tile-accent" />
            </div>
          ))}
        </div>
      </section>

      {/* Signature Process Section */}
      <section className="process-modern">
        <div className="process-container">
          <div className="process-intro">
            <h2 className="process-main-title">Modern. Efficient. Secure.</h2>
            <p className="process-sub">A streamlined ecosystem for the modern academic world.</p>
          </div>
          
          <div className="process-steps-modern">
            <div className="p-step">
              <div className="p-icon-box"><Users size={30} /></div>
              <h4>PROFILE</h4>
              <p>Secure digital identity creation.</p>
            </div>
            <div className="p-arrow"><ArrowRight size={24} /></div>
            <div className="p-step">
              <div className="p-icon-box"><FileCheck size={30} /></div>
              <h4>VALIDATE</h4>
              <p>Cryptographic hash generation.</p>
            </div>
            <div className="p-arrow"><ArrowRight size={24} /></div>
            <div className="p-step">
              <div className="p-icon-box"><Check size={30} /></div>
              <h4>SUCCESS</h4>
              <p>Universal credential access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Security Section - Fortress of Integrity Redesign */}
      <section className="security-bento-section">
        <div className="section-meta">
          <span className="meta-label">ADVANCED PROTECTION</span>
          <h2 className="meta-title">The Fortress of Integrity</h2>
        </div>

        <div className="security-bento-grid">
          {/* Main Core Card */}
          <div className="security-card core-card">
            <img 
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" 
              className="card-bg-img" 
              alt="Hardened Security"
            />
            <div className="core-visual">
              <div className="pulse-ring"></div>
              <Lock size={80} className="core-lock-icon" />
              <div className="core-scanner"></div>
            </div>
            <div className="card-info">
              <h3>Institutional Grade Security</h3>
              <p>Our infrastructure is hardened against all vectors of credential fraud and data tampering.</p>
            </div>
          </div>

          {/* Secondary Feature Card 1 */}
          <div className="security-card feature-card feat-1">
            <img 
              src="https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1000&auto=format&fit=crop" 
              className="card-bg-img" 
              alt="Blockchain Ledger"
            />
            <div className="feat-icon-box">
              <ShieldCheck size={32} />
            </div>
            <h4>Immutable Ledger</h4>
            <p>Once a certificate is hashed on-chain, it exists forever in its original, unalterable state.</p>
            <div className="feat-badge">100% SECURE</div>
          </div>

          {/* Secondary Feature Card 2 */}
          <div className="security-card feature-card feat-2">
            <img 
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop" 
              className="card-bg-img" 
              alt="Encryption"
            />
            <div className="feat-icon-box">
              <Layers size={32} />
            </div>
            <h4>E2E Encryption</h4>
            <p>Every piece of student data is encrypted at rest and in transit using military-grade protocols.</p>
            <div className="feat-glow"></div>
          </div>

          {/* Stats Card */}
          <div className="security-card stats-card">
            <div className="stat-item">
              <span className="stat-val">AES-256</span>
              <span className="stat-lbl">Standard</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-val">2FA</span>
              <span className="stat-lbl">Protection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sleek Protocol Footer - Clean & High-Contrast Aesthetic */}
      <footer className="sleek-footer">
        <div className="sleek-footer-top">
          <div className="sleek-cta-banner">
            <div className="sleek-cta-info">
              <div className="protocol-status">
                <span className="status-label">VERSION 5.0</span>
                <div className="status-line"></div>
                <span className="status-text">DECENTRALIZED & SECURE</span>
              </div>
              <h3>Ready to Join the Global Academic Ledger?</h3>
              <p>Initialize your institutional or student identity on the most secure verification protocol.</p>
            </div>
            <button className="sleek-cta-btn" onClick={handleStart}>
              <span>Get Started Now</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="sleek-footer-main">
          <div className="sleek-brand-col">
            <div className="sleek-logo">
              <div className="logo-pulse-box">
                <Cpu size={28} />
              </div>
              <div className="logo-names">
                <span className="m-name">ACADEMIC CHAIN</span>
                <span className="s-name">SECURE PROTOCOL</span>
              </div>
            </div>
            <p className="sleek-mission">
              The gold standard in academic integrity. Built for a world where 
              credentials are immutable, transparent, and instantly verifiable.
            </p>
            <div className="sleek-socials">
              <a href="#" className="sleek-social-link"><Github size={18} /></a>
              <a href="#" className="sleek-social-link"><Twitter size={18} /></a>
              <a href="#" className="sleek-social-link"><Mail size={18} /></a>
            </div>
          </div>

          <div className="sleek-links-grid">
            <div className="sleek-link-stack">
              <h6>ECOSYSTEM</h6>
              <a onClick={() => setView("landing")}>Protocol Home</a>
              <a onClick={() => setView("portal")}>Student Hub</a>
              <a onClick={() => setView("portal")}>Admin Node</a>
              <a onClick={() => setView("verifier")}>Public Verifier</a>
            </div>
            <div className="sleek-link-stack">
              <h6>PROTOCOL</h6>
              <a href="#">Security Audit</a>
              <a href="#">Whitepaper</a>
              <a href="#">Explorer</a>
              <a href="#">API Documentation</a>
            </div>
            <div className="sleek-link-stack">
              <h6>LEGAL</h6>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Compliance</a>
            </div>
          </div>
        </div>

        <div className="sleek-footer-bottom">
          <div className="bottom-content-wrap">
            <div className="copyright-info">
              &copy; {new Date().getFullYear()} Blockchain Based Academic Certificate Verification Portal
            </div>
            <div className="bottom-badges">
              <div className="network-indicator">
                <div className="n-dot"></div>
                <span>Mainnet Active</span>
              </div>
              <div className="powered-tag">
                PROVISIONED BY <strong>ETHEREUM</strong>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
