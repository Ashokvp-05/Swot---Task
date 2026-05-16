"use client";

import React, { useState } from "react";
import { ChevronRight, CheckCircle2, Circle, Clock, Play, ChevronDown } from "lucide-react";

const nameMap: Record<string, string> = {
  JD: "John Doe", SK: "Sarah Kim", MJ: "Mike Johnson",
  AW: "Alex Wang", LR: "Lisa Roberts", DK: "David Kim",
};

type Task = {
  id: string; title: string; status: "To Do" | "In Progress" | "In Review" | "Done";
  assignee: string; points: number;
};

type ScheduleItem = {
  id: number; name: string; status: "Active" | "Planned" | "Completed";
  startDate: string; endDate: string; tasks: Task[];
};

const initialSchedules: ScheduleItem[] = [
  {
    id: 1, name: "Schedule #4", status: "Active", startDate: "May 5", endDate: "May 19",
    tasks: [
      { id: "s1", title: "User Authentication API", status: "Done", assignee: "MJ", points: 8 },
      { id: "s2", title: "Dashboard Analytics Charts", status: "In Progress", assignee: "AW", points: 5 },
      { id: "s3", title: "Task Board Drag & Drop", status: "In Progress", assignee: "SK", points: 8 },
      { id: "s4", title: "AI Task Recommendations", status: "To Do", assignee: "LR", points: 13 },
      { id: "s5", title: "Notification System", status: "In Review", assignee: "DK", points: 5 },
    ],
  },
  {
    id: 2, name: "Schedule #5", status: "Planned", startDate: "May 19", endDate: "Jun 2",
    tasks: [
      { id: "s6", title: "Employee Directory Page", status: "To Do", assignee: "AW", points: 5 },
      { id: "s7", title: "Report Generation", status: "To Do", assignee: "MJ", points: 8 },
      { id: "s8", title: "Attendance Tracking", status: "To Do", assignee: "DK", points: 8 },
    ],
  },
  {
    id: 3, name: "Schedule #3", status: "Completed", startDate: "Apr 21", endDate: "May 4",
    tasks: [
      { id: "s9", title: "Project Setup & Config", status: "Done", assignee: "JD", points: 3 },
      { id: "s10", title: "Authentication UI", status: "Done", assignee: "AW", points: 5 },
      { id: "s11", title: "Database Schema Design", status: "Done", assignee: "MJ", points: 8 },
      { id: "s12", title: "REST API Endpoints", status: "Done", assignee: "DK", points: 5 },
    ],
  },
];

const statusIcon = (s: string) => {
  if (s === "Done") return <CheckCircle2 size={14} color="#10b981" />;
  if (s === "In Progress") return <Play size={14} color="#3b82f6" />;
  if (s === "In Review") return <Clock size={14} color="#f59e0b" />;
  return <Circle size={14} color="#94a3b8" />;
};

const statusBadge = (s: string) => {
  const m: Record<string, { bg: string; text: string }> = {
    Active: { bg: "#ecfdf5", text: "#10b981" },
    Planned: { bg: "#eff6ff", text: "#3b82f6" },
    Completed: { bg: "#f1f5f9", text: "#64748b" },
  };
  const c = m[s] || m.Planned;
  return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: c.bg, color: c.text }}>{s}</span>;
};

export default function SprintsView() {
  const [sprintsData, setSprintsData] = React.useState(initialSchedules);
  const [openIds, setOpenIds] = useState<number[]>([1]);

  React.useEffect(() => {
    const id = setInterval(() => {
      setSprintsData(prev => prev.map(schedule => {
        if (schedule.status !== "Active") return schedule;
        
        // Randomly advance a task's status
        if (Math.random() > 0.6) {
          const statuses: Task["status"][] = ["To Do", "In Progress", "In Review", "Done"];
          const tasks = [...schedule.tasks];
          const taskIdx = Math.floor(Math.random() * tasks.length);
          const task = tasks[taskIdx];
          
          if (task.status !== "Done") {
            const nextStatus = statuses[statuses.indexOf(task.status) + 1];
            tasks[taskIdx] = { ...task, status: nextStatus };
            return { ...schedule, tasks };
          }
        }
        return schedule;
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const toggle = (id: number) => setOpenIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sprintsData.map(schedule => {
          const isOpen = openIds.includes(schedule.id);
          const total = schedule.tasks.length;
          const done = schedule.tasks.filter(t => t.status === "Done").length;
          const pts = schedule.tasks.reduce((a, t) => a + t.points, 0);
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div key={schedule.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {/* Schedule Header */}
              <div onClick={() => toggle(schedule.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <ChevronRight size={14} color="#94a3b8" style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "none" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{schedule.name}</span>
                {statusBadge(schedule.status)}
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{schedule.startDate} – {schedule.endDate}</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{done}/{total} done · {pts} pts</span>
                <div style={{ width: 60, height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: progress === 100 ? "#10b981" : "#6366f1", borderRadius: 2, transition: "width 0.4s" }} />
                </div>
              </div>

              {/* Tasks */}
              {isOpen && (
                <div style={{ borderTop: "1px solid #f1f5f9" }}>
                  {schedule.tasks.map((task, i) => (
                    <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px 10px 46px", borderBottom: i < total - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.1s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {statusIcon(task.status)}
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: task.status === "Done" ? "#94a3b8" : "#1e293b", textDecoration: task.status === "Done" ? "line-through" : "none" }}>{task.title}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #a78bfa)", color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{task.assignee}</div>
                        <span style={{ fontSize: 11, color: "#64748b", width: 60 }}>{nameMap[task.assignee]?.split(" ")[0]}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "2px 8px", borderRadius: 6 }}>{task.points} pts</span>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 6, background: task.status === "Done" ? "#ecfdf5" : task.status === "In Progress" ? "#eff6ff" : task.status === "In Review" ? "#fefce8" : "#f1f5f9", color: task.status === "Done" ? "#10b981" : task.status === "In Progress" ? "#3b82f6" : task.status === "In Review" ? "#ca8a04" : "#64748b", width: 72, textAlign: "center" }}>{task.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
