import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth, AuthRequest } from '@/middleware/withAuth';

export const GET = withAuth(async (request: AuthRequest) => {
  try {
    const { user } = request;
    const where =
      user.role === 'user'
        ? { userId: user.id }
        : { user: { organizationId: user.organizationId } };
    const tasks = await prisma.task.findMany({ where });
    return NextResponse.json(tasks, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
});

export const POST = withAuth(async (request: AuthRequest) => {
  try {
    const data = await request.json();
    const { user } = request;

    if (user.role === 'user') {
      data.userId = user.id;
    } else {
      if (!data.userId) {
        return NextResponse.json(
          { error: 'userId is required' },
          { status: 400 }
        );
      }
      const targetUser = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { organizationId: true },
      });
      if (!targetUser || targetUser.organizationId !== user.organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const task = await prisma.task.create({ data });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
});

