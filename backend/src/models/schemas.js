import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const AccountSchema = z.object({
  name: z.string().min(2)
});

export const EntrySchema = z.object({
  type: z.enum(['expense', 'income', 'investment']),
  title: z.string().min(2),
  amount: z.number().positive(),
  category: z.string().optional().default('Geral'),
  date: z.string().datetime().or(z.string().min(8))
});

export const QueryFiltersSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  type: z.enum(['expense', 'income', 'investment']).optional(),
  category: z.string().optional()
});
