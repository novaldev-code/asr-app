import { env } from "../config/env.js";
import { createDatabase } from "./client.js";

const instance = createDatabase(env.DATABASE_URL);

export const db = instance.db;
export const pool = instance.pool;
