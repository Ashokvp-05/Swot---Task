import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';

dotenv.config();

const app = express();

// ───── CORS Configuration ─────
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3005')
  .split(',')
  .map((s) => s.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// ───── Health Check (Docker) ─────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'flowsync-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({ status: 'FlowSync AI Workspace Backend Running' });
});

// ───── Users API ─────
app.get('/api/users', async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
  res.json(user);
});

// ───── Projects API ─────
app.get('/api/projects', async (_req, res) => {
  const projects = await prisma.project.findMany({ include: { creator: true, tasks: true } });
  res.json(projects);
});

app.post('/api/projects', async (req, res) => {
  const project = await prisma.project.create({ data: req.body });
  res.json(project);
});

// ───── Tasks API ─────
app.get('/api/tasks', async (_req, res) => {
  const tasks = await prisma.task.findMany({ include: { assignee: true, project: true } });
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const task = await prisma.task.create({ data: req.body });
  io.emit('task:created', task);
  res.json(task);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const task = await prisma.task.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  io.emit('task:updated', task);
  res.json(task);
});

// ───── Socket.IO ─────
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ───── Start Server ─────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ───── Graceful Shutdown ─────
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server closed. Database disconnected.');
    process.exit(0);
  });
  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
