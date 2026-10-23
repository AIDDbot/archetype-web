export type ConsoleLogger = {
  page: (path: string) => void;
  theme: (theme: string) => void;
  operation: (name: string) => void;
};
