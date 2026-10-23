import type { HttpClient } from "#shared/http/http.contract.ts";
import type { About, AboutData } from "./about.type.ts";
import { readAbout } from "./about.read.ts";
export function createAboutData(http: HttpClient): AboutData {
  return {
    load: async (): Promise<About | null> => {
      try {
        return readAbout(await http.request({ path: "/api/about" }));
      } catch {
        return null;
      }
    },
  };
}
