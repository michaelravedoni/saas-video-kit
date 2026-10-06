// Types du kit : une marque, une vidéo (storyboard) et les textes d'une langue.

export type Format = "16x9" | "9x16";
export type TransitionKind = "fade" | "slide";

export type BrandColors = {
  blue: string;
  blueDeep: string;
  blueLogo: string;
  blueTint: string;
  blueMid: string;
  bg: string;
  white: string;
  ink: string;
  gray: string;
  line: string;
  success: string;
  successTint: string;
  danger: string;
  dangerTint: string;
  night: string;
  nightDeep: string;
  blueOnNight: string;
};

export type BrandConfig = {
  id: string;
  name: string;
  /** Police Google Fonts prise en charge (voir src/engine/fonts.ts). */
  font: string;
  /** Drapeau affiché à côté de l'URL finale (ex. « CH »), ou absent. */
  flag?: "CH";
  logo: { file: string; width: number; height: number };
  colors: BrandColors;
  /** Accessoires (messagerie, téléphone, drapeau) : valeurs par défaut dans src/theme.ts. */
  decor?: Partial<{
    avatars: string[];
    phoneOff: string;
    phoneRim: string;
    wallpaper: string;
    swissRed: string;
  }>;
  claims: { allowed: string[]; forbiddenWords: string[] };
  tone: string;
  /** Direction musicale utilisée par le générateur de prompt (scripts/music-prompt.mjs). */
  music?: { style: string; avoid: string };
};

export type SceneType =
  | "chaos"
  | "reveal"
  | "phoneFlow"
  | "choiceCard"
  | "control"
  | "cta"
  /** Scène propre à une vidéo : content/videos/<id>/scenes/<name>.tsx (voir docs/07-extending.md). */
  | "custom";

export type SceneConfig = {
  type: SceneType;
  /** Clé des textes dans copy.<langue>.json (par défaut : le type de la scène). */
  id?: string;
  frames: number;
  /** Paramètres de l'archétype (captures, nombres…) : voir src/engine/archetypes.json. */
  props?: Record<string, unknown>;
  /** Surcharge des repères d'animation par défaut (images relatives à la scène). */
  cues?: Record<string, unknown>;
  /** Scène « custom » : nom du fichier content/videos/<id>/scenes/<name>.tsx (sans extension). */
  name?: string;
  /** Scène « custom » : rôle musical pour le prompt de musique (tension, release, groove, build, resolution). */
  musicRole?: "tension" | "release" | "groove" | "build" | "resolution";
  /** Scène « custom » : textes à minuter pour les sous-titres et le temps de lecture : { clé de texte: nom du repère }. */
  textCues?: Record<string, string>;
  /** Transition vers la scène suivante (absente pour la dernière scène). */
  transitionOut?: TransitionKind;
};

export type MusicConfig = {
  /** Chemin relatif à public/videos/<id>/ */
  file: string;
  volume: number;
  fadeInFrames: number;
  fadeOutFrames: number;
};

export type ThumbnailsConfig = {
  desktopCapture: string | Record<string, string>;
  mobileCapture: string | Record<string, string>;
};

export type VideoConfig = {
  id: string;
  brand: string;
  locales: string[];
  formats: Format[];
  transitionFrames: number;
  scenes: SceneConfig[];
  music?: MusicConfig;
  /** Sous-titres (option) : fichiers SRT/VTT et version incrustée. source « auto » = textes à l'écran minutés ; « copy » = narration écrite dans copy.<langue>.json (clé « subtitles »). */
  subtitles?: { source: "auto" | "copy" };
  /** Visuels des miniatures ; les textes sont dans copy.<langue>.json, clé « thumbnail ». */
  thumbnails?: ThumbnailsConfig;
};

/** Textes d'une langue : structure libre, chaînes avec marqueurs « · » (espace insécable). */
export type CopyTree = { [key: string]: string | string[] | CopyTree };
