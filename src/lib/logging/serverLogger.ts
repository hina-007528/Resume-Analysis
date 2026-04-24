import "server-only";

import { createLogger, format, transports } from "winston";

export const serverLogger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: "resume-analyzer-frontend" },
  transports: [new transports.Console()],
});
