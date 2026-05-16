"use client";

import React, { useState, useEffect } from "react";
import {
  FolderKanban, CheckCircle2, Users, Clock, ArrowUpRight, ArrowDownRight,
  Plus, AlertCircle, Timer, Flame, Star, TrendingUp,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Animated Counter Hook ─── */
function useCounter(target: number, duration = 1200) {
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

/* ─── Chart Data ─── */
const chartData = [
  { day: "Mon", tasks: 12, completed: 8 },
  { day: "Tue", tasks: 19, completed: 14 },
  { day: "Wed", tasks: 15, completed: 12 },
  { day: "Thu", tasks: 22, completed: 18 },
  { day: "Fri", tasks: 28, completed: 21 },
  { day: "Sat", tasks: 14, completed: 11 },
  { day: "Sun", tasks: 9, completed: 7 },
];

/* ─── Stats ─── */
const stats = [
  { title: "Total Projects", value: 24, suffix: "", change: "+12%", up: true, icon: FolderKanban, color: "#6366f1", bg: "#eef2ff" },
  { title: "Active Tasks", value: 128, suffix: "", change: "+8%", up: true, icon: Clock, color: "#f59e0b", bg: "#fffbeb" },
  { title: "Team Members", value: 36, suffix: "", change: "+3", up: true, icon: Users, color: "#10b981", bg: "#ecfdf5" },
  { title: "Urgent Tasks", value: 0, suffix: "", change: "-5%", up: false, icon: Flame, color: "#ef4444", bg: "#fef2f2" },
];

/* ─── Kanban Data ─── */
type Task = { id: string; title: string; priority: string; tag: string; tagColor: string };
type Column = { id: string; title: string; color: string; tasks: Task[] };

const initialColumns: Column[] = [
  { id: "todo", title: "To Do", color: "#94a3b8", tasks: [
    { id: "t1", title: "Design landing page mockup", priority: "High", tag: "Design", tagColor: "#8b5cf6" },
    { id: "t2", title: "Setup CI/CD pipeline", priority: "Medium", tag: "DevOps", tagColor: "#f59e0b" },
  ]},
  { id: "progress", title: "Ongoing", color: "#3b82f6", tasks: [
    { id: "t3", title: "Implement user auth API", priority: "High", tag: "Backend", tagColor: "#10b981" },
    { id: "t4", title: "Create Kanban drag & drop", priority: "Urgent", tag: "Frontend", tagColor: "#6366f1" },
  ]},
  { id: "review", title: "In Review", color: "#f59e0b", tasks: [
    { id: "t5", title: "Sprint planning module", priority: "Medium", tag: "Feature", tagColor: "#ec4899" },
  ]},
  { id: "done", title: "Completed", color: "#10b981", tasks: [
    { id: "t6", title: "Project setup & config", priority: "Low", tag: "Setup", tagColor: "#64748b" },
    { id: "t7", title: "Authentication UI", priority: "High", tag: "Frontend", tagColor: "#6366f1" },
  ]},
];

/* ─── Main Dashboard ─── */
export default function DashboardContent() {
  const [columns, setColumns] = useState(initialColumns);

  // Derived Stats
  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const activeCount = columns.filter(c => c.id !== "done").reduce((acc, col) => acc + col.tasks.length, 0);
  const urgentCount = columns.reduce((acc, col) => acc + col.tasks.filter(t => t.priority === "Urgent").length, 0);
  const teamCount = 6; // Matching initialEmployees

  const p = useCounter(24); // Projects
  const t = useCounter(activeCount);
  const m = useCounter(teamCount);
  const u = useCounter(urgentCount);
  const counterValues = [p, t, m, u];

  // Simulation Effect for Real-time feeling
  useEffect(() => {
    const id = setInterval(() => {
      setColumns(prev => {
        const newCols = [...prev];
        if (Math.random() > 0.9) {
          const progIdx = newCols.findIndex(c => c.id === "progress");
          if (newCols[progIdx].tasks.length > 0) {
            const task = newCols[progIdx].tasks[0];
            newCols[progIdx] = { ...newCols[progIdx], tasks: newCols[progIdx].tasks.slice(1) };
            const nextIdx = Math.random() > 0.5 ? newCols.findIndex(c => c.id === "review") : newCols.findIndex(c => c.id === "done");
            newCols[nextIdx] = { ...newCols[nextIdx], tasks: [...newCols[nextIdx].tasks, task] };
          }
        }
        return newCols;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1400 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", animation: `fadeIn 0.5s ease ${i * 0.1}s both` }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 8 }}>{s.title}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{counterValues[i]}{s.suffix}</p>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} color={s.color} />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Chart Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "20px 24px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Weekly Overview</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Tasks created vs completed across all projects</p>
            </div>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip 
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontSize: 13 }}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="tasks" stroke="#6366f1" fill="url(#g1)" strokeWidth={3} />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="url(#g2)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
