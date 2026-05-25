"use client";

import React, { useState } from "react";
import { Plus, Trash2, UserPlus, Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useBoards } from "@/context/BoardContext";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingPanel({ boardId }: { boardId: string }) {
  const { user } = useAuth();
  const { getBoardById, addOnboardedUser, removeOnboardedUser } = useBoards();
  const board = getBoardById(boardId);
  const isAdmin = user?.role === "Admin";

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Manager" | "Employee">("Employee");
  const [showPwd, setShowPwd] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  if (!board) return null;
  if (user?.role === "Employee") return null;

  const users = board.onboardedUsers;

  const [successMsg, setSuccessMsg] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    await addOnboardedUser(boardId, { name: name.trim(), email: email.trim(), password, role });
    setName(""); setEmail(""); setPassword(""); setRole("Employee"); setShowForm(false); setShowPwd(false);
    setSuccessMsg("User added successfully!");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const togglePwdVisibility = (userId: string) => {
    setShowPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <>
      {successMsg && (
        <div style={{
          position: "fixed",
          bottom: 32,
          left: 32,
          background: "#10b981",
          color: "#fff",
          padding: "14px 24px",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 10,
          animation: "fadeIn 0.3s ease"
        }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}

      {/* Add User Button */}
      {isAdmin && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
              borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff",
              transition: "all 0.2s", width: "100%", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(79,70,229,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.25)"; }}
          >
            <Plus size={16} />
            {showForm ? "Cancel" : "Add New User"}
          </button>
        </div>
      )}

      {/* Add User Form */}
      {isAdmin && showForm && (
        <div style={{
          background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12,
          padding: "20px", marginBottom: 20,
          animation: "fadeIn 0.2s ease",
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
            New Team Member
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Full Name</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8,
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
                  width: "100%", padding: "10px 12px", borderRadius: 8,
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
                    width: "100%", padding: "10px 36px 10px 12px", borderRadius: 8,
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
                  width: "100%", padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit",
                  background: "#fff", outline: "none", cursor: "pointer",
                }}
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleAdd}
            style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: "#0f172a", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              width: "100%", transition: "background 0.2s",
              boxShadow: "0 2px 8px rgba(15,23,42,0.15)",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
            onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}
          >
            Add User
          </button>
        </div>
      )}

      {/* User List */}
      {users.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", borderRadius: 12,
                background: "#fafafa", border: "1px solid #f3f4f6",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f3f4f6"; e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(99,102,241,0.25)",
                }}>
                  {u.initials}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{u.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                      background: u.role === "Manager" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
                      color: u.role === "Manager" ? "#d97706" : "#059669",
                      border: `1px solid ${u.role === "Manager" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`,
                    }}>
                      {u.role}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Mail size={11} color="#94a3b8" />
                      <span style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Lock size={11} color="#94a3b8" />
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
                  </div>
                </div>
              </div>

              {/* Delete */}
              {isAdmin && (
                <button
                  onClick={() => removeOnboardedUser(boardId, u.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", padding: 6, color: "#d1d5db", transition: "all 0.15s",
                    borderRadius: 6, flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fef2f2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = "none"; }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontSize: 13,
          background: "#fafafa", borderRadius: 12, border: "1px dashed #e2e8f0",
        }}>
          <UserPlus size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: "#64748b", marginBottom: 4 }}>No team members yet</p>
          <p>Add users to give them access to this board</p>
        </div>
      )}
    </>
  );
}
