"use client";

import React, { useState, useRef, useCallback } from "react";
import { Plus, Calendar, ChevronLeft, ChevronRight, ArrowLeft, LogOut, Shield, User, Mail, Briefcase, MapPin, X } from "lucide-react";
import TaskDetailModal, { TaskDetail } from "./TaskDetailModal";
import OnboardingPanel from "./OnboardingPanel";
import { useBoards, memberNameMap, allTeamMembers, BoardTask, BoardColumn } from "@/context/BoardContext";
import { useAuth, Role } from "@/context/AuthContext";

type Task = TaskDetail;

const priorityConfig: Record<string, { color: string; label: string }> = {
  Urgent: { color: "#ef4444", label: "Urgent" },
  High:   { color: "#f97316", label: "High" },
  Medium: { color: "#eab308", label: "Medium" },
  Low:    { color: "#94a3b8", label: "Low" },
};



function formatDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function KanbanView({ boardId, onBack }: { boardId: string; onBack: () => void }) {
  const { user, logout } = useAuth();
  const { getBoardById, updateBoardColumns, addTask, updateTask } = useBoards();
  const board = getBoardById(boardId);

  const isEmployee = user?.role === "Employee";

  const [draggedTask, setDraggedTask] = useState<{ taskId: string; fromCol: string } | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [landedTaskId, setLandedTaskId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState(board?.columns[0]?.id || "");
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterMonth, setFilterMonth] = useState<Date | null>(null);
  const [showProfileView, setShowProfileView] = useState(false);
  const dragCloneRef = useRef<HTMLElement | null>(null);

  // --- Drag Handlers ---
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, taskId: string, fromCol: string) => {
    setDraggedTask({ taskId, fromCol });
    setDraggingTaskId(taskId);
    const el = e.currentTarget as HTMLElement;
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.transform = "rotate(3deg) scale(1.03)";
    clone.style.boxShadow = "0 16px 40px rgba(0,0,0,0.15)";
    clone.style.borderRadius = "8px";
    clone.style.border = "1px solid #d1d5db";
    clone.style.background = "#ffffff";
    clone.style.width = el.offsetWidth + "px";
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.zIndex = "99999";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);
    dragCloneRef.current = clone;
    e.dataTransfer.setDragImage(clone, el.offsetWidth / 2, 24);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingTaskId(null);
    setDraggedTask(null);
    if (dragCloneRef.current) {
      document.body.removeChild(dragCloneRef.current);
      dragCloneRef.current = null;
    }
    document.querySelectorAll(".kanban-column-dragover").forEach((el) => {
      el.classList.remove("kanban-column-dragover");
    });
  }, []);

  if (!board) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 64px)", color: "#94a3b8" }}>
        <p>Board not found</p>
      </div>
    );
  }

  // Build complete team list from board.team + onboardedUsers (deduplicated)
  const allInitials = new Set<string>(board.team);
  board.onboardedUsers?.forEach(u => allInitials.add(u.initials));
  const fullTeam = Array.from(allInitials);

  const boardNameMap: Record<string, string> = {};
  fullTeam.forEach((initials) => {
    const onboardedMatch = board.onboardedUsers?.find(u => u.initials === initials);
    boardNameMap[initials] = onboardedMatch ? onboardedMatch.name : (memberNameMap[initials] || initials);
  });

  const columns = board.columns;

  const setColumns = (updater: BoardColumn[] | ((prev: BoardColumn[]) => BoardColumn[])) => {
    if (typeof updater === "function") {
      updateBoardColumns(boardId, updater(board.columns));
    } else {
      updateBoardColumns(boardId, updater);
    }
  };

  const handleTaskUpdate = (updated: Task) => {
    updateTask(updated.id, updated);
  };



  const handleDrop = (targetColId: string) => {
    if (!draggedTask || draggedTask.fromCol === targetColId) {
      handleDragEnd();
      return;
    }
    const droppedTaskId = draggedTask.taskId;
    setColumns((prev) => {
      const sourceCol = prev.find((c) => c.id === draggedTask.fromCol);
      const task = sourceCol?.tasks.find((t) => t.id === draggedTask.taskId);
      if (!task) return prev;
      return prev.map((col) => {
        if (col.id === draggedTask.fromCol) return { ...col, tasks: col.tasks.filter((t) => t.id !== draggedTask.taskId) };
        if (col.id === targetColId) return { ...col, tasks: [task, ...col.tasks] };
        return col;
      });
    });
    setLandedTaskId(droppedTaskId);
    setTimeout(() => setLandedTaskId(null), 400);
    handleDragEnd();
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    addTask(boardId, {
      title: newTitle,
      priority: "Medium",
      assignee: newAssignee || fullTeam[0] || "",
      startDate: newStartDate,
      endDate: newDueDate,
      columnId: targetColumnId,
    });
    setNewTitle(""); setNewStartDate(""); setNewDueDate(""); setNewAssignee(""); setShowModal(false);
  };

  const filterTask = (t: BoardTask, colId: string) => {
    if (selectedAssignee && t.assignee !== selectedAssignee) return false;
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.toDateString());
      const taskEnd = t.endDate ? new Date(t.endDate) : null;
      const taskStart = t.startDate ? new Date(t.startDate) : null;
      if (dateFilter === "today") {
        const todayEnd = new Date(today); todayEnd.setHours(23,59,59,999);
        if (!taskStart && !taskEnd) return false;
        if (taskStart && taskStart > todayEnd) return false;
        if (taskEnd && taskEnd < today) return false;
      } else if (dateFilter === "week") {
        const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
        if (!taskStart && !taskEnd) return false;
        if (taskStart && taskStart > weekEnd) return false;
        if (taskEnd && taskEnd < today) return false;
      } else if (dateFilter === "overdue") {
        if (!taskEnd || taskEnd >= today) return false;
        const col = board?.columns.find(c => c.id === colId);
        if (col && (col.title.toLowerCase().includes("done") || col.title.toLowerCase().includes("complete") || col.title.toLowerCase() === "closed")) return false;
      } else if (dateFilter === "upcoming") {
        if (!taskStart || taskStart <= today) return false;
      }
    }
    if (filterMonth) {
      const monthStart = new Date(filterMonth.getFullYear(), filterMonth.getMonth(), 1);
      const monthEnd = new Date(filterMonth.getFullYear(), filterMonth.getMonth() + 1, 0, 23, 59, 59);
      const taskStart = t.startDate ? new Date(t.startDate) : null;
      const taskEnd = t.endDate ? new Date(t.endDate) : null;
      if (!taskStart && !taskEnd) return false;
      if (taskStart && taskStart > monthEnd) return false;
      if (taskEnd && taskEnd < monthStart) return false;
    }
    return true;
  };

  const totalTasks = columns.reduce((a, c) => a + c.tasks.length, 0);

  const dateFilters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "overdue", label: "Overdue" },
    { id: "upcoming", label: "Upcoming" },
  ];

  const s = {
    filterBtn: (active: boolean): React.CSSProperties => ({
      padding: "5px 12px",
      borderRadius: 6,
      border: "none",
      fontSize: 12,
      fontWeight: active ? 600 : 500,
      fontFamily: "inherit",
      cursor: "pointer",
      background: active ? "#1e293b" : "transparent",
      color: active ? "#fff" : "#64748b",
      transition: "all 0.15s ease",
      letterSpacing: "-0.01em",
    }),
  };

  return (
    <div style={{ 
      padding: isEmployee ? "32px 32px" : "20px 24px", 
      height: isEmployee ? "100vh" : "calc(100vh - 64px)", 
      display: "flex", 
      flexDirection: "column", 
      overflow: "hidden" 
    }}>
      {/* ─── Board Header ─── */}
      {user?.role !== "Employee" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexShrink: 0 }}>
          <button
            onClick={onBack}
            style={{
              background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px",
              cursor: "pointer", display: "flex", alignItems: "center", color: "#6b7280",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.color = "#374151"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ width: 10, height: 10, borderRadius: 4, background: board.color, flexShrink: 0 }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            {board.name}
          </h2>
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{board.description}</span>
        </div>
      )}

      {/* ─── Onboarding Panel ─── */}
      <OnboardingPanel boardId={boardId} />

      {/* ─── Employee Header (Headless Mode) ─── */}
      {isEmployee && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Brand Logo Mark */}
            <img 
              src="/rudratic-logo.png" 
              alt="Rudratic Logo" 
              style={{ height: 84, width: "auto", objectFit: "contain", mixBlendMode: "multiply", filter: "contrast(1.1)" }} 
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h1 style={{ 
                fontSize: 32, 
                fontWeight: 900, 
                margin: 0, 
                letterSpacing: "0.05em", 
                lineHeight: 1, 
                textTransform: "uppercase",
                display: "inline-block",
                background: "linear-gradient(135deg, #7e22ce 0%, #be185d 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Rudratic
              </h1>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.25em", marginTop: 4 }}>
                Task Board
              </span>
            </div>
          </div>

          {/* Profile Dropdown for Employee Header */}
          {user && (
            <div style={{ position: "relative", transform: "translateY(-12px)" }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  background: "transparent", border: "none", padding: 0, cursor: "pointer",
                  display: "flex", alignItems: "center", textAlign: "left",
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: "linear-gradient(135deg, #7e22ce 0%, #be185d 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "#fff",
                  boxShadow: "0 4px 10px rgba(126, 34, 206, 0.25)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}>
                  {user.initials}
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 90 }}
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div style={{
                    position: "absolute", top: "100%", right: 0, marginTop: 12,
                    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: 8, zIndex: 100,
                    minWidth: 180,
                  }}>
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: 0 }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{user.username}</p>
                    </div>
                    <button
                      onClick={() => { setShowProfileView(true); setShowProfileMenu(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                        background: "transparent", border: "none", borderRadius: 6,
                        color: "#1e293b", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      onClick={logout}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                        background: "transparent", border: "none", borderRadius: 6,
                        color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Toolbar ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Member Filter */}
          <div style={{ position: "relative" }}>
            <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)}
              style={{
                padding: "7px 28px 7px 10px", borderRadius: 6,
                border: "1px solid #e5e7eb", fontSize: 12, fontWeight: 500,
                fontFamily: "inherit", background: "#fff", outline: "none",
                color: "#374151", cursor: "pointer", appearance: "none",
                minWidth: 140, letterSpacing: "-0.01em"
              }}
            >
              <option value="">All Members</option>
              {fullTeam.map((initials) => (
                <option key={initials} value={initials}>{boardNameMap[initials]}</option>
              ))}
            </select>
            <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />

          {/* Date Filter Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
            {dateFilters.map((f) => (
              <button key={f.id} onClick={() => setDateFilter(f.id)} style={s.filterBtn(dateFilter === f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af", letterSpacing: "-0.01em" }}>
            {totalTasks} tasks
          </span>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "#e5e7eb" }} />

          {/* Month Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button
              onClick={() => {
                if (!filterMonth) { setFilterMonth(new Date()); return; }
                const prev = new Date(filterMonth); prev.setMonth(prev.getMonth() - 1); setFilterMonth(prev);
              }}
              style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#6b7280", transition: "all 0.1s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "none"; }}
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setFilterMonth(null)}
              style={{
                padding: "5px 14px", borderRadius: 6, border: "1px solid #e5e7eb",
                fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
                background: filterMonth ? "#1e293b" : "#fff",
                color: filterMonth ? "#fff" : "#374151",
                minWidth: 110, textAlign: "center",
                transition: "all 0.15s", letterSpacing: "-0.01em",
              }}
            >
              {filterMonth
                ? filterMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "All Months"
              }
            </button>
            <button
              onClick={() => {
                if (!filterMonth) { setFilterMonth(new Date()); return; }
                const next = new Date(filterMonth); next.setMonth(next.getMonth() + 1); setFilterMonth(next);
              }}
              style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center", color: "#6b7280", transition: "all 0.1s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "none"; }}
            >
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Board ─── */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: 12, height: "100%" }}>
        {columns.map((col) => {
          const filtered = col.tasks.filter(t => filterTask(t, col.id));
          return (
          <div key={col.id}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; e.currentTarget.classList.add("kanban-column-dragover"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("kanban-column-dragover"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("kanban-column-dragover"); handleDrop(col.id); }}
            style={{
              background: "#fafafa",
              borderRadius: 10,
              display: "flex",
              flexDirection: "column",
              border: "1px solid #f0f0f0",
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}>
            {/* Column Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: col.color }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>{col.title}</span>
                <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600 }}>{filtered.length}</span>
              </div>
              <button
                onClick={() => { setTargetColumnId(col.id); setShowModal(true); }}
                style={{ background: "none", border: "none", borderRadius: 4, padding: 2, cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", transition: "color 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#374151"}
                onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Task Cards */}
            <div className="custom-scrollbar" style={{
              display: "flex", flexDirection: "column", gap: 6,
              padding: "0 8px 12px",
              flex: 1, overflowY: "auto", minHeight: 0
            }}>
              {filtered.map((task) => (
                <div key={task.id} draggable
                  className={`kanban-card${draggingTaskId === task.id ? " kanban-card-dragging" : ""}${landedTaskId === task.id ? " kanban-card-landed" : ""}`}
                  onClick={() => setSelectedTask(task as Task)}
                  onDragStart={(e) => handleDragStart(e, task.id, col.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    background: "#fff", borderRadius: 8, padding: "10px 12px",
                    border: "1px solid #e5e7eb", cursor: "grab",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)", flexShrink: 0,
                  }}
                >
                  {/* Title Row */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                      background: priorityConfig[task.priority]?.color || "#94a3b8",
                    }} title={task.priority} />
                    <p style={{
                      fontSize: 13, fontWeight: 500, color: "#111827", lineHeight: 1.4,
                      letterSpacing: "-0.01em",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden", overflowWrap: "anywhere", wordBreak: "break-word",
                      margin: 0,
                    }} title={task.title}>{task.title}</p>
                  </div>

                  {/* Meta Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {/* Assignee */}
                      {task.assignee && (() => {
                        const colors: Record<string, string> = {
                          JD: "#374151", SK: "#1e3a5f", MJ: "#1e293b",
                          AW: "#3730a3", LR: "#831843", DK: "#164e63",
                        };
                        return (
                          <div style={{
                            width: 20, height: 20, borderRadius: "50%",
                            background: colors[task.assignee] || "#6b7280",
                            color: "#fff", fontSize: 8, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            letterSpacing: "0.02em",
                          }}>{task.assignee}</div>
                        );
                      })()}
                    </div>

                    {/* Date */}
                    {(task.startDate || task.endDate) && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>
                        <Calendar size={10} strokeWidth={2} />
                        <span>
                          {task.startDate && task.endDate 
                            ? `${formatDate(task.startDate)} - ${formatDate(task.endDate)}`
                            : task.startDate ? `Starts: ${formatDate(task.startDate)}`
                            : `Due: ${formatDate(task.endDate)}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
        })}
        </div>
      </div>

      {/* ─── Task Detail Modal ─── */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleTaskUpdate} 
          teamMembers={fullTeam.map(initials => ({ initials, name: boardNameMap[initials] }))}
          columns={board.columns.map(c => ({ id: c.id, title: c.title }))}
        />
      )}

      {/* ─── Create Modal ─── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 32, width: 550, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: "#111827", letterSpacing: "-0.02em" }}>New Task</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</label>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What needs to be done?"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 15, fontFamily: "inherit", outline: "none", color: "#0f172a", boxSizing: "border-box" }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Assignee</label>
                <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 15, fontFamily: "inherit", background: "#fff", color: "#0f172a", outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="">Select member</option>
                  {fullTeam.map((initials) => <option key={initials} value={initials}>{boardNameMap[initials]}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Start Date</label>
                <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} 
                  style={{ width: "100%", padding: "11px 16px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 15, fontFamily: "inherit", background: "#fff", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Due Date</label>
                <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} 
                  style={{ width: "100%", padding: "11px 16px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 15, fontFamily: "inherit", background: "#fff", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} 
                style={{ padding: "12px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#64748b", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                Cancel
              </button>
              <button onClick={handleAddTask} 
                style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Profile Modal ─── */}
      {showProfileView && user && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "#fff", width: "100%", maxWidth: 440, borderRadius: 20,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden",
            position: "relative",
          }}>
            {/* Header / Banner */}
            <div style={{ height: 100, background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }} />
            
            {/* Close Button */}
            <button 
              onClick={() => setShowProfileView(false)}
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
              <div style={{
                width: 80, height: 80, borderRadius: 24, background: "#fff",
                margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", border: "4px solid #fff",
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: 18,
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 800, color: "#fff",
                }}>
                  {user.initials}
                </div>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{user.name}</h2>
              <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500, marginBottom: 24 }}>{user.role} • {user.department.replace(/sprint/i, "Team").trim()}</p>

              <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Email Address</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{user.username}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", margin: 0 }}>Department</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>{user.department.replace(/sprint/i, "Team").trim()}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowProfileView(false)}
                style={{
                  width: "100%", marginTop: 32, padding: "12px", borderRadius: 12,
                  background: "#1e293b", color: "#fff", border: "none",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#0f172a"}
                onMouseLeave={e => e.currentTarget.style.background = "#1e293b"}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
