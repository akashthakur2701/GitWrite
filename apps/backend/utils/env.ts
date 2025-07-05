import type { Env } from '../type/env';

export const validateEnv = (env: Env): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  } else if (!env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  if (!env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const logEnvStatus = (env: Env): void => {
  const validation = validateEnv(env);
  
  if (validation.isValid) {
    console.log('✅ Environment variables validation passed');
  } else {
    console.error('❌ Environment variables validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
};
