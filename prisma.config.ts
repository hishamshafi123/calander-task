import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const databaseUrl = env("DATABASE_URL");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
});
