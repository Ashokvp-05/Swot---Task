"use client";
import React, { useState } from "react";
import { X, Plus, Trash2, CheckSquare, Square, Calendar, User, ChevronDown, Columns, AlignLeft, Link, ExternalLink } from "lucide-react";

type TodoItem = { id: string; text: string; done: boolean; link?: string };
export type TaskDetail = {
  id: string; title: string; description?: string; priority: string; tag: string; tagColor: string;
  assignee?: string; startDate?: string; endDate?: string; link?: string; todos?: TodoItem[];
  columnId?: string; updatedAt?: string;
};

export default function TaskDetailModal({ task, onClose, onUpdate, onDelete, teamMembers, columns = [] }: {
  task: TaskDetail; onClose: () => void; onUpdate: (t: TaskDetail) => void;
  onDelete?: (taskId: string) => void;
  teamMembers: { initials: string; name: string }[];
  columns?: { id: string; title: string }[];
}) {
  // Split title on init
  const hasNewline = task.title.includes("\n");
  const hasDelimiter = task.title.includes(">>");
  
  let initialTitle = task.title;
  let initialSub = "";
  
  if (hasNewline) {
    const parts = task.title.split("\n");
    initialTitle = parts[0];
    initialSub = parts.slice(1).join("\n");
  } else if (hasDelimiter) {
    const parts = task.title.split(/\s*>>\s*/);
    initialTitle = parts[0];
    initialSub = parts.slice(1).join("\n");
  }

  const [title, setTitle] = useState(initialTitle);
  const [subheading, setSubheading] = useState(initialSub);
  const [description, setDescription] = useState(task.description || "");
  const [assignee, setAssignee] = useState(task.assignee || "");
  const [startDate, setStartDate] = useState(task.startDate || "");
  const [endDate, setEndDate] = useState(task.endDate || "");
  const [link, setLink] = useState(task.link || "");
  const [columnId, setColumnId] = useState(task.columnId || "");
  const [todos, setTodos] = useState<TodoItem[]>(task.todos || []);
  const [newTodo, setNewTodo] = useState("");
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: `td${Date.now()}`, text: newTodo, done: false, link: "" }]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTodo = (id: string) => setTodos(todos.filter(t => t.id !== id));
  const updateTodoLink = (id: string, link: string) => setTodos(todos.map(t => t.id === id ? { ...t, link } : t));
  const doneCount = todos.filter(t => t.done).length;

  const save = () => {
    const combinedTitle = subheading.trim() ? `${title.trim()}\n${subheading.trim()}` : title.trim();
    onUpdate({ ...task, title: combinedTitle, description, assignee, startDate, endDate, link, todos, columnId });
    onClose();
  };

  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

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
      <div 
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()} 
        style={{ 
          background: "#fff", borderRadius: 12, width: "92%", maxWidth: 1000, maxHeight: "90vh", 
          display: "flex", flexDirection: "column", overflow: "hidden", 
          boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
          outline: "none"
        }}
      >

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

          {/* Title - borderless & large */}
          <textarea 
            value={title} 
            onChange={e => { setTitle(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} 
            rows={1}
            placeholder="Heading (e.g. Settings page)"
            ref={el => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
            style={{ 
              width: "100%", fontSize: 26, fontWeight: 700, 
              border: "none", outline: "none", color: "#0f172a", 
              fontFamily: "inherit", marginBottom: 4, padding: "2px 0", 
              resize: "none", overflow: "hidden", lineHeight: 1.4, 
              letterSpacing: "-0.02em", background: "transparent",
            }}
          />



          {/* Subheading - borderless & smaller */}
          <textarea 
            value={subheading} 
            onChange={e => { setSubheading(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} 
            rows={1}
            placeholder="Add subheading or details here..."
            ref={el => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
            style={{ 
              width: "100%", fontSize: 17, fontWeight: 400, 
              border: "none", outline: "none", color: "#334155", 
              fontFamily: "inherit", marginBottom: 20, padding: "2px 0", 
              resize: "none", overflow: "hidden", lineHeight: 1.6, 
              background: "transparent",
            }}
          />

          {/* ─── Demo Link Section ─── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexWrap: "wrap", minHeight: 32 }}>
            {link ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Link size={14} color="#7e22ce" />
                  <a 
                    href={link.startsWith("http") ? link : `https://${link}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ fontSize: 14, fontWeight: 600, color: "#7e22ce", textDecoration: "none" }}
                  >
                    {link}
                  </a>
                </div>
                
                <a 
                  href={link.startsWith("http") ? link : `https://${link}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#7e22ce",
                    backgroundColor: "#f3e8ff",
                    border: "1px solid #e9d5ff",
                    borderRadius: 6,
                    padding: "6px 14px",
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#e9d5ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#f3e8ff"; }}
                >
                  <ExternalLink size={12} />
                  Open Demo
                </a>

                {/* Edit & Delete Buttons */}
                <button
                  onClick={() => {
                    const newL = prompt("Edit Demo Link:", link);
                    if (newL !== null) setLink(newL);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#9ca3af", padding: "4px 8px", transition: "color 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#4b5563"}
                  onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
                >
                  Edit
                </button>
                <button
                  onClick={() => setLink("")}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#ef4444", padding: "4px 8px", transition: "opacity 0.1s", opacity: 0.6 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <Link size={14} color="#9ca3af" />
                <input 
                  type="text" 
                  placeholder="Add a Demo or Project link (e.g. https://hrms-demo.rudratic.com)..." 
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  style={{
                    flex: 1,
                    maxWidth: 450,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    fontSize: 13,
                    outline: "none",
                    color: "#374151",
                    background: "#fafafa",
                    fontFamily: "inherit",
                    transition: "border-color 0.15s"
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fafafa"; }}
                />
              </div>
            )}
          </div>

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

          {/* ─── Completed Work ─── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "0.03em", textTransform: "uppercase" }}>Completed Work</span>
              {todos.length > 0 && (
                <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>
                  {doneCount} of {todos.length} items ({Math.round((doneCount / todos.length) * 100)}%)
                </span>
              )}
            </div>

            {todos.length > 0 && (
              <div style={{ width: "100%", height: 6, background: "#f3f4f6", borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ width: `${(doneCount / todos.length) * 100}%`, height: "100%", background: "#10b981", borderRadius: 4, transition: "width 0.3s ease" }} />
              </div>
            )}

            {todos.map(todo => (
              <div key={todo.id} style={{ display: "flex", flexDirection: "column", padding: "7px 0", borderBottom: "1px solid #f9fafb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}>
                    {todo.text}
                    {todo.link && (
                      <a 
                        href={todo.link.startsWith("http") ? todo.link : `https://${todo.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#2563eb",
                          textDecoration: "none",
                          background: "#eff6ff",
                          padding: "2px 8px",
                          borderRadius: 4,
                          transition: "all 0.1s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={10} /> Link
                      </a>
                    )}
                  </span>
                  
                  <button onClick={() => setEditingLinkId(editingLinkId === todo.id ? null : todo.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2, opacity: todo.link ? 0.8 : 0.4, transition: "opacity 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={e => e.currentTarget.style.opacity = todo.link ? "0.8" : "0.4"}
                  >
                    <Link size={13} color="#4b5563" strokeWidth={1.5} />
                  </button>

                  <button onClick={() => removeTodo(todo.id)} 
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2, opacity: 0.4, transition: "opacity 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
                  >
                    <Trash2 size={13} color="#ef4444" strokeWidth={1.5} />
                  </button>
                </div>

                {editingLinkId === todo.id && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, paddingLeft: 24 }}>
                    <input 
                      value={todo.link || ""} 
                      onChange={e => updateTodoLink(todo.id, e.target.value)}
                      placeholder="Paste work link (e.g. Figma/Google Docs)..."
                      style={{
                        flex: 1,
                        padding: "5px 8px",
                        fontSize: 12,
                        borderRadius: 4,
                        border: "1px solid #d1d5db",
                        outline: "none",
                        fontFamily: "inherit",
                        background: "#fdfdfd"
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                      onBlur={e => e.currentTarget.style.borderColor = "#d1d5db"}
                      onKeyDown={e => e.key === "Enter" && setEditingLinkId(null)}
                    />
                    <button 
                      onClick={() => setEditingLinkId(null)}
                      style={{
                        padding: "5px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#fff",
                        background: "#1e293b",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                    >
                      Save Link
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <input value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="Add completed work…"
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
                <Plus size={13} strokeWidth={1.5} /> Completed Work
              </button>
            </div>
          </div>

          {/* ─── Description ─── */}
          <div style={{ marginBottom: 28 }}>
            <label style={fieldLabel}>
              <AlignLeft size={11} strokeWidth={1.5} /> Description
            </label>
            <textarea
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              placeholder="Add a description to evaluate or review this task..."
              rows={6}
              ref={el => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }
              }}
              style={{
                width: "100%",
                minHeight: 160,
                padding: "12px 14px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                fontWeight: 400,
                fontFamily: "inherit",
                color: "#1f2937",
                background: "#fafafa",
                outline: "none",
                transition: "all 0.15s ease",
                resize: "none",
                lineHeight: 1.6,
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.boxShadow = "0 0 0 1px #6366f1";
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.background = "#fafafa";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "1px solid #f3f4f6" }}>
          {onDelete ? (
            <button 
              onClick={() => onDelete(task.id)} 
              style={{ 
                display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 6, 
                border: "1px solid #fecaca", background: "#fef2f2", fontSize: 12, fontWeight: 500, 
                color: "#ef4444", cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s" 
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fecaca"; }}
            >
              <Trash2 size={13} /> Delete Task
            </button>
          ) : <div />}
          <div style={{ display: "flex", gap: 8 }}>
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
    </div>
  );
}
