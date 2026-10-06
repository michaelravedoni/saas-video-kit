import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, SPRINGS } from "../theme";
import { Cursor } from "../components/Cursor";
import {
  DEADLINE_H,
  DEADLINE_W,
  DeadlineCard,
  PDF_BTN,
} from "../components/DeadlineCard";
import { PdfChip } from "../components/PdfChip";
import { StatCard } from "../components/StatCard";
import { TextCue } from "../components/TextCue";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CARD = { left: 1000, top: 160 };
const STATS = { left: 140, top: 520, width: 1640, gap: 40, count: 4 };
const STAT_W = (STATS.width - STATS.gap * (STATS.count - 1)) / STATS.count;

export const S5Control: React.FC = () => {
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
      name="S5 · Le contrôle"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 900px at 1380px 520px, rgba(16,88,200,${0.1 * halo}), rgba(16,88,200,0) 70%), radial-gradient(900px 600px at 300px 900px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      {/* Phase A : titre + 4 cartes de statistiques */}
      <div
        style={{ opacity: 1 - statsOut, translate: `0px ${-statsOut * 40}px` }}
      >
        <div
          style={{
            position: "absolute",
            left: 210,
            top: 110,
            width: 1500,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextCue
            cue={c.title}
            text={copy.title}
            highlight={copy.titleHighlight}
            maxWidth={1500}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: STATS.left,
            top: STATS.top,
            display: "flex",
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

      {/* Phase B : sous-titre à gauche */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 0,
          width: 800,
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextCue
          cue={c.subtitle}
          text={copy.deadline}
          highlight={copy.deadlineHighlight}
          size={76}
          weight={600}
          align="left"
          maxWidth={800}
        />
      </div>

      {/* Phase C : slogan, hero, à gauche */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 0,
          width: 800,
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextCue
          cue={c.slogan}
          text={copy.slogan}
          highlight={copy.sloganHighlight}
          align="left"
          maxWidth={800}
          hold
        />
      </div>

      {/* Carte « délai d'inscription » + puce PDF + curseur */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          scale: push,
          transformOrigin: "1390px 480px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: CARD.left,
            top: CARD.top,
            opacity: cardP,
            translate: `${interpolate(cardP, [0, 1], [140, 0])}px 0px`,
          }}
        >
          <DeadlineCard />
        </div>
        <div
          style={{
            position: "absolute",
            left: CARD.left + DEADLINE_W / 2 - 270,
            top: CARD.top + DEADLINE_H + 60,
          }}
        >
          {frame >= c.pdfClick ? (
            <PdfChip name={copy.pdfFile} from={c.pdfClick + 2} />
          ) : null}
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: cursorOpacity }}>
          <Cursor
            path={[
              { frame: c.closed + 4, x: 1560, y: 940 },
              { frame: c.pdfClick - 4, x: target.x, y: target.y },
              { frame: c.pdfClick + 20, x: target.x, y: target.y },
            ]}
            clicks={[c.pdfClick]}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
