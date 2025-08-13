import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { taskUpdateSchema } from '@/lib/validators';

const idSchema = z.coerce.number().int();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = idSchema.safeParse(idParam);
  if (!id.success) {
    return NextResponse.json(
      { error: id.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  try {
    const task = await prisma.task.findUnique({ where: { id: id.data } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkRateLimit(request)) {
    return rateLimitResponse();
  }

  const { id: idParam } = await params;
  const id = idSchema.safeParse(idParam);
  if (!id.success) {
    return NextResponse.json(
      { error: id.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const data = taskUpdateSchema.safeParse(await request.json());
  if (!data.success) {
    return NextResponse.json(
      { error: data.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  try {
    const existingTask = await prisma.task.findUnique({ where: { id: id.data } });
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: id.data },
      data: data.data,
    });

    // Build field-level logs
    const logs: {
      taskId: string;
      field: string;
      oldValue: string | null;
      newValue: string | null;
      action: string;
    }[] = [];

    if (data.data.status && data.data.status !== existingTask.status) {
      logs.push({
        taskId: task.id.toString(),
        field: 'status',
        oldValue: existingTask.status,
        newValue: data.data.status,
        action: `STATUS_CHANGED: ${data.data.status}`,
      });
    }

    if (
      data.data.assignedTo &&
      data.data.assignedTo !== (existingTask as any).assignedTo
    ) {
      logs.push({
        taskId: task.id.toString(),
        field: 'assignee',
        oldValue: String((existingTask as any).assignedTo),
        newValue: String(data.data.assignedTo),
        action: `ASSIGNEE_CHANGED`,
      });
    }

    if (data.data.priority && data.data.priority !== existingTask.priority) {
      logs.push({
        taskId: task.id.toString(),
        field: 'priority',
        oldValue: existingTask.priority,
        newValue: data.data.priority,
        action: `PRIORITY_CHANGED: ${data.data.priority}`,
      });
    }

    if (logs.length > 0) {
      await prisma.activityLog.createMany({ data: logs });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkRateLimit(request)) {
    return rateLimitResponse();
  }

  const { id: idParam } = await params;
  const id = idSchema.safeParse(idParam);
  if (!id.success) {
    return NextResponse.json(
      { error: id.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  try {
    await prisma.task.delete({ where: { id: id.data } });
    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
