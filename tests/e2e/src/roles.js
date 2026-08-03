import pg from "pg";
import { DATABASE_URL } from "./config.js";

const pool = new pg.Pool({ connectionString: DATABASE_URL });

export async function promoteRole({ email, role }) {
  const result = await pool.query(
    "UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role",
    [role, email]
  );
  return result.rows[0] ?? null;
}

export async function readUserByEmail(email) {
  const result = await pool.query(
    "SELECT id, email, role, \"isVerified\", \"authProvider\", \"otpCode\" FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return result.rows[0] ?? null;
}

export async function setRoleIfDifferent({ email, role }) {
  const user = await readUserByEmail(email);
  if (!user) return null;
  if (user.role !== role) {
    const updated = await promoteRole({ email, role });
    return { changed: true, user: updated };
  }
  return { changed: false, user };
}

export async function close() {
  await pool.end();
}
