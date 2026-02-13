import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default categories
  const categories = [
    { name: "Physical", icon: "💪", color: "#3b82f6", order: 0 },
    { name: "Money", icon: "💰", color: "#10b981", order: 1 },
    { name: "Education", icon: "📚", color: "#8b5cf6", order: 2 },
    { name: "Chores", icon: "🧹", color: "#f59e0b", order: 3 },
    { name: "Health", icon: "❤️", color: "#ef4444", order: 4 },
    { name: "Relationship", icon: "👥", color: "#ec4899", order: 5 },
    { name: "Hobbies", icon: "🎨", color: "#06b6d4", order: 6 },
    { name: "Entertainment", icon: "🎬", color: "#a855f7", order: 7 },
    { name: "Life Admin", icon: "📋", color: "#6366f1", order: 8 },
    { name: "Shopping", icon: "🛒", color: "#14b8a6", order: 9 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: `cat_${category.name.toLowerCase().replace(" ", "_")}` },
      update: {},
      create: {
        id: `cat_${category.name.toLowerCase().replace(" ", "_")}`,
        ...category,
      },
    });
  }

  console.log("✅ Created 10 default categories");

  // Create default settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      weekStartsOn: 1,
      defaultView: "month",
      darkMode: false,
      showCompleted: true,
      defaultStatus: "not-started",
    },
  });

  console.log("✅ Created default settings");

  // Create a sample task
  const physicalCategory = await prisma.category.findFirst({
    where: { name: "Physical" },
  });

  if (physicalCategory) {
    await prisma.task.create({
      data: {
        title: "Morning workout",
        description: "Do 30 minutes of cardio",
        date: new Date(),
        startTime: "07:00",
        endTime: "07:30",
        status: "not-started",
        priority: "high",
        categoryId: physicalCategory.id,
      },
    });

    console.log("✅ Created sample task");
  }

  console.log("🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
