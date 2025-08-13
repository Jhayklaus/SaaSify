import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { userUpdateSchema } from '@/lib/validators';
import { z } from 'zod';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const data = parsed.data;

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });
    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
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
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
