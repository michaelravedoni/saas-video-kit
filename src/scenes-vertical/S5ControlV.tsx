import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, SAFE_V, SPRINGS, TYPE_V } from "../theme";
import { Cursor } from "../components/Cursor";
import {
  DEADLINE_H,
  DEADLINE_W,
  DeadlineCard,
  PDF_BTN,
} from "../components/DeadlineCard";
import { PdfChip } from "../components/PdfChip";
import { SafeGuides } from "../components/SafeGuides";
import { StatCard } from "../components/StatCard";
import { TextCue } from "../components/TextCue";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Géométrie (px, scène 1080×1920)
const CARD = { left: (1080 - DEADLINE_W) / 2, top: 540 };
const STATS = { top: 640, gap: 40, width: SAFE_V.width };
const STAT_W = (STATS.width - STATS.gap) / 2; // grille 2×2
const ORIGIN = "540px 860px";

export const S5ControlV: React.FC = () => {
  const { copy, cues, props } = useScene("control");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = cues;

  const halo = interpolate(frame, [0, 30], [0, 1], clamp);
  const statsOut = interpolate(frame, c.statsExit, [0, 1], clamp);
  const cardP = spring({
    frame: frame - c.card,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 28,
  });
  const push = interpolate(frame, [c.card, 310], [1, 1.03], clamp);

  const cursorOpacity =
    interpolate(frame, [c.closed + 6, c.closed + 16], [0, 1], clamp) *
    interpolate(frame, [c.pdfClick + 6, c.pdfClick + 20], [1, 0], clamp);
  const target = { x: CARD.left + PDF_BTN.x, y: CARD.top + PDF_BTN.y };

  return (
    <AbsoluteFill
      name="S5 · Le contrôle (9:16)"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at 540px 880px, rgba(16,88,200,${0.1 * halo}), rgba(16,88,200,0) 70%), radial-gradient(700px 500px at 150px 1500px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      {/* Phase A : titre + grille 2×2 de statistiques */}
      <div
        style={{ opacity: 1 - statsOut, translate: `0px ${-statsOut * 40}px` }}
      >
        <div
          style={{
            position: "absolute",
            left: SAFE_V.x,
            top: SAFE_V.top,
            width: SAFE_V.width,
          }}
        >
          <TextCue
            cue={c.title}
            text={copy.title}
            highlight={copy.titleHighlight}
            size={TYPE_V.title}
            align="left"
            maxWidth={SAFE_V.width}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: SAFE_V.x,
            top: STATS.top,
            width: STATS.width,
            display: "flex",
            flexWrap: "wrap",
            gap: STATS.gap,
          }}
        >
          {copy.statsLabels.map((label, i) => (
            <StatCard
              key={label}
              label={label}
              sub={copy.statsSub}
              value={props.statsValues[i]}
              from={c.stats + i * 6}
              width={STAT_W}
            />
          ))}
        </div>
      </div>

      {/* Phase B : sous-titre en haut */}
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: SAFE_V.top,
          width: SAFE_V.width,
        }}
      >
        <TextCue
          cue={c.subtitle}
          text={copy.deadline}
          highlight={copy.deadlineHighlight}
          size={TYPE_V.subtitle}
          weight={600}
          align="left"
          maxWidth={SAFE_V.width}
        />
      </div>

      {/* Phase C : slogan en haut */}
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: SAFE_V.top,
          width: SAFE_V.width,
        }}
      >
        <TextCue
          cue={c.slogan}
          text={copy.slogan}
          highlight={copy.sloganHighlight}
          size={TYPE_V.title}
          align="left"
          maxWidth={SAFE_V.width}
          hold
        />
      </div>

      {/* Carte « délai d'inscription » + puce PDF + curseur */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: push,
          transformOrigin: ORIGIN,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: CARD.left,
            top: CARD.top,
            opacity: cardP,
            translate: `0px ${interpolate(cardP, [0, 1], [160, 0])}px`,
          }}
        >
          <DeadlineCard />
        </div>
        <div
          style={{
            position: "absolute",
            left: CARD.left + DEADLINE_W / 2 - 270,
            top: CARD.top + DEADLINE_H + 50,
          }}
        >
          {frame >= c.pdfClick ? (
            <PdfChip name={copy.pdfFile} from={c.pdfClick + 2} />
          ) : null}
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: cursorOpacity }}>
          <Cursor
            path={[
              { frame: c.closed + 4, x: 820, y: 1280 },
              { frame: c.pdfClick - 4, x: target.x, y: target.y },
              { frame: c.pdfClick + 20, x: target.x, y: target.y },
            ]}
            clicks={[c.pdfClick]}
          />
        </div>
      </div>

      <SafeGuides />
    </AbsoluteFill>
  );
};
