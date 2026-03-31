import { query } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../logger";

const SALT_ROUNDS = 10;

export async function createUser({ username, password, display_name }: { username: string; password: string; display_name: string; }) {
  // check exists
  const exists = await query("SELECT id FROM users WHERE username = $1", [username]);
  if ((exists.rowCount ?? 0) > 0) {
    const err: any = new Error("username_taken");
    err.status = 409;
    logger.warn({ username }, "username_taken");
    throw err;
  }
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO users (username, display_name, password_hash) VALUES ($1, $2, $3) RETURNING id, username, display_name, created_at`,
    [username, display_name, password_hash]
  );
  return result.rows[0];
}

export async function authenticateUser({ username, password }: { username: string; password: string; }) {
  const result = await query("SELECT id, username, password_hash FROM users WHERE username = $1", [username]);
  if ((result.rowCount ?? 0) === 0) {
    const err: any = new Error("invalid_credentials");
    err.status = 401;
    throw err;
  }
  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err: any = new Error("invalid_credentials");
    err.status = 401;
    throw err;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: "7d" });
  logger.info({ userId: user.id, username: user.username }, "user_authenticated");
  return token;
}

export async function getUserByUsername(username: string) {
  const result = await query("SELECT id, username, display_name, bio, created_at FROM users WHERE username = $1", [username]);
  if ((result.rowCount ?? 0) === 0) return null;
  return result.rows[0];
}
