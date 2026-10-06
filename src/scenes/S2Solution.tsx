import React from "react";
import { captureFile } from "../engine/assets";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, SPRINGS } from "../theme";
import { BrowserFrame } from "../components/BrowserFrame";
import { Cursor } from "../components/Cursor";
import { Logo } from "../components/Logo";
import { PhoneMock } from "../components/PhoneMock";
import { TextCue } from "../components/TextCue";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Géométrie (px, coordonnées de la scène)
const LOGO_W = 700;
const LOGO_H = (LOGO_W * 166) / 500;
const LOGO_SMALL = 380 / LOGO_W; // échelle du petit logo
const DASH = { left: 840, top: 210, width: 1000, barH: 56 };
const DASH_H = DASH.width / 1.6; // capture 2880×1800
const PHONE = { left: 1500, top: 520, width: 300 };

const Logos: React.FC = () => {
  const { cues } = useScene("reveal");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [logoStart] = cues.logo;
  const [tagStart] = cues.tagline;
  const [visStart] = cues.visuals;

  const enter = spring({
    frame: frame - logoStart,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 30,
  });
  const p1 = spring({
    frame: frame - tagStart,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 26,
  });
  const p2 = spring({
    frame: frame - (visStart - 2),
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 26,
  });

  const x = 960 + (330 - 960) * p2;
  const y = 540 + (170 - 540) * p1 + (130 - 170) * p2;
  const s = (1 + (LOGO_SMALL - 1) * p1) * interpolate(enter, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: x - LOGO_W / 2,
        top: y - LOGO_H / 2,
        opacity: enter,
        scale: s,
        filter: `blur(${interpolate(enter, [0, 1], [14, 0])}px)`,
      }}
    >
      <Logo width={LOGO_W} />
    </div>
  );
};

const Visuals: React.FC = () => {
  const { cues, props } = useScene("reveal");
  const ROW = props.highlightRow;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [visStart, visEnd] = cues.visuals;
  const [curStart, curClick] = cues.cursor;

  const dash = spring({
    frame: frame - visStart,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 30,
  });
  const phone = spring({
    frame: frame - (visStart + 16),
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 30,
  });
  const push = interpolate(frame, [visStart, visEnd], [1, 1.06], clamp);
  // Parallaxe : le mobile se déplace 1,3 × plus vite que le bureau.
  const drift = interpolate(frame, [visStart, visEnd], [0, -16], clamp);

  const rowOn = interpolate(frame, [curClick, curClick + 8], [0, 1], clamp);

  // Point visé par le curseur : la ligne du tableau
  const tx = DASH.left + (ROW.x + ROW.w * 0.45) * DASH.width;
  const ty = DASH.top + DASH.barH + (ROW.y + ROW.h / 2) * DASH_H;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        scale: push,
        transformOrigin: "1300px 560px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: DASH.left,
          top: DASH.top,
          opacity: dash,
          translate: `${drift}px ${interpolate(dash, [0, 1], [160, 0])}px`,
          transform: `perspective(2400px) rotateY(${interpolate(dash, [0, 1], [-9, 0])}deg)`,
        }}
      >
        <BrowserFrame width={DASH.width} height={DASH_H + DASH.barH}>
          <CanvasImage
            src={captureFile(props.desktopCapture)}
            style={{ width: DASH.width, height: DASH_H }}
          />
          <div
            style={{
              position: "absolute",
              left: ROW.x * DASH.width,
              top: ROW.y * DASH_H,
              width: ROW.w * DASH.width,
              height: ROW.h * DASH_H,
              backgroundColor: COLORS.blue,
              opacity: 0.14 * rowOn,
              borderRadius: 6,
              outline: `2px solid rgba(16,88,200,${0.5 * rowOn})`,
            }}
          />
        </BrowserFrame>
      </div>

      <div
        style={{
          position: "absolute",
          left: PHONE.left,
          top: PHONE.top,
          opacity: phone,
          translate: `${drift * 1.3}px ${interpolate(phone, [0, 1], [240, 0]) + drift * 1.3}px`,
        }}
      >
        <PhoneMock width={PHONE.width}>
          <CanvasImage
            src={captureFile(props.mobileCapture)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        </PhoneMock>
      </div>

      <div
        style={{
          opacity: interpolate(
            frame,
            [curStart - 14, curStart - 4],
            [0, 1],
            clamp,
          ),
        }}
      >
        <Cursor
          path={[
            { frame: curStart - 12, x: 1560, y: 900 },
            { frame: curClick - 4, x: tx, y: ty },
          ]}
          clicks={[curClick]}
        />
      </div>
    </div>
  );
};

export const S2Solution: React.FC = () => {
  const { copy, cues } = useScene("reveal");
  const frame = useCurrentFrame();
  const white = interpolate(frame, [0, 14], [1, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const halo = interpolate(frame, [0, 30], [0, 1], clamp);

  return (
    <AbsoluteFill
      name="S2 · La solution"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 800px at 1250px 560px, rgba(16,88,200,${0.1 * halo}), rgba(16,88,200,0) 70%), radial-gradient(900px 600px at 300px 120px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      <Logos />

      {/* Slogan centré, sous le logo */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 240,
        }}
      >
        <TextCue
          cue={cues.tagline}
          text={copy.tagline}
          highlight={copy.taglineHighlight}
          maxWidth={1500}
        />
      </AbsoluteFill>

      {/* Sous-titre, colonne de gauche */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 250,
          width: 660,
          height: 700,
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextCue
          cue={cues.subtitle}
          text={copy.subtitle}
          highlight={copy.subtitleHighlight}
          size={76}
          weight={600}
          align="left"
          maxWidth={660}
          hold
        />
      </div>

      <Visuals />

      {/* le voile blanc de S1 se résorbe */}
      <AbsoluteFill style={{ backgroundColor: COLORS.white, opacity: white }} />
    </AbsoluteFill>
  );
};
