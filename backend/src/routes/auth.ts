import express from "express";
import { createUser, authenticateUser, getUserByUsername } from "../services/userService";
import { body, validationResult } from "express-validator";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.post(
  "/signup",
  body("username").isAlphanumeric().isLength({ min: 3, max: 30 }),
  body("password").isLength({ min: 8, max: 128 }),
  body("display_name").optional().isLength({ min: 1, max: 100 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, password, display_name } = req.body;
      const user = await createUser({ username, password, display_name: display_name ?? username });
      // create token so frontend can use the session immediately
      const token = await authenticateUser({ username, password });
      return res.status(201).json({ id: user.id, username: user.username, display_name: user.display_name, token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  body("username").isAlphanumeric().isLength({ min: 3, max: 30 }),
  body("password").isLength({ min: 8, max: 128 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, password } = req.body;
      const token = await authenticateUser({ username, password });
      return res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);

// public profile by username
router.get("/profile/:username", async (req, res, next) => {
  try {
    const user = await getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: "not found" });
    const { id, username, display_name, bio, created_at } = user;
    return res.json({ id, username, display_name, bio, created_at });
  } catch (err) {
    next(err);
  }
});

// example protected route for current user
router.get("/me", authMiddleware, async (req: any, res, next) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "unauthorized" });
    const user = await getUserByUsername(username);
    if (!user) return res.status(404).json({ error: "not found" });
    const { id, username: u, display_name, bio, created_at } = user;
    return res.json({ id, username: u, display_name, bio, created_at });
  } catch (err) {
    next(err);
  }
});

export default router;
