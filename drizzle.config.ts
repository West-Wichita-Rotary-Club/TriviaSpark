import { defineConfig } from "drizzle-kit";

// Default to the consistent absolute path
const DATABASE_URL = process.env.DATABASE_URL || "C:\\websites\\TriviaSpark\\trivia.db";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
