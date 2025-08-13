import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { loginSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(request)) {
      return rateLimitResponse();
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, password: true, organizationId: true },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { password: passwordHash, ...safeUser } = user;
    void passwordHash;

    return NextResponse.json(safeUser, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}

