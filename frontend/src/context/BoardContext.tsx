"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import io, { Socket } from "socket.io-client";

/* ─── Types ─── */
export type OnboardedUser = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "Manager" | "Employee" | "Admin";
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

/* ─── Context ─── */
type BoardContextType = {
  boards: Board[];
  addBoard: (board: Omit<Board, "id" | "createdAt" | "columns" | "onboardedUsers">) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  getBoardById: (id: string) => Board | undefined;
  updateBoardColumns: (boardId: string, columns: BoardColumn[]) => void;
  addTask: (boardId: string, task: any) => void;
  updateTask: (taskId: string, updates: any) => void;
  deleteTask: (taskId: string) => void;
  addOnboardedUser: (boardId: string, user: Omit<OnboardedUser, "id" | "initials">) => void;
  removeOnboardedUser: (boardId: string, userId: string) => void;
  getAllOnboardedUsers: () => (OnboardedUser & { boardId: string; boardName: string })[];
  socket: Socket | null;
};

const BoardContext = createContext<BoardContextType>({
  boards: [],
  addBoard: () => {},
  updateBoard: () => {},
  deleteBoard: () => {},
  getBoardById: () => undefined,
  updateBoardColumns: () => {},
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  addOnboardedUser: () => {},
  removeOnboardedUser: () => {},
  getAllOnboardedUsers: () => [],
  socket: null,
});

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      const res = await fetch("/api/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    }
  }, []);

  useEffect(() => {
    fetchBoards();

    const newSocket = io({ path: "/socket.io" });
    setSocket(newSocket);

    newSocket.on("board:created", (board: Board) => {
      setBoards((prev) => [...prev, board]);
    });

    newSocket.on("board:updated", (updatedBoard: Board) => {
      setBoards((prev) => prev.map((b) => (b.id === updatedBoard.id ? { ...b, ...updatedBoard } : b)));
    });

    newSocket.on("board:deleted", (id: string) => {
      setBoards((prev) => prev.filter((b) => b.id !== id));
    });

    newSocket.on("columns:updated", ({ boardId, columns }) => {
      setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, columns } : b)));
    });

    newSocket.on("task:created", ({ boardId, task }) => {
      setBoards((prev) => prev.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((col) => col.id === task.columnId ? { ...col, tasks: [...col.tasks, task] } : col),
        };
      }));
    });

    newSocket.on("task:updated", (task) => {
      setBoards((prev) => prev.map((b) => ({
        ...b,
        columns: b.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => (t.id === task.id ? task : t)),
        })),
      })));
    });

    newSocket.on("task:deleted", ({ taskId, columnId }) => {
      setBoards((prev) => prev.map((b) => ({
        ...b,
        columns: b.columns.map((col) => col.id === columnId ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) } : col),
      })));
    });

    newSocket.on("user:added", ({ boardId, user }) => {
      setBoards((prev) => prev.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          onboardedUsers: [...b.onboardedUsers, user],
          team: [...b.team, user.initials],
        };
      }));
    });

    newSocket.on("user:removed", ({ boardId, userId }) => {
      setBoards((prev) => prev.map((b) => {
        if (b.id !== boardId) return b;
        const removedUser = b.onboardedUsers.find((u) => u.id === userId);
        return {
          ...b,
          onboardedUsers: b.onboardedUsers.filter((u) => u.id !== userId),
          team: removedUser ? b.team.filter((t) => t !== removedUser.initials) : b.team,
        };
      }));
    });

    return () => {
      newSocket.close();
    };
  }, [fetchBoards]);

  const addBoard = async (board: Omit<Board, "id" | "createdAt" | "columns" | "onboardedUsers">) => {
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(board),
      });
      if (res.ok) {
        const newBoard = await res.json();
        setBoards((prev) => {
          if (prev.some((b) => b.id === newBoard.id)) return prev;
          return [...prev, newBoard];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateBoard = async (id: string, updates: Partial<Board>) => {
    try {
      const res = await fetch(`/api/boards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updatedBoard = await res.json();
        setBoards((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...updatedBoard } : b))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBoards((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getBoardById = (id: string) => boards.find((b) => b.id === id);

  const updateBoardColumns = async (boardId: string, columns: BoardColumn[]) => {
    // Optimistic update
    setBoards((prev) => prev.map((b) => (b.id === boardId ? { ...b, columns } : b)));
    try {
      await fetch(`/api/boards/${boardId}/columns`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns }),
      });
    } catch (err) {
      console.error(err);
      fetchBoards(); // Revert on failure
    }
  };

  const addTask = async (boardId: string, task: any) => {
    try {
      const res = await fetch(`/api/boards/${boardId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (res.ok) {
        const newTask = await res.json();
        setBoards((prev) => prev.map((b) => {
          if (b.id !== boardId) return b;
          const colHasTask = b.columns.some((col) => col.id === newTask.columnId && col.tasks.some((t) => t.id === newTask.id));
          if (colHasTask) return b;
          return {
            ...b,
            columns: b.columns.map((col) => col.id === newTask.columnId ? { ...col, tasks: [...col.tasks, newTask] } : col),
          };
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = async (taskId: string, updates: any) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updatedTask = await res.json();
        setBoards((prev) => prev.map((b) => ({
          ...b,
          columns: b.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t)),
          })),
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setBoards((prev) => prev.map((b) => ({
          ...b,
          columns: b.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          })),
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addOnboardedUser = async (boardId: string, user: Omit<OnboardedUser, "id" | "initials">) => {
    try {
      const res = await fetch(`/api/boards/${boardId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        const newUser = await res.json();
        setBoards((prev) => prev.map((b) => {
          if (b.id !== boardId) return b;
          if (b.onboardedUsers.some((u) => u.id === newUser.id)) return b;
          const updatedTeam = b.team.includes(newUser.initials) ? b.team : [...b.team, newUser.initials];
          return { ...b, team: updatedTeam, onboardedUsers: [...b.onboardedUsers, newUser] };
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeOnboardedUser = async (boardId: string, userId: string) => {
    try {
      const res = await fetch(`/api/boards/${boardId}/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setBoards((prev) => prev.map((b) => {
          if (b.id !== boardId) return b;
          const userToRemove = b.onboardedUsers.find((u) => u.id === userId);
          if (!userToRemove) return b;
          return {
            ...b,
            team: b.team.filter((initials) => initials !== userToRemove.initials),
            onboardedUsers: b.onboardedUsers.filter((u) => u.id !== userId),
          };
        }));
      }
    } catch (err) {
      console.error(err);
    }
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

  return (
    <BoardContext.Provider
      value={{ boards, addBoard, updateBoard, deleteBoard, getBoardById, updateBoardColumns, addTask, updateTask, deleteTask, addOnboardedUser, removeOnboardedUser, getAllOnboardedUsers, socket }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoards() {
  return useContext(BoardContext);
}
