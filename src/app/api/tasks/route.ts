import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { taskCreateSchema } from '@/lib/validators';
import { withAuth, AuthRequest } from '@/middleware/withAuth';

const getTasksQuerySchema = z.object({
  organizationId: z.coerce.number().int().optional(),
});

export const GET = withAuth(async (request: AuthRequest) => {
  const query = getTasksQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!query.success) {
    return NextResponse.json(
      { error: query.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

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
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: AuthRequest) => {
  if (!checkRateLimit(request)) {
    return rateLimitResponse();
  }

  const body = taskCreateSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  try {
    const { user } = request;
    const data = body.data;

    if (user.role === 'user') {
      // Force assigning to self for normal users
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
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
});
