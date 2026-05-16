"use client";

import React, { useState } from "react";
import { Sparkles, AlertTriangle, Lightbulb, Users, ArrowRight, Zap, Target } from "lucide-react";

const nameMap: Record<string, string> = {
  JD: "John Doe", SK: "Sarah Kim", MJ: "Mike Johnson",
  AW: "Alex Wang", LR: "Lisa Roberts", DK: "David Kim",
};

export default function AiInsightsView() {
  const [generating, setGenerating] = useState(false);

  const simulateGeneration = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={16} />
            </div>
            AI Insights
          </h2>
          <p style={{ fontSize: 13, color: "#64748b" }}>Smart recommendations and risk predictions for your projects.</p>
        </div>
        <button 
          onClick={simulateGeneration}
          style={{ 
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, 
            background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", fontSize: 13, fontWeight: 600, 
            cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", opacity: generating ? 0.7 : 1
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          {generating ? <Zap size={16} color="#6366f1" style={{ animation: "pulse 1s infinite" }} /> : <Zap size={16} color="#6366f1" />}
          {generating ? "Analyzing Data..." : "Refresh Insights"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Left Column: Delay Predictions & Bottlenecks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} color="#f59e0b" />
              Risk & Delay Predictions
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#fffbeb", borderLeft: "4px solid #f59e0b", borderRadius: "0 8px 8px 0", padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#b45309", marginBottom: 4 }}>Sprint #4: Notification System</div>
                <div style={{ fontSize: 12, color: "#92400e", lineHeight: "18px" }}>
                  This task is assigned to <strong>David Kim</strong>. Based on his current workload (3 active tasks), there is a <strong>75% chance of delay</strong>. Consider reassigning to <strong>Alex Wang</strong>.
                </div>
              </div>
              <div style={{ background: "#fef2f2", borderLeft: "4px solid #ef4444", borderRadius: "0 8px 8px 0", padding: "14px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>Critical Bottleneck: API Documentation</div>
                <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: "18px" }}>
                  The documentation task has been in "Backlog" for 6 days. This is blocking the QA team from starting their test cases.
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={16} color="#3b82f6" />
              Workload Optimization
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { name: "Mike Johnson", load: "High", msg: "Operating at 110% capacity. Risk of burnout." },
                { name: "Sarah Kim", load: "Optimal", msg: "Perfectly balanced workload. High velocity." },
                { name: "Lisa Roberts", load: "Low", msg: "Available for more tasks (30% capacity)." },
              ].map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: i === 2 ? "none" : "1px solid #f1f5f9" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{w.msg}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: w.load === "High" ? "#fef2f2" : w.load === "Low" ? "#eff6ff" : "#ecfdf5", color: w.load === "High" ? "#ef4444" : w.load === "Low" ? "#3b82f6" : "#10b981" }}>
                    {w.load} Load
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Task Suggestions */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Lightbulb size={16} color="#8b5cf6" />
            Smart Task Suggestions
          </h3>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20, lineHeight: "18px" }}>
            Based on recent project activity and sprint goals, AI recommends adding the following tasks to your backlog:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { t: "Implement rate limiting on Auth API", r: "Security Best Practice", p: "High" },
              { t: "Add dark mode to Dashboard", r: "User Request Trend", p: "Low" },
              { t: "Optimize Kanban drag-and-drop performance", r: "Tech Debt", p: "Medium" },
            ].map((task, i) => (
              <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, transition: "border-color 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#c7d2fe"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{task.t}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>{task.r}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: task.p === "High" ? "#ea580c" : task.p === "Medium" ? "#d97706" : "#16a34a" }}>
                    {task.p} Priority
                  </span>
                </div>
                <button style={{ marginTop: 12, width: "100%", padding: "6px 0", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#6366f1", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={e => {e.currentTarget.style.background = "#eef2ff"; e.currentTarget.style.borderColor = "#6366f1";}} onMouseLeave={e => {e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1";}}>
                  + Add to Backlog
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
