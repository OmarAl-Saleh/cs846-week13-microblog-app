import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import postsRouter from "./routes/posts";
import usersRouter from "./routes/users";
import logger from "./logger";

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for local frontend during development (open for dev only)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// basic error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error({ err, message: err.message || "internal_error" }, "unhandled_error");
  res.status(err.status || 500).json({ error: err.message || "internal" });
});

export default app;
