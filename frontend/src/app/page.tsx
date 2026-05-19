"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth, Role } from "@/context/AuthContext";
import { BoardProvider, useBoards } from "@/context/BoardContext";
import LoginPage from "@/components/LoginPage";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import DashboardContent from "@/components/DashboardContent";
import KanbanView from "@/components/KanbanView";
import EmployeesView from "@/components/EmployeesView";
import BoardManagerView from "@/components/BoardManagerView";
import { ShieldAlert } from "lucide-react";

/* ─── Role-Based View Access Map ─── */
const viewAccessMap: Record<string, Role[]> = {
  dashboard: ["Admin", "Manager"],
  boards: ["Admin", "Manager", "Employee"],
  employees: ["Admin", "Manager"],
};

/* ─── Access Denied Component ─── */
function AccessDenied() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "calc(100vh - 64px)", padding: 40, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
      }}>
        <ShieldAlert size={32} color="#ef4444" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
        Access Restricted
      </h2>
      <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 380, lineHeight: 1.7 }}>
        You don&apos;t have permission to view this section. Contact your administrator if you believe this is an error.
      </p>
    </div>
  );
}

function AppContent() {
  const { user, hasAccess } = useAuth();
  const { boards } = useBoards();
  const [activeView, setActiveView] = useState<string>("dashboard");

  useEffect(() => {
    if (user) {
      if (user.role === "Employee") {
        if (activeView === "dashboard" || activeView === "boards") {
          const visibleBoards = boards.filter((b) => {
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
          if (visibleBoards.length > 0) {
            setActiveView(`board:${visibleBoards[0].id}`);
          } else {
            setActiveView("boards");
          }
        }
      } else {
        if (activeView === "dashboard") {
          setActiveView("dashboard");
        }
      }
    }
  }, [user, boards, activeView]);
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <LoginPage />;

  // Extract board ID if viewing a specific board
  const isBoardView = activeView.startsWith("board:");
  const currentBoardId = isBoardView ? activeView.replace("board:", "") : null;

  const renderView = () => {
    // Board detail view
    if (isBoardView && currentBoardId) {
      return (
        <KanbanView
          boardId={currentBoardId}
          onBack={() => setActiveView("boards")}
        />
      );
    }

    // Check role-based access
    const allowedRoles = viewAccessMap[activeView];
    if (allowedRoles && !hasAccess(allowedRoles)) {
      return <AccessDenied />;
    }

    switch (activeView) {
      case "boards":
        return <BoardManagerView onOpenBoard={(id) => setActiveView(`board:${id}`)} />;
      case "employees":
        return <EmployeesView />;
      default:
        return <DashboardContent />;
    }
  };

  // Determine header view name
  const headerView = isBoardView ? "kanban" : activeView;

  const isEmployee = user?.role === "Employee";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      {!isEmployee && (
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      )}
      <div style={{ flex: 1, marginLeft: isEmployee ? 0 : (collapsed ? 72 : 260), transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        {!isEmployee && <TopHeader activeView={headerView} />}
        {renderView()}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <BoardProvider>
        <AppContent />
      </BoardProvider>
    </AuthProvider>
  );
}
