"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

/* ─── Types ─── */
export type OnboardedUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "Manager" | "Employee";
  initials: string;
};

export type BoardColumn = {
  id: string;
  title: string;
  color: string;
  tasks: BoardTask[];
};

export type BoardTask = {
  id: string;
  title: string;
  priority: string;
  tag: string;
  tagColor: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  todos?: { id: string; text: string; done: boolean }[];
};

export type Board = {
  id: string;
  name: string;
  description: string;
  color: string;
  team: string[]; // member initials (legacy)
  onboardedUsers: OnboardedUser[];
  columns: BoardColumn[];
  createdAt: string;
};

/* ─── Team Members Registry (legacy preset members) ─── */
export const allTeamMembers = [
  { initials: "JD", name: "John Doe", role: "Tech Lead", dept: "Engineering" },
  { initials: "SK", name: "Sarah Kim", role: "UI Designer", dept: "Design" },
  { initials: "MJ", name: "Mike Johnson", role: "Backend Developer", dept: "Engineering" },
  { initials: "AW", name: "Alex Wang", role: "Frontend Developer", dept: "Engineering" },
  { initials: "LR", name: "Lisa Roberts", role: "Project Manager", dept: "Management" },
  { initials: "DK", name: "David Kim", role: "DevOps Engineer", dept: "Engineering" },
];

export const memberNameMap: Record<string, string> = Object.fromEntries(
  allTeamMembers.map((m) => [m.initials, m.name])
);

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── Default Columns Template ─── */
const defaultColumns = (): BoardColumn[] => [
  { id: "backlog", title: "Backlog", color: "#a1a1aa", tasks: [] },
  { id: "todo", title: "To Do", color: "#6b7280", tasks: [] },
  { id: "progress", title: "In Progress", color: "#6366f1", tasks: [] },
  { id: "review", title: "In Review", color: "#f59e0b", tasks: [] },
  { id: "done", title: "Done", color: "#10b981", tasks: [] },
];

/* ─── Sample Boards ─── */
const sampleBoards: Board[] = [
  {
    id: "board-eng",
    name: "Engineering Team",
    description: "Core product development sprint board",
    color: "#6366f1",
    team: ["JD", "MJ", "AW", "DK"],
    onboardedUsers: [
      { id: "ou1", name: "John Doe", email: "john@flowsync.com", password: "John@123", role: "Manager", initials: "JD" },
      { id: "ou2", name: "Mike Johnson", email: "mike@flowsync.com", password: "Mike@123", role: "Employee", initials: "MJ" },
      { id: "ou3", name: "Alex Wang", email: "alex@flowsync.com", password: "Alex@123", role: "Employee", initials: "AW" },
      { id: "ou4", name: "David Kim", email: "david@flowsync.com", password: "David@123", role: "Employee", initials: "DK" },
    ],
    columns: [
      { id: "backlog", title: "Backlog", color: "#a1a1aa", tasks: [
        { id: "t15", title: "Explore analytics integration", priority: "Low", tag: "Research", tagColor: "#64748b", assignee: "MJ", startDate: "2026-05-20", endDate: "2026-05-28" },
      ]},
      { id: "todo", title: "To Do", color: "#6b7280", tasks: [
        { id: "t1", title: "Setup CI/CD pipeline", priority: "Medium", tag: "DevOps", tagColor: "#f59e0b", assignee: "DK", startDate: "2026-05-14", endDate: "2026-05-20" },
        { id: "t8", title: "Write API documentation", priority: "Low", tag: "Docs", tagColor: "#64748b", assignee: "JD", startDate: "2026-05-15", endDate: "2026-05-22" },
      ]},
      { id: "progress", title: "In Progress", color: "#6366f1", tasks: [
        { id: "t3", title: "Implement user auth API", priority: "High", tag: "Backend", tagColor: "#10b981", assignee: "MJ", startDate: "2026-05-08", endDate: "2026-05-16" },
        { id: "t4", title: "Create Kanban drag & drop", priority: "Urgent", tag: "Frontend", tagColor: "#6366f1", assignee: "AW", startDate: "2026-05-10", endDate: "2026-05-15" },
      ]},
      { id: "review", title: "In Review", color: "#f59e0b", tasks: [
        { id: "t10", title: "Unit tests for auth", priority: "High", tag: "Testing", tagColor: "#14b8a6", assignee: "MJ", startDate: "2026-05-09", endDate: "2026-05-15" },
      ]},
      { id: "done", title: "Done", color: "#10b981", tasks: [
        { id: "t6", title: "Project setup & config", priority: "Low", tag: "Setup", tagColor: "#64748b", assignee: "JD", startDate: "2026-05-01", endDate: "2026-05-05" },
        { id: "t7", title: "Authentication UI", priority: "High", tag: "Frontend", tagColor: "#6366f1", assignee: "AW", startDate: "2026-05-03", endDate: "2026-05-10" },
      ]},
    ],
    createdAt: "2026-05-01",
  },
  {
    id: "board-design",
    name: "Design Team",
    description: "UI/UX design tasks and deliverables",
    color: "#8b5cf6",
    team: ["SK", "LR"],
    onboardedUsers: [
      { id: "ou5", name: "Sarah Kim", email: "sarah@flowsync.com", password: "Sarah@123", role: "Employee", initials: "SK" },
      { id: "ou6", name: "Lisa Roberts", email: "lisa@flowsync.com", password: "Lisa@123", role: "Employee", initials: "LR" },
    ],
    columns: [
      { id: "backlog", title: "Backlog", color: "#a1a1aa", tasks: [
        { id: "t16", title: "Redesign onboarding flow", priority: "Medium", tag: "Design", tagColor: "#8b5cf6", assignee: "SK", startDate: "2026-05-22", endDate: "2026-05-30" },
      ]},
      { id: "todo", title: "To Do", color: "#6b7280", tasks: [
        { id: "t11", title: "Design landing page mockup", priority: "High", tag: "Design", tagColor: "#8b5cf6", assignee: "SK", startDate: "2026-05-12", endDate: "2026-05-18" },
        { id: "t12", title: "Define brand guidelines", priority: "Medium", tag: "Design", tagColor: "#8b5cf6", assignee: "LR", startDate: "2026-05-11", endDate: "2026-05-15" },
      ]},
      { id: "progress", title: "In Progress", color: "#6366f1", tasks: [] },
      { id: "review", title: "In Review", color: "#f59e0b", tasks: [
        { id: "t5", title: "Sprint planning module", priority: "Medium", tag: "Feature", tagColor: "#ec4899", assignee: "SK", startDate: "2026-05-05", endDate: "2026-05-14" },
      ]},
      { id: "done", title: "Done", color: "#10b981", tasks: [] },
    ],
    createdAt: "2026-05-03",
  },
];

/* ─── Context ─── */
type BoardContextType = {
  boards: Board[];
  addBoard: (board: Omit<Board, "id" | "createdAt" | "columns">) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  getBoardById: (id: string) => Board | undefined;
  updateBoardColumns: (boardId: string, columns: BoardColumn[]) => void;
  addOnboardedUser: (boardId: string, user: Omit<OnboardedUser, "id" | "initials">) => void;
  removeOnboardedUser: (boardId: string, userId: string) => void;
  getAllOnboardedUsers: () => (OnboardedUser & { boardId: string; boardName: string })[];
};

const BoardContext = createContext<BoardContextType>({
  boards: [],
  addBoard: () => {},
  updateBoard: () => {},
  deleteBoard: () => {},
  getBoardById: () => undefined,
  updateBoardColumns: () => {},
  addOnboardedUser: () => {},
  removeOnboardedUser: () => {},
  getAllOnboardedUsers: () => [],
});

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("flowsync_boards");
      if (stored) {
        setBoards(JSON.parse(stored));
      } else {
        setBoards(sampleBoards);
      }
    } catch {
      setBoards(sampleBoards);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      sessionStorage.setItem("flowsync_boards", JSON.stringify(boards));
    }
  }, [boards, hydrated]);

  const addBoard = (board: Omit<Board, "id" | "createdAt" | "columns">) => {
    const newBoard: Board = {
      ...board,
      id: `board-${Date.now()}`,
      columns: defaultColumns(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBoards((prev) => [...prev, newBoard]);
  };

  const updateBoard = (id: string, updates: Partial<Board>) => {
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBoard = (id: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  const getBoardById = (id: string) => boards.find((b) => b.id === id);

  const updateBoardColumns = (boardId: string, columns: BoardColumn[]) => {
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, columns } : b)));
  };

  const addOnboardedUser = (boardId: string, user: Omit<OnboardedUser, "id" | "initials">) => {
    const initials = getInitials(user.name);
    const newUser: OnboardedUser = {
      ...user,
      id: `ou-${Date.now()}`,
      initials,
    };
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? {
              ...b,
              onboardedUsers: [...b.onboardedUsers, newUser],
              team: [...b.team, initials],
            }
          : b
      )
    );
  };

  const removeOnboardedUser = (boardId: string, userId: string) => {
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id !== boardId) return b;
        const removedUser = b.onboardedUsers.find((u) => u.id === userId);
        return {
          ...b,
          onboardedUsers: b.onboardedUsers.filter((u) => u.id !== userId),
          team: removedUser ? b.team.filter((t) => t !== removedUser.initials) : b.team,
        };
      })
    );
  };

  const getAllOnboardedUsers = () => {
    const all: (OnboardedUser & { boardId: string; boardName: string })[] = [];
    boards.forEach((b) => {
      b.onboardedUsers.forEach((u) => {
        all.push({ ...u, boardId: b.id, boardName: b.name });
      });
    });
    return all;
  };

  if (!hydrated) return null;

  return (
    <BoardContext.Provider
      value={{ boards, addBoard, updateBoard, deleteBoard, getBoardById, updateBoardColumns, addOnboardedUser, removeOnboardedUser, getAllOnboardedUsers }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoards() {
  return useContext(BoardContext);
}
