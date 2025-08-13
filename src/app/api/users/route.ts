import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { userCreateSchema } from '@/lib/validators';
import { z } from 'zod';
import { withAuth, AuthRequest } from '@/middleware/withAuth';

const ROLES = ['admin', 'manager', 'user'] as const;

const userQuerySchema = z.object({
  email: z.string().email().optional(),
  organizationId: z.coerce.number().int().optional(),
});

export const GET = withAuth(async (request: AuthRequest) => {
  const parsed = userQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  try {
    const users = await prisma.user.findMany({
      where: {
        ...(email ? { email } : {}),
        organizationId: request.user.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}, { roles: ['admin', 'manager'] });

export const POST = withAuth(async (request: AuthRequest) => {
  if (!checkRateLimit(request)) {
    return rateLimitResponse();
  }

  const body = userCreateSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const { name, email, role, password, organizationId } = body.data;

  try {
    // Only allow creating users in the same organization
    if (organizationId !== request.user.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}, { roles: ['admin'] });
