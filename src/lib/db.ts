import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../../drizzle/schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
export const db = drizzle(pool, { schema })
export type DbType = typeof db

// Re-export schema tables for convenient imports via @/lib/db
export * from '../../drizzle/schema'
