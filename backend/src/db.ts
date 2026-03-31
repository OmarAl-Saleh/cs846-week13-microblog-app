import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
// Top-level implementation pointer for query; assigned below based on env
type QueryResult = { rows: any[]; rowCount: number };
type QueryFn = (text: string, params?: any[]) => Promise<QueryResult>;
let implQuery: QueryFn;
export let pool: any;

// Development in-memory implementation
if (process.env.DEV_USE_IN_MEMORY_DB === "true") {
  const state = {
    users: [] as Array<any>,
    posts: [] as Array<any>,
    likes: [] as Array<any>,
  };
  let userId = 1;
  let postId = 1;

  implQuery = async function (text: string, params?: any[]) {
    const t = (text || "").trim();

    // Users
    if (t.startsWith("SELECT id FROM users WHERE username")) {
      const username = params ? params[0] : undefined;
      const found = state.users.find((u) => String(u.username).toLowerCase() === String(username).toLowerCase());
      return { rows: found ? [{ id: found.id }] : [], rowCount: found ? 1 : 0 };
    }
    if (t.startsWith("SELECT id, username, password_hash FROM users WHERE username")) {
      const username = params ? params[0] : undefined;
      const found = state.users.find((u) => String(u.username).toLowerCase() === String(username).toLowerCase());
      return { rows: found ? [{ id: found.id, username: found.username, password_hash: found.password_hash }] : [], rowCount: found ? 1 : 0 };
    }
    if (t.startsWith("SELECT id, username, display_name, bio, created_at FROM users WHERE username")) {
      const username = params ? params[0] : undefined;
      const found = state.users.find((u) => String(u.username).toLowerCase() === String(username).toLowerCase());
      return { rows: found ? [{ id: found.id, username: found.username, display_name: found.display_name || null, bio: found.bio || null, created_at: found.created_at }] : [], rowCount: found ? 1 : 0 };
    }
    if (t.startsWith("INSERT INTO users")) {
      const username = params ? params[0] : undefined;
      const display_name = params ? params[1] : undefined;
      const password_hash = params ? params[2] : undefined;
      const now = new Date().toISOString();
      const u = { id: userId++, username, display_name, password_hash, created_at: now };
      state.users.push(u);
      return { rows: [{ id: u.id, username: u.username, display_name: u.display_name, created_at: u.created_at }], rowCount: 1 };
    }

    // Posts
    if (t.startsWith("SELECT id, parent_post_id FROM posts WHERE id =")) {
      const id = params ? params[0] : undefined;
      const p = state.posts.find((x) => x.id === id);
      return { rows: p ? [{ id: p.id, parent_post_id: p.parent_post_id ?? null }] : [], rowCount: p ? 1 : 0 };
    }
    if (t.startsWith("INSERT INTO posts")) {
      const user_id = params ? params[0] : undefined;
      const content = params ? params[1] : undefined;
      const parent_post_id = params ? params[2] : undefined;
      const created_at = new Date().toISOString();
      const p = { id: postId++, user_id, content, parent_post_id: parent_post_id || null, created_at };
      state.posts.push(p);
      return { rows: [{ id: p.id, user_id: p.user_id, content: p.content, parent_post_id: p.parent_post_id, created_at: p.created_at }], rowCount: 1 };
    }

    // Global feed
    if (t.startsWith("SELECT p.id, p.user_id, p.content")) {
      const limit = (params && params[0]) || 20;
      const offset = (params && params[1]) || 0;
      const topLevel = state.posts.filter((p) => p.parent_post_id == null).slice();
      // compute like_count for ordering
      const withCounts = topLevel.map((p) => {
        const like_count = state.likes.filter((l) => l.post_id === p.id).length;
        return { p, like_count };
      });
      withCounts.sort((a, b) => {
        if (b.like_count !== a.like_count) return b.like_count - a.like_count;
        return a.p.created_at < b.p.created_at ? 1 : -1;
      });
      const rows = withCounts.slice(offset, offset + limit).map(({ p, like_count }) => {
        const u = state.users.find((x) => x.id == p.user_id) || { username: null, display_name: null };
        const reply_count = state.posts.filter((r) => r.parent_post_id === p.id).length;
        return { id: p.id, user_id: p.user_id, content: p.content, parent_post_id: p.parent_post_id, created_at: p.created_at, username: u.username, display_name: u.display_name, like_count, reply_count };
      });
      return { rows, rowCount: rows.length };
    }

    // Replies
    if (t.startsWith("SELECT p.id, p.user_id, p.content, p.parent_post_id, p.created_at,")) {
      const postIdParam = params ? params[0] : undefined;
      const replies = state.posts.filter((p) => p.parent_post_id === postIdParam).slice().sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
      const rows = replies.map((p) => {
        const u = state.users.find((x) => x.id == p.user_id) || { username: null, display_name: null };
        const like_count = state.likes.filter((l) => l.post_id === p.id).length;
        return { id: p.id, user_id: p.user_id, content: p.content, parent_post_id: p.parent_post_id, created_at: p.created_at, username: u.username, display_name: u.display_name, like_count };
      });
      return { rows, rowCount: rows.length };
    }

    // Likes: insert
    if (t.startsWith("INSERT INTO likes")) {
      const user_id = params ? params[0] : undefined;
      const post_id = params ? params[1] : undefined;
      const exists = state.likes.find((l) => l.user_id === user_id && l.post_id === post_id);
      if (!exists) state.likes.push({ user_id, post_id });
      return { rows: [], rowCount: exists ? 0 : 1 };
    }
    if (t.startsWith("SELECT count(*)::int") && t.includes("FROM likes WHERE post_id")) {
      const post_id = params ? params[0] : undefined;
      const c = state.likes.filter((l) => l.post_id === post_id).length;
      return { rows: [{ like_count: c }], rowCount: 1 };
    }

    // Posts by username (match several SQL formatting variants, e.g. LOWER(u.username) = LOWER($1))
    if (t.includes("u.username") && t.includes("parent_post_id IS NULL")) {
      const username = params ? params[0] : undefined;
      const limit = params ? params[1] : 20;
      const offset = params ? params[2] : 0;
      const u = state.users.find((x) => String(x.username).toLowerCase() === String(username).toLowerCase());
      if (!u) return { rows: [], rowCount: 0 };
      const posts = state.posts.filter((p) => p.user_id == u.id && p.parent_post_id == null).slice();
      const withCounts = posts.map((p) => ({ p, like_count: state.likes.filter((l) => l.post_id === p.id).length }));
      withCounts.sort((a, b) => {
        if (b.like_count !== a.like_count) return b.like_count - a.like_count;
        return a.p.created_at < b.p.created_at ? 1 : -1;
      });
      const rows = withCounts.slice(offset, offset + limit).map(({ p, like_count }) => ({ id: p.id, user_id: p.user_id, content: p.content, parent_post_id: p.parent_post_id, created_at: p.created_at, username: u.username, display_name: u.display_name, like_count, reply_count: state.posts.filter((r) => r.parent_post_id === p.id).length }));
      return { rows, rowCount: rows.length };
    }

    // Fallback: empty result
    return { rows: [], rowCount: 0 };
  };

  pool = { query: implQuery } as any;
  console.info("DEV_USE_IN_MEMORY_DB=true — using in-memory DB fallback");
} else {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment");
  }

  pool = new Pool({ connectionString });
  implQuery = async function (text: string, params?: any[]) {
    return pool.query(text, params);
  };
}

export async function query(text: string, params?: any[]) {
  return implQuery(text, params);
}
