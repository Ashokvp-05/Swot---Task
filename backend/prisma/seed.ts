import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin User
  const admin = await prisma.systemUser.upsert({
    where: { username: "Ashok" },
    update: {},
    create: {
      name: "Ashok",
      username: "Ashok",
      password: "Swot@1234",
      role: "Admin",
      department: "Management",
    },
  });

  // Check if we already have boards
  const existingBoards = await prisma.board.count();
  if (existingBoards > 0) {
    console.log("Database already seeded with boards. Skipping.");
    return;
  }

  // 2. Create Engineering Board
  const engBoard = await prisma.board.create({
    data: {
      name: "Engineering Team",
      description: "Sprint planning and bug tracking",
      color: "#6366f1",
      team: ["JD", "AW", "DK"],
      columns: {
        create: [
          {
            title: "Backlog",
            color: "#6b7280",
            order: 0,
            tasks: {
              create: [
                {
                  title: "Research new authentication methods",
                  priority: "Low",
                  assignee: "DK",
                  order: 0,
                },
                {
                  title: "Update dependency packages to latest versions",
                  priority: "Medium",
                  assignee: "JD",
                  order: 1,
                },
              ],
            },
          },
          {
            title: "To Do",
            color: "#3b82f6",
            order: 1,
            tasks: {
              create: [
                {
                  title: "Implement password reset flow",
                  priority: "High",
                  assignee: "AW",
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                  order: 0,
                  todos: {
                    create: [
                      { text: "Design UI", done: true },
                      { text: "Backend endpoint", done: false },
                      { text: "Email template", done: false },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "In Progress",
            color: "#f59e0b",
            order: 2,
            tasks: {
              create: [
                {
                  title: "Fix navigation bug on mobile devices",
                  priority: "Urgent",
                  assignee: "JD",
                  order: 0,
                },
              ],
            },
          },
          {
            title: "In Review",
            color: "#8b5cf6",
            order: 3,
            tasks: {
              create: [
                {
                  title: "Refactor user dashboard component",
                  priority: "Medium",
                  assignee: "AW",
                  order: 0,
                },
              ],
            },
          },
          {
            title: "Done",
            color: "#10b981",
            order: 4,
            tasks: {
              create: [
                {
                  title: "Setup CI/CD pipeline",
                  priority: "High",
                  assignee: "DK",
                  order: 0,
                },
                {
                  title: "Write documentation for API v2",
                  priority: "Low",
                  assignee: "JD",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
      users: {
        create: [
          {
            name: "John Doe",
            email: "john@flowsync.com",
            password: "password123",
            role: "Manager",
            initials: "JD",
          },
        ],
      },
    },
  });

  // 3. Create Design Board
  const designBoard = await prisma.board.create({
    data: {
      name: "Design Team",
      description: "UI/UX design tasks and deliverables",
      color: "#8b5cf6",
      team: ["SK", "LR"],
      columns: {
        create: [
          {
            title: "Ideas",
            color: "#6b7280",
            order: 0,
            tasks: {
              create: [
                { title: "Brainstorm new logo concepts", priority: "Medium", assignee: "LR", order: 0 },
              ],
            },
          },
          {
            title: "Wireframes",
            color: "#f59e0b",
            order: 1,
            tasks: {
              create: [
                { title: "Homepage redesign wireframes", priority: "High", assignee: "SK", order: 0 },
              ],
            },
          },
          {
            title: "Mockups",
            color: "#ec4899",
            order: 2,
            tasks: {
              create: [
                { title: "Mobile app onboarding screens", priority: "Medium", assignee: "LR", order: 0 },
              ],
            },
          },
          {
            title: "Handoff",
            color: "#10b981",
            order: 3,
            tasks: {
              create: [
                { title: "Settings page design specs", priority: "Low", assignee: "SK", order: 0 },
              ],
            },
          },
        ],
      },
      users: {
        create: [
          {
            name: "Sarah Kim",
            email: "sarah@flowsync.com",
            password: "password123",
            role: "Employee",
            initials: "SK",
          },
          {
            name: "Lisa Roberts",
            email: "lisa@flowsync.com",
            password: "password123",
            role: "Employee",
            initials: "LR",
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
