import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const getTasksQuerySchema = z.object({
  organizationId: z.coerce.number().int().optional(),
});

const createTaskSchema = z.object({
  title: z.string(),
  assignedTo: z.number().int(),
  status: z.string(),
});

export async function GET(request: Request) {
  const query = getTasksQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!query.success) {
    return NextResponse.json(
      { error: query.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const { organizationId } = query.data;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        ...(organizationId ? { user: { organizationId } } : {}),
      },
    });
    return NextResponse.json(tasks, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = createTaskSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  try {
    const task = await prisma.task.create({ data: body.data });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
