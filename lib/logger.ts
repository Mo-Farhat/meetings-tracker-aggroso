import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  }),
});

// ── Context Loggers ──────────────────────────────────────────────
export const log = {
  api: logger.child({ context: "api" }),
  llm: logger.child({ context: "llm" }),
  db: logger.child({ context: "db" }),
};

// ── LLM Usage Tracker ────────────────────────────────────────────
export function logLLMUsage(data: {
  provider: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs: number;
}) {
  log.llm.info(data, `LLM call completed via ${data.provider}`);
}

export default logger;
