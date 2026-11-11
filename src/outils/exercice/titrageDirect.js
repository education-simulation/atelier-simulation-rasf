// ============================================================
//  EXERCICE TITRAGE DIRECT — les étapes du parcours guidé et les idées de l'exploration libre.
//  Même principe que l'exercice Métamérisme (src/outils/exercice/metamerisme.js) :
//  les « indices » servent aussi de CRITÈRES à l'agent pour analyser les prompts de la personne ;
//  la « proposition » est une réponse possible, la PLUS COURTE qui marche (l'IA devine le reste),
//  montrée seulement si la personne la demande : l'agent ne doit JAMAIS s'en servir pour compléter un prompt.
// ============================================================

import * as MODELE_FOURNI from "../titrage.js";
// Le modèle chimique construit par la personne (étape 0), s'il existe déjà : chargé à la demande.
const MODELE_PERSO = import.meta.glob("../monTitrage.js");

export const ETAPES = [
  {
    titre: "Remplir la burette et le bécher",
    graphiques: ["quantites"],
    boutonGraphiques: "📈 Voir les quantités de matière",
    motsCles: ["burette graduée", "bécher", "flacon de Lugol", "thiosulfate de sodium", "pipette jaugée", "solution titrante", "solution titrée", "remplis", "quand on clique", "couleur de la solution", "avec le modèle chimique", "ne change rien d'autre"],
    consigne: "La burette et le bécher sont vides. Rédige un prompt pour préparer le titrage : chaque solution à sa place.",
    indices: [
      "Qui va où ? La solution de concentration connue (solution titrante) va dans la burette ; celle dont on cherche la concentration (solution titrée) est prélevée à la pipette jaugée et va dans le bécher.",
      "Les flacons, les concentrations, le volume prélevé et la couleur du Lugol existent déjà (sur la paillasse et dans le modèle chimique) : inutile de les décrire.",
      "Pour aller plus loin (facultatif) : un bouton « Remplir », la burette ajustée au zéro, l'agitateur magnétique qui se met à tourner.",
    ],
    proposition: "Remplis la burette de thiosulfate et le bécher de Lugol.",
  },
  {
    titre: "Faire couler la burette",
    graphiques: ["absorbance"],
    boutonGraphiques: "📈 Voir l'absorbance de la solution",
    motsCles: ["robinet", "burette graduée", "fais fonctionner", "robinet ouvert / fermé", "goutte à goutte (0,05 mL)", "+ 1 mL", "lecture du volume", "zoom sur la graduation", "couleur de la solution", "la couleur change progressivement", "à la souris et au doigt", "avec le modèle chimique"],
    consigne: "Le robinet de la burette ne fait rien. Rédige un prompt pour verser la solution titrante dans le bécher et voir la couleur changer.",
    indices: [
      "Comment verser ? Un robinet qu'on ouvre et qu'on ferme (écoulement continu), et des boutons pour verser précisément : + 1 mL, goutte à goutte (0,05 mL).",
      "Que voir ? Le volume versé, lu sur la burette, et la couleur du bécher : le modèle chimique la calcule d'office, à chaque goutte.",
      "Pour aller plus loin (facultatif) : un zoom sur la graduation, et un bouton « Nouveau titrage » qui remet tout au départ.",
    ],
    proposition: "Fais fonctionner le robinet de la burette, avec un bouton goutte à goutte.",
  },
  {
    titre: "Repérer l'équivalence avec le thiodène",
    graphiques: ["absorbance"],
    boutonGraphiques: "📈 Voir l'absorbance de la solution",
    motsCles: ["flacon de thiodène", "fais fonctionner", "quand on clique", "volume équivalent V_éq", "couleur de la solution", "valeur arrondie", "phrase d'explication", "avec le modèle chimique"],
    consigne: "Sans indicateur, la solution pâlit lentement : l'équivalence est difficile à voir. Rédige un prompt pour pouvoir utiliser le flacon de thiodène.",
    indices: [
      "Le flacon de thiodène est déjà sur la paillasse : dis seulement quoi en faire (un clic l'ajoute au bécher).",
      "Le thiodène forme avec le diiode un composé bleu très foncé, qui disparaît d'un coup à l'équivalence. La couleur vient du modèle chimique.",
      "Pour mesurer (facultatif) : un bouton « C'est l'équivalence ! » qui note le volume versé et le compare au volume équivalent calculé.",
    ],
    proposition: "Fais fonctionner le flacon de thiodène.",
  },
  {
    titre: "Tracer les quantités de matière",
    graphiques: ["quantites"],
    boutonGraphiques: "📈 Voir les courbes de ta simulation",
    motsCles: ["sous la scène", "trace", "graphique n = f(V)", "quantité de matière", "courbes superposées", "légende", "trait vertical à V_éq", "volume équivalent V_éq", "avec le modèle chimique", "calculé, pas choisi à la main"],
    consigne: "Rédige un prompt pour suivre, sous la scène, les quantités de matière des espèces pendant le titrage.",
    indices: [
      "Quel graphique ? n = f(V) : la quantité de matière de chaque espèce (I₂, S₂O₃²⁻, I⁻, S₄O₆²⁻) en fonction du volume versé, courbes superposées, avec une légende.",
      "Où en est-on ? Un trait au volume versé et un autre à V_éq : on voit le réactif limitant changer à l'équivalence.",
      "Les valeurs viennent du modèle chimique (tableau d'avancement), d'office : aucune n'est choisie à la main.",
    ],
    proposition: "Trace sous la scène n = f(V) pour les 4 espèces, avec V_éq.",
  },
  {
    titre: "Le message à retenir",
    motsCles: ["sous la scène", "ajoute", "encadré « À retenir »", "volume équivalent V_éq", "phrase d'explication"],
    consigne: "Rédige un prompt pour ajouter la conclusion de la simulation, puis terminer la page.",
    indices: [
      "Quelle forme ? Un encadré « À retenir », bien visible sous la scène.",
      "Quel contenu ? La définition de l'équivalence, et comment en tirer la concentration du Lugol.",
      "Pour montrer la simulation seule (en classe), inutile de toucher au code : le bouton « 🙈 Masquer le guide » cache le guide et les mots clés.",
    ],
    proposition: "Ajoute sous la scène un encadré « À retenir » sur l'équivalence.",
  },
];

// Le modèle mathématique (par défaut ou construit), montré dans la fenêtre « ❓ Voir le modèle ».
const EQUATIONS = [
  { titre: "1. La réaction support du titrage",
    formules: ["I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻"],
    note: "Hypothèse du modèle : la réaction est rapide et totale. Seul le diiode est coloré." },
  { titre: "2. Le tableau d'avancement (V : volume versé)",
    formules: ["n(S₂O₃²⁻) versé = c_B · V", "x = min( c_B · V / 2 ; n₀(I₂) )", "n(I₂) = n₀(I₂) − x  ·  n(S₂O₃²⁻) = c_B · V − 2x", "n(I⁻) = 2x  ·  n(S₄O₆²⁻) = x"],
    note: "Avant l'équivalence, le thiosulfate versé est le réactif limitant ; après, c'est le diiode." },
  { titre: "3. L'équivalence",
    formules: ["n₀(I₂) / 1 = c_B · V_éq / 2", "V_éq = 2 · c_A · V_A / c_B"],
    note: "À l'équivalence, les réactifs ont été introduits dans les proportions de l'équation : il n'en reste plus aucun." },
  { titre: "4. La concentration du diiode dans le bécher",
    formules: ["c(I₂) = n(I₂) / (V_A + V)", "c_A = t · 10 / M(I₂)  (t : g de diiode pour 100 mL)"],
    note: "Le volume du bécher augmente pendant le titrage : la solution se dilue." },
  { titre: "5. La couleur de la solution (loi de Beer-Lambert)",
    formules: ["A = ε · ℓ · c(I₂)  (pour le rouge, le vert et le bleu)", "T = 10^(−A)", "→ couleur à l'écran (sRGB)"],
    note: "Le diiode absorbe surtout le bleu : rouge-brun concentré, jaune dilué. Avec le thiodène, le composé formé absorbe surtout le rouge : bleu très foncé, même à très faible concentration, d'où un virage net." },
];

// --- Le titrage pour les graphiques : volumes de 0 à 25 mL, tous les 0,05 mL (une goutte) ---
const VOLUMES = Array.from({ length: 501 }, (_, i) => Math.round(i * 5) / 100);
const AXE_V = { titre: "Volume versé V (mL)", min: 0, max: 25, graduations: [0, 5, 10, 15, 20, 25] };
const fr = (v, d = 2) => v.toLocaleString("fr-FR", { maximumFractionDigits: d, minimumFractionDigits: d });

function donneesTitrage(m = MODELE_FOURNI) {
  const mod = m.solution({});
  const esp = m.REACTION.especes;
  const graphiques = [
    { id: "quantites", titre: "⚗️ Quantités de matière pendant le titrage", unite: "quantité de matière (mmol)",
      explication: `${m.REACTION.equation}. Lugol : ${fr(mod.cA, 4)} mol/L de diiode, V_A = ${fr(mod.VA, 1)} mL ; thiosulfate : c_B = ${fr(mod.cB, 4)} mol/L. Volume équivalent : V_éq = ${fr(mod.Veq)} mL.`,
      series: esp.map((e) => ({ nom: e.nom, couleur: e.couleur, valeurs: VOLUMES.map((V) => 1000 * m.quantites(mod, V)[e.id]) })) },
  ];
  if (typeof m.absorbances === "function") {
    // Zoom autour de l'équivalence (sur 3 mL, jusqu'à un peu après V_éq) : c'est là que tout se joue.
    const v0 = Math.max(0, Math.floor((mod.Veq - 2) * 2) / 2), v1 = v0 + 3;
    const zoom = Array.from({ length: 301 }, (_, i) => Math.round((v0 + i * 0.01) * 100) / 100);
    const A = (V, ind, k) => Math.min(3, m.absorbances(m.concentrationI2(mod, V), ind)[k]);
    graphiques.push({ id: "absorbance", titre: "🌈 Absorbance de la solution près de l'équivalence (plafonnée à 3)", unite: "absorbance",
      abscisses: zoom, axeX: { titre: "Volume versé V (mL)", min: v0, max: v1, graduations: Array.from({ length: 7 }, (_, i) => v0 + i * 0.5) },
      explication: `Sans indicateur, la solution absorbe le bleu : l'absorbance ne baisse qu'à la toute fin et la couleur pâlit progressivement. Avec le thiodène, le composé bleu absorbe fortement le rouge jusqu'à la dernière goutte avant l'équivalence (${fr(mod.Veq)} mL) : la solution se décolore d'un coup.`,
      series: [
        { nom: "sans indicateur (bleu absorbé)", couleur: "#d97706", valeurs: zoom.map((V) => A(V, false, 2)) },
        { nom: "avec thiodène (rouge absorbé)", couleur: "#1d4ed8", valeurs: zoom.map((V) => A(V, true, 0)) },
      ] });
  }
  return graphiques.map((g) => ({ abscisses: VOLUMES, axeX: AXE_V, ...g }));
}

// --- Les courbes publiées par la page : [{ id: "I2", nom, couleur, x: [mL], valeurs: [mmol], parametres: { cA, VA, cB } }, …] ---
const estTitrage = (series) => Array.isArray(series) && series.some((s) => Array.isArray(s.x) && s.parametres && s.id);

// Contrôle EN DIRECT, mesuré avec le modèle par défaut (référence indépendante) :
// le diiode disparaît exactement à V_éq = 2·c_A·V_A / c_B, et les quantités publiées respectent le tableau d'avancement.
export function controleDirect(series) {
  if (!estTitrage(series)) return null;
  const sI2 = series.find((s) => s.id === "I2" && Array.isArray(s.x));
  const p = (sI2 || series.find((s) => s.parametres)).parametres;
  if (![p.cA, p.VA, p.cB].every((v) => Number.isFinite(v) && v > 0)) return null;
  const ref = MODELE_FOURNI.solution(p), n0 = 1000 * ref.nI2;
  // 1) Les quantités publiées suivent le tableau d'avancement (à 2 % de n₀ près).
  const ecart = Math.max(...series.filter((s) => Array.isArray(s.x) && s.id in MODELE_FOURNI.quantites(ref, 0))
    .flatMap((s) => s.x.map((V, i) => Math.abs(s.valeurs[i] - 1000 * MODELE_FOURNI.quantites(ref, V)[s.id]))));
  const quantitesOk = Number.isFinite(ecart) && ecart <= 0.02 * n0;
  // 2) Le diiode publié s'annule au volume équivalent.
  let veqOk = null, vPub = null;
  if (sI2) {
    const i = sI2.valeurs.findIndex((v) => v <= 1e-3 * n0);
    vPub = i >= 0 ? sI2.x[i] : null;
    const pas = Math.max(...sI2.x.slice(1).map((v, k) => v - sI2.x[k]), 0.01);
    if (Math.max(...sI2.x) >= ref.Veq) veqOk = vPub !== null && Math.abs(vPub - ref.Veq) <= Math.max(pas, 0.01 * ref.Veq);
  }
  const ok = quantitesOk && veqOk !== false;
  const v = fr(ref.Veq);
  return {
    ok,
    titre: ok ? `Le diiode est entièrement consommé à l'équivalence, V_éq = ${v} mL = 2·c_A·V_A / c_B.` : "Les quantités de matière de ta simulation ne suivent PAS la réaction",
    detail: ok
      ? "Les quantités de matière suivent le tableau d'avancement (mesuré avec le modèle par défaut)."
      : veqOk === false
        ? `(le diiode s'annule à ${vPub === null ? "aucun volume" : `${fr(vPub)} mL`} au lieu de ${v} mL). Les courbes doivent être recalculées.`
        : `(écart de ${fr(ecart, 3)} mmol avec le tableau d'avancement). Les courbes doivent être recalculées.`,
  };
}

// Les courbes publiées remplacent l'exemple du modèle dans la fenêtre « 📈 Voir … » d'une étape.
function avecPubliees(g, publiees) {
  if (g.id !== "quantites") return g;
  if (!estTitrage(publiees)) return { ...g, explication: `${g.explication} (Exemple tiré du modèle : ta simulation ne montre pas encore ses propres courbes ici.)` };
  const c = controleDirect(publiees);
  return { ...g, titre: "⚗️ Quantités de matière de ta simulation", abscisses: publiees[0].x, series: publiees,
    explication: `Les courbes actuelles de ta simulation.${c ? ` Contrôle : ${c.ok ? "✅" : "❌"} ${c.titre} ${c.detail}` : ""}` };
}

// --- Vérifie, élément par élément, un modèle chimique construit par la personne (même forme que le modèle par défaut) ---
const enRVB = (c) => {
  if (typeof c !== "string") return null;
  const h = c.match(/^#([0-9a-f]{6})$/i);
  if (h) return [0, 2, 4].map((k) => parseInt(h[1].slice(k, k + 2), 16));
  const r = c.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  return r ? [r[1], r[2], r[3]].map(Number) : null;
};
const incolore = (c) => { const v = enRVB(c); return v !== null && Math.min(...v) >= 235; };
const coloree = (c) => { const v = enRVB(c); return v !== null && Math.min(...v) < 215; };
const bleue = (c) => { const v = enRVB(c); return v !== null && coloree(c) && v[2] > v[0] + 40; };
// Cinq jeux de valeurs (g de diiode pour 100 mL, mL de Lugol, mol/L de thiosulfate).
const JEUX = [{ t: 1.0, VA: 10, cB: 0.05 }, { t: 0.8, VA: 10, cB: 0.05 }, { t: 1.2, VA: 5, cB: 0.02 }, { t: 1.0, VA: 20, cB: 0.1 }, { t: 0.5, VA: 25, cB: 0.04 }];

function verifierModele(m) {
  const fn = (f) => typeof f === "function";
  const essai = (f) => { try { return f(); } catch { return false; } };
  const proche = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol * Math.abs(b);
  const esp = (id) => m.REACTION?.especes?.find((e) => e.id === id);
  const reaction = esp("I2")?.coef === 1 && esp("S2O3")?.coef === 2 && esp("I")?.coef === 2 && esp("S4O6")?.coef === 1;
  const D = m.DONNEES || {};
  const donnees = proche(D.M_I2, 253.8, 0.002) && proche(D.etiquette, 1, 1e-6) && proche(D.VA, 10, 1e-6) && proche(D.cB, 0.05, 1e-6) && proche(D.V_BURETTE, 25, 1e-6);
  const fonctions = [m.solution, m.quantites, m.concentrationI2, m.couleurSolution].every(fn);
  const pour = (test) => fonctions && JEUX.every((p) => essai(() => test(m.solution(p), MODELE_FOURNI.solution(p))));
  // LA règle n° 1 : le diiode est entièrement consommé EXACTEMENT au volume équivalent V_éq = 2·c_A·V_A / c_B.
  // Elle est mesurée avec le modèle par défaut (référence indépendante), pas avec le modèle construit.
  const equivalence = pour((mod, ref) => proche(mod.Veq, ref.Veq, 0.005) && m.quantites(mod, ref.Veq).I2 <= 1e-3 * ref.nI2
    && m.quantites(mod, 0.98 * ref.Veq).I2 > 5e-3 * ref.nI2 && m.quantites(mod, ref.Veq).S2O3 <= 1e-3 * ref.nI2);
  const fractions = [0, 0.25, 0.5, 0.75, 1, 1.5];
  const matiere = pour((mod, ref) => fractions.every((f) => {
    const V = f * ref.Veq, q = m.quantites(mod, V), r = MODELE_FOURNI.quantites(ref, V), n0 = ref.nI2;
    return ["I2", "S2O3", "I", "S4O6"].every((k) => Math.abs(q[k] - r[k]) <= 0.01 * n0)
      && Math.abs(2 * q.I2 + q.I - 2 * n0) <= 0.01 * n0                       // atomes d'iode
      && Math.abs(2 * q.S2O3 + 4 * q.S4O6 - (2 * ref.cB * V) / 1000) <= 0.01 * n0; // atomes de soufre
  }));
  const goutte = D.goutte || 0.05;
  const virage = pour((mod, ref) => {
    const coul = (V, ind) => m.couleurSolution(m.concentrationI2(mod, V), ind);
    return coloree(coul(0.5 * ref.Veq, false)) && incolore(coul(1.02 * ref.Veq, false))
      && bleue(coul(ref.Veq - goutte, true)) && incolore(coul(ref.Veq + goutte, true));
  });
  return [
    ["⚗️ la réaction : I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻", reaction],
    ["🧪 les données : M(I₂), le Lugol, V_A, c_B, la burette de 25 mL", donnees],
    ["🧮 les calculs : V_éq, quantités de matière, concentration, couleur", fonctions],
    ["🟰 contrôle n° 1 (5 jeux de valeurs testés) : le diiode disparaît EXACTEMENT à V_éq = 2·c_A·V_A / c_B", equivalence],
    ["⚖️ contrôle (5 jeux) : les quantités de matière suivent le tableau d'avancement ; les atomes d'iode et de soufre sont conservés", matiere],
    ["🎨 contrôle (5 jeux) : la solution se décolore à l'équivalence ; avec le thiodène, elle passe du bleu à l'incolore en une goutte", virage],
  ].map(([texte, ok]) => ({ texte, ok: Boolean(ok) }));
}

const COMMUN = {
  nomModele: "Modèle chimique",
  nomPerso: "Ton modèle chimique",
  titreEquations: "🧮 Le modèle mathématique : de la réaction à la couleur",
  titreDonnees: "Les données du modèle (volume versé de 0 à 25 mL, goutte à goutte)",
  prefixeCSV: "titrage",
  equations: EQUATIONS,
  controleDirect,
  avecPubliees,
};

export const OUTILS = [
  {
    ...COMMUN,
    titre: "Le modèle chimique par défaut",
    resume: "C'est le modèle du titrage sur lequel repose la simulation, déjà dans ton site. Modéliser, c'est décrire chaque acteur par des données, puis les relier par des équations. Ici :",
    contenu: [
      "⚗️ la réaction : I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻, rapide et totale ;",
      "🧪 les solutions : le Lugol (1,00 g de diiode pour 100 mL, prise d'essai V_A = 10,0 mL) et le thiosulfate (c_B = 0,0500 mol/L) ;",
      "🧮 les calculs qui les relient : tableau d'avancement, quantités de matière, volume équivalent, concentration du diiode ;",
      "🎨 la couleur de la solution, avec ou sans thiodène (loi de Beer-Lambert).",
    ],
    limites: "Comme tout modèle, il simplifie : réaction instantanée et totale, burette idéale (gouttes de 0,05 mL, pas d'erreur de lecture), coefficients d'absorption approchés (choisis pour que la couleur à l'écran ressemble à la réalité), et thiodène supposé capter tout le diiode.",
    conseil: "Écris simplement « avec le modèle chimique » dans ton prompt, ou rien du tout : l'IA n'invente pas les valeurs, et les volumes, quantités et couleurs sont calculés.",
    donnees: () => donneesTitrage(),
  },
];

// Sans le modèle par défaut (AVEC_MODELE = false dans la page) : le fichier que l'on construit soi-même.
export const FICHIER_PERSO = "monTitrage.js";

// Étape 0, seulement sans le modèle par défaut : le construire.
export const ETAPE_OUTILS = {
  titre: "Construire ton modèle chimique",
  motsCles: ["crée un fichier", "mon modèle chimique", "données de référence", "pas de valeurs de mémoire", "réaction totale", "tableau d'avancement", "quantité de matière", "volume équivalent V_éq", "loi de Beer-Lambert", "matière conservée", "vérifie avec plusieurs jeux de valeurs", "calculé, pas choisi à la main", "n'utilise pas le modèle fourni"],
  consigne: "Tu construis toi-même le modèle chimique. Rédige un prompt pour que l'IA crée la réaction, les données et les calculs dont la simulation aura besoin, avec un volume équivalent VÉRIFIÉ.",
  indices: [
    "Quelles données ? La réaction de titrage du diiode par le thiosulfate, la masse molaire du diiode (données de référence, pas de mémoire), et les solutions du TP : Lugol à 1,00 g de diiode pour 100 mL, V_A = 10,0 mL, c_B = 0,0500 mol/L.",
    "Quels calculs ? Les quantités de matière de chaque espèce selon le volume versé (tableau d'avancement, réaction totale), la concentration du diiode, et la couleur de la solution avec et sans thiodène (loi de Beer-Lambert).",
    "Le cœur du titrage : le diiode doit disparaître EXACTEMENT à V_éq = 2·c_A·V_A / c_B, la matière doit être conservée, et la couleur doit virer à l'équivalence. Exige que ce soit vérifié sur plusieurs jeux de valeurs, et corrigé sinon.",
  ],
  proposition: "Crée mon modèle chimique du titrage du Lugol par le thiosulfate (données de référence) : quantités de matière selon le volume versé, couleur avec et sans thiodène. Vérifie sur plusieurs jeux de valeurs que le diiode disparaît à V_éq = 2·c_A·V_A / c_B et que la matière est conservée. N'utilise pas le modèle fourni.",
  // L'étape ne peut être terminée que si le contrôle automatique du modèle est entièrement ✅.
  exigeModeleValide: true,
};

export const OUTILS_SANS = [
  {
    ...COMMUN,
    titre: "Modèle en cours de construction",
    titreComplet: "Ton modèle chimique, complet", // quand tous les éléments sont ✅
    resume: "Ton propre modèle du titrage, construit par l'IA à l'étape 0, à la place du modèle par défaut. Il doit contenir :",
    contenu: [
      "⚗️ la réaction de titrage et ses coefficients ;",
      "🧪 les données : masse molaire du diiode, Lugol, prise d'essai, thiosulfate, burette ;",
      "🧮 les quantités de matière selon le volume versé, le volume équivalent, la concentration du diiode ;",
      "🎨 la couleur de la solution, avec et sans thiodène.",
    ],
    conseil: "Vérifie-le : le diiode doit disparaître exactement à V_éq = 2·c_A·V_A / c_B, et la solution se décolorer à cet instant.",
    // Le fichier construit : chargé s'il existe, puis montré (courbes) et vérifié automatiquement.
    charger: async () => { const f = MODELE_PERSO["../monTitrage.js"]; return f ? f() : null; },
    donneesDe: (m) => { try { return donneesTitrage(m); } catch { return null; } },
    verifier: verifierModele,
  },
];

// Rattachés aux étapes : le cadre les affiche sans que la page ait à les passer.
ETAPES.outils = OUTILS;
ETAPES.outilsSans = OUTILS_SANS;
ETAPES.etapeOutils = ETAPE_OUTILS;
ETAPES.fichierPerso = FICHIER_PERSO;
ETAPES.depart = "la burette et le bécher vides, rien ne fonctionne";
// Mots clés montrés seulement quand on construit son modèle.
ETAPES.motsSansSeulement = ["crée un fichier", "mon modèle chimique", "données de référence", "pas de valeurs de mémoire", "loi de Beer-Lambert", "vérifie avec plusieurs jeux de valeurs", "n'utilise pas le modèle fourni"];

export const IDEES = [
  "ajoute un bouton « C'est l'équivalence ! » qui note le volume versé, puis calcule la masse de diiode pour 100 mL et la compare à l'étiquette du Lugol (tolérance 5 %)",
  "ajoute un curseur pour changer la concentration du thiosulfate, de 0,02 à 0,10 mol/L, et montre le volume équivalent changer",
  "ajoute sous la scène un tableau d'avancement qui se remplit pendant le titrage",
  "ajoute une question à choix : « Quel est le réactif limitant avant l'équivalence ? », avec la correction",
];

// Mots clés : le vocabulaire qui rend un prompt précis (affiché à côté de la simulation ; un clic copie le mot).
export const MOTS_CLES = [
  { titre: "📍 Où ?", mots: ["sur la paillasse", "sur la burette", "dans le bécher", "au-dessus de la scène", "sous la scène", "dans une fenêtre (popup)"] },
  { titre: "🧱 Les objets", mots: ["burette graduée", "robinet", "bécher", "agitateur magnétique", "pipette jaugée", "flacon de Lugol", "thiosulfate de sodium", "flacon de thiodène", "solution titrante", "solution titrée", "le modèle chimique", "mon modèle chimique", "données de référence", "quantité de matière", "volume équivalent V_éq", "couleur de la solution", "tableau d'avancement"] },
  { titre: "🛠 Les actions", mots: ["crée un fichier", "ajoute", "fais fonctionner", "remplis", "remplace", "trace", "affiche", "surligne", "retire"] },
  { titre: "⚙️ Le comportement", mots: ["quand on clique", "robinet ouvert / fermé", "goutte à goutte (0,05 mL)", "+ 1 mL", "à la souris et au doigt", "la couleur change progressivement", "retiens le choix au rechargement"] },
  { titre: "📈 L'affichage", mots: ["lecture du volume", "zoom sur la graduation", "graphique n = f(V)", "courbes superposées", "légende", "trait vertical à V_éq", "encadré « À retenir »", "valeur arrondie"] },
  { titre: "✅ Les exigences", mots: ["pas de valeurs de mémoire", "réaction totale", "loi de Beer-Lambert", "matière conservée", "vérifie avec plusieurs jeux de valeurs", "n'utilise pas le modèle fourni", "calculé, pas choisi à la main", "avec le modèle chimique", "ne change rien d'autre", "une étape à la fois", "phrase d'explication"] },
];
