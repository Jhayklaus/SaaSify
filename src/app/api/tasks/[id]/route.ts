import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { taskUpdateSchema } from '@/lib/validators';
import { z } from 'zod';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const idResult = z.coerce.number().int().safeParse(idParam);
  if (!idResult.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const id = idResult.data;

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
  if (!checkRateLimit(request)) {
    return rateLimitResponse();
  }
  const { id: idParam } = await params;
  const idResult = z.coerce.number().int().safeParse(idParam);
  if (!idResult.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const id = idResult.data;
  const body = await request.json();
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const task = await prisma.task.update({ where: { id }, data: parsed.data });
    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkRateLimit(request)) {
    return rateLimitResponse();
  }
  const { id: idParam } = await params;
  const idResult = z.coerce.number().int().safeParse(idParam);
  if (!idResult.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const id = idResult.data;

  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
