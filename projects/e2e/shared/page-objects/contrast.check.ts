import type { Locator } from "@playwright/test";
function luminance(color: string): number {
  const channels = color
    .replace(/[^\d.,]/g, "")
    .split(",")
    .slice(0, 3)
    .map(Number)
    .map((value) => {
      const channel = value / 255;
      const low = channel <= 0.04045;
      return low ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
  return channels.reduce(
    (sum, channel, index) => sum + channel * Number([0.2126, 0.7152, 0.0722][index]),
    0,
  );
}
export async function contrast(locator: Locator): Promise<number> {
  const colors = await locator.evaluate((element) => {
    let parent: Element | null = element;
    let background = "rgba(0, 0, 0, 0)";
    while (parent) {
      background = getComputedStyle(parent).backgroundColor;
      const opaque = background !== "rgba(0, 0, 0, 0)";
      if (opaque) break;
      parent = parent.parentElement;
    }
    return { color: getComputedStyle(element).color, background };
  });
  const foreground = luminance(colors.color);
  const background = luminance(colors.background);
  return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
}
