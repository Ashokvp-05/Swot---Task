"use client";

import React, { useState } from "react";
import { Shield, LogOut, User, Mail, Briefcase, X } from "lucide-react";
import { useAuth, Role } from "@/context/AuthContext";

interface TopHeaderProps {
  activeView: string;
}

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Here's your workspace overview." },
  boards: { title: "Boards", subtitle: "Manage and organize your team boards." },
  kanban: { title: "Task Board", subtitle: "Manage and track your tasks across workflow stages." },
  employees: { title: "Employees", subtitle: "Manage team members and monitor productivity." },
  settings: { title: "Settings", subtitle: "Customize your workspace preferences." },
};

const roleBadgeColors: Record<Role, { bg: string; color: string; border: string }> = {
  Admin: { bg: "rgba(239,68,68,0.08)", color: "#dc2626", border: "rgba(239,68,68,0.2)" },
  Manager: { bg: "rgba(245,158,11,0.08)", color: "#d97706", border: "rgba(245,158,11,0.2)" },
  Employee: { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.2)" },
};

export default function TopHeader({ activeView }: TopHeaderProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const info = viewTitles[activeView] || viewTitles.dashboard;
  const greeting = user ? `Welcome back, ${user.name}!` : "Welcome!";
  const subtitle = activeView === "dashboard" ? `${greeting} ${info.subtitle}` : info.subtitle;
  const badge = user ? roleBadgeColors[user.role] : null;

  return (
    <>
      <header
        style={{
          height: 64,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", transition: "all 0.3s ease" }}>
            {info.title}
          </h2>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{subtitle}</p>
        </div>

        {/* Right - Clickable User Info */}
        {user && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "transparent", border: "1px solid transparent",
                cursor: "pointer", padding: "6px 12px", borderRadius: 12,
                transition: "all 0.2s ease", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#f1f5f9"; }}
              onMouseLeave={(e) => { if (!showDropdown) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
            >
              {badge && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6,
                  background: badge.bg, color: badge.color,
                  border: `1px solid ${badge.border}`,
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <Shield size={12} />
                  {user.role}
                </span>
              )}
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
                boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
              }}>
                {user.initials}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{user.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{user.department}</div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 90 }}
                  onClick={() => setShowDropdown(false)}
                />
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 8,
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.12)", padding: 6, zIndex: 100,
                  minWidth: 220, animation: "fadeIn 0.15s ease",
                }}>
                  {/* User Summary */}
                  <div style={{
                    padding: "12px 14px", borderBottom: "1px solid #f1f5f9", marginBottom: 4,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>
                      {user.initials}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{user.username}</p>
                    </div>
                  </div>

                  {/* View Profile */}
                  <button
                    onClick={() => { setShowProfileModal(true); setShowDropdown(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      background: "transparent", border: "none", borderRadius: 8,
                      color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <User size={16} color="#64748b" />
                    View Profile
                  </button>

                  {/* Divider */}
                  <div style={{ height: 1, background: "#f1f5f9", margin: "4px 8px" }} />

                  {/* Sign Out */}
                  <button
                    onClick={() => { logout(); setShowDropdown(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      background: "transparent", border: "none", borderRadius: 8,
                      color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* ─── Profile Modal ─── */}
      {showProfileModal && user && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{
            background: "#fff", width: "100%", maxWidth: 440, borderRadius: 20,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden",
            position: "relative",
          }}>
            {/* Header Banner */}
            <div style={{ height: 100, background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }} />

            {/* Close Button */}
            <button
              onClick={() => setShowProfileModal(false)}
              style={{
                position: "absolute", top: 12, right: 12, width: 32, height: 32,
                borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div style={{ padding: "0 32px 32px", marginTop: -40, textAlign: "center" }}>
              {/* Avatar */}
              <div style={{
                width: 80, height: 80, borderRadius: 24, background: "#fff",
                margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", border: "4px solid #fff",
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: 18,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 800, color: "#fff",
                }}>
                  {user.initials}
                </div>
              </div>

              {/* Name & Role */}
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{user.name}</h2>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                {badge && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: badge.bg, color: badge.color,
                    border: `1px solid ${badge.border}`,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    <Shield size={11} />
                    {user.role}
                  </span>
                )}
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>• {user.department}</span>
              </div>

              {/* Details Cards */}
              <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Email / Username */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "#f8fafc", borderRadius: 12,
                  border: "1px solid #f1f5f9",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#6366f1", border: "1px solid #e2e8f0", flexShrink: 0,
                  }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Username / Email</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{user.username}</p>
                  </div>
                </div>

                {/* Department */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "#f8fafc", borderRadius: 12,
                  border: "1px solid #f1f5f9",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#8b5cf6", border: "1px solid #e2e8f0", flexShrink: 0,
                  }}>
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Department</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{user.department}</p>
                  </div>
                </div>

                {/* Role */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "#f8fafc", borderRadius: 12,
                  border: "1px solid #f1f5f9",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#ec4899", border: "1px solid #e2e8f0", flexShrink: 0,
                  }}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Access Level</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{user.role}</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  width: "100%", marginTop: 24, padding: "12px", borderRadius: 12,
                  background: "#1e293b", color: "#fff", border: "none",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
                onMouseLeave={e => e.currentTarget.style.background = "#1e293b"}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
