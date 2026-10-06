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
import { COLORS, SAFE_V, SPRINGS, TYPE_V } from "../theme";
import { BrowserFrame } from "../components/BrowserFrame";
import { Cursor } from "../components/Cursor";
import { Logo } from "../components/Logo";
import { PhoneMock } from "../components/PhoneMock";
import { SafeGuides } from "../components/SafeGuides";
import { TextCue } from "../components/TextCue";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Géométrie (px, coordonnées de la scène 1080×1920)
const LOGO_W = 640;
const LOGO_H = (LOGO_W * 166) / 500;
const LOGO_SMALL = 340 / LOGO_W;
const DASH = { left: SAFE_V.x, top: 760, width: SAFE_V.width, barH: 56 };
const DASH_H = DASH.width / 1.6; // capture 2880×1800
const PHONE = { left: 660, top: 1010, width: 320 };

const Logos: React.FC = () => {
  const { cues } = useScene("reveal");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [logoStart] = cues.logo;
  const [tagStart] = cues.tagline;

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

  // Centre → haut de la zone utile
  const y = 960 + (290 - 960) * p1;
  const s = (1 + (LOGO_SMALL - 1) * p1) * interpolate(enter, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 540 - LOGO_W / 2,
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
  const push = interpolate(frame, [visStart, visEnd], [1, 1.05], clamp);
  const drift = interpolate(frame, [visStart, visEnd], [0, -14], clamp);
  const rowOn = interpolate(frame, [curClick, curClick + 8], [0, 1], clamp);

  const tx = DASH.left + (ROW.x + ROW.w * 0.45) * DASH.width;
  const ty = DASH.top + DASH.barH + (ROW.y + ROW.h / 2) * DASH_H;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        scale: push,
        transformOrigin: "540px 1100px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: DASH.left,
          top: DASH.top,
          opacity: dash,
          translate: `${drift}px ${interpolate(dash, [0, 1], [200, 0])}px`,
          transform: `perspective(2400px) rotateX(${interpolate(dash, [0, 1], [8, 0])}deg)`,
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
          translate: `${drift * 1.3}px ${interpolate(phone, [0, 1], [260, 0]) + drift * 1.3}px`,
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
            { frame: curStart - 12, x: 760, y: 1480 },
            { frame: curClick - 4, x: tx, y: ty },
          ]}
          clicks={[curClick]}
        />
      </div>
    </div>
  );
};

export const S2SolutionV: React.FC = () => {
  const { copy, cues } = useScene("reveal");
  const frame = useCurrentFrame();
  const white = interpolate(frame, [0, 14], [1, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const halo = interpolate(frame, [0, 30], [0, 1], clamp);

  return (
    <AbsoluteFill
      name="S2 · La solution (9:16)"
      style={{ backgroundColor: COLORS.bg }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at 540px 1100px, rgba(16,88,200,${0.1 * halo}), rgba(16,88,200,0) 70%), radial-gradient(700px 500px at 200px 200px, rgba(16,88,200,${0.06 * halo}), rgba(16,88,200,0) 70%)`,
        }}
      />

      <Logos />

      {/* Slogan centré */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 140,
        }}
      >
        <TextCue
          cue={cues.tagline}
          text={copy.tagline}
          highlight={copy.taglineHighlight}
          size={TYPE_V.title}
          maxWidth={SAFE_V.width}
        />
      </AbsoluteFill>

      {/* Sous-titre en haut de la zone utile, sous le logo */}
      <div
        style={{
          position: "absolute",
          left: SAFE_V.x,
          top: 370,
          width: SAFE_V.width,
        }}
      >
        <TextCue
          cue={cues.subtitle}
          text={copy.subtitle}
          highlight={copy.subtitleHighlight}
          size={TYPE_V.subtitle}
          weight={600}
          align="left"
          maxWidth={SAFE_V.width}
          hold
        />
      </div>

      <Visuals />

      <AbsoluteFill style={{ backgroundColor: COLORS.white, opacity: white }} />
      <SafeGuides />
    </AbsoluteFill>
  );
};
