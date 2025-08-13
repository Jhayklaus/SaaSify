// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('❌ Seeding in production is not allowed');
    return;
  }

  console.log('🌱 Starting seed...');

  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const adminOrg = await prisma.organization.create({
    data: { name: 'Admin Org', sector: 'General', phone: '1111111111' }
  });

  const managerOrg = await prisma.organization.create({
    data: { name: 'Manager Org', sector: 'General', phone: '2222222222' }
  });

  const userOrg = await prisma.organization.create({
    data: { name: 'User Org', sector: 'General', phone: '3333333333' }
  });

  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      role: Role.ADMIN,
      password: await bcrypt.hash('password123', 10),
      organization: { connect: { id: adminOrg.id } },
      profile: { create: { bio: 'Admin user' } }
    }
  });

  await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      role: Role.MANAGER,
      password: await bcrypt.hash('password123', 10),
      organization: { connect: { id: managerOrg.id } },
      profile: { create: { bio: 'Manager user' } }
    }
  });

  await prisma.user.create({
    data: {
      name: 'Charlie',
      email: 'charlie@example.com',
      role: Role.USER,
      password: await bcrypt.hash('password123', 10),
      organization: { connect: { id: userOrg.id } },
      profile: { create: { bio: 'Regular user' } }
    }
  });

  console.log('✅ Seed complete. Added admin, manager and user.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

