import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Inject test fallbacks if running in Jest/testing environment
if (process.env.NODE_ENV === 'test') {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/test';
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecretjwtaccesskeyforlocaltestingonly';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretjwtrefreshkeyforlocaltestingonly';
}

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  PORT: z.coerce.number().default(3000),
  WEB_URL: z.string().url().default('http://localhost:3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingOrInvalid = error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('\n');
    console.error(`❌ Environment validation failed:\n${missingOrInvalid}`);
  } else {
    console.error('❌ Unknown error during environment validation:', error);
  }
  process.exit(1);
}

export const env = validatedEnv;
