import type { FieldError } from 'react-hook-form';
import { z } from 'zod';

export function zodResolver<T extends z.ZodTypeAny>(schema: T) {
  return async (values: unknown): Promise<{ values: z.infer<T> | {}; errors: Record<string, FieldError> }> => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const fieldErrors: Record<string, FieldError> = {};
    result.error.errors.forEach((err) => {
      const path = err.path[0] as string;
      if (!fieldErrors[path]) {
        fieldErrors[path] = { type: err.code, message: err.message };
      }
    });

    return { values: {}, errors: fieldErrors };
  };
}
