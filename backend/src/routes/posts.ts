import express from "express";
import authMiddleware from "../middleware/auth";
import * as postService from "../services/postService";

const router = express.Router();

// Create a top-level post
router.post("/", authMiddleware, async (req: any, res, next) => {
  try {
    const userId = req.user?.id;
    const { content } = req.body;
    const post = await postService.createPost(userId, content);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

// Global feed (top-level posts only)
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const page = Math.max(1, Number(req.query.page) || 1);
    const offset = (page - 1) * limit;
    const posts = await postService.getGlobalFeed(limit, offset);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// Like a post
router.post("/:id/like", authMiddleware, async (req: any, res, next) => {
  try {
    const userId = req.user?.id;
    const postId = Number(req.params.id);
    const likeCount = await postService.likePost(userId, postId);
    res.json({ postId, likeCount });
  } catch (err) {
    next(err);
  }
});

// Reply to a post (one-level deep enforced in service)
router.post("/:id/reply", authMiddleware, async (req: any, res, next) => {
  try {
    const userId = req.user?.id;
    const parentId = Number(req.params.id);
    const { content } = req.body;
    const reply = await postService.createPost(userId, content, parentId);
    res.status(201).json(reply);
  } catch (err) {
    next(err);
  }
});

// Get replies for a post
router.get("/:id/replies", async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const replies = await postService.getReplies(postId);
    res.json({ replies });
  } catch (err) {
    next(err);
  }
});

export default router;
