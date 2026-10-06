export type SubtitleCue = { start: number; end: number; text: string };
export function buildSubtitles(args: {
  video: unknown;
  copyTree: unknown;
  archetypes: unknown;
  fps?: number;
  source?: "auto" | "copy";
}): SubtitleCue[];
export function plainText(s: string): string;
export function toSrt(
  cues: SubtitleCue[],
  text?: (s: string) => string,
): string;
export function toVtt(
  cues: SubtitleCue[],
  text?: (s: string) => string,
): string;
