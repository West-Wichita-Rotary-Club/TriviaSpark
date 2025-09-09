import { defineConfig } from "drizzle-kit";
import { join } from "path";

// Default to platform-appropriate path
const DEFAULT_DATABASE_PATH =
  process.platform === "win32"
    ? "C:\\websites\\TriviaSpark\\trivia.db"
    : join(process.cwd(), "data", "trivia.db");

const DATABASE_URL =
  process.env.DATABASE_URL || `file:${DEFAULT_DATABASE_PATH}`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
