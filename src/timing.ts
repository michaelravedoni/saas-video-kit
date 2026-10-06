// Minutages communs (en images, 30 fps). Les repères CUES ci-dessous sont ceux des scènes de la bibliothèque.

export const FPS = 30;

// Dimensions par format. Le 9:16 a une zone de sécurité (docs/09-vertical.md, SAFE_V dans theme.ts).
export const FORMAT_SIZE = {
  "16x9": { width: 1920, height: 1080 },
  "9x16": { width: 1080, height: 1920 },
} as const;
export const WIDTH_V = FORMAT_SIZE["9x16"].width;
export const HEIGHT_V = FORMAT_SIZE["9x16"].height;

// Les durées des scènes, les transitions et la musique viennent de content/videos/<id>/video.json.

// Repères de texte, [début, fin], en images RELATIVES au début de chaque scène.
export const CUES = {
  s1: {
    message: [26, 100],
    mail: [100, 146],
    excel: [148, 214],
    end: [218, 310],
  },
  s2: {
    logo: [10, 56],
    tagline: [56, 142],
    visuals: [142, 340],
    subtitle: [146, 340],
    cursor: [180, 232],
  },
  s3: {
    title: [0, 168],
    phone: [52, 370],
    email: [64, 170],
    click: 148,
    appOpen: [152, 230],
    familyScreen: 226,
    clicks: [196, 370],
    family: [250, 370],
    check1: 262,
    check2: 292,
  },
  s4: {
    title: [0, 94],
    card: 88,
    choose: 116, // clic sur « Choisir » (Buvette)
    slotClick: 148, // clic sur le créneau 13 h 00 – 15 h 00
    validated: 154, // la ligne passe au vert, pastille « Validé »
    collapse: 162, // le sélecteur de créneau se referme
    shift: [196, 222], // la carte glisse à droite
    quotas: [204, 340],
    timer2: 238, // Chronométreur 2 / 3
    timer3: 268, // Chronométreur 3 / 3 → Complet
  },
  s5: {
    title: [0, 96],
    stats: 34, // les 4 cartes entrent, compteurs animés
    statsExit: [94, 108],
    card: 100, // la carte « délai d'inscription » entre
    subtitle: [102, 226],
    steps: [124, 140, 156, 172], // dans 4 j → 3 j → 2 j → 1 j → aujourd'hui
    closed: 184, // « Inscriptions closes »
    pdfClick: 214, // clic sur « Liste PDF »
    slogan: [230, 310],
  },
  s6: {
    question: [0, 210], // reste affiché jusqu'à la fin de la scène
    button: 56,
    pills: 100, // 3 pastilles, une toutes les PILL_STAGGER images
    timer: [128, 190], // chronomètre 0 → 30 dans la dernière pastille
    url: 140,
    fadeOut: [194, 210], // fondu au blanc final
  },
} as const;

// Rythme d'entrée du texte mot à mot (docs/04-motion.md).
export const WORD_STAGGER = 3;
export const PILL_STAGGER = 12;
