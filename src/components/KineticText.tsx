import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, MAX_TEXT_WIDTH, SPRINGS, TYPE } from "../theme";
import { WORD_STAGGER } from "../timing";

type Props = {
  text: string;
  /** Mots (ou fin de phrase) à colorer en bleu. Ex. « terminé. » */
  highlight?: string;
  size?: number;
  color?: string;
  highlightColor?: string;
  weight?: 500 | 600 | 700 | 800;
  align?: "left" | "center";
  /** Image (relative à la scène) à laquelle le premier mot commence à entrer. */
  from?: number;
  /** Image (relative à la scène) à laquelle le texte sort. Omettre pour ne pas sortir. */
  exitAt?: number;
  maxWidth?: number;
};

// Entrée mot à mot : opacité, translateY 24 → 0, flou 8 → 0 (docs/04-motion.md).
export const KineticText: React.FC<Props> = ({
  text,
  highlight,
  size = TYPE.title,
  color = COLORS.ink,
  highlightColor = COLORS.blue,
  weight = 800,
  align = "center",
  from = 0,
  exitAt,
  maxWidth = MAX_TEXT_WIDTH,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ");
  const highlightWords = new Set((highlight ?? "").split(" ").filter(Boolean));

  const exit =
    exitAt === undefined
      ? 1
      : interpolate(frame, [exitAt, exitAt + 8], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      style={{
        fontFamily: FONT(),
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        color,
        textAlign: align,
        maxWidth,
        opacity: exit,
        translate: `0px ${(1 - exit) * -12}px`,
      }}
    >
      {words.map((word, i) => {
        const p = spring({
          frame: frame - from - i * WORD_STAGGER,
          fps,
          config: SPRINGS.smooth,
          durationInFrames: 18,
        });
        const isHighlight = highlightWords.has(word);
        const underline = isHighlight
          ? spring({
              frame: frame - from - words.length * WORD_STAGGER - 6,
              fps,
              config: SPRINGS.smooth,
              durationInFrames: 18,
            })
          : 0;
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              position: "relative",
              marginRight: i < words.length - 1 ? "0.26em" : 0,
              color: isHighlight ? highlightColor : color,
              opacity: p,
              translate: `0px ${interpolate(p, [0, 1], [24, 0])}px`,
              filter: `blur(${interpolate(p, [0, 1], [8, 0])}px)`,
            }}
          >
            {word}
            {isHighlight ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "-0.04em",
                  height: "0.07em",
                  width: `${underline * 100}%`,
                  borderRadius: 999,
                  backgroundColor: highlightColor,
                  opacity: 0.35,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
