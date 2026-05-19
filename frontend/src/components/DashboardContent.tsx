"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban, CheckCircle2, Users, Clock, Flame, 
  TrendingUp, BarChart2, PieChart as PieChartIcon, LayoutDashboard, Activity
} from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useBoards } from "@/context/BoardContext";

/* ─── Animated Counter Hook ─── */
function useCounter(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];
const PRIORITY_COLORS: Record<string, string> = { Low: "#3b82f6", Medium: "#f59e0b", High: "#ec4899", Urgent: "#ef4444" };

export default function DashboardContent() {
  const { boards } = useBoards();

  const [selectedMonth, setSelectedMonth] = useState<string>("All Time");

  // Real-time calculations
  const totalProjects = boards.length;
  let activeTasks = 0;
  let urgentTasks = 0;
  const uniqueMembers = new Set<string>();

  const priorityDataMap: Record<string, number> = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
  const columnDataMap: Record<string, number> = {};

  const months = ["All Time", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  boards.forEach(b => {
    b.onboardedUsers.forEach(u => uniqueMembers.add(u.id));
    b.columns.forEach(col => {
      const isDone = col.title.toLowerCase().includes("done") || col.title.toLowerCase().includes("complete") || col.title.toLowerCase() === "closed";
      
      let tasksInColumn = 0;
      col.tasks.forEach(t => {
        // Apply Month Filter if not "All Time"
        if (selectedMonth !== "All Time") {
          let taskMonth = -1;
          if (t.startDate) taskMonth = new Date(t.startDate).getMonth();
          else if (t.endDate) taskMonth = new Date(t.endDate).getMonth();
          else if (b.createdAt) taskMonth = new Date(b.createdAt).getMonth(); // Fallback to board creation month
          
          if (taskMonth !== months.indexOf(selectedMonth) - 1) return;
        }

        tasksInColumn++;
        if (!isDone) activeTasks++;
        if (t.priority === "Urgent") urgentTasks++;
        if (priorityDataMap[t.priority] !== undefined) priorityDataMap[t.priority]++;
        else priorityDataMap[t.priority] = 1;
      });

      if (tasksInColumn > 0) {
        if (!columnDataMap[col.title]) columnDataMap[col.title] = 0;
        columnDataMap[col.title] += tasksInColumn;
      }
    });
  });

  const teamMembers = uniqueMembers.size;

  const priorityData = Object.keys(priorityDataMap).filter(k => priorityDataMap[k] > 0).map(k => ({ name: k, value: priorityDataMap[k] }));
  const columnData = Object.keys(columnDataMap).map(k => ({ name: k, tasks: columnDataMap[k] }));

  const p = useCounter(totalProjects);
  const t = useCounter(activeTasks);
  const m = useCounter(teamMembers);
  const u = useCounter(urgentTasks);
  const counterValues = [p, t, m, u];

  const stats = [
    { title: "Total Boards", value: totalProjects, icon: LayoutDashboard, color: "#4f46e5", bg: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)" },
    { title: "Active Tasks", value: activeTasks, icon: Activity, color: "#059669", bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" },
    { title: "Team Members", value: teamMembers, icon: Users, color: "#ea580c", bg: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)" },
    { title: "Urgent Tasks", value: urgentTasks, icon: Flame, color: "#e11d48", bg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)" },
  ];

  return (
    <div style={{ padding: "30px 40px", maxWidth: 1400, margin: "0 auto" }}>
      
      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
        borderRadius: 20, padding: "32px 40px", marginBottom: 32,
        color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center",
        boxShadow: "0 10px 30px rgba(79,70,229,0.2)"
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Workspace Overview</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)" }}>Here is what's happening across all your real-time Kanban boards today.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
              padding: "10px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, outline: "none",
              backdropFilter: "blur(10px)", cursor: "pointer", WebkitAppearance: "none", appearance: "none"
            }}
          >
            {months.map(m => (
              <option key={m} value={m} style={{ color: "#0f172a" }}>{m}</option>
            ))}
          </select>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
            <TrendingUp size={30} color="#fff" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} style={{ 
              background: "#fff", borderRadius: 20, padding: "24px", 
              border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", 
              transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s", 
              cursor: "pointer", position: "relative", overflow: "hidden"
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 35px rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.03)"; }}
            >
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: s.bg, borderRadius: "50%", opacity: 0.5, filter: "blur(20px)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)" }}>
                  <Icon size={26} color={s.color} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.title}</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>{counterValues[i]}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        
        {/* Task Status Bar Chart */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
            <div style={{ padding: 8, background: "#f1f5f9", borderRadius: 10 }}><BarChart2 size={20} color="#3b82f6" /></div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Tasks by Column Stage</h3>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Distribution of tasks across all your board columns</p>
            </div>
          </div>
          {columnData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={columnData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontSize: 13, fontWeight: 600 }}
                />
                <Bar dataKey="tasks" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {columnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
              No tasks found. Create a board to see data here.
            </div>
          )}
        </div>

        {/* Priority Pie Chart */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px", border: "1px solid #f1f5f9", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ padding: 8, background: "#fef2f2", borderRadius: 10 }}><PieChartIcon size={20} color="#e11d48" /></div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Task Priority</h3>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Breakdown of task urgency</p>
            </div>
          </div>
          {priorityData.length > 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={priorityData} cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                    paddingAngle={4} dataKey="value" stroke="none"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontSize: 13, fontWeight: 600 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 500 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>
              No tasks found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
