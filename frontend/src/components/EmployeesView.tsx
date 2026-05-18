"use client";

import React, { useState, useMemo } from "react";
import { Search, Users, UserCheck, Briefcase, Plus, Trash2, X, Eye, EyeOff, UserPlus } from "lucide-react";
import { useBoards } from "@/context/BoardContext";
import { useAuth } from "@/context/AuthContext";

type DerivedEmployee = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  department: string;
  boardId: string;
  tasksCompleted: number;
  activeTasks: number;
  totalTasks: number;
  productivity: number;
};

const deptColors: Record<string, string> = {
  Design: "#8b5cf6", Engineering: "#3b82f6", Management: "#f59e0b",
  Marketing: "#ec4899", Operations: "#10b981",
};

function getDeptColor(dept: string): string {
  for (const [key, color] of Object.entries(deptColors)) {
    if (dept.toLowerCase().includes(key.toLowerCase())) return color;
  }
  let hash = 0;
  for (let i = 0; i < dept.length; i++) hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

const DONE_TITLES = new Set(["done", "completed", "closed", "finished", "resolved"]);

export default function EmployeesView() {
  const { boards, addOnboardedUser, removeOnboardedUser } = useBoards();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // Add User Modal state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"Manager" | "Employee">("Employee");
  const [newBoardId, setNewBoardId] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  // Confirm delete state
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; boardId: string; name: string } | null>(null);

  const employees: DerivedEmployee[] = useMemo(() => {
    const empMap = new Map<string, DerivedEmployee>();
    boards.forEach((board) => {
      board.onboardedUsers.forEach((u) => {
        if (!empMap.has(u.id)) {
          empMap.set(u.id, {
            id: u.id, name: u.name, initials: u.initials, email: u.email,
            role: u.role, department: board.name, boardId: board.id,
            tasksCompleted: 0, activeTasks: 0, totalTasks: 0, productivity: 0,
          });
        }
        const emp = empMap.get(u.id)!;
        board.columns.forEach((col) => {
          const t = col.title.toLowerCase().trim();
          col.tasks.forEach((task) => {
            if (task.assignee === u.initials) {
              emp.totalTasks++;
              if (DONE_TITLES.has(t)) emp.tasksCompleted++;
              else emp.activeTasks++;
            }
          });
        });
      });
    });
    empMap.forEach((emp) => {
      emp.productivity = emp.totalTasks > 0 ? Math.round((emp.tasksCompleted / emp.totalTasks) * 100) : 0;
    });
    return Array.from(empMap.values());
  }, [boards]);

  const departments = useMemo(() => {
    const depts = new Set(employees.map((e) => e.department));
    return ["All", ...Array.from(depts)];
  }, [employees]);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
    const matchDept = selectedDept === "All" || e.department === selectedDept;
    return matchSearch && matchDept;
  });

  const openModal = () => {
    setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("Employee");
    setNewBoardId(boards[0]?.id || ""); setError(""); setShowPwd(false);
    setShowModal(true);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim() || !newBoardId) {
      setError("All fields are required."); return;
    }
    setAdding(true); setError("");
    try {
      await addOnboardedUser(newBoardId, { name: newName.trim(), email: newEmail.trim(), password: newPassword, role: newRole });
      setShowModal(false);
    } catch {
      setError("Failed to add user. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmDelete) return;
    await removeOnboardedUser(confirmDelete.boardId, confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div style={{ padding: "24px 28px" }}>

      {/* ── Summary Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: <Users size={20} color="#6366f1" />, bg: "rgba(99,102,241,0.08)", value: employees.length, label: "Total Employees" },
          { icon: <UserCheck size={20} color="#10b981" />, bg: "rgba(16,185,129,0.08)", value: employees.reduce((s, e) => s + e.tasksCompleted, 0), label: "Tasks Completed" },
          { icon: <Briefcase size={20} color="#f59e0b" />, bg: "rgba(245,158,11,0.08)", value: new Set(employees.map(e => e.department)).size, label: "Departments" },
        ].map(({ icon, bg, value, label }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Controls Row ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {departments.map((d) => (
            <button key={d} onClick={() => setSelectedDept(d)}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: selectedDept === d ? "#4f46e5" : "#fff",
                color: selectedDept === d ? "#fff" : "#64748b",
                border: selectedDept === d ? "none" : "1px solid #e2e8f0",
              }}>
              {d}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", width: 220 }}>
            <Search size={15} color="#94a3b8" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..."
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", fontFamily: "inherit" }} />
          </div>
          {isAdmin && (
            <button onClick={openModal}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
                borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff",
                boxShadow: "0 4px 14px rgba(79,70,229,0.3)", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,70,229,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.3)"; }}>
              <Plus size={16} /> Add User
            </button>
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {employees.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 360, background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 48 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <UserPlus size={28} color="#6366f1" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No Employees Yet</h3>
          <p style={{ fontSize: 13, color: "#94a3b8", maxWidth: 340, textAlign: "center", lineHeight: 1.7, marginBottom: 20 }}>
            Onboard employees to boards and they will appear here with real-time stats.
          </p>
          {isAdmin && (
            <button onClick={openModal} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}>
              <Plus size={16} /> Add First Employee
            </button>
          )}
        </div>
      )}

      {/* ── No search results ── */}
      {employees.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8", fontSize: 14, background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9" }}>
          No employees match your search.
        </div>
      )}

      {/* ── Employee Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.map((emp) => {
          const color = getDeptColor(emp.department);
          return (
            <div key={emp.id}
              style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "22px", transition: "all 0.2s", position: "relative" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>

              {/* Remove button (Admin only) */}
              {isAdmin && (
                <button
                  onClick={() => setConfirmDelete({ id: emp.id, boardId: emp.boardId, name: emp.name })}
                  title="Remove employee"
                  style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#d1d5db", borderRadius: 6, padding: 4, display: "flex", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#d1d5db")}>
                  <Trash2 size={15} />
                </button>
              )}

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingRight: isAdmin ? 24 : 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${color}88)`, color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {emp.initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                    {emp.name}
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 2px rgba(16,185,129,0.2)" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{emp.role}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, background: `${color}15`, color, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {emp.department}
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { val: emp.tasksCompleted, label: "Completed" },
                  { val: emp.activeTasks, label: "Active" },
                ].map(({ val, label }) => (
                  <div key={label} style={{ textAlign: "center", padding: "10px 0", background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{val}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
                <div style={{ textAlign: "center", padding: "10px 0", background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: emp.productivity >= 90 ? "#10b981" : emp.productivity >= 50 ? "#f59e0b" : emp.totalTasks === 0 ? "#94a3b8" : "#ef4444" }}>
                    {emp.totalTasks === 0 ? "—" : `${emp.productivity}%`}
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Score</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Productivity</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                    {emp.totalTasks === 0 ? "No tasks" : `${emp.tasksCompleted}/${emp.totalTasks} done`}
                  </span>
                </div>
                <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${emp.productivity}%`, height: "100%", borderRadius: 3, transition: "width 0.8s ease",
                    background: emp.productivity >= 90 ? "linear-gradient(90deg,#10b981,#34d399)" : emp.productivity >= 50 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#ef4444,#f87171)",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────── ADD USER MODAL ─────────────── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 520, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", position: "relative" }}>
            {/* Close */}
            <button onClick={() => setShowModal(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", borderRadius: 8, padding: 4 }}>
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserPlus size={22} color="#6366f1" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Add New Employee</h2>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Create a login for a new team member</p>
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {/* Full Name */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Full Name *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Jane Smith"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                  onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
              </div>
              {/* Email */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Email *</label>
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@company.com" type="email"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                  onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"} />
              </div>
              {/* Password */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Password *</label>
                <div style={{ position: "relative" }}>
                  <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Set password" type={showPwd ? "text" : "password"}
                    style={{ width: "100%", padding: "10px 40px 10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                    onKeyDown={e => e.key === "Enter" && handleAdd()} />
                  <button onClick={() => setShowPwd(!showPwd)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {/* Role */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Role *</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as "Manager" | "Employee")}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
            </div>

            {/* Board */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Assign to Board *</label>
              <select value={newBoardId} onChange={e => setNewBoardId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box" }}>
                {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={handleAdd} disabled={adding}
                style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: adding ? "#a5b4fc" : "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: adding ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}>
                {adding ? "Adding…" : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── CONFIRM DELETE MODAL ─────────────── */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", width: "100%", maxWidth: 400, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Remove Employee?</h3>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
              <strong>{confirmDelete.name}</strong> will be removed and will no longer be able to log in.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#64748b" }}>
                Cancel
              </button>
              <button onClick={handleRemove}
                style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
