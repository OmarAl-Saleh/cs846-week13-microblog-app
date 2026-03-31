import pino from "pino";
import dotenv from "dotenv";

dotenv.config();

const level = process.env.LOG_LEVEL || "info";

const logger = pino({ level, base: { service: "microblog-backend" }, timestamp: pino.stdTimeFunctions.isoTime });

export default logger;
