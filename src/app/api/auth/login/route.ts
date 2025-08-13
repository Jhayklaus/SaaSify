import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

    // 2️⃣ Explicitly fetch the hashed password
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, password: true, organizationId: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3️⃣ Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password as string);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 4️⃣ Issue the token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json(
        { error: 'JWT secret not configured' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // 5️⃣ Never return the hash
    const { password: passwordHash, ...safeUser } = user;
    void passwordHash;
    return NextResponse.json({ user: safeUser, token, password: null }, { status: 200 });
  } catch (err) {
    console.error('LOGIN_ERROR', err);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
