import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1),
});

export const taskCreateSchema = z.object({
  title: z.string().min(1),
  assignedTo: z.number().int(),
  status: z.string().min(1),
});

export const taskUpdateSchema = taskCreateSchema.partial();

const roles = ['admin', 'manager', 'user'] as const;

export const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(roles),
  password: z.string().min(1).optional(),
  organizationId: z.number().int(),
});

export const userUpdateSchema = userCreateSchema.partial();
