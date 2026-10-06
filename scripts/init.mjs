// Crée un nouveau projet de vidéos à partir du kit (ce dépôt) : copie le kit sans les fichiers de plugin/extension.
//   node scripts/init.mjs <dossier> [--name mon-projet] [--no-install] [--no-git] [--force]
// Le dossier cible doit être vide (ou absent). Sans --no-install : `npm install`. Sans --no-git : dépôt Git + premier commit.
import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { dirname, join, relative, resolve, basename, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : null;
};
const positional = args.filter(
  (a, i) => !a.startsWith("--") && args[i - 1] !== "--name",
);
if (!positional[0]) {
  console.error(
    "Usage : node scripts/init.mjs <dossier> [--name nom] [--no-install] [--no-git] [--force]",
  );
  process.exit(1);
}
const target = resolve(positional[0]);

const kit = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (
  !existsSync(join(kit, "package.json")) ||
  !existsSync(join(kit, "src", "engine"))
) {
  console.error(`Kit introuvable autour de ${kit}.`);
  process.exit(1);
}
if (target === kit || target.startsWith(kit + sep)) {
  console.error("Le dossier cible ne peut pas être dans le kit lui-même.");
  process.exit(1);
}
if (
  existsSync(join(target, "AGENTS.md")) &&
  existsSync(join(target, "content"))
) {
  console.log(`Ce dossier est déjà un projet du kit : ${target}`);
  process.exit(0);
}
mkdirSync(target, { recursive: true });
const present = readdirSync(target).filter(
  (f) => f !== ".DS_Store" && f !== ".git",
);
if (present.length && !flag("--force")) {
  console.error(
    `Le dossier n'est pas vide (${present.slice(0, 5).join(", ")}…). Choisir un dossier vide, ou --force pour copier quand même.`,
  );
  process.exit(1);
}

// Ce qui sert au plugin / à l'extension, au dépôt Git du kit ou aux rendus ne fait pas partie d'un projet.
const SKIP = [
  /^\.git(\/|$)/,
  /^node_modules(\/|$)/,
  /^out(\/|$)/,
  /^dist(\/|$)/,
  /(^|\/)\.DS_Store$/,
  /^\.claude-plugin(\/|$)/,
  /^gemini-extension\.json$/,
  /^commands(\/|$)/,
  /^skills(\/|$)/,
  /^\.claude(\/|$)/,
  /^scripts\/(init|export-public)\.mjs$/,
];
cpSync(kit, target, {
  recursive: true,
  filter: (src) => {
    const rel = relative(kit, src).split(sep).join("/");
    return rel === "" || !SKIP.some((re) => re.test(rel));
  },
});

const name =
  (opt("--name") ?? basename(target))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "saas-video-kit";
const pkgPath = join(target, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
pkg.name = name;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`✓ Projet créé dans ${target} (nom : ${name})`);

const run = (cmd, argv) =>
  spawnSync(cmd, argv, { cwd: target, stdio: "inherit" }).status === 0;
if (!flag("--no-install")) {
  console.log("\n▶ npm install (quelques minutes la première fois)");
  if (!run("npm", ["install"]))
    console.log(
      "! npm install a échoué : le relancer à la main dans ce dossier.",
    );
}
if (
  !flag("--no-git") &&
  spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: target })
    .status !== 0
) {
  if (run("git", ["init", "-q"])) {
    run("git", ["symbolic-ref", "HEAD", "refs/heads/main"]);
    run("git", ["add", "-A"]);
    run("git", [
      "commit",
      "-q",
      "-m",
      "Projet créé à partir du kit saas-video-kit",
    ]);
    console.log("✓ Dépôt Git initialisé (premier commit fait)");
  }
}
console.log(
  "\nProchaine étape : lire AGENTS.md puis demander la création d'une vidéo (skill saas-video).",
);
console.log("Vérification : npm run validate   ·   Aperçu : npm run dev");
