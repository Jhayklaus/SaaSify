// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomName = (i: number) => `User${i}`;
const generateEmail = (i: number) => `user${i}@example.com`;
const generateRole = () => (Math.random() > 0.5 ? 'manager' : 'user') as 'manager' | 'user';
const generateStatus = () => {
  const statuses = ['pending', 'in-progress', 'completed'];
  return statuses[randomInt(0, statuses.length - 1)];
};

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('❌ Seeding in production is not allowed');
    return;
  }

  console.log('🌱 Starting seed...');

  // Step 1: Base users (Admin, Manager, User)
  const baseUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: { name: 'Alice', email: 'alice@example.com', role: 'admin', password: 'password123' },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: { name: 'Bob', email: 'bob@example.com', role: 'manager', password: 'password123' },
    }),
    prisma.user.upsert({
      where: { email: 'charlie@example.com' },
      update: {},
      create: { name: 'Charlie', email: 'charlie@example.com', role: 'user', password: 'password123' },
    }),
  ]);

  // Step 2: Add 50 more users (random manager/user, no admins)
  const extraUsers = await Promise.all(
    Array.from({ length: 50 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: generateRandomName(i + 4),
          email: generateEmail(i + 4),
          role: generateRole(),
          password: 'password123',
        },
      })
    )
  );

  const allUsers = [...baseUsers, ...extraUsers];

  // Step 3: Wipe tasks before seeding
  await prisma.task.deleteMany();

  // Step 4: Add 35+ tasks assigned to random users
  const totalTasks = 35;
  const taskData = Array.from({ length: totalTasks }).map((_, i) => ({
    title: `Task ${i + 1}`,
    status: generateStatus(),
    assignedTo: allUsers[randomInt(0, allUsers.length - 1)].id,
  }));

  await prisma.task.createMany({ data: taskData });

  console.log(`✅ Seed complete. Added ${allUsers.length} users and ${totalTasks} tasks.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
