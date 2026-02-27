export type LogLevel = "info" | "warn" | "error" | "debug";

export interface ServerLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  method: string;
  path: string;
  ip: string;
  status: number;
  duration: string;
  user_agent: string;
}