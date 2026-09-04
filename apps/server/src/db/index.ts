import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[Warning] DATABASE_URL environment variable is missing in serverless environment.');
}

const db = drizzle(connectionString || 'postgresql://localhost:5432/postgres');

export default db;

