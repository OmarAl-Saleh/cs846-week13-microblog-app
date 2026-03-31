import { query } from "../db";
import logger from "../logger";

export const MAX_POST_LENGTH = 280;

export async function createPost(userId: number, content: string, parentPostId?: number) {
  const text = (content || "").trim();
  if (text.length === 0) throw { status: 400, message: "empty_content" };
  if (text.length > MAX_POST_LENGTH) throw { status: 400, message: "content_too_long" };

  // validation warnings
  if (text.length === 0) logger.warn({ userId, parentPostId }, "attempted_empty_post");

  if (parentPostId) {
    const parentRes = await query("SELECT id, parent_post_id FROM posts WHERE id = $1", [parentPostId]);
    if ((parentRes.rowCount ?? 0) === 0) throw { status: 404, message: "parent_not_found" };
    if (parentRes.rows[0].parent_post_id !== null) throw { status: 400, message: "nested_replies_not_allowed" };
  }

  const res = await query(
    "INSERT INTO posts (user_id, content, parent_post_id) VALUES ($1, $2, $3) RETURNING id, user_id, content, parent_post_id, created_at",
    [userId, text, parentPostId || null]
  );
  const created = res.rows[0];
  logger.info({ postId: created.id, userId, parentPostId }, "post_created");
  return created;
}

export async function getGlobalFeed(limit = 20, offset = 0) {
  const res = await query(
    `SELECT p.id, p.user_id, p.content, p.parent_post_id, p.created_at,
            u.username, u.display_name,
            (SELECT count(*)::int FROM likes l WHERE l.post_id = p.id) AS like_count,
            (SELECT count(*)::int FROM posts r WHERE r.parent_post_id = p.id) AS reply_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.parent_post_id IS NULL
      ORDER BY like_count DESC, p.created_at DESC
      LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.rows;
}

export async function getReplies(postId: number) {
  const res = await query(
    `SELECT p.id, p.user_id, p.content, p.parent_post_id, p.created_at,
            u.username, u.display_name,
            (SELECT count(*)::int FROM likes l WHERE l.post_id = p.id) AS like_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.parent_post_id = $1
      ORDER BY p.created_at ASC`,
    [postId]
  );
  return res.rows;
}

export async function likePost(userId: number, postId: number) {
  await query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, postId]);
  const res = await query("SELECT count(*)::int AS like_count FROM likes WHERE post_id = $1", [postId]);
  // Be defensive: some adapters or fallback DB implementations may return an empty rows array.
  const likeCount = (res.rows && res.rows[0] && typeof res.rows[0].like_count !== "undefined") ? res.rows[0].like_count : 0;
  if (!res.rows || res.rows.length === 0) logger.warn({ postId, userId }, "like_count_missing_from_db_result");
  logger.info({ postId, userId, likeCount }, "post_liked");
  return likeCount;
}

export async function getPostsByUsername(username: string, limit = 20, offset = 0) {
  const res = await query(
    `SELECT p.id, p.user_id, p.content, p.parent_post_id, p.created_at,
            u.username, u.display_name,
            (SELECT count(*)::int FROM likes l WHERE l.post_id = p.id) AS like_count,
            (SELECT count(*)::int FROM posts r WHERE r.parent_post_id = p.id) AS reply_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE LOWER(u.username) = LOWER($1) AND p.parent_post_id IS NULL
      ORDER BY like_count DESC, p.created_at DESC
      LIMIT $2 OFFSET $3`,
    [username, limit, offset]
  );
  return res.rows;
}
