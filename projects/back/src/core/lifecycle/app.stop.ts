import type { Logger } from "#shared/logging/logger.contract.ts";
export type StopServices = {
  closeServer: () => Promise<void>;
  logger: Logger;
  closeDatabase: () => void;
};
export function createStop(services: StopServices): () => Promise<void> {
  let stopped: Promise<void> | undefined;
  const stop = async (): Promise<void> => {
    await services.closeServer();
    await services.logger.stop();
    services.closeDatabase();
  };
  return (): Promise<void> => {
    stopped ??= stop();
    return stopped;
  };
}
