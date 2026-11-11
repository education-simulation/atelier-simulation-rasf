// ============================================================
//  EXERCICE MÉTAMÉRISME — les étapes du parcours guidé et les idées de l'exploration libre.
//  Les « indices » servent aussi de CRITÈRES à l'agent pour analyser les prompts de la personne.
//  La « proposition » est une réponse possible, la PLUS COURTE qui marche (l'IA devine le reste),, montrée seulement si la personne la demande :
//  l'agent ne doit JAMAIS s'en servir pour compléter un prompt.
// ============================================================

import * as MODELE_FOURNI from "../colorimetrie.js";
// Le modèle couleur construit par la personne (étape 0), s'il existe déjà : chargé à la demande.
const MODELE_PERSO = import.meta.glob("../maColorimetrie.js");

export const ETAPES = [
  {
    titre: "Faire fonctionner les boutons des illuminants",
    graphiques: ["illuminants"], // bouton « 📈 Voir … » dans l'étape : courbes du modèle couleur choisi
    motsCles: ["sur le bord de la cabine", "cabine de lumière 3D", "illuminant A", "illuminant D65", "illuminant F11", "fais fonctionner", "quand on clique", "un voyant s'allume", "retiens le choix au rechargement", "ne change rien d'autre", "sur le fond de la cabine", "distribution spectrale"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Les trois boutons A, D65 et F11 sont déjà sur le bord de la cabine, mais ils ne font rien. Rédige un prompt pour qu'ils permettent de choisir la lumière de la cabine.",
    indices: [
      "Les trois boutons et les trois illuminants existent déjà (sur la cabine et dans le modèle couleur) : inutile de les décrire, dis juste quoi en faire.",
      "Un verbe d'action et la cible suffisent : « active… », « fais fonctionner… ».",
      "Pour aller plus loin (facultatif) : tracer la distribution spectrale de l'illuminant choisi sur le fond de la cabine, un voyant sur le bouton actif, ou le choix retenu au rechargement.",
    ],
    proposition: "Active les 3 boutons d'illuminants.",
  },

  {
    titre: "Choisir la couleur des cartes",
    graphiques: ["paire-metamere"], // bouton « 📈 Voir … » : réflectances d'une paire métamère du modèle couleur
    boutonGraphiques: "📈 Voir les courbes de réflectance",
    motsCles: ["sur chaque carte", "un bouton", "dans une fenêtre (popup)", "échantillon", "carte de contraste", "une palette de couleurs", "quand on clique", "paire métamère", "illuminant D65", "illuminant A", "réflectance spectrale", "courbes superposées", "graphique de 380 à 780 nm", "légende", "retiens le choix au rechargement"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Les deux cartes sont vierges. Rédige un prompt pour choisir la couleur de la carte 1, la carte 2 formant avec elle une paire métamère, et pour voir leurs courbes de réflectance.",
    indices: [
      "Comment choisir ? Par exemple un bouton qui ouvre une fenêtre avec une palette de couleurs : un clic choisit la couleur de la carte 1.",
      "La carte 2 n'est pas choisie : elle forme une paire métamère avec la carte 1 (même couleur à la lumière du jour D65, différente sous l'illuminant A). Ses courbes croisent celles de la carte 1 au moins 3 fois et s'en écartent dans le rouge.",
      "Que montrer ? Les courbes de réflectance des deux cartes, superposées, de 380 à 780 nm : on voit qu'elles se croisent. Les couleurs et les courbes viennent du modèle couleur, d'office.",
    ],
    proposition: "Crée un bouton qui ouvre une fenêtre pour choisir la couleur de la carte 1 ; la carte 2 forme avec elle une paire métamère. Montre les courbes de réflectance des deux cartes.",
  },
  {
    titre: "Demander à l'IA de rendre les cartes mobiles pour les placer dans la cabine",
    motsCles: ["carte de contraste", "cabine de lumière 3D", "un bouton", "rends déplaçable", "quand on fait glisser", "à la souris et au doigt", "sur téléphone", "calcule à partir des spectres", "ne change rien d'autre"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Rédige un prompt pour que l'on puisse déplacer les deux cartes de la table jusque dans la cabine.",
    indices: [
      "Comment déplace-t-on les cartes ? Pense à la souris ET au doigt (tablette, téléphone).",
      "Sur un petit écran, glisser est difficile : demande aussi un bouton qui place les deux cartes dans la cabine.",
      "Dis ce qui change quand une carte entre dans la cabine : sa couleur est recalculée sous la lumière de la cabine ; sur la table, elle reste à la lumière du jour (D65).",
    ],
    proposition: "Rends les deux cartes déplaçables dans la cabine, à la souris et au doigt.",
  },
  {
    titre: "Mesurer l'écart de couleur",
    motsCles: ["sous la scène", "écart ΔE*ab", "échantillon", "avec le modèle couleur", "calcule à partir des spectres", "affiche", "valeur arrondie", "vert / orange / rouge selon le résultat", "phrase d'explication pour l'élève", "surligne", "zone surlignée", "réflectance spectrale"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Rédige un prompt pour mesurer et afficher la différence de couleur entre les deux cartes, sous la lumière où elles se trouvent.",
    indices: [
      "Quelle mesure ? L'écart ΔE*ab entre les deux échantillons, calculé avec le modèle couleur, sous la lumière où sont les cartes.",
      "Comment le rendre lisible ? Une valeur arrondie, une couleur verte, orange ou rouge selon que la différence se voit ou non, et une phrase d'explication.",
      "Pour comprendre pourquoi : surligne sur le graphique des réflectances la zone où les deux courbes s'écartent le plus, et fais le lien avec la lumière choisie.",
    ],
    proposition: "Affiche l'écart ΔE*ab entre les deux cartes sous la lumière où elles sont, en vert, orange ou rouge.",
  },
  {
    titre: "Le message à retenir",
    motsCles: ["sous la scène", "paire métamère", "ajoute", "retire", "encadré « À retenir »", "phrase d'explication pour l'élève"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Rédige un prompt pour ajouter la conclusion de la simulation, puis terminer la page.",
    indices: [
      "Quelle forme ? Un encadré « À retenir », bien visible en bas de la page.",
      "Quel contenu ? La définition du métamérisme, et une conséquence pratique : comment comparer correctement deux couleurs.",
      "Pour finir la page : le cadre de l'exercice (guide, mots clés, sauvegardes) n'a plus lieu d'être. Demande de le retirer pour ne garder que la simulation.",
    ],
    proposition: "Ajoute un encadré « À retenir » sur le métamérisme, puis retire le cadre de l'exercice (<CadreExercice>).",
  },
];

// Les outils déjà présents dans le site, expliqués dans le guide (« 🧰 C'est quoi … ? »).
// Les équations du modèle couleur (fourni ou construit), montrées dans la fenêtre « ❓ Voir le modèle ».
const EQUATIONS = [ // montrées dans la fenêtre « À quoi sert … ? », section « 🧮 Les équations »
  { titre: "1. De la réflectance à X, Y, Z (sous un illuminant)",
    formules: ["X = k · Σ S(λ) · R(λ) · x̄(λ)", "Y = k · Σ S(λ) · R(λ) · ȳ(λ)", "Z = k · Σ S(λ) · R(λ) · z̄(λ)", "k = 100 / Σ S(λ) · ȳ(λ)"],
    note: "S : distribution spectrale de l'illuminant ; R : réflectance de l'échantillon (0 à 1) ; x̄, ȳ, z̄ : observateur CIE 1931 ; somme de 380 à 780 nm, pas de 5 nm. Avec k, le blanc parfait (R = 1) a Y = 100." },
  { titre: "2. Le blanc de référence",
    formules: ["(Xn, Yn, Zn) = X, Y, Z du blanc parfait (R = 1) sous le même illuminant"],
    note: "Les couleurs sont comparées à ce blanc : l'œil s'habitue à la lumière." },
  { titre: "3. De X, Y, Z à L*, a*, b* (CIELAB)",
    formules: ["L* = 116 · f(Y/Yn) − 16", "a* = 500 · [ f(X/Xn) − f(Y/Yn) ]", "b* = 200 · [ f(Y/Yn) − f(Z/Zn) ]", "f(t) = ∛t  si t > (6/29)³,  sinon  t / (3 · (6/29)²) + 4/29"],
    note: "L* : clarté (0 noir, 100 blanc) ; a* : vert (−) → rouge (+) ; b* : bleu (−) → jaune (+)." },
  { titre: "4. L'écart de couleur",
    formules: ["ΔE*ab = √( ΔL*² + Δa*² + Δb*² )"],
    note: "Repères : moins de 1, invisible ; de 1 à 3, visible pour un œil exercé ; au-delà, nettement visible." },
  { titre: "5. La couleur affichée à l'écran",
    formules: ["XYZ → adaptation de Bradford (blanc de l'illuminant → blanc D65)", "→ RVB linéaire (matrice sRGB)", "→ C = 12,92 · c  si c ≤ 0,0031308,  sinon  1,055 · c^(1/2,4) − 0,055"],
    note: "L'adaptation de Bradford imite l'œil qui s'habitue à la lumière : un blanc paraît blanc sous A comme sous D65." },
  { titre: "6. La paire métamère",
    formules: ["R₂(λ) = R₁(λ) + k · b(λ)", "Σ S_D65 · b · x̄ = Σ S_D65 · b · ȳ = Σ S_D65 · b · z̄ = 0"],
    note: "b est un « noir métamérique » : invisible sous D65. Les deux échantillons ont donc exactement les mêmes X, Y, Z sous D65, mais pas sous A ou F11 ; b change de signe au moins 3 fois, d'où les croisements des deux courbes." },
    ];

export const OUTILS = [
  {
    titre: "Le modèle couleur fourni",
    nom: "colorimetrie.js",
    chemin: "src/outils/colorimetrie.js",
    resume: "C'est le modèle de la couleur sur lequel repose la simulation, déjà dans ton site. Modéliser, c'est décrire chaque acteur par des données, puis les relier par des équations. Ici, la couleur perçue naît de trois acteurs :",
    contenu: [
      "💡 la lumière : la distribution spectrale de chaque illuminant (A, D65, F11), de 380 à 780 nm ;",
      "🃏 l'objet : la réflectance spectrale de l'échantillon (la part de lumière renvoyée à chaque longueur d'onde) ;",
      "👁 l'œil : l'observateur de référence CIE 1931, un œil moyen ;",
      "🧮 le calcul qui les relie : X, Y, Z, puis L*a*b*, l'écart ΔE*ab et la couleur à l'écran ;",
      "🎨 et un outil pour fabriquer une paire métamère (paireMetamere).",
    ],
    limites: "Comme tout modèle, il simplifie : un œil moyen (pas le tien), une adaptation de l'œil à la lumière idéalisée, et un écran qui ne peut pas afficher toutes les couleurs réelles.",
    conseil: "Écris simplement « avec le modèle couleur » dans ton prompt : l'IA n'invente pas les données, et les couleurs sont justes.",
    equations: EQUATIONS, // montrées dans la fenêtre, section « 🧮 Le modèle mathématique »
    controlePaire,
    donnees: () => donneesColorimetrie(), // courbes montrées (et téléchargeables) dans la fenêtre « À quoi sert … ? »
  },
];

// Règles d'une paire métamère pour l'exercice : AU MOINS 3 croisements, et le plus grand écart dans le rouge (600 à 700 nm).
export function compterCroisements(R1, R2, L) {
  let n = 0;
  for (let i = 1; i < L.length; i++) { const a = R1[i - 1] - R2[i - 1], b = R1[i] - R2[i]; if (a * b < 0 || (a === 0 && i > 1)) n++; }
  return n;
}
export function controlePaire(R1, R2, L = MODELE_FOURNI.LONGUEURS) {
  const croisements = compterCroisements(R1, R2, L);
  const d = R1.map((v, i) => Math.abs(v - R2[i]));
  const pic = L[d.indexOf(Math.max(...d))];
  const rouge = pic >= 600 && pic <= 700;
  return { croisements, pic, rouge, ok: croisements >= 3 && rouge };
}

// Vérifie, élément par élément, un modèle couleur construit par la personne (même forme que le modèle fourni).
function verifierModele(m) {
  const n = m.LONGUEURS?.length;
  const tableau = (t) => Array.isArray(t) && t.length === n && t.every(Number.isFinite);
  const fn = (f) => typeof f === "function";
  const essai = (f) => { try { return f(); } catch { return false; } };
  const illum = n > 0 && ["A", "D65", "F11"].every((k) => tableau(m.ILLUMINANTS?.[k]?.spectre));
  const pics = illum && essai(() => {
    const S = m.ILLUMINANTS.F11.spectre, mx = Math.max(...S), L = m.LONGUEURS;
    const sommets = S.map((v, i) => (v > 0.3 * mx && v >= (S[i - 1] ?? 0) && v >= (S[i + 1] ?? 0) ? L[i] : null)).filter((x) => x !== null);
    return [435, 545, 610].every((c) => sommets.some((l) => Math.abs(l - c) <= 10));
  });
  const paire = fn(m.paireMetamere) && illum && essai(() => {
    const R1 = m.LONGUEURS.map((l) => 0.30 + 0.15 * Math.exp(-(((l - 530) / 70) ** 2)));
    const R2 = m.paireMetamere(R1);
    const dE = (S) => { const w = m.blanc(S); return m.deltaE(m.lab(m.xyz(R1, S), w), m.lab(m.xyz(R2, S), w)); };
    return dE(m.ILLUMINANTS.D65.spectre) < 0.5 && dE(m.ILLUMINANTS.A.spectre) > 1 && controlePaire(R1, R2, m.LONGUEURS).ok;
  });
  return [
    ["📏 les longueurs d'onde (380 à 780 nm)", n > 0 && m.LONGUEURS[0] === 380 && m.LONGUEURS[n - 1] === 780],
    ["📈 les distributions spectrales de A, D65 et F11", illum],
    ["👁 l'observateur CIE 1931 (x̄, ȳ, z̄)", tableau(m.XBAR) && tableau(m.YBAR) && tableau(m.ZBAR)],
    ["🧮 les calculs XYZ, L*a*b*, ΔE*ab", fn(m.xyz) && fn(m.blanc) && fn(m.lab) && fn(m.deltaE)],
    ["🖥 la couleur à l'écran", fn(m.versEcran)],
    ["🎨 la fabrication d'une paire métamère", fn(m.paireMetamere)],
    ["🔎 contrôle : F11 a trois pics vers 435, 545 et 610 nm", pics],
    ["🔎 contrôle : la paire est identique sous D65, différente sous A, se croise au moins 3 fois et s'écarte dans le rouge", paire],
  ].map(([texte, ok]) => ({ texte, ok: Boolean(ok) }));
}

// Les données de colorimetrie.js, en courbes, pour la fenêtre « À quoi sert colorimetrie.js ? ».
function donneesColorimetrie(m = MODELE_FOURNI) {
  const { LONGUEURS, XBAR, YBAR, ZBAR, ILLUMINANTS, xyz, blanc, lab, deltaE, versEcran, paireMetamere } = m;
  const { A, D65, F11 } = ILLUMINANTS;
  // Distribution spectrale normalisée : chaque courbe divisée par son maximum (maximum = 1).
  const normalisee = (S) => { const m = Math.max(...S); return S.map((v) => v / m); };
  const carte1 = LONGUEURS.map((l) => 0.30 + 0.15 * Math.exp(-(((l - 530) / 70) ** 2)));
  const carte2 = paireMetamere(carte1);
  const nCrois = compterCroisements(carte1, carte2, LONGUEURS);
  const ecarts = [D65, A, F11].map((il) => { const w = blanc(il.spectre); return `${il.nom} : ${deltaE(lab(xyz(carte1, il.spectre), w), lab(xyz(carte2, il.spectre), w)).toFixed(1).replace(".", ",")}`; });
  return [
    { id: "illuminants", titre: "📈 Distributions spectrales normalisées des illuminants (maximum = 1)", unite: "puissance normalisée",
      explication: m === MODELE_FOURNI
        ? "A : lampe à incandescence (formule de Planck, 2856 K) · D65 : lumière du jour (table CIE) · F11 : tube fluorescent à trois bandes (table CIE)."
        : `A : ${A.detail || A.type || "lampe à incandescence"} · D65 : ${D65.detail || D65.type || "lumière du jour"} · F11 : ${F11.detail || F11.type || "tube fluorescent"} (données de ton modèle).`,
      series: [A, D65, F11].map((il) => ({ nom: il.nom, couleur: il.couleur, valeurs: normalisee(il.spectre) })) },
    { id: "observateur", titre: "👁 Observateur de référence CIE 1931", unite: "sensibilité",
      explication: "Les trois courbes x̄, ȳ, z̄ : comment l'œil moyen répond à chaque longueur d'onde (ȳ = la luminosité perçue).",
      series: [["x̄", "#dc2626", XBAR], ["ȳ", "#16a34a", YBAR], ["z̄", "#2563eb", ZBAR]].map(([nom, couleur, valeurs]) => ({ nom, couleur, valeurs })) },
    { id: "paire-metamere", titre: "🎨 Exemple de paire métamère (réflectances spectrales)", unite: "réflectance",
      explication: `Deux couleurs calculées avec paireMetamere : identiques sous D65, différentes sous A. Les courbes se croisent ${nCrois} fois et s'écartent surtout dans le rouge. Écart ΔE*ab — ${ecarts.join(" · ")}.`,
      series: [{ nom: "carte 1", couleur: versEcran(xyz(carte1, D65.spectre), blanc(D65.spectre)), valeurs: carte1 }, { nom: "carte 2", couleur: "#0f172a", valeurs: carte2, tirets: true }] },
  ].map((g) => ({ ...g, longueurs: LONGUEURS }));
}

// Sans la boîte à outils fournie (AVEC_COLORIMETRIE = false dans la page) : le fichier que l'on construit soi-même.
export const FICHIER_PERSO = "maColorimetrie.js";

// Étape 0, seulement sans la boîte à outils fournie : la construire.
export const ETAPE_OUTILS = {
  titre: "Construire ton modèle couleur",
  motsCles: ["crée un fichier", "mon modèle couleur", "tables officielles de la CIE", "pas de valeurs de mémoire", "de 380 à 780 nm, pas de 5 nm", "observateur CIE 1931", "illuminant A", "illuminant D65", "illuminant F11", "écart ΔE*ab", "paire métamère", "calculé, pas choisi à la main", "n'utilise pas le modèle fourni"], // surlignés quand l'étape est ouverte
  consigne: "Tu construis toi-même le modèle couleur. Rédige un prompt pour que l'IA crée les données spectrales et les calculs dont la simulation aura besoin.",
  indices: [
    "Quelles données ? Les distributions spectrales des illuminants A, D65 et F11, et l'observateur CIE 1931, de 380 à 780 nm.",
    "D'où viennent-elles ? Exige les tables officielles de la CIE, pas des valeurs de mémoire : sinon l'IA peut en inventer une partie.",
    "Quels calculs ? XYZ, L*a*b*, l'écart ΔE*ab, la couleur à l'écran, et une paire métamère calculée : même couleur sous D65, au moins 3 croisements, et les courbes qui s'écartent dans le rouge.",
  ],
  proposition: "Crée mon modèle couleur avec les tables officielles de la CIE (pas de mémoire) : illuminants A, D65, F11 et observateur CIE 1931, de 380 à 780 nm. Ajoute XYZ, L*a*b*, ΔE*ab, la couleur à l'écran et une paire métamère calculée. N'utilise pas le modèle fourni.",
};

export const OUTILS_SANS = [
  {
    titre: "Modèle en cours de construction",
    titreComplet: "Ton modèle couleur, complet", // quand tous les éléments sont ✅
    nom: "maColorimetrie.js",
    chemin: "src/outils/maColorimetrie.js",
    resume: "Ton propre modèle couleur, construit par l'IA à l'étape 0, à la place du modèle fourni. Il doit contenir :",
    contenu: [
      "📈 les distributions spectrales des illuminants A, D65 et F11, de 380 à 780 nm, tirées des tables officielles de la CIE ;",
      "👁 l'observateur de référence CIE 1931 ;",
      "🧮 les calculs XYZ, L*a*b* et l'écart ΔE*ab ;",
      "🖥 la couleur à afficher à l'écran ;",
      "🎨 la fabrication d'une paire métamère calculée.",
    ],
    conseil: "Vérifie-la : F11 doit avoir trois pics étroits (vers 435, 545 et 610 nm), et les deux cartes doivent être identiques sous D65.",
    // Le fichier construit : chargé s'il existe, puis montré (courbes) et vérifié automatiquement.
    equations: EQUATIONS,
    controlePaire,
    charger: async () => { const f = MODELE_PERSO["../maColorimetrie.js"]; return f ? f() : null; },
    donneesDe: (m) => { try { return donneesColorimetrie(m); } catch { return null; } },
    verifier: verifierModele,
  },
];

// Rattachés aux étapes : le cadre les affiche sans que la page ait à les passer.
ETAPES.outils = OUTILS;
ETAPES.outilsSans = OUTILS_SANS;
ETAPES.etapeOutils = ETAPE_OUTILS;
ETAPES.fichierPerso = FICHIER_PERSO;
// Mots clés montrés seulement quand on construit sa boîte à outils.
ETAPES.motsSansSeulement = ["crée un fichier", "mon modèle couleur", "tables officielles de la CIE", "pas de valeurs de mémoire", "de 380 à 780 nm, pas de 5 nm", "n'utilise pas le modèle fourni"];

export const IDEES = [
  "ajoute une troisième carte, d'une autre couleur, qui reste identique sous les trois lumières (elle sert de témoin)",
  "ajoute un curseur pour régler la température de couleur de la lampe de la cabine, de 2700 K à 6500 K",
  "affiche en grand, sous la scène, l'écart ΔE*ab entre les deux cartes, avec une couleur verte, orange ou rouge selon qu'il se voit ou non",
  "ajoute une question à choix pour l'élève : « Sous quelle lumière les deux cartes sont-elles différentes ? », avec la correction",
];

// Mots clés : le vocabulaire qui rend un prompt précis (affiché à côté de la simulation ; un clic copie le mot).
export const MOTS_CLES = [
  { titre: "📍 Où ?", mots: ["sur le bord de la cabine", "sur le fond de la cabine", "au-dessus de la scène", "sous la scène", "sur chaque carte", "dans une fenêtre (popup)"] },
  { titre: "🧱 Les objets", mots: ["cabine de lumière 3D", "un bouton", "illuminant A", "illuminant D65", "illuminant F11", "carte de contraste", "échantillon", "une palette de couleurs", "le modèle couleur", "mon modèle couleur", "tables officielles de la CIE", "distribution spectrale", "réflectance spectrale", "observateur CIE 1931", "écart ΔE*ab", "paire métamère"] },
  { titre: "🛠 Les actions", mots: ["crée un fichier", "ajoute", "fais fonctionner", "remplace", "rends déplaçable", "calcule à partir des spectres", "affiche", "surligne", "retire"] },
  { titre: "⚙️ Le comportement", mots: ["quand on clique", "quand on fait glisser", "à la souris et au doigt", "sur téléphone", "retiens le choix au rechargement", "un voyant s'allume"] },
  { titre: "📈 L'affichage", mots: ["graphique de 380 à 780 nm", "courbes superposées", "légende", "zone surlignée", "encadré « À retenir »", "valeur arrondie", "vert / orange / rouge selon le résultat"] },
  { titre: "✅ Les exigences", mots: ["pas de valeurs de mémoire", "de 380 à 780 nm, pas de 5 nm", "n'utilise pas le modèle fourni", "calculé, pas choisi à la main", "avec le modèle couleur", "ne change rien d'autre", "une étape à la fois", "phrase d'explication pour l'élève"] },
];
