import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../theme";

// Cellules : une chaîne ; un « ! » en tête marque une cellule en erreur (affichée en rouge, clignotante).
const toCell = (raw: string): { t: string; err: boolean } =>
  raw.startsWith("!") ? { t: raw.slice(1), err: true } : { t: raw, err: false };

export const SheetGrid: React.FC<{
  width: number;
  title: string;
  headers: string[];
  rows: string[][];
  from: number;
}> = ({ width, title, headers, rows, from }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  const rowH = 78;
  const barH = 64;
  const headH = 56;
  const chaos = interpolate(t, [10, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blink = Math.floor(frame / 6) % 2 === 0;
  const colW = [width * 0.42, width * 0.26, width * 0.32];

  return (
    <div
      style={{
        width,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: COLORS.white,
        fontFamily: FONT(),
        boxShadow: "0 40px 90px rgba(0,0,0,.5)",
        rotate: `${chaos * -1.6}deg`,
      }}
    >
      <div
        style={{
          height: barH,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.gray,
          backgroundColor: COLORS.bg,
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        {title}
      </div>
      <div
        style={{ display: "flex", height: headH, backgroundColor: COLORS.line }}
      >
        {headers.map((h, i) => (
          <div
            key={h}
            style={{
              width: colW[i],
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              fontSize: 30,
              fontWeight: 700,
              color: COLORS.gray,
            }}
          >
            {h}
          </div>
        ))}
      </div>
      {rows.map((rawRow, r) => {
        const row = rawRow.map(toCell);
        const rowT = t - r * 3;
        const enter = interpolate(rowT, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const drift = Math.sin(r * 1.7 + frame * 0.06) * 26 * chaos;
        return (
          <div
            key={r}
            style={{
              display: "flex",
              height: rowH,
              borderTop: `1px solid ${COLORS.line}`,
              opacity: enter,
              translate: `${drift}px 0px`,
            }}
          >
            {row.map((c, i) => {
              const showErr = c.err && chaos > 0.2;
              return (
                <div
                  key={i}
                  style={{
                    width: colW[i],
                    display: "flex",
                    alignItems: "center",
                    padding: "0 18px",
                    fontSize: 32,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    color: showErr ? COLORS.danger : COLORS.ink,
                    backgroundColor:
                      showErr && blink ? COLORS.dangerTint : "transparent",
                    borderLeft: i > 0 ? `1px solid ${COLORS.line}` : undefined,
                  }}
                >
                  {c.t}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
