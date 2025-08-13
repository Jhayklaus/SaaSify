import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export type Role = 'admin' | 'manager' | 'user';

interface AuthUser {
  id: number;
  role: Role;
  organizationId: number;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}

interface Options {
  roles?: Role[];
}

export function withAuth(
  handler: (req: AuthRequest, ...args: unknown[]) => Promise<Response>,
  options: Options = {}
) {
  return async (req: Request, ...args: unknown[]) => {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT secret not configured');
      }
      const payload = jwt.verify(token, jwtSecret) as { id: number };
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, role: true, organizationId: true },
      });
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (options.roles && !options.roles.includes(user.role as Role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Enforce organizationId scope if provided in query
      const url = new URL(req.url);
      const orgParam = url.searchParams.get('organizationId');
      if (orgParam && Number(orgParam) !== user.organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      (req as AuthRequest).user = user as AuthUser;
      return handler(req as AuthRequest, ...args);
    } catch (err) {
      console.error('AUTH_ERROR', err);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}

