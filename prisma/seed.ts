// prisma/seed.ts
import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Random data helpers
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomName = (i: number) => `User${i}`;
const generateEmail = (i: number) => `user${i}@example.com`;
const generateRole = (): Role =>
  Math.random() > 0.5 ? Role.MANAGER : Role.USER;
const generateStatus = (): TaskStatus => {
  const statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED];
  return statuses[randomInt(0, statuses.length - 1)];
};
const generatePriority = (): TaskPriority => {
  const priorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];
  return priorities[randomInt(0, priorities.length - 1)];
};

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('❌ Seeding in production is not allowed');
    return;
  }

  console.log('🌱 Starting seed...');

  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create base orgs
  const adminOrg = await prisma.organization.create({
    data: { name: 'Admin Org', sector: 'General', phone: '1111111111' }
  });
  const managerOrg = await prisma.organization.create({
    data: { name: 'Manager Org', sector: 'General', phone: '2222222222' }
  });
  const userOrg = await prisma.organization.create({
    data: { name: 'User Org', sector: 'General', phone: '3333333333' }
  });

  // Create fixed test accounts
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      role: Role.ADMIN,
      password: await bcrypt.hash('password123', 10),
      organizationId: adminOrg.id,
      profile: { create: { bio: 'Admin user' } }
    }
  });

  await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      role: Role.MANAGER,
      password: await bcrypt.hash('password123', 10),
      organizationId: managerOrg.id,
      profile: { create: { bio: 'Manager user' } }
    }
  });

  await prisma.user.create({
    data: {
      name: 'Charlie',
      email: 'charlie@example.com',
      role: Role.USER,
      password: await bcrypt.hash('password123', 10),
      organizationId: userOrg.id,
      profile: { create: { bio: 'Regular user' } }
    }
  });

  // Generate random users for testing
  const randomUsers: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const newUser = await prisma.user.create({
      data: {
        name: generateRandomName(i),
        email: generateEmail(i),
        role: generateRole(),
        password: await bcrypt.hash('password123', 10),
        organizationId: userOrg.id,
        profile: { create: { bio: `Bio for user ${i}` } }
      }
    });
    randomUsers.push(newUser);
  }

  // Create tasks for random users
  for (let i = 1; i <= 35; i++) {
    const assignee = randomUsers[randomInt(0, randomUsers.length - 1)];
    await prisma.task.create({
      data: {
        title: `Task ${i}`,
        status: generateStatus(),
        priority: generatePriority(),
        organizationId: userOrg.id,
        assigneeId: assignee.id,
        createdById: assignee.id
      }
    });
  }

  console.log('✅ Seed complete. Added admin, manager, user, random users, and tasks.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
