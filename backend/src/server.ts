import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:3005", "http://localhost:8080", "http://127.0.0.1:8080", "http://127.0.0.1:3005"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ─── AUTH ─────────────────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const input = username.trim().toLowerCase();

    // 1. Check System Users
    const systemUser = await prisma.systemUser.findFirst({
      where: {
        username: { equals: input, mode: "insensitive" },
        password,
      },
    });

    if (systemUser) {
      return res.json({
        user: {
          id: systemUser.id,
          name: systemUser.name,
          username: systemUser.username,
          role: systemUser.role,
          department: systemUser.department,
          initials: systemUser.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
        },
      });
    }

    // 2. Check Board Users
    const boardUser = await prisma.boardUser.findFirst({
      where: {
        OR: [
          { email: { equals: input, mode: "insensitive" } },
          { name: { equals: input, mode: "insensitive" } },
        ],
        password,
      },
      include: { board: true },
    });

    if (boardUser) {
      return res.json({
        user: {
          id: boardUser.id,
          name: boardUser.name,
          username: boardUser.email,
          role: boardUser.role,
          department: boardUser.board.name,
          initials: boardUser.initials,
        },
      });
    }

    res.status(401).json({ error: "Invalid username or password" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── BOARDS ───────────────────────────────────────────────────────────
app.get("/api/boards", async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: { todos: true },
            },
          },
        },
        users: true,
      },
    });

    // Format for frontend
    const formatted = boards.map((b: any) => ({
      id: b.id,
      name: b.name,
      description: b.description || "",
      color: b.color,
      team: b.team,
      columns: b.columns.map((c: any) => ({
        id: c.id,
        title: c.title,
        color: c.color,
        tasks: c.tasks.map((t: any) => ({
          ...t,
          todos: t.todos || [],
        })),
      })),
      onboardedUsers: b.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role as "Manager" | "Employee",
        initials: u.initials,
        boardId: u.boardId,
        boardName: b.name,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/boards", async (req, res) => {
  try {
    const { name, description, color, team } = req.body;
    const board = await prisma.board.create({
      data: {
        name,
        description,
        color,
        team,
        columns: {
          create: [
            { title: "Backlogs", color: "#ef4444", order: 0 },
            { title: "Ongoing", color: "#22c55e", order: 1 },
            { title: "Testing", color: "#f59e0b", order: 2 },
            { title: "Hold", color: "#94a3b8", order: 3 },
            { title: "Closed", color: "#10b981", order: 4 },
          ],
        },
      },
      include: {
        columns: { include: { tasks: { include: { todos: true } } } },
        users: true,
      },
    });
    
    // Format to match frontend structure
    const formatted = {
      ...board,
      onboardedUsers: [],
    };
    
    io.emit("board:created", formatted);
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create board" });
  }
});

app.patch("/api/boards/:id", async (req, res) => {
  try {
    const { name, description, color, team } = req.body;
    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: { name, description, color, team },
    });
    io.emit("board:updated", board);
    res.json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update board" });
  }
});

app.delete("/api/boards/:id", async (req, res) => {
  try {
    await prisma.board.delete({ where: { id: req.params.id } });
    io.emit("board:deleted", req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete board" });
  }
});

// ─── BOARD USERS ──────────────────────────────────────────────────────
app.post("/api/boards/:boardId/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
    
    // Create the user
    const user = await prisma.boardUser.create({
      data: {
        name,
        email,
        password,
        role,
        initials,
        boardId: req.params.boardId,
      },
    });

    // Update the board's team array so the user persists in UI after refresh
    const board = await prisma.board.findUnique({ where: { id: req.params.boardId } });
    if (board && !board.team.includes(initials)) {
      await prisma.board.update({
        where: { id: req.params.boardId },
        data: { team: [...board.team, initials] },
      });
    }

    io.emit("user:added", { boardId: req.params.boardId, user });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add user" });
  }
});

app.delete("/api/boards/:boardId/users/:userId", async (req, res) => {
  try {
    const user = await prisma.boardUser.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete the user
    await prisma.boardUser.delete({ where: { id: req.params.userId } });

    // Remove the user's initials from the board's team array
    const board = await prisma.board.findUnique({ where: { id: req.params.boardId } });
    if (board) {
      const updatedTeam = board.team.filter((t: string) => t !== user.initials);
      await prisma.board.update({
        where: { id: req.params.boardId },
        data: { team: updatedTeam },
      });
    }

    io.emit("user:removed", { boardId: req.params.boardId, userId: req.params.userId });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ─── COLUMNS & TASKS ──────────────────────────────────────────────────
app.put("/api/boards/:boardId/columns", async (req, res) => {
  try {
    const { columns } = req.body;
    // Client sends the full updated columns array after drag and drop
    
    // We update task orders and column IDs in a transaction
    const updates = [];
    for (const col of columns) {
      for (let i = 0; i < col.tasks.length; i++) {
        const task = col.tasks[i];
        updates.push(
          prisma.boardTask.update({
            where: { id: task.id },
            data: { columnId: col.id, order: i },
          })
        );
      }
    }
    await prisma.$transaction(updates);
    
    io.emit("columns:updated", { boardId: req.params.boardId, columns });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update columns" });
  }
});

app.post("/api/boards/:boardId/tasks", async (req, res) => {
  try {
    const { title, priority, assignee, startDate, endDate, columnId } = req.body;
    
    const count = await prisma.boardTask.count({ where: { columnId } });
    
    const task = await prisma.boardTask.create({
      data: {
        title,
        priority: priority || "Medium",
        assignee,
        startDate,
        endDate,
        columnId,
        order: count,
      },
      include: { todos: true }
    });
    
    io.emit("task:created", { boardId: req.params.boardId, task });
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { title, priority, assignee, startDate, endDate, columnId, todos } = req.body;
    
    // Process todos: delete all and recreate for simplicity
    if (todos) {
      await prisma.taskTodo.deleteMany({ where: { taskId: req.params.id } });
    }
    
    const task = await prisma.boardTask.update({
      where: { id: req.params.id },
      data: {
        title,
        priority,
        assignee,
        startDate,
        endDate,
        columnId,
        ...(todos ? {
          todos: {
            create: todos.map((t: any) => ({ text: t.text, done: t.done }))
          }
        } : {})
      },
      include: { todos: true }
    });
    
    io.emit("task:updated", task);
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await prisma.boardTask.delete({ where: { id: req.params.id } });
    io.emit("task:deleted", { taskId: req.params.id, columnId: task.columnId });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

const standardColumns = [
  { title: "Backlogs", color: "#ef4444", order: 0 },
  { title: "Ongoing", color: "#22c55e", order: 1 },
  { title: "Testing", color: "#f59e0b", order: 2 },
  { title: "Hold", color: "#94a3b8", order: 3 },
  { title: "Closed", color: "#10b981", order: 4 },
];

function getStandardColumnName(oldTitle: string): string {
  const t = oldTitle.toLowerCase().trim();
  if (t === "backlog" || t === "ideas" || t === "backlogs") return "Backlogs";
  if (t === "to do" || t === "todo" || t === "in progress" || t === "ongoing" || t === "wireframes") return "Ongoing";
  if (t === "in review" || t === "review" || t === "mockups" || t === "testing") return "Testing";
  if (t === "handoff" || t === "hold") return "Hold";
  if (t === "done" || t === "completed" || t === "closed") return "Closed";
  return "Ongoing";
}

async function migrateDatabaseColumns() {
  console.log("Starting column standardization migration...");
  try {
    const boards = await prisma.board.findMany({
      include: { columns: { include: { tasks: true } } },
    });

    for (const board of boards) {
      const hasCorrectColumns = board.columns.length === 5 && 
        board.columns.every((c, i) => {
          const std = standardColumns[i];
          return c.title === std.title && c.order === std.order && c.color === std.color;
        });

      if (hasCorrectColumns) {
        continue;
      }

      console.log(`Board "${board.name}" has non-standard columns. Migrating...`);

      const newColumnsMap: Record<string, string> = {};
      for (const std of standardColumns) {
        const existingCol = board.columns.find(c => c.title === std.title);
        if (existingCol) {
          const updatedCol = await prisma.boardColumn.update({
            where: { id: existingCol.id },
            data: { order: std.order, color: std.color },
          });
          newColumnsMap[std.title] = updatedCol.id;
        } else {
          const newCol = await prisma.boardColumn.create({
            data: {
              title: std.title,
              color: std.color,
              order: std.order,
              boardId: board.id,
            },
          });
          newColumnsMap[std.title] = newCol.id;
        }
      }

      for (const oldCol of board.columns) {
        const stdTitle = getStandardColumnName(oldCol.title);
        const newColId = newColumnsMap[stdTitle];

        if (oldCol.id !== newColId) {
          for (const task of oldCol.tasks) {
            await prisma.boardTask.update({
              where: { id: task.id },
              data: { columnId: newColId },
            });
          }
        }
      }

      for (const oldCol of board.columns) {
        if (!standardColumns.some(std => std.title === oldCol.title)) {
          await prisma.boardColumn.delete({
            where: { id: oldCol.id },
          });
        }
      }

      console.log(`Board "${board.name}" migration completed.`);
    }
    console.log("Column standardization migration finished successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await migrateDatabaseColumns();
});

// Graceful shutdown handling
const shutdown = () => {
  console.log("\nReceived shutdown signal. Closing HTTP server...");
  httpServer.close(async () => {
    console.log("HTTP server closed.");
    await prisma.$disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
