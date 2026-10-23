export type LogLevel = "debug" | "info" | "warn" | "error";
export type Logger = {
  write: (level: LogLevel, message: string) => void;
  stop: () => Promise<void>;
};
