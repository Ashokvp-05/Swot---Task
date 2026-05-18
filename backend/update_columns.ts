import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const boards = await prisma.board.findMany({
    include: {
      columns: {
        orderBy: { order: "asc" },
      },
    },
  });

  const newCols = [
    { title: "To Do", color: "#6b7280" },
    { title: "Ongoing", color: "#3b82f6" },
    { title: "Backlog testing", color: "#8b5cf6" },
    { title: "Hold on", color: "#ef4444" },
  ];

  for (const board of boards) {
    console.log(`Updating columns for board: ${board.name}`);
    for (let i = 0; i < newCols.length; i++) {
      if (i < board.columns.length) {
        // Update existing column
        await prisma.boardColumn.update({
          where: { id: board.columns[i].id },
          data: {
            title: newCols[i].title,
            color: newCols[i].color,
          },
        });
      } else {
        // Create new column if missing
        await prisma.boardColumn.create({
          data: {
            title: newCols[i].title,
            color: newCols[i].color,
            order: i,
            boardId: board.id,
          },
        });
      }
    }
    
    // Optional: delete extra columns if any (we'll leave them for safety)
  }
  
  console.log("Columns updated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
