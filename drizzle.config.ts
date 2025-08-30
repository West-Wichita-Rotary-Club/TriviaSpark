import { defineConfig } from "drizzle-kit";

// Default to SQLite file if no DATABASE_URL is provided
const DATABASE_URL = process.env.DATABASE_URL || "./data/trivia.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
