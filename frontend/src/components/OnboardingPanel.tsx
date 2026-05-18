"use client";

import React, { useState } from "react";
import { Plus, Trash2, UserPlus, Mail, Lock, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { useBoards } from "@/context/BoardContext";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingPanel({ boardId }: { boardId: string }) {
  const { user } = useAuth();
  const { getBoardById, addOnboardedUser, removeOnboardedUser } = useBoards();
  const board = getBoardById(boardId);
  const isAdmin = user?.role === "Admin";

  const [collapsed, setCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Manager" | "Employee">("Employee");
  const [showPwd, setShowPwd] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  if (!board) return null;
  if (user?.role === "Employee") return null;
  if (!isAdmin && board.onboardedUsers.length === 0) return null;

  const users = board.onboardedUsers;

  const handleAdd = () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    addOnboardedUser(boardId, { name: name.trim(), email: email.trim(), password: password.trim(), role });
    setName(""); setEmail(""); setPassword(""); setRole("Employee"); setShowForm(false); setShowPwd(false);
  };

  const togglePwdVisibility = (userId: string) => {
    setShowPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12, marginBottom: 16,
      transition: "all 0.3s ease",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", padding: "14px 20px",
          background: "#fafafa", borderBottom: collapsed ? "none" : "1px solid #f3f4f6",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UserPlus size={17} color="#6366f1" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
            Onboarded Users
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
            background: "#e0e7ff", color: "#4338ca",
          }}>
            {users.length}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAdmin && !collapsed && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowForm(!showForm); }}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "5px 12px",
                borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff",
                transition: "all 0.15s",
              }}
            >
              <Plus size={13} /> Add User
            </button>
          )}
          {collapsed ? <ChevronDown size={16} color="#94a3b8" /> : <ChevronUp size={16} color="#94a3b8" />}
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div style={{ padding: "12px 20px 16px" }}>
          {/* User Table */}
          {users.length > 0 && (
            <div style={{ marginBottom: showForm ? 16 : 0 }}>
              {/* Table Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 2.5fr 2fr 1fr 40px",
                gap: 8, padding: "8px 12px", marginBottom: 4,
                fontSize: 10, fontWeight: 600, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                <span>Name</span>
                <span>Email</span>
                <span>Password</span>
                <span>Role</span>
                <span></span>
              </div>

              {/* User Rows */}
              {users.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 2.5fr 2fr 1fr 40px",
                    gap: 8, alignItems: "center", padding: "10px 12px",
                    borderRadius: 8, marginBottom: 2,
                    background: "#fafafa", border: "1px solid #f3f4f6",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f3f4f6"; e.currentTarget.style.background = "#fafafa"; }}
                >
                  {/* Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 7,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff", fontSize: 9, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {u.initials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{u.name}</span>
                  </div>

                  {/* Email */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Mail size={12} color="#94a3b8" />
                    <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{u.email}</span>
                  </div>

                  {/* Password */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Lock size={12} color="#94a3b8" />
                    <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
                      {isAdmin && showPasswords[u.id] ? u.password : "••••••••"}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => togglePwdVisibility(u.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2, color: "#cbd5e1" }}
                      >
                        {showPasswords[u.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Role */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: u.role === "Manager" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
                    color: u.role === "Manager" ? "#d97706" : "#059669",
                    border: `1px solid ${u.role === "Manager" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`,
                    width: "fit-content",
                  }}>
                    {u.role}
                  </span>

                  {/* Delete */}
                  {isAdmin ? (
                    <button
                      onClick={() => removeOnboardedUser(boardId, u.id)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        display: "flex", padding: 4, color: "#d1d5db", transition: "color 0.1s",
                        borderRadius: 4,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#d1d5db"}
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : <div />}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {users.length === 0 && !showForm && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>
              No users onboarded yet
            </div>
          )}

          {/* Add User Form (Admin Only) */}
          {isAdmin && showForm && (
            <div style={{
              background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
              padding: "16px 18px",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
                Add New User
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Full Name</label>
                  <input
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8,
                      border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit",
                      outline: "none", transition: "border 0.15s",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#6366f1"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Email</label>
                  <input
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    type="email"
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8,
                      border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit",
                      outline: "none", transition: "border 0.15s",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#6366f1"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set password"
                      type={showPwd ? "text" : "password"}
                      style={{
                        width: "100%", padding: "9px 36px 9px 12px", borderRadius: 8,
                        border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit",
                        outline: "none", transition: "border 0.15s",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#6366f1"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <button
                      onClick={() => setShowPwd(!showPwd)}
                      style={{
                        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex",
                      }}
                    >
                      {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Role</label>
                  <select
                    value={role} onChange={(e) => setRole(e.target.value as "Manager" | "Employee")}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 8,
                      border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit",
                      background: "#fff", outline: "none", cursor: "pointer",
                    }}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setShowForm(false); setName(""); setEmail(""); setPassword(""); }}
                  style={{
                    padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0",
                    background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", color: "#64748b",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  style={{
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                  }}
                >
                  Add User
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
