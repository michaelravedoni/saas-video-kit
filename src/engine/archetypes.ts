import type { CaptureRef } from "./assets";
import archetypesJson from "./archetypes.json";
import type { SceneType } from "./types";

// Bibliothèque de scènes (archétypes). Pour chaque type :
//   - les clés de texte attendues dans copy.<langue>.json (sous l'identifiant de la scène),
//   - les paramètres (props) de video.json,
//   - les repères d'animation par défaut (cues), en images relatives au début de la scène.
// Le fichier archetypes.json sert aussi au validateur (scripts/validate.mjs) et au skill.

export type Cue = readonly [number, number];
type Box = { x: number; y: number; w: number; h: number };

// ───────── chaos ─────────
export interface ChaosCopy {
  message: string;
  mail: string;
  excel: string;
  end: string;
  endHighlight: string;
  notifications: { name: string; text: string }[];
  time: string;
  unread: string;
  mailSubject: string;
  mailMeta: string;
  sheetFile: string;
  sheetHeaders: string[];
  /** Cellules ; un « ! » en tête marque une cellule en erreur (affichée en rouge). */
  sheetRows: string[][];
}
export type ChaosProps = Record<string, never>;
export interface ChaosCues {
  message: Cue;
  mail: Cue;
  excel: Cue;
  end: Cue;
}

// ───────── reveal ─────────
export interface RevealCopy {
  tagline: string;
  taglineHighlight: string;
  subtitle: string;
  subtitleHighlight: string;
}
export interface RevealProps {
  desktopCapture: CaptureRef;
  mobileCapture: CaptureRef;
  highlightRow: Box;
}
export interface RevealCues {
  logo: Cue;
  tagline: Cue;
  visuals: Cue;
  subtitle: Cue;
  cursor: Cue;
}

// ───────── phoneFlow ─────────
export interface PhoneFlowCopy {
  title: string;
  titleHighlight: string;
  clicks: string;
  clicksHighlight: string;
  family: string;
  inbox: string;
  emailSender: string;
  emailNow: string;
  emailSubject: string;
  emailBody: string;
  emailButton: string;
  eventName: string;
  eventMeta: string;
  registered: string;
  items: { name: string; meta: string }[];
}
export interface PhoneFlowProps {
  profileCapture: CaptureRef;
  blur: { left: number; top: number; width: number; height: number } | null;
}
export interface PhoneFlowCues {
  title: Cue;
  phone: Cue;
  email: Cue;
  click: number;
  appOpen: Cue;
  familyScreen: number;
  clicks: Cue;
  family: Cue;
  check1: number;
  check2: number;
}

// ───────── choiceCard ─────────
export interface ChoiceCardCopy {
  title: string;
  titleHighlight: string;
  cardTitle: string;
  cardMeta: string;
  rows: { name: string }[];
  choose: string;
  full: string;
  validated: string;
  slots: string[];
  quotas: string;
  quotasHighlight: string;
}
export interface ChoiceCardProps {
  rows: { total: number; value: number }[];
  selectRow: number;
  fillRow: number;
  slotIndex: number;
}
export interface ChoiceCardCues {
  title: Cue;
  card: number;
  choose: number;
  slotClick: number;
  validated: number;
  collapse: number;
  shift: Cue;
  quotas: Cue;
  timer2: number;
  timer3: number;
}

// ───────── control ─────────
export interface ControlCopy {
  title: string;
  titleHighlight: string;
  statsLabels: string[];
  statsSub: string;
  deadline: string;
  deadlineHighlight: string;
  deadlineLabel: string;
  cardTitle: string;
  cardMeta: string;
  countdown: string[];
  closed: string;
  register: string;
  registerClosed: string;
  listPdf: string;
  pdfFile: string;
  slogan: string;
  sloganHighlight: string;
}
export interface ControlProps {
  statsValues: number[];
}
export interface ControlCues {
  title: Cue;
  stats: number;
  statsExit: Cue;
  card: number;
  subtitle: Cue;
  steps: readonly number[];
  closed: number;
  pdfClick: number;
  slogan: Cue;
}

// ───────── cta ─────────
export interface CtaCopy {
  question: string;
  button: string;
  pills: string[];
  url: string;
}
export interface CtaProps {
  timerPill: number | null;
}
export interface CtaCues {
  question: Cue;
  button: number;
  pills: number;
  timer: Cue;
  url: number;
  fadeOut: Cue;
}

export type SceneData = {
  chaos: { copy: ChaosCopy; props: ChaosProps; cues: ChaosCues };
  reveal: { copy: RevealCopy; props: RevealProps; cues: RevealCues };
  phoneFlow: {
    copy: PhoneFlowCopy;
    props: PhoneFlowProps;
    cues: PhoneFlowCues;
  };
  choiceCard: {
    copy: ChoiceCardCopy;
    props: ChoiceCardProps;
    cues: ChoiceCardCues;
  };
  control: { copy: ControlCopy; props: ControlProps; cues: ControlCues };
  cta: { copy: CtaCopy; props: CtaProps; cues: CtaCues };
  /** Scène propre à une vidéo : contenu libre. */
  custom: {
    copy: Record<string, unknown>;
    props: Record<string, unknown>;
    cues: Record<string, number | readonly number[]>;
  };
};

type Manifest = {
  label: string;
  copy: string[];
  rawCopy: string[];
  textCues: Record<string, string>;
  props: Record<string, unknown>;
  propsDefaults: Record<string, unknown>;
  cues: Record<string, unknown>;
};
export const ARCHETYPES = archetypesJson as unknown as Record<
  SceneType,
  Manifest
>;
