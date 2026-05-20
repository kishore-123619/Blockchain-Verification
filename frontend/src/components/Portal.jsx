import React from "react";
import { motion } from "framer-motion";
import { Shield, Search, User, ArrowRight, ChevronLeft } from "lucide-react";
import "./Portal.css";

export const Portal = ({ setView }) => {
  const portalItems = [
    {
      title: "Admin Panel",
      desc: "Issue certificates, upload documents, and manage student accounts.",
      icon: Shield,
      action: () => setView("admin-login"),
      color: "#f43f5e",
    },
    {
      title: "Verifier",
      desc: "Verify the authenticity of a certificate using its cryptographic hash or QR code.",
      icon: Search,
      action: () => setView("verifier"),
      color: "#10b981",
    },
    {
      title: "Student Portal",
      desc: "Log in to view, download, and share your officially issued certificates.",
      icon: User,
      action: () => setView("student"),
      color: "#3b82f6",
    },
  ];

  return (
    <div className="portal-section">
      <div className="portal-back-nav">
        <button onClick={() => setView("landing")} className="portal-back-btn">
          <ChevronLeft size={18} />
          Back to Home
        </button>
      </div>

      <h2 className="portal-title">Access Your Portal</h2>
      <div className="portal-title-underline" />

      <div className="portal-grid">
        {portalItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              className="portal-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={item.action}
            >
              {/* Icon */}
              <div
                className="portal-icon-wrapper"
                style={{ backgroundColor: item.color }}
              >
                <Icon className="portal-icon" />
              </div>

              {/* Title */}
              <h3 className="portal-card-title">{item.title}</h3>

              {/* Description */}
              <p className="portal-card-desc">{item.desc}</p>

              {/* Button */}
              <button className="portal-btn">
                Enter {item.title.split(" ")[0]}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="portal-footer">
        © 2025 Certificate Chain | A Secure Student Portal
      </div>
    </div>
  );
};
