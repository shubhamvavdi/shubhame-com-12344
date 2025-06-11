import dotenv from "dotenv";
dotenv.config();

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";


neonConfig.webSocketConstructor = ws;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL missing in .env");
  process.exit(1);
}

console.log("✅ Loaded DATABASE_URL:", url);

export const pool = new Pool({ connectionString: url });
export const db = drizzle(pool, { schema });
