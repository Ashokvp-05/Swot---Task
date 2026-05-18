import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Maps old titles → new titles
const RENAME_MAP: Record<string, { title: string; color: string }> = {
  "In Progress": { title: "Ongoing",       color: "#3b82f6" },
  "Ongoing":     { title: "Ongoing",       color: "#3b82f6" },
  "In Review":   { title: "Backlog",       color: "#8b5cf6" },
  "Backlog testing": { title: "Backlog",   color: "#8b5cf6" },
  "Backlog":     { title: "Backlog",       color: "#8b5cf6" },
  "Hold on":     { title: "Completed",     color: "#10b981" },
  "Done":        { title: "Completed",     color: "#10b981" },
  "Completed":   { title: "Completed",     color: "#10b981" },
  "Handoff":     { title: "Completed",     color: "#10b981" },
  "To Do":       { title: "To Do",         color: "#6b7280" },
  "Ideas":       { title: "To Do",         color: "#6b7280" },
  "Wireframes":  { title: "To Do",         color: "#6b7280" },
  "Mockups":     { title: "Ongoing",       color: "#3b82f6" },
};

async function main() {
  console.log("Starting column migration...\n");

  const boards = await prisma.board.findMany({ include: { columns: { orderBy: { order: "asc" } } } });

  for (const board of boards) {
    console.log(`\nBoard: "${board.name}" (${board.columns.length} columns)`);

    // 1. Rename / recolour existing columns
    for (const col of board.columns) {
      const mapped = RENAME_MAP[col.title];
      if (mapped) {
        await prisma.boardColumn.update({
          where: { id: col.id },
          data: { title: mapped.title, color: mapped.color },
        });
        if (mapped.title !== col.title) {
          console.log(`  Renamed: "${col.title}" → "${mapped.title}"`);
        }
      }
    }

    // Re-fetch columns after rename
    const updatedCols = await prisma.boardColumn.findMany({
      where: { boardId: board.id },
      orderBy: { order: "asc" },
    });

    // 2. Ensure all 5 required columns exist
    const required = [
      { title: "To Do",         color: "#6b7280", order: 0 },
      { title: "Ongoing",       color: "#3b82f6", order: 1 },
      { title: "Backlog",       color: "#8b5cf6", order: 2 },
      { title: "Completed",     color: "#10b981", order: 3 },
      { title: "Board Testing", color: "#f59e0b", order: 4 },
    ];

    for (const req of required) {
      const exists = updatedCols.find(c => c.title === req.title);
      if (!exists) {
        await prisma.boardColumn.create({
          data: { title: req.title, color: req.color, order: req.order, boardId: board.id },
        });
        console.log(`  Created missing column: "${req.title}"`);
      } else {
        // Ensure correct order
        await prisma.boardColumn.update({ where: { id: exists.id }, data: { order: req.order } });
      }
    }

    // 3. Remove any leftover duplicate/unmapped columns
    const finalCols = await prisma.boardColumn.findMany({ where: { boardId: board.id } });
    const requiredTitles = new Set(required.map(r => r.title));
    for (const col of finalCols) {
      if (!requiredTitles.has(col.title)) {
        // Move tasks to "Backlog" before deleting
        const backlogCol = finalCols.find(c => c.title === "Backlog");
        if (backlogCol) {
          await prisma.boardTask.updateMany({ where: { columnId: col.id }, data: { columnId: backlogCol.id } });
        }
        await prisma.boardColumn.delete({ where: { id: col.id } });
        console.log(`  Removed old column: "${col.title}"`);
      }
    }

    console.log(`  ✅ Board "${board.name}" updated.`);
  }

  console.log("\n✅ All boards migrated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
