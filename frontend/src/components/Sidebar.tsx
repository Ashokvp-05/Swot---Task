"use client";

import React, { useState } from "react";
import { useAuth, Role } from "@/context/AuthContext";
import { useBoards } from "@/context/BoardContext";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  Plus,
  Layers,
} from "lucide-react";

/* ─── Role-Based Navigation Items ─── */
const navItems: { icon: typeof LayoutDashboard; label: string; id: string; allowedRoles: Role[] }[] = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard", allowedRoles: ["Admin", "Manager"] },
  { icon: Layers, label: "Boards", id: "boards", allowedRoles: ["Admin", "Manager"] },
  { icon: Users, label: "Employees", id: "employees", allowedRoles: ["Admin", "Manager"] },
];

/* ─── Role Badge Styling ─── */
const roleBadgeColors: Record<Role, { bg: string; color: string; border: string }> = {
  Admin: { bg: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "rgba(239,68,68,0.25)" },
  Manager: { bg: "rgba(245,158,11,0.15)", color: "#fcd34d", border: "rgba(245,158,11,0.25)" },
  Employee: { bg: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "rgba(16,185,129,0.25)" },
};

interface SidebarProps {
  activeView: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeView, onNavigate, collapsed, onToggle }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { user, logout, hasAccess } = useAuth();
  const { boards } = useBoards();

  const badge = user ? roleBadgeColors[user.role] : null;
  const isAdmin = user?.role === "Admin";

  // Filter nav items by role
  const visibleNavItems = navItems.filter((item) => hasAccess(item.allowedRoles));

  // Boards visible to user
  const visibleBoards = isAdmin
    ? boards
    : boards.filter((b) => {
        const userInitials = user?.initials || "";
        const userName = user?.name?.toLowerCase() || "";
        const userEmail = user?.username?.toLowerCase() || "";
        return (
          b.team.includes(userInitials) ||
          b.onboardedUsers.some(
            (u) =>
              u.initials === userInitials ||
              u.name.toLowerCase() === userName ||
              u.email.toLowerCase() === userEmail
          )
        );
      });

  const renderNavButton = (id: string, label: string, Icon: typeof LayoutDashboard, extraStyle?: React.CSSProperties) => {
    const isActive = activeView === id;
    const isHovered = hoveredItem === id;
    return (
      <button
        key={id}
        onClick={() => onNavigate(id)}
        onMouseEnter={() => setHoveredItem(id)}
        onMouseLeave={() => setHoveredItem(null)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: collapsed ? "11px 0" : "10px 14px",
          marginBottom: 2,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: isActive
            ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))"
            : isHovered
            ? "rgba(255,255,255,0.05)"
            : "transparent",
          color: isActive ? "#a5b4fc" : isHovered ? "#cbd5e1" : "#64748b",
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          fontFamily: "inherit",
          transition: "all 0.2s ease",
          position: "relative",
          justifyContent: collapsed ? "center" : "flex-start",
          transform: isHovered && !isActive ? "translateX(2px)" : "none",
          ...extraStyle,
        }}
      >
        {isActive && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 3,
              height: 22,
              borderRadius: "0 4px 4px 0",
              background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
              boxShadow: "0 0 8px rgba(99,102,241,0.5)",
            }}
          />
        )}
        <Icon size={19} style={{ transition: "transform 0.2s ease", transform: isHovered ? "scale(1.1)" : "scale(1)" }} />
        {!collapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <aside
      style={{
        width: collapsed ? 72 : 260,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Logo Area (Toggle only) */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={onToggle}
          style={{
            marginLeft: collapsed ? "0" : "auto",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 5,
            borderRadius: 6,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        >
          {collapsed ? <Menu size={16} /> : <X size={14} />}
        </button>
      </div>

      {/* User Info */}
      {user && !collapsed && (
        <div style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff",
            }}>
              {user.initials}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>
                {user.name}
              </div>
              {badge && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 4,
                  background: badge.bg, color: badge.color,
                  border: `1px solid ${badge.border}`,
                  display: "inline-flex", alignItems: "center", gap: 3, marginTop: 2,
                }}>
                  <Shield size={9} />
                  {user.role}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Avatar */}
      {user && collapsed && (
        <div style={{ padding: "14px 0", display: "flex", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
          }}>
            {user.initials}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 8px", overflowY: "auto" }}>
        {!collapsed && visibleNavItems.length > 0 && (
          <p style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 12px", marginBottom: 8 }}>
            Main Menu
          </p>
        )}

        {/* Main Nav Items */}
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return renderNavButton(item.id, item.label, Icon);
        })}

        {/* ─── Boards Section ─── */}
        {!collapsed && visibleBoards.length > 0 && (
          <>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 12px", marginTop: 20, marginBottom: 8,
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your Boards
              </p>
              {isAdmin && (
                <button
                  onClick={() => onNavigate("boards")}
                  style={{
                    background: "none", border: "none", cursor: "pointer", color: "#475569",
                    display: "flex", alignItems: "center", padding: 2, borderRadius: 4,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#a5b4fc"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}
                  title="Manage Boards"
                >
                  <Plus size={13} />
                </button>
              )}
            </div>
            {visibleBoards.map((board) => {
              const boardViewId = `board:${board.id}`;
              const isActive = activeView === boardViewId;
              const isHovered = hoveredItem === boardViewId;
              return (
                <button
                  key={board.id}
                  onClick={() => onNavigate(boardViewId)}
                  onMouseEnter={() => setHoveredItem(boardViewId)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 14px",
                    marginBottom: 2,
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))"
                      : isHovered
                      ? "rgba(255,255,255,0.05)"
                      : "transparent",
                    color: isActive ? "#a5b4fc" : isHovered ? "#cbd5e1" : "#64748b",
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                        width: 3, height: 18, borderRadius: "0 4px 4px 0",
                        background: board.color,
                        boxShadow: `0 0 6px ${board.color}80`,
                      }}
                    />
                  )}
                  <div style={{
                    width: 8, height: 8, borderRadius: 3, flexShrink: 0,
                    background: board.color,
                  }} />
                  <span style={{
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {board.name}
                  </span>
                  <span style={{
                    fontSize: 10, color: "#475569", fontWeight: 500, marginLeft: "auto", flexShrink: 0,
                  }}>
                    {board.columns.reduce((a, c) => a + c.tasks.length, 0)}
                  </span>
                </button>
              );
            })}
          </>
        )}

        {/* Collapsed board dots */}
        {collapsed && visibleBoards.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 16 }}>
            {visibleBoards.slice(0, 4).map((board) => {
              const boardViewId = `board:${board.id}`;
              const isActive = activeView === boardViewId;
              return (
                <button
                  key={board.id}
                  onClick={() => onNavigate(boardViewId)}
                  title={board.name}
                  style={{
                    width: 28, height: 28, borderRadius: 7, border: "none",
                    background: isActive ? `${board.color}30` : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    width: 10, height: 10, borderRadius: 3,
                    background: board.color,
                    boxShadow: isActive ? `0 0 6px ${board.color}60` : "none",
                  }} />
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={logout}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#fca5a5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: collapsed ? "11px 0" : "10px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "#64748b",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "inherit",
            transition: "all 0.2s ease",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <LogOut size={19} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
