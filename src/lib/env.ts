import { z } from 'zod';

// Handles empty strings from Docker env defaults (e.g. ${VAR:-})
const optionalUrl = z.string().url().optional().or(z.literal(''));

const envSchema = z.object({
  // Database (required)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // NextAuth (required)
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: optionalUrl,

  // Public
  NEXT_PUBLIC_API_MODE: z.enum(['mock', 'ostrovok']).default('mock'),
  NEXT_PUBLIC_BASE_URL: optionalUrl,

  // Ostrovok (optional — mock mode works without)
  OSTROVOK_KEY_ID: z.string().optional(),
  OSTROVOK_API_KEY: z.string().optional(),
  OSTROVOK_BASE_URL: optionalUrl,

  // OAuth (optional — email auth works without)
  AUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  AUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  AUTH_YANDEX_CLIENT_ID: z.string().optional(),
  AUTH_YANDEX_CLIENT_SECRET: z.string().optional(),

  // SMTP (optional — emails silently skip without)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_SECRET: z.string().optional(),

  // YooKassa (optional — cash payment works without)
  YOOKASSA_SHOP_ID: z.string().optional(),
  YOOKASSA_SECRET_KEY: z.string().optional(),
  YOOKASSA_RETURN_URL: optionalUrl,

  // Cron
  CRON_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const formatted = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');

    console.error(`\n❌ Invalid environment variables:\n${formatted}\n`);
    throw new Error('Invalid environment variables');
  }

  return result.data;
}

export const env = validateEnv();
