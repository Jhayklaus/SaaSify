import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  
  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await request.json();

  try {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    const task = await prisma.task.update({ where: { id }, data });

    if (existingTask) {
      const logs = [] as {
        taskId: number;
        field: string;
        oldValue: string | null;
        newValue: string | null;
      }[];

      if (
        data.status &&
        data.status !== existingTask.status
      ) {
        logs.push({
          taskId: id,
          field: 'status',
          oldValue: existingTask.status,
          newValue: data.status,
        });
      }

      if (
        data.assignedTo &&
        data.assignedTo !== existingTask.assignedTo
      ) {
        logs.push({
          taskId: id,
          field: 'assignee',
          oldValue: String(existingTask.assignedTo),
          newValue: String(data.assignedTo),
        });
      }

      if (
        data.priority &&
        data.priority !== existingTask.priority
      ) {
        logs.push({
          taskId: id,
          field: 'priority',
          oldValue: existingTask.priority,
          newValue: data.priority,
        });
      }

      if (logs.length > 0) {
        await prisma.activityLog.createMany({ data: logs });
      }
    }

    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  
  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}