import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/** PostgreSQL + `prisma migrate` akışı; şema: prisma/schema.prisma */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
