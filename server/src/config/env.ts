import { config } from 'dotenv';
import path from 'path';

// Resolve the correct .env file from the root directory
const envFile = path.resolve(
  process.cwd(),
  `.env.${process.env.NODE_ENV || 'development'}.local`,
);

config({ path: envFile });

export const { PORT, N8N_WEBHOOK_URL, API_BASE_URL } = process.env;
