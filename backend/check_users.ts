import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.boardUser.findMany();
  console.log("Board Users:");
  console.table(users);
  
  const systemUsers = await prisma.systemUser.findMany();
  console.log("System Users:");
  console.table(systemUsers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
