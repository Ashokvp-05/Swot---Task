import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const REQUIRED = [
  { title: "To Do",         color: "#6b7280", order: 0 },
  { title: "Ongoing",       color: "#3b82f6", order: 1 },
  { title: "Backlog",       color: "#8b5cf6", order: 2 },
  { title: "Completed",     color: "#10b981", order: 3 },
  { title: "Board Testing", color: "#f59e0b", order: 4 },
];

async function main() {
  const boards = await prisma.board.findMany({
    include: { columns: { orderBy: { order: "asc" } } },
  });

  for (const board of boards) {
    console.log(`\n── Board: "${board.name}"`);

    // Step 1: Delete ALL existing columns (tasks cascade-delete automatically)
    // But first move tasks to safety — we'll just delete cols and tasks since they're demo data
    for (const col of board.columns) {
      await prisma.boardTask.deleteMany({ where: { columnId: col.id } });
      await prisma.boardColumn.delete({ where: { id: col.id } });
    }
    console.log(`   Cleared ${board.columns.length} old columns`);

    // Step 2: Recreate exactly 5 clean columns
    for (const req of REQUIRED) {
      await prisma.boardColumn.create({
        data: { title: req.title, color: req.color, order: req.order, boardId: board.id },
      });
    }
    console.log(`   ✅ Created 5 clean columns: To Do | Ongoing | Backlog | Completed | Board Testing`);
  }

  console.log("\n✅ All boards now have clean columns!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
