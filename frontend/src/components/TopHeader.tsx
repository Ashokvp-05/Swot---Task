"use client";

import React from "react";
import { Shield } from "lucide-react";
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
  const { user } = useAuth();

  const info = viewTitles[activeView] || viewTitles.dashboard;
  const greeting = user ? `Welcome back, ${user.name}!` : "Welcome!";
  const subtitle = activeView === "dashboard" ? `${greeting} ${info.subtitle}` : info.subtitle;
  const badge = user ? roleBadgeColors[user.role] : null;

  return (
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

      {/* Right - User Info & Role */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          }}>
            {user.initials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>{user.department}</div>
          </div>
        </div>
      )}
    </header>
  );
}
