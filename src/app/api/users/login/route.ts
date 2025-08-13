import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { loginSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    // Rate limiting to prevent brute force attempts
    if (!checkRateLimit(request)) {
      return rateLimitResponse();
    }

    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
        organizationId: true,
      },
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

    // Remove password from response
    const { password: _password, ...safeUser } = user;

    return NextResponse.json(safeUser, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
