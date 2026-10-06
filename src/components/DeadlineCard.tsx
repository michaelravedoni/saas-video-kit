import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, FONT, SPRINGS } from "../theme";
import { Pill } from "./Pill";

// Carte « délai d'inscription » RECRÉÉE : compte à rebours → « Inscriptions closes » (docs/02-storyboard.md, S5).
export const DEADLINE_W = 780;
export const DEADLINE_H = 640;
const PAD = 36;
// Position du bouton « Liste PDF » dans la carte (pour le curseur)
export const PDF_BTN = { x: PAD + 300 + 16 + 110, y: 520 + 40 };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const RollText: React.FC<{
  labels: readonly string[];
  changes: readonly number[];
  color: (i: number) => string;
}> = ({ labels, changes, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = changes.filter((c) => frame >= c).length;
  const p =
    idx > 0
      ? spring({ frame: frame - changes[idx - 1], fps, config: SPRINGS.snappy })
      : 1;
  const style: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    fontSize: 88,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    whiteSpace: "nowrap",
    lineHeight: "104px",
  };
  return (
    <div style={{ position: "relative", height: 104, overflow: "hidden" }}>
      {idx > 0 ? (
        <div
          style={{
            ...style,
            color: color(idx - 1),
            translate: `0px ${-p * 100}px`,
            opacity: 1 - p,
          }}
        >
          {labels[idx - 1]}
        </div>
      ) : null}
      <div
        style={{
          ...style,
          color: color(idx),
          translate: `0px ${(1 - p) * 100}px`,
          opacity: p,
        }}
      >
        {labels[idx]}
      </div>
    </div>
  );
};

export const DeadlineCard: React.FC = () => {
  const { copy, cues } = useScene("control");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = cues;

  const idx = c.steps.filter((s) => frame >= s).length; // 0..4
  const closed = frame >= c.closed;
  const closedP = spring({
    frame: frame - c.closed,
    fps,
    config: SPRINGS.pop,
    durationInFrames: 18,
  });

  // La barre se vide à chaque palier ; elle devient rouge à la fermeture.
  const bar = interpolate(
    frame,
    [c.card + 10, ...c.steps],
    [0.08, 0.25, 0.5, 0.75, 1],
    clamp,
  );
  const press = interpolate(
    frame,
    [c.pdfClick, c.pdfClick + 4, c.pdfClick + 12],
    [1, 0.94, 1],
    clamp,
  );

  return (
    <div
      style={{
        position: "relative",
        width: DEADLINE_W,
        height: DEADLINE_H,
        boxSizing: "border-box",
        borderRadius: 20,
        backgroundColor: COLORS.white,
        border: `2px solid ${closed ? COLORS.dangerTint : COLORS.line}`,
        boxShadow: "0 40px 80px rgba(16,88,200,.18)",
        fontFamily: FONT(),
        overflow: "hidden",
      }}
    >
      <div style={{ padding: `${PAD - 4}px ${PAD}px` }}>
        <div
          style={{
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: COLORS.ink,
          }}
        >
          {copy.cardTitle}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 32,
            fontWeight: 500,
            color: COLORS.gray,
          }}
        >
          {copy.cardMeta}
        </div>
      </div>
      <div style={{ height: 1, backgroundColor: COLORS.line }} />

      <div style={{ position: "absolute", left: PAD, right: PAD, top: 178 }}>
        <div style={{ fontSize: 36, fontWeight: 600, color: COLORS.gray }}>
          {copy.deadlineLabel}
        </div>
        <div style={{ marginTop: 6 }}>
          <RollText
            labels={copy.countdown}
            changes={c.steps}
            color={(i) => (i >= 4 ? COLORS.danger : COLORS.ink)}
          />
        </div>
        <div
          style={{
            marginTop: 22,
            height: 16,
            borderRadius: 999,
            backgroundColor: COLORS.blueTint,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${bar * 100}%`,
              height: "100%",
              borderRadius: 999,
              backgroundColor: closed ? COLORS.danger : COLORS.blue,
            }}
          />
        </div>
        <div style={{ marginTop: 28, height: 70 }}>
          {closed ? (
            <div
              style={{
                opacity: closedP,
                scale: interpolate(closedP, [0, 1], [0.8, 1]),
                transformOrigin: "0 50%",
                display: "inline-block",
              }}
            >
              <Pill
                label={copy.closed}
                tone="danger"
                size={38}
                icon={<LockIcon />}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          height: 1,
          backgroundColor: COLORS.line,
          position: "absolute",
          left: 0,
          right: 0,
          top: 500,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PAD,
          top: 520,
          display: "flex",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 300,
            height: 80,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            fontWeight: 600,
            backgroundColor: closed ? COLORS.line : COLORS.blue,
            color: closed ? COLORS.gray : COLORS.white,
          }}
        >
          {closed ? copy.registerClosed : copy.register}
        </div>
        <div
          style={{
            width: 220,
            height: 80,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 600,
            border: `3px solid ${COLORS.blue}`,
            color: COLORS.blue,
            scale: press,
          }}
        >
          {copy.listPdf}
        </div>
      </div>
      {/* idx sert uniquement à forcer le re-rendu cohérent des paliers */}
      <span style={{ display: "none" }}>{idx}</span>
    </div>
  );
};

const LockIcon: React.FC = () => (
  <svg width={30} height={30} viewBox="0 0 24 24" fill="none">
    <rect
      x={5}
      y={11}
      width={14}
      height={9}
      rx={2.5}
      stroke={COLORS.danger}
      strokeWidth={2.4}
    />
    <path
      d="M8 11 V8 a4 4 0 0 1 8 0 V11"
      stroke={COLORS.danger}
      strokeWidth={2.4}
    />
  </svg>
);
