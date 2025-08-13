import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { userCreateSchema } from '@/lib/validators';
import { z } from 'zod';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySchema = z.object({
    email: z.string().email().optional(),
    organizationId: z.coerce.number().int().optional(),
  });
  const parsed = querySchema.safeParse({
    email: searchParams.get('email') ?? undefined,
    organizationId: searchParams.get('organizationId') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }
  const { email, organizationId } = parsed.data;

  try {
    const users = await prisma.user.findMany({
      where: {
        ...(email ? { email } : {}),
        ...(organizationId ? { organizationId } : {}),
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
}

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(request)) {
      return rateLimitResponse();
    }

    const body = await request.json();
    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { password, ...rest } = parsed.data;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
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
}
