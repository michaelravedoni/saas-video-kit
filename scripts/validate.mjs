// Validateur du kit : vérifie les marques, vidéos et textes avant tout rendu.
//   npm run validate            → toutes les vidéos
//   npm run validate -- demo   → une vidéo
// Code de sortie 1 s'il y a au moins une ERREUR (les AVERTISSEMENTS n'empêchent pas le rendu).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(p, "utf-8"));
const only = process.argv[2];

let errors = 0;
let warnings = 0;
const err = (ctx, msg) => {
  errors++;
  console.log(`  ✗ ERREUR   ${ctx} : ${msg}`);
};
const warn = (ctx, msg) => {
  warnings++;
  console.log(`  ! avertis. ${ctx} : ${msg}`);
};

// Parcourt toutes les chaînes d'un arbre de textes, avec leur chemin (ex. s3.title, s5.countdown[2]).
const walk = (node, path, fn) => {
  if (typeof node === "string") return fn(path, node);
  if (Array.isArray(node))
    return node.forEach((v, i) => walk(v, `${path}[${i}]`, fn));
  if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node))
      walk(v, path ? `${path}.${k}` : k, fn);
};
const flatten = (tree) => {
  const out = {};
  walk(tree, "", (p, s) => {
    out[p] = s;
  });
  return out;
};

const NBSP = " ";
const ARCH = JSON.parse(
  readFileSync(join(root, "src", "engine", "archetypes.json"), "utf-8"),
);
const norm = (p) => p.replace(/\[\d+\]/g, "[]");
const isRaw = (n, raws) =>
  raws.some((r) => n === r || n.startsWith(r + "[") || n.startsWith(r + "."));
// « a[].b » : a est une liste non vide dont chaque élément a « b » ; « a[] » : liste non vide ; « a[][] » : liste de listes.
const hasPath = (node, path) => {
  const m = path.match(/^([^.\[]+)((?:\[\])*)(?:\.(.+))?$/);
  if (!m) return false;
  const [, key, brackets, rest] = m;
  if (node == null || typeof node !== "object" || !(key in node)) return false;
  const check = (v, depth) => {
    if (depth === 0) return rest ? hasPath(v, rest) : v !== undefined;
    return (
      Array.isArray(v) && v.length > 0 && v.every((x) => check(x, depth - 1))
    );
  };
  return check(node[key], brackets.length / 2);
};
const brandsDir = join(root, "content", "brands");
const videosDir = join(root, "content", "videos");

const COLOR_KEYS = [
  "blue",
  "blueDeep",
  "blueLogo",
  "blueTint",
  "blueMid",
  "bg",
  "white",
  "ink",
  "gray",
  "line",
  "success",
  "successTint",
  "danger",
  "dangerTint",
  "night",
  "nightDeep",
  "blueOnNight",
];
const FONT_FACTORS = JSON.parse(
  readFileSync(join(root, "src", "engine", "fonts.json"), "utf-8"),
);
const FONTS = Object.keys(FONT_FACTORS);
const SCENE_TYPES = [
  ...Object.keys(ARCH).filter((k) => !k.startsWith("_")),
  "custom",
];
const FORMATS = ["16x9", "9x16"];

const brandCache = {};
const loadBrand = (id) => {
  if (id in brandCache) return brandCache[id];
  const p = join(brandsDir, id, "brand.json");
  return (brandCache[id] = existsSync(p) ? read(p) : null);
};

const checkBrand = (id) => {
  const ctx = `marque ${id}`;
  const b = loadBrand(id);
  if (!b) return err(ctx, "brand.json introuvable");
  if (b.id !== id) err(ctx, `« id » (${b.id}) différent du nom de dossier`);
  if (!FONTS.includes(b.font))
    err(ctx, `police « ${b.font} » non prise en charge (${FONTS.join(", ")})`);
  for (const k of COLOR_KEYS)
    if (!/^#[0-9a-fA-F]{6}$/.test(b.colors?.[k] ?? ""))
      err(ctx, `couleur « ${k} » absente ou invalide (attendu #RRGGBB)`);
  if (!b.logo?.file || !existsSync(join(root, "public", b.logo.file)))
    err(ctx, `logo introuvable : public/${b.logo?.file}`);
  if (!b.claims?.forbiddenWords) warn(ctx, "claims.forbiddenWords absent");
  if (!b.music?.style)
    warn(
      ctx,
      "music.style absent (le prompt de musique utilisera un style par défaut)",
    );
};

const checkVideo = (id) => {
  const dir = join(videosDir, id);
  const ctx = `vidéo ${id}`;
  const v = read(join(dir, "video.json"));
  const videoTotal =
    (v.scenes.reduce((a, sc) => a + sc.frames, 0) -
      v.scenes.filter((sc) => sc.transitionOut).length * v.transitionFrames) /
    30;
  if (v.id !== id) err(ctx, `« id » (${v.id}) différent du nom de dossier`);
  checkBrand(v.brand);
  const brand = loadBrand(v.brand);

  for (const f of v.formats ?? [])
    if (!FORMATS.includes(f)) err(ctx, `format inconnu : ${f}`);
  v.scenes.forEach((s, i) => {
    if (!SCENE_TYPES.includes(s.type))
      err(ctx, `scène ${i + 1} : type inconnu « ${s.type} »`);
    if (!Number.isInteger(s.frames) || s.frames < 30)
      err(ctx, `scène ${i + 1} : durée invalide (${s.frames})`);
    if (s.type === "custom") {
      if (!s.name || !/^[A-Za-z0-9_-]+$/.test(s.name))
        err(
          ctx,
          `scène ${i + 1} (custom) : « name » manquant ou invalide (nom du fichier sans extension)`,
        );
      else if (!existsSync(join(dir, "scenes", `${s.name}.tsx`)))
        err(
          ctx,
          `scène custom « ${s.name} » : fichier introuvable content/videos/${id}/scenes/${s.name}.tsx`,
        );
      if (
        s.musicRole &&
        !["tension", "release", "groove", "build", "resolution"].includes(
          s.musicRole,
        )
      )
        err(
          ctx,
          `scène custom « ${s.name} » : musicRole inconnu « ${s.musicRole} »`,
        );
      for (const [k, v2] of Object.entries(s.props ?? {})) {
        if (
          /Capture$/.test(k) &&
          typeof v2 === "string" &&
          !existsSync(join(root, "public", "videos", id, "captures", v2))
        )
          err(
            ctx,
            `scène custom « ${s.name} » : capture introuvable public/videos/${id}/captures/${v2}`,
          );
      }
    }
    const last = i === v.scenes.length - 1;
    if (last && s.transitionOut)
      err(ctx, "la dernière scène ne peut pas avoir de transition de sortie");
    if (!last && !s.transitionOut)
      warn(ctx, `scène ${i + 1} : pas de transition de sortie (coupe franche)`);
  });
  // Scènes : identifiants, paramètres, repères
  const ids = new Set();
  v.scenes.forEach((sc, i) => {
    const man = ARCH[sc.type];
    const sid = sc.id ?? (sc.type === "custom" ? sc.name : sc.type);
    if (sc.type === "custom") {
      if (ids.has(sid))
        err(
          ctx,
          `scène ${i + 1} : identifiant « ${sid} » en double (ajouter un champ « id » unique)`,
        );
      ids.add(sid);
      return;
    }
    if (!man) return;
    if (ids.has(sid))
      err(
        ctx,
        `scène ${i + 1} : identifiant « ${sid} » en double (ajouter un champ « id » unique)`,
      );
    ids.add(sid);
    for (const k of Object.keys(man.props)) {
      if (!(k in (sc.props ?? {})) && !(k in man.propsDefaults))
        err(
          ctx,
          `scène ${sid} : paramètre « ${k} » manquant (${typeof man.props[k] === "string" ? man.props[k] : ""})`,
        );
    }
    for (const [k, val] of Object.entries(sc.props ?? {})) {
      if (!(k in man.props))
        warn(ctx, `scène ${sid} : paramètre inconnu « ${k} »`);
      if (/Capture$/.test(k)) {
        const files =
          typeof val === "string" ? [val] : Object.values(val ?? {});
        for (const f of files)
          if (!existsSync(join(root, "public", "videos", id, "captures", f)))
            err(
              ctx,
              `scène ${sid} : capture introuvable public/videos/${id}/captures/${f}`,
            );
        if (typeof val === "object" && val)
          for (const l of v.locales)
            if (!(l in val))
              warn(
                ctx,
                `scène ${sid} : pas de capture « ${k} » pour la langue « ${l} » (la première est utilisée)`,
              );
      }
    }
    for (const k of Object.keys(sc.cues ?? {}))
      if (!(k in man.cues)) err(ctx, `scène ${sid} : repère inconnu « ${k} »`);
  });

  if (v.subtitles && !["auto", "copy"].includes(v.subtitles.source))
    err(
      ctx,
      `subtitles.source doit valoir « auto » ou « copy » (reçu : ${v.subtitles.source})`,
    );
  if (v.thumbnails) {
    for (const k of ["desktopCapture", "mobileCapture"]) {
      const val = v.thumbnails[k];
      if (!val) {
        err(ctx, `thumbnails.${k} manquant`);
        continue;
      }
      const files = typeof val === "string" ? [val] : Object.values(val);
      for (const f of files)
        if (!existsSync(join(root, "public", "videos", id, "captures", f)))
          err(
            ctx,
            `thumbnails.${k} : capture introuvable public/videos/${id}/captures/${f}`,
          );
    }
  }
  const phPath = join(
    root,
    "public",
    "videos",
    id,
    "captures",
    ".placeholders.json",
  );
  if (existsSync(phPath)) {
    const used = read(phPath).filter((f) =>
      existsSync(join(root, "public", "videos", id, "captures", f)),
    );
    if (used.length)
      warn(
        ctx,
        `${used.length} capture(s) de remplacement (badge PLACEHOLDER) à remplacer par les vraies captures : ${used.join(", ")}`,
      );
  }
  if (v.music) {
    const mp = join(root, "public", "videos", id, v.music.file);
    if (!existsSync(mp))
      err(ctx, `musique introuvable : public/videos/${id}/${v.music.file}`);
    if (!(v.music.volume > 0 && v.music.volume <= 1))
      err(ctx, "music.volume doit être entre 0 et 1");
  }

  // Textes par langue
  const copyFiles = readdirSync(dir).filter((f) =>
    /^copy\.[a-z]{2}\.json$/.test(f),
  );
  const copies = {};
  for (const f of copyFiles)
    copies[f.match(/^copy\.([a-z]{2})\.json$/)[1]] = flatten(
      read(join(dir, f)),
    );
  for (const l of v.locales)
    if (!copies[l])
      err(ctx, `copy.${l}.json manquant (langue déclarée dans video.json)`);
  const ref = copies[v.locales[0]];
  for (const [locale, flat] of Object.entries(copies)) {
    const c = `${ctx} [${locale}]`;
    if (ref && locale !== v.locales[0]) {
      for (const k of Object.keys(ref))
        if (!(k in flat)) err(c, `clé manquante : ${k}`);
      for (const k of Object.keys(flat))
        if (!(k in ref))
          warn(c, `clé en trop (absente de ${v.locales[0]}) : ${k}`);
    }
    // Sous-titres rédigés (clé « subtitles ») : minutage, vitesse de lecture, longueur
    if (v.subtitles) {
      const sub = read(join(dir, `copy.${locale}.json`)).subtitles;
      if (v.subtitles.source === "copy" && !Array.isArray(sub))
        err(
          c,
          `subtitles.source = « copy » : la clé « subtitles » est absente de copy.${locale}.json`,
        );
      if (Array.isArray(sub)) {
        sub.forEach((e, i) => {
          const where = `subtitles[${i}]`;
          if (
            !(
              typeof e.from === "number" &&
              typeof e.to === "number" &&
              e.to > e.from
            )
          )
            return err(
              c,
              `${where} : « from » et « to » (secondes, to > from) attendus`,
            );
          if (e.to > videoTotal + 0.5)
            err(
              c,
              `${where} : se termine à ${e.to} s, après la fin de la vidéo (${videoTotal.toFixed(1)} s)`,
            );
          const text = String(e.text ?? "")
            .replace(/··/g, "·")
            .replace(/·/g, " ");
          if (!text.trim()) return err(c, `${where} : texte vide`);
          const cps = text.length / (e.to - e.from);
          if (cps > 20)
            warn(
              c,
              `${where} : lecture trop rapide (${cps.toFixed(0)} caractères/s, 20 conseillés au maximum) → « ${text} »`,
            );
          if (text.length > 84)
            warn(
              c,
              `${where} : ${text.length} caractères (2 lignes de 42 au maximum conseillées)`,
            );
          if (i > 0 && e.from < sub[i - 1].to)
            warn(c, `${where} : chevauche la réplique précédente`);
        });
      }
    }
    // Miniatures : copy.<langue>.json → thumbnail { lines[], highlight, badge }
    if (v.thumbnails) {
      const t = read(join(dir, `copy.${locale}.json`)).thumbnail;
      if (
        !t ||
        !Array.isArray(t.lines) ||
        !t.lines.length ||
        typeof t.highlight !== "string" ||
        typeof t.badge !== "string"
      )
        err(
          c,
          "clé « thumbnail » invalide (attendu : lines[], highlight, badge)",
        );
      else {
        if (!t.lines.join(" ").split(" ").includes(t.highlight))
          err(c, `thumbnail.highlight « ${t.highlight} » absent des lignes`);
        if (t.lines.length > 4)
          warn(
            c,
            "thumbnail.lines : plus de 4 lignes (texte trop petit sur une miniature)",
          );
        const longest = Math.max(
          ...t.lines.map((l) => l.replace(/·/g, " ").length),
        );
        const sizeYt = Math.min(
          96,
          640 / (longest * (FONT_FACTORS[brand?.font] ?? 0.52)),
          420 / (t.lines.length * 1.04),
        );
        if (sizeYt < 96 * 0.7)
          warn(
            c,
            `thumbnail.lines : ligne la plus longue de ${longest} caractères : le texte sera réduit à ${Math.floor(sizeYt)} px sur la miniature 16:9 (raccourcir ou mieux répartir les lignes)`,
          );
      }
    }
    // Clés attendues par les archétypes + temps de lecture
    const tree = read(join(dir, `copy.${locale}.json`));
    v.scenes.forEach((sc) => {
      if (sc.type === "custom") {
        // textes facultatifs : on contrôle seulement le temps de lecture de ceux qui sont minutés (textCues)
        const sid = sc.id ?? sc.name;
        for (const [copyKey, cueName] of Object.entries(sc.textCues ?? {})) {
          const text = tree[sid]?.[copyKey];
          const cue = (sc.cues ?? {})[cueName];
          if (typeof text !== "string" || !Array.isArray(cue)) {
            err(
              c,
              `scène custom « ${sc.name} » : textCues « ${copyKey} » → « ${cueName} » : texte ou repère introuvable`,
            );
            continue;
          }
          const chars = text.replace(/··/g, "·").replace(/·/g, " ").length;
          const need = Math.round((0.6 + chars / 15) * 30);
          if (cue[1] - cue[0] < need * 0.9)
            warn(
              c,
              `${sid}.${copyKey} : temps de lecture court (${cue[1] - cue[0]} images disponibles, ≈ ${need} recommandées pour ${chars} caractères)`,
            );
        }
        return;
      }
      const man = ARCH[sc.type];
      if (!man) return;
      const sid = sc.id ?? sc.type;
      const sceneCopy = tree[sid];
      if (!sceneCopy)
        return err(c, `textes de la scène « ${sid} » absents (clé « ${sid} »)`);
      for (const path of man.copy)
        if (!hasPath(sceneCopy, path))
          err(
            c,
            `${sid} : clé de texte manquante ou vide « ${path} » (type ${sc.type})`,
          );
      const cues = { ...man.cues, ...(sc.cues ?? {}) };
      for (const [copyKey, cueName] of Object.entries(man.textCues)) {
        const text = sceneCopy[copyKey];
        const cue = cues[cueName];
        if (typeof text !== "string" || !Array.isArray(cue)) continue;
        const chars = text.replace(/··/g, "·").replace(/·/g, " ").length;
        const need = Math.round((0.6 + chars / 15) * 30);
        const have = cue[1] - cue[0];
        if (have < need * 0.9)
          warn(
            c,
            `${sid}.${copyKey} : temps de lecture court (${have} images disponibles, ≈ ${need} recommandées pour ${chars} caractères)`,
          );
      }
    });
    const rawFor = (key) => {
      const sid = key.split(".")[0];
      const sc = v.scenes.find(
        (x) => (x.id ?? (x.type === "custom" ? x.name : x.type)) === sid,
      );
      const man = sc && ARCH[sc.type];
      if (!man) return false;
      return isRaw(norm(key.slice(sid.length + 1)), man.rawCopy);
    };
    const todo = {};
    for (const [k, s] of Object.entries(flat)) {
      const raw = rawFor(k);
      if (/TODO/.test(s)) {
        const sc = k.split(".")[0];
        todo[sc] = (todo[sc] ?? 0) + 1;
      }
      // Mots interdits (marque)
      for (const w of brand?.claims?.forbiddenWords ?? [])
        if (s.toLowerCase().includes(w.toLowerCase()))
          err(c, `${k} : mot interdit « ${w} »`);
      // Apostrophes droites : elles sont converties, mais signaler les guillemets droits
      if (/"/.test(s))
        warn(c, `${k} : guillemet droit " (utiliser « » en français)`);
      if (locale === "fr" && !raw) {
        // Espace insécable avant ? ! ; : (hors heures 23:30 et URL)
        if (/[^\s· ][?!;]/.test(s))
          err(
            c,
            `${k} : espace insécable manquante avant ? ! ou ; → « ${s} » (écrire « · » avant le signe)`,
          );
        if (/(^|[^\d\s· \/]):(?!\d|\/)/.test(s.replace(/https?:\/\//g, "")))
          err(c, `${k} : espace insécable manquante avant « : » → « ${s} »`);
        if (/ :(\s|$)/.test(s))
          err(
            c,
            `${k} : espace normale avant « : » (elle peut se couper en fin de ligne) → « ${s} »`,
          );
        if (/ [?!;]/.test(s))
          err(
            c,
            `${k} : espace normale avant ? ! ou ; (elle peut se couper en fin de ligne) → « ${s} »`,
          );
        if (/\s{2,}/.test(s)) warn(c, `${k} : espaces multiples`);
        // Casse française : pas de Majuscules Partout
        const words = s.split(/\s+/).filter((w) => w.length > 3);
        let run = 0;
        for (let i = 1; i < words.length; i++) {
          if (
            /^[A-ZÀ-Ý]/.test(words[i]) &&
            !/^[A-ZÀ-Ý]{2,}/.test(words[i]) &&
            !words[i - 1].endsWith(".")
          )
            run++;
          else run = 0;
          if (run >= 2) {
            warn(
              c,
              `${k} : majuscules en série (casse de phrase attendue) → « ${s} »`,
            );
            break;
          }
        }
        if (/ ?[.]{3}/.test(s))
          warn(c, `${k} : « ... » (utiliser le caractère « … »)`);
      }
    }
    for (const [sc, n] of Object.entries(todo))
      warn(c, `${sc} : ${n} texte(s) à compléter (« TODO »)`);
  }
  console.log(
    `  ${v.locales.length} langue(s), ${v.scenes.length} scènes, formats ${v.formats.join(", ")}`,
  );
};

const videos = readdirSync(videosDir, { withFileTypes: true })
  .filter(
    (e) => e.isDirectory() && existsSync(join(videosDir, e.name, "video.json")),
  )
  .map((e) => e.name)
  .filter((n) => !only || n === only);
if (!videos.length) {
  console.log(
    only
      ? `Vidéo « ${only} » introuvable.`
      : "Aucune vidéo dans content/videos/.",
  );
  process.exit(1);
}
for (const id of videos) {
  console.log(`\n▶ ${id}`);
  checkVideo(id);
}
console.log(`\n${errors} erreur(s), ${warnings} avertissement(s)`);
process.exit(errors ? 1 : 0);
