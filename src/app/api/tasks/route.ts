import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId')
    ? Number(searchParams.get('organizationId'))
    : undefined;

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
    const data = await request.json();
    const task = await prisma.task.create({ data });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
