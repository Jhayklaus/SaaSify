import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { taskCreateSchema } from '@/lib/validators';
import { z } from 'zod';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySchema = z.object({
    organizationId: z.coerce.number().int().optional(),
  });
  const parsed = querySchema.safeParse({
    organizationId: searchParams.get('organizationId') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }
  const { organizationId } = parsed.data;

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
  try {
    if (!checkRateLimit(request)) {
      return rateLimitResponse();
    }

    const body = await request.json();
    const parsed = taskCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const task = await prisma.task.create({ data: parsed.data });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
