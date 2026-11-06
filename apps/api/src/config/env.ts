import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/setsuzoku_os?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'setsuzoku-os-super-secret-jwt-key-2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'setsuzoku-os-super-secret-refresh-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

