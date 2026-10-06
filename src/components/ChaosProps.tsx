import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useScene } from "../engine/scene";
import { COLORS, DECOR, FONT, SPRINGS } from "../theme";
import { ChatBubble } from "./ChatBubble";
import { Cursor } from "./Cursor";
import { MailChip } from "./MailChip";
import { PhoneMock } from "./PhoneMock";
import { SheetGrid } from "./SheetGrid";

// Accessoires de S1 (téléphone, e-mail perdu, tableur), positionnés par leurs props
// pour servir aux versions 16:9 et 9:16. Valeurs par défaut = version 16:9.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.22, 1, 0.36, 1);

// Arrivée des notifications : une toutes les 18 images à partir de l'image 30 (relatives à la scène).
const arrivals = (count: number): number[] =>
  Array.from({ length: count }, (_, i) => 30 + 18 * i);
const DEFAULT_PHONE_W = 520;
const BUBBLE_W = 440;
const SLOT = 172;

// Secousses : une grosse au début, une petite à chaque notification.
const vibration = (frame: number, ARRIVALS: number[]) => {
  const bursts: [number, number][] = [
    [0, 12],
    ...ARRIVALS.map((a): [number, number] => [a, 4]),
  ];
  let amp = 0;
  for (const [start, amplitude] of bursts) {
    const t = frame - start;
    if (t >= 0 && t < 10) amp = Math.max(amp, amplitude * (1 - t / 10));
  }
  return {
    x: (Math.sin(frame * 2.9) + Math.sin(frame * 4.7)) * 0.5 * amp,
    y: (Math.sin(frame * 3.7) + Math.sin(frame * 5.3)) * 0.5 * amp,
    r: Math.sin(frame * 3.1) * 0.35 * amp,
  };
};

export const ChaosPhone: React.FC<{
  centerX?: number;
  top?: number;
  width?: number;
  notifTop?: number;
  slot?: number;
}> = ({
  centerX = 1400,
  top = 90,
  width: PHONE_W = DEFAULT_PHONE_W,
  notifTop = 410,
  slot = SLOT,
}) => {
  const { copy } = useScene("chaos");
  const ARRIVALS = arrivals(copy.notifications.length);
  const HUES = DECOR.avatars;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lit = interpolate(frame, [12, 24], [0, 1], clamp);
  const unread = Math.round(
    interpolate(frame, [30, 98], [3, 99], { ...clamp, easing: OUT }),
  );
  const vib = vibration(frame, ARRIVALS);

  // Entrée / sortie du téléphone
  const enter = spring({
    frame,
    fps,
    config: SPRINGS.smooth,
    durationInFrames: 22,
  });
  const exit = interpolate(frame, [96, 112], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  return (
    <div
      style={{
        position: "absolute",
        left: centerX - PHONE_W / 2,
        top,
        opacity: enter * (1 - exit),
        translate: `${vib.x + exit * 160}px ${vib.y + interpolate(enter, [0, 1], [60, 0])}px`,
        rotate: `${vib.r - 3}deg`,
        transform: "perspective(2400px) rotateY(-10deg)",
        filter: `blur(${exit * 10}px)`,
      }}
    >
      <PhoneMock
        width={PHONE_W}
        screenColor={DECOR.phoneOff}
        style={{
          boxShadow: `0 0 0 2px ${DECOR.phoneRim}, 0 40px 100px rgba(0,0,0,.6)`,
        }}
      >
        {/* fond d'écran allumé */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: lit,
            background: DECOR.wallpaper,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: lit,
            fontFamily: FONT(),
            color: COLORS.white,
          }}
        >
          <div
            style={{
              marginTop: 70,
              textAlign: "center",
              fontSize: 130,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {copy.time}
          </div>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                padding: "6px 22px",
                borderRadius: 999,
                backgroundColor: COLORS.danger,
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {unread >= 99 ? "99+" : unread}
            </div>
            <div style={{ fontSize: 30, fontWeight: 500, opacity: 0.85 }}>
              {copy.unread}
            </div>
          </div>

          {ARRIVALS.map((a, i) => {
            const own = spring({
              frame: frame - a,
              fps,
              config: SPRINGS.pop,
              durationInFrames: 16,
            });
            // Décalage cumulé dû aux notifications arrivées après celle-ci
            let push = 0;
            for (let j = i + 1; j < ARRIVALS.length; j++) {
              push += spring({
                frame: frame - ARRIVALS[j],
                fps,
                config: SPRINGS.snappy,
              });
            }
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: (PHONE_W - 2 * 20.8 - BUBBLE_W) / 2,
                  top: notifTop + push * slot,
                  opacity: frame >= a ? Math.min(1, own * 1.5) : 0,
                  translate: `0px ${(1 - own) * -50}px`,
                  scale: interpolate(own, [0, 1], [0.9, 1]),
                }}
              >
                <ChatBubble
                  name={copy.notifications[i].name}
                  message={copy.notifications[i].text}
                  width={BUBBLE_W}
                  hue={HUES[i % HUES.length]}
                />
              </div>
            );
          })}
        </div>
      </PhoneMock>
    </div>
  );
};

export const ChaosMail: React.FC<{
  centerX?: number;
  top?: number;
  width?: number;
}> = ({ centerX = 1400, top = 380, width = 740 }) => {
  const { copy, cues } = useScene("chaos");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = cues.mail[0];
  const enter = spring({ frame: frame - start, fps, config: SPRINGS.snappy });
  const lost = interpolate(frame, [start + 22, start + 46], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  if (frame < start || frame > start + 48) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: centerX - width / 2,
        top,
        opacity: enter * (1 - lost),
        translate: `${interpolate(enter, [0, 1], [200, 0]) + lost * 40}px ${lost * 260}px`,
        rotate: `${lost * 8}deg`,
        filter: `blur(${lost * 6}px)`,
      }}
    >
      <MailChip subject={copy.mailSubject} meta={copy.mailMeta} width={width} />
    </div>
  );
};

export const ChaosSheet: React.FC<{
  centerX?: number;
  top?: number;
  width?: number;
}> = ({ centerX = 1400, top = 190, width: SHEET_W = 760 }) => {
  const { copy, cues } = useScene("chaos");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = cues.excel[0];
  const enter = spring({ frame: frame - start, fps, config: SPRINGS.snappy });
  const exit = interpolate(frame, [206, 222], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  if (frame < start || frame > 224) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: centerX - SHEET_W / 2,
        top,
        opacity: enter * (1 - exit),
        scale: interpolate(enter, [0, 1], [0.92, 1]) * (1 - exit * 0.08),
        translate: `0px ${interpolate(enter, [0, 1], [80, 0])}px`,
        filter: `blur(${exit * 10}px)`,
      }}
    >
      <SheetGrid
        width={SHEET_W}
        title={copy.sheetFile}
        headers={copy.sheetHeaders}
        rows={copy.sheetRows}
        from={start}
      />
      <Cursor
        path={[
          { frame: start + 6, x: 120, y: 200 },
          { frame: start + 26, x: 620, y: 330 },
          { frame: start + 44, x: 260, y: 520 },
          { frame: start + 62, x: 700, y: 300 },
        ]}
      />
    </div>
  );
};
