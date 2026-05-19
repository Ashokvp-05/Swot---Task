"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit3, Users, CheckCircle2, X, Palette } from "lucide-react";
import { useBoards, allTeamMembers } from "@/context/BoardContext";
import { useAuth } from "@/context/AuthContext";

const boardColors = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b",
  "#10b981", "#3b82f6", "#14b8a6", "#f97316", "#6b7280",
];

export default function BoardManagerView({ onOpenBoard }: { onOpenBoard: (id: string) => void }) {
  const { user } = useAuth();
  const { boards, addBoard, deleteBoard, updateBoard } = useBoards();
  const isAdmin = user?.role === "Admin";

  const [showCreate, setShowCreate] = useState(false);
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);

  // Filter boards by user's visibility
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

  const resetForm = () => {
    setName(""); setDescription(""); setColor("#6366f1"); setSelectedTeam([]);
    setShowCreate(false); setEditingBoard(null);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    addBoard({ name, description, color, team: selectedTeam });
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingBoard || !name.trim()) return;
    updateBoard(editingBoard, { name, description, color, team: selectedTeam });
    resetForm();
  };

  const openEdit = (board: typeof boards[0]) => {
    setEditingBoard(board.id);
    setName(board.name);
    setDescription(board.description);
    setColor(board.color);
    setSelectedTeam([...board.team]);
    setShowCreate(true);
  };

  const toggleMember = (initials: string) => {
    setSelectedTeam((prev) =>
      prev.includes(initials) ? prev.filter((i) => i !== initials) : [...prev, initials]
    );
  };

  const totalTasks = (board: typeof boards[0]) =>
    board.columns.reduce((acc, col) => acc + col.tasks.length, 0);

  const onboardedCount = (board: typeof boards[0]) => board.onboardedUsers.length;

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            {visibleBoards.length} board{visibleBoards.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowCreate(true); }}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
              borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#fff", boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,70,229,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(79,70,229,0.25)"; }}
          >
            <Plus size={16} /> New Board
          </button>
        )}
      </div>

      {/* Board Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {visibleBoards.map((board) => {
          const userCount = onboardedCount(board);
          return (
            <div
              key={board.id}
              style={{
                background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
                overflow: "hidden", transition: "all 0.2s", cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              {/* Color Banner */}
              <div style={{ height: 6, background: board.color }} />

              <div style={{ padding: "20px 22px" }}>
                {/* Title Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div onClick={() => onOpenBoard(board.id)} style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>
                      {board.name}
                    </h3>
                    <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{board.description}</p>
                  </div>
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(board); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#94a3b8", display: "flex", transition: "color 0.1s" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#6366f1"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 16, marginBottom: 16, marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: board.color }} />
                    {totalTasks(board)} tasks
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                    <Users size={13} />
                    {userCount} users
                  </div>
                </div>

                {/* Team Avatars */}
                <div style={{ display: "flex", alignItems: "center", gap: -4, marginBottom: 0 }}>
                  {board.team.slice(0, 5).map((initials, i) => (
                    <div
                      key={initials}
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: `hsl(${(i * 60 + 220) % 360}, 60%, 55%)`,
                        color: "#fff", fontSize: 9, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid #fff", marginLeft: i > 0 ? -6 : 0,
                        position: "relative", zIndex: 5 - i,
                      }}
                      title={allTeamMembers.find((m) => m.initials === initials)?.name || board.onboardedUsers.find((u) => u.initials === initials)?.name}
                    >
                      {initials}
                    </div>
                  ))}
                  {board.team.length > 5 && (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9",
                      color: "#64748b", fontSize: 9, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid #fff", marginLeft: -6,
                    }}>
                      +{board.team.length - 5}
                    </div>
                  )}
                </div>



                {/* Open Board Button */}
                <button
                  onClick={() => onOpenBoard(board.id)}
                  style={{
                    width: "100%", padding: "9px", borderRadius: 8, marginTop: 16,
                    border: "1px solid #e2e8f0", background: "#fafafa",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    color: "#374151", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  Open Board
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {visibleBoards.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
          <Users size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>No boards yet</p>
          <p style={{ fontSize: 13 }}>
            {isAdmin ? "Create your first board to get started." : "You haven't been assigned to any boards yet."}
          </p>
        </div>
      )}

      {/* ─── Create / Edit Modal ─── */}
      {showCreate && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
          onClick={resetForm}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: 520, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                {editingBoard ? "Edit Board" : "Create New Board"}
              </h3>
              <button onClick={resetForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            {/* Name */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Board Name</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering Sprint"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 18, transition: "border 0.15s" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#6366f1"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
            />

            {/* Description */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Description</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..."
              rows={2}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 18, resize: "none", transition: "border 0.15s" }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#6366f1"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
            />

            {/* Color Picker */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <Palette size={13} /> Board Color
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
              {boardColors.map((c) => (
                <button
                  key={c} onClick={() => setColor(c)}
                  style={{
                    width: 30, height: 30, borderRadius: 8, background: c, border: color === c ? "2.5px solid #0f172a" : "2px solid transparent",
                    cursor: "pointer", transition: "all 0.15s", transform: color === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {/* Team Members */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
              <Users size={13} /> Team Members
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
              {allTeamMembers.map((m) => {
                const selected = selectedTeam.includes(m.initials);
                return (
                  <button
                    key={m.initials} onClick={() => toggleMember(m.initials)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                      borderRadius: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      border: selected ? `1.5px solid ${color}` : "1.5px solid #e2e8f0",
                      background: selected ? `${color}08` : "#fff",
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: selected ? color : "#d1d5db",
                      transition: "background 0.15s",
                    }} />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{m.role}</div>
                    </div>
                    {selected && <CheckCircle2 size={16} color={color} style={{ marginLeft: "auto" }} />}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={resetForm} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#64748b" }}>
                Cancel
              </button>
              <button
                onClick={editingBoard ? handleUpdate : handleCreate}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
                }}
              >
                {editingBoard ? "Save Changes" : "Create Board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
