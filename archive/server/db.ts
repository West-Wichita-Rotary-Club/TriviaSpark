/**
 * Database Configuration - SQLite with LibSQL
 *
 * Local Development:
 * - Uses file:./data/trivia.db by default
 * - Data persists between server restarts
 * - Full CRUD operations available
 *
 * Production Options:
 * - Local SQLite: DATABASE_URL=file:./data/trivia.db
 * - Turso Distributed: DATABASE_URL=libsql://your-db.turso.io (requires TURSO_AUTH_TOKEN)
 *
 * GitHub Pages: No database (static build only)
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@shared/schema";

// Use SQLite database file or Turso URL
const DATABASE_URL = process.env.DATABASE_URL || "file:./data/trivia.db";

const client = createClient({
  url: DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN, // Optional, only needed for Turso
});

export const db = drizzle(client, { schema });
