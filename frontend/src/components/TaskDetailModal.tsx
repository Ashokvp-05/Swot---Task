"use client";
import React, { useState } from "react";
import { X, Plus, Trash2, CheckSquare, Square, Calendar, User, ChevronDown, Columns } from "lucide-react";

type TodoItem = { id: string; text: string; done: boolean };
export type TaskDetail = {
  id: string; title: string; priority: string; tag: string; tagColor: string;
  assignee?: string; startDate?: string; endDate?: string; todos?: TodoItem[];
  columnId?: string;
};

export default function TaskDetailModal({ task, onClose, onUpdate, teamMembers, columns = [] }: {
  task: TaskDetail; onClose: () => void; onUpdate: (t: TaskDetail) => void;
  teamMembers: { initials: string; name: string }[];
  columns?: { id: string; title: string }[];
}) {
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee || "");
  const [startDate, setStartDate] = useState(task.startDate || "");
  const [endDate, setEndDate] = useState(task.endDate || "");
  const [columnId, setColumnId] = useState(task.columnId || "");
  const [todos, setTodos] = useState<TodoItem[]>(task.todos || []);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: `td${Date.now()}`, text: newTodo, done: false }]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTodo = (id: string) => setTodos(todos.filter(t => t.id !== id));
  const doneCount = todos.filter(t => t.done).length;

  const save = () => {
    onUpdate({ ...task, title, assignee, startDate, endDate, todos, columnId });
    onClose();
  };

  const fieldLabel: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: "#4b5563", display: "flex",
    alignItems: "center", gap: 5, marginBottom: 5, letterSpacing: "0.03em",
    textTransform: "uppercase",
  };

  const fieldInput: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 6,
    border: "1px solid #e5e7eb", fontSize: 13, fontWeight: 400,
    fontFamily: "inherit", color: "#111827", background: "#fafafa",
    outline: "none", transition: "border-color 0.15s",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 12, width: 720, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)" }}>

        {/* ─── Top Bar ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <div />
          <button onClick={onClose} style={{ background: "none", border: "none", borderRadius: 6, padding: 4, cursor: "pointer", display: "flex", color: "#9ca3af", transition: "color 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#374151"}
            onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
          ><X size={16} strokeWidth={1.5} /></button>
        </div>

        {/* ─── Body ─── */}
        <div style={{ padding: "20px 24px", flex: 1, overflow: "auto" }} className="custom-scrollbar">

          {/* Title */}
          <textarea 
            value={title} 
            onChange={e => { setTitle(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} 
            rows={1}
            ref={el => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
            style={{ 
              width: "100%", fontSize: 22, fontWeight: 500, 
              border: "none", outline: "none", color: "#0f172a", 
              fontFamily: "inherit", marginBottom: 24, padding: "2px 0", 
              borderBottom: "1px solid transparent", resize: "none",
              overflow: "hidden", lineHeight: 1.5, letterSpacing: "-0.02em",
              background: "transparent",
            }}
            onFocus={e => e.currentTarget.style.borderBottomColor = "#d1d5db"}
            onBlur={e => e.currentTarget.style.borderBottomColor = "transparent"} 
          />

          {/* ─── Properties Grid ─── */}
          <div style={{ display: "grid", gridTemplateColumns: columns.length > 0 ? "1fr 1fr 1fr 1fr" : "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
            {columns.length > 0 && (
              <div>
                <label style={fieldLabel}><Columns size={11} strokeWidth={1.5} />Status</label>
                <div style={{ position: "relative" }}>
                  <select value={columnId} onChange={e => setColumnId(e.target.value)} 
                    style={{ ...fieldInput, cursor: "pointer", appearance: "none" as const, paddingRight: 28 }}
                    onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
                  >
                    {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
                </div>
              </div>
            )}
            <div>
              <label style={fieldLabel}><User size={11} strokeWidth={1.5} />Assignee</label>
              <div style={{ position: "relative" }}>
                <select value={assignee} onChange={e => setAssignee(e.target.value)} 
                  style={{ ...fieldInput, cursor: "pointer", appearance: "none" as const, paddingRight: 28 }}
                  onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                  onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(m => <option key={m.initials} value={m.initials}>{m.name}</option>)}
                </select>
                <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              </div>
            </div>
            <div>
              <label style={fieldLabel}><Calendar size={11} strokeWidth={1.5} />Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
                style={fieldInput}
                onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
              />
            </div>
            <div>
              <label style={fieldLabel}><Calendar size={11} strokeWidth={1.5} />End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} 
                style={fieldInput}
                onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"}
              />
            </div>
          </div>

          {/* ─── Checklist ─── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", letterSpacing: "-0.01em" }}>Checklist</span>
              {todos.length > 0 && <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400 }}>{doneCount}/{todos.length}</span>}
            </div>

            {todos.length > 0 && (
              <div style={{ width: "100%", height: 3, background: "#f3f4f6", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ width: `${todos.length ? (doneCount / todos.length) * 100 : 0}%`, height: "100%", background: "#10b981", borderRadius: 2, transition: "width 0.3s ease" }} />
              </div>
            )}

            {todos.map(todo => (
              <div key={todo.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #f9fafb" }}>
                <button onClick={() => toggleTodo(todo.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, flexShrink: 0 }}>
                  {todo.done 
                    ? <CheckSquare size={16} color="#10b981" strokeWidth={1.5} /> 
                    : <Square size={16} color="#d1d5db" strokeWidth={1.5} />
                  }
                </button>
                <span style={{ 
                  flex: 1, fontSize: 13, fontWeight: 400, letterSpacing: "-0.01em",
                  color: todo.done ? "#9ca3af" : "#374151", 
                  textDecoration: todo.done ? "line-through" : "none", 
                  transition: "all 0.15s" 
                }}>{todo.text}</span>
                <button onClick={() => removeTodo(todo.id)} 
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2, opacity: 0, transition: "opacity 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                >
                  <Trash2 size={13} color="#ef4444" strokeWidth={1.5} />
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="Add item…"
                onKeyDown={e => e.key === "Enter" && addTodo()}
                style={{ ...fieldInput, flex: 1 }}
                onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={e => e.currentTarget.style.borderColor = "#e5e7eb"} 
              />
              <button onClick={addTodo} style={{ 
                display: "flex", alignItems: "center", gap: 3, padding: "7px 12px", 
                borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", 
                cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#6b7280", 
                fontFamily: "inherit", transition: "all 0.1s" 
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fff"; }}
              >
                <Plus size={13} strokeWidth={1.5} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 20px", borderTop: "1px solid #f3f4f6" }}>
          <button onClick={onClose} style={{ 
            padding: "7px 16px", borderRadius: 6, border: "1px solid #e5e7eb", 
            background: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", 
            fontFamily: "inherit", color: "#6b7280", transition: "all 0.1s" 
          }}>Cancel</button>
          <button onClick={save} style={{ 
            padding: "7px 16px", borderRadius: 6, border: "none", 
            background: "#111827", color: "#fff", fontSize: 12, fontWeight: 500, 
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s" 
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}
