import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const adapter = new PrismaPg(
  new Pool({ connectionString: process.env.DATABASE_URL })
);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Migrating to role-based system...");

  // Find all existing users and set isAdmin = true (they were all admins before)
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log("No users found. Skipping migration.");
    return;
  }

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isAdmin: true,
        isActive: true,
      },
    });
    console.log(`✅ Set user "${user.username}" as admin`);
  }

  console.log(`\n🎉 Migration completed! ${users.length} user(s) updated.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Migration failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
