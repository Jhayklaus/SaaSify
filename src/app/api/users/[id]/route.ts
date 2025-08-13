import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { userUpdateSchema } from '@/lib/validators';
import { z } from 'zod';

const ROLES = ['admin', 'manager', 'user'] as const;
const idSchema = z.coerce.number().int();

export async function PATCH(
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

  const body = userUpdateSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  // Restrict role changes to admins only
  const currentUserRole = request.headers.get('x-user-role');
  if (body.data.role && currentUserRole !== 'admin') {
    return NextResponse.json(
      { error: 'Only admins can change roles' },
      { status: 403 }
    );
  }

  const data = { ...body.data };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id: id.data },
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
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
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
    await prisma.user.delete({ where: { id: id.data } });
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
