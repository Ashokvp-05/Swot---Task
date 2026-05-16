"use client";

import React, { useState } from "react";
import { Search, BarChart3, CheckCircle2, Clock, TrendingUp, ArrowUpRight } from "lucide-react";

const initialEmployees = [
  { id: 1, name: "Sarah Kim", initials: "SK", role: "UI Designer", department: "Design", tasksCompleted: 24, activeTasks: 3, productivity: 92, trend: "+5%" },
  { id: 2, name: "Mike Johnson", initials: "MJ", role: "Backend Developer", department: "Engineering", tasksCompleted: 31, activeTasks: 4, productivity: 88, trend: "+3%" },
  { id: 3, name: "Alex Wang", initials: "AW", role: "Frontend Developer", department: "Engineering", tasksCompleted: 28, activeTasks: 2, productivity: 95, trend: "+8%" },
  { id: 4, name: "Lisa Roberts", initials: "LR", role: "Project Manager", department: "Management", tasksCompleted: 18, activeTasks: 5, productivity: 78, trend: "-2%" },
  { id: 5, name: "David Kim", initials: "DK", role: "DevOps Engineer", department: "Engineering", tasksCompleted: 22, activeTasks: 3, productivity: 85, trend: "+4%" },
  { id: 6, name: "John Doe", initials: "JD", role: "Tech Lead", department: "Engineering", tasksCompleted: 35, activeTasks: 6, productivity: 90, trend: "+6%" },
];

const deptColors: Record<string, string> = {
  Design: "#8b5cf6", Engineering: "#3b82f6", Management: "#f59e0b",
};

export default function EmployeesView() {
  const [empList, setEmpList] = React.useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const departments = ["All", ...new Set(initialEmployees.map((e) => e.department))];

  React.useEffect(() => {
    // Kept empty to respect user request to not simulate random data
  }, []);

  const filtered = empList.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === "All" || e.department === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {departments.map((d) => (
            <button key={d} onClick={() => setSelectedDept(d)}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: selectedDept === d ? "#4f46e5" : "#fff", color: selectedDept === d ? "#fff" : "#64748b",
                border: selectedDept === d ? "none" : "1px solid #e2e8f0",
              }}>
              {d}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", width: 220 }}>
          <Search size={15} color="#94a3b8" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, width: "100%", fontFamily: "inherit" }} />
        </div>
      </div>

      {/* Employee Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map((emp) => (
          <div key={emp.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: "22px", transition: "all 0.2s", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${deptColors[emp.department] || "#6366f1"}, ${deptColors[emp.department] || "#6366f1"}88)`, color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{emp.initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                  {emp.name}
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 0 2px rgba(16,185,129,0.2)", animation: "pulse 2s infinite" }} title="Active Now" />
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{emp.role}</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, background: `${deptColors[emp.department]}15`, color: deptColors[emp.department], padding: "3px 8px", borderRadius: 6 }}>{emp.department}</span>
            </div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ textAlign: "center", padding: "10px 0", background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{emp.tasksCompleted}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Completed</div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 0", background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{emp.activeTasks}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Active</div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 0", background: "#f8fafc", borderRadius: 8, transition: "background 0.3s" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: emp.productivity >= 90 ? "#10b981" : emp.productivity >= 80 ? "#f59e0b" : "#ef4444", transition: "color 0.3s" }}>{emp.productivity}%</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Score</div>
              </div>
            </div>
            {/* Progress Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Productivity</span>
                <span style={{ fontSize: 11, color: emp.trend.startsWith("+") ? "#10b981" : emp.trend.startsWith("-") && emp.trend !== "-0%" ? "#ef4444" : "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: 2, transition: "color 0.3s" }}><ArrowUpRight size={12} style={{ transform: emp.trend.startsWith("-") ? "rotate(90deg)" : "none", transition: "transform 0.3s" }}/>{emp.trend}</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${emp.productivity}%`, height: "100%", borderRadius: 3, background: emp.productivity >= 90 ? "linear-gradient(90deg, #10b981, #34d399)" : emp.productivity >= 80 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "#ef4444", transition: "width 0.8s ease" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
