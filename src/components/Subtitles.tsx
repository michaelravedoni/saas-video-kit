import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { buildSubtitles } from "../../scripts/lib/subtitles.mjs";
import archetypes from "../engine/archetypes.json";
import { getActive } from "../engine/active";
import { typographize } from "../engine/typography";
import { COLORS, FONT } from "../theme";
import { FPS } from "../timing";

// Sous-titres incrustés (option : composition « …-st »). Source : video.json > subtitles.source
// (« auto » : textes à l'écran minutés ; « copy » : narration écrite dans copy.<langue>.json, clé « subtitles »).
// Légende en bas de l'écran (dans la zone de sécurité en 9:16), sur fond sombre pour rester lisible partout.
export const Subtitles: React.FC = () => {
  const { video, copy, locale, format } = getActive();
  const frame = useCurrentFrame();
  const cues = useMemo(
    () => buildSubtitles({ video, copyTree: copy, archetypes, fps: FPS }),
    [video, copy],
  );

  const t = frame / FPS;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;

  const fade = 4 / FPS;
  const opacity = interpolate(
    t,
    [cue.start, cue.start + fade, cue.end - fade, cue.end],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const portrait = format === "9x16";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: portrait ? 400 : 56,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: portrait ? 920 : 1500,
          padding: "14px 30px",
          borderRadius: 18,
          backgroundColor: "rgba(15,23,42,0.86)",
          color: COLORS.white,
          fontFamily: FONT(),
          fontWeight: 600,
          fontSize: portrait ? 44 : 46,
          lineHeight: 1.2,
          textAlign: "center",
          opacity,
          translate: `0px ${(1 - opacity) * 12}px`,
        }}
      >
        {typographize(cue.text, locale)}
      </div>
    </AbsoluteFill>
  );
};
