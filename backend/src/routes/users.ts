import express from "express";
import * as postService from "../services/postService";
import * as userService from "../services/userService";

const router = express.Router();

// Get top-level posts for a user (profile view)
router.get("/:username/posts", async (req, res, next) => {
  try {
    const username = req.params.username;
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const page = Math.max(1, Number(req.query.page) || 1);
    const offset = (page - 1) * limit;
    const posts = await postService.getPostsByUsername(username, limit, offset);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// Get user profile by username
router.get('/:username', async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await userService.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'user_not_found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});
export default router;
