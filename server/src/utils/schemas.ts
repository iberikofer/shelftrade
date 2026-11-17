import { z } from 'zod';

/**
 * Validates that a URL is either empty, a relative server upload path, or
 * a fully-qualified http/https URL. Shared across auth, books, and me controllers.
 */
export const safeUrlSchema = z
  .string()
  .max(1000)
  .refine(
    val => {
      if (!val || val.trim() === '') return true;
      if (val.startsWith('/uploads/')) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must start with http:// or https://' },
  )
  .optional()
  .or(z.literal(''));
