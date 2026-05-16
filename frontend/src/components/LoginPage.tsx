"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useAuth, Role } from "@/context/AuthContext";
import { useBoards } from "@/context/BoardContext";

/* ─── Admin / System Users ─── */
const systemUsers = [
  { id: 1, name: "Ashok", username: "Ashok", password: "Swot@1234", role: "Admin" as Role, department: "Management" },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function LoginPage() {
  const { login } = useAuth();
  const { getAllOnboardedUsers } = useBoards();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    const input = username.trim().toLowerCase();

    // 1. Check system users (admin) — match by username
    const systemMatch = systemUsers.find(
      (u) => u.username.toLowerCase() === input && u.password === password
    );

    if (systemMatch) {
      setLoading(true);
      setTimeout(() => {
        login({
          id: systemMatch.id,
          name: systemMatch.name,
          username: systemMatch.username,
          role: systemMatch.role,
          department: systemMatch.department,
          initials: getInitials(systemMatch.name),
        });
      }, 600);
      return;
    }

    // 2. Check onboarded users across all boards — match by email or name
    const allOnboarded = getAllOnboardedUsers();
    const onboardedMatch = allOnboarded.find(
      (u) =>
        (u.email.toLowerCase() === input || u.name.toLowerCase() === input) &&
        u.password === password
    );

    if (onboardedMatch) {
      setLoading(true);
      setTimeout(() => {
        login({
          id: Date.now(),
          name: onboardedMatch.name,
          username: onboardedMatch.email,
          role: onboardedMatch.role,
          department: onboardedMatch.boardName,
          initials: onboardedMatch.initials,
        });
      }, 600);
      return;
    }

    setError("Invalid username or password");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
    }}>
      <div style={{
        width: 520, background: "#fff", borderRadius: 24, padding: "52px 48px",
        boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <img 
              src="/rudratic-logo.png" 
              alt="Rudratic Logo" 
              style={{ height: 100, width: "auto", objectFit: "contain", marginBottom: 4 }} 
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h1 style={{ 
                fontSize: 36, 
                fontWeight: 900, 
                margin: 0, 
                letterSpacing: "0.05em", 
                lineHeight: 1, 
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #7e22ce 0%, #be185d 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block"
              }}>
                Rudratic
              </h1>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.25em", marginTop: 8, marginBottom: 0 }}>
                Enterprise Task Board
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
            padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#dc2626", fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <label style={{ fontSize: 13, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8 }}>
          Username or Email
        </label>
        <div style={{ position: "relative", marginBottom: 22 }}>
          <User size={17} color="#94a3b8" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username or email"
            type="text"
            style={{
              width: "100%", padding: "14px 18px 14px 44px", borderRadius: 12,
              border: "1.5px solid #e2e8f0", fontSize: 15, fontFamily: "inherit",
              outline: "none", transition: "border 0.15s",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#6366f1"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8 }}>
          Password
        </label>
        <div style={{ position: "relative", marginBottom: 32 }}>
          <Lock size={17} color="#94a3b8" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            style={{
              width: "100%", padding: "14px 48px 14px 44px", borderRadius: 12,
              border: "1.5px solid #e2e8f0", fontSize: 15, fontFamily: "inherit",
              outline: "none", transition: "border 0.15s",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#6366f1"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex",
            }}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "15px", borderRadius: 12, border: "none",
            fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            background: loading ? "#a5b4fc" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "#fff", boxShadow: "0 4px 15px rgba(79,70,229,0.3)", transition: "all 0.2s",
          }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
