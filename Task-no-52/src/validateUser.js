import { z } from 'zod';
export const userSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
});
export function validateUser(input) {
  const result = userSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  const errors = {};
  for (const issue of result.error.issues) errors[issue.path[0] ?? 'form'] ??= issue.message;
  return { success: false, errors };
}
