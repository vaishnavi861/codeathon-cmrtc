import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This is a placeholder for the actual connection string
// In a real app, this would come from process.env.DATABASE_URL
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/career_score';

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
