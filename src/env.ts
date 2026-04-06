import { z } from 'zod';

const envSchema = z.object({
  // Clerk
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().url().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().url().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().optional(),

  // Database
  DATABASE_URL: z.string().min(1),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),

  // Email
  RESEND_API_KEY: z.string().min(1),

  // Pusher
  NEXT_PUBLIC_PUSHER_APP_KEY: z.string().min(1),
  PUSHER_APP_ID: z.string().min(1),
  PUSHER_SECRET: z.string().min(1),

  // Upload Thing
  UPLOADTHING_SECRET: z.string().min(1),
  NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string().min(1),

  // Screenshot API
  SCREENSHOTONE_API_KEY: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Environment = z.infer<typeof envSchema>;

const env = envSchema.parse(process.env);

export default env;
