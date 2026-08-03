import pg from "pg";
import { DATABASE_URL } from "./config.js";

const pool = new pg.Pool({ connectionString: DATABASE_URL });

const READ_ONLY_RE = /^\s*(SELECT|SHOW|WITH)\b/i;

export async function query(sql, params = []) {
  if (!READ_ONLY_RE.test(sql)) {
    throw new Error(`E2E db helper only allows read-only statements, got: ${sql.slice(0, 80)}`);
  }
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

export async function count(table, where = "", params = []) {
  const rows = await query(`SELECT COUNT(*)::int AS n FROM ${table} ${where}`, params);
  return rows[0].n;
}

export async function close() {
  await pool.end();
}
