import { Pool, types } from "pg";
import { env } from "./config/env.js";

// Parse NUMERIC (oid 1700) columns as numbers instead of strings
types.setTypeParser(1700, (val) => parseFloat(val));

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});