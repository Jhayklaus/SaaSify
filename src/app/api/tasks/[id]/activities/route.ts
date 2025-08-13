import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const taskId = Number(idParam);
  try {
    const activities = await prisma.activity.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(activities, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
