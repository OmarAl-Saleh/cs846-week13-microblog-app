import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default function authMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "missing_authorization" });
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ error: "invalid_authorization" });
  const token = parts[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "server_misconfigured" });
  try {
    const payload = jwt.verify(token, secret) as any;
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}
