// ============================================================
//  TITRAGE DIRECT (outil partagé, ne pas modifier) — le modèle chimique par défaut de l'exercice « Titrage direct ».
//  Titrage du diiode d'un Lugol par les ions thiosulfate (repérage colorimétrique de l'équivalence) :
//      I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻   (réaction rapide et totale)
//  Fournit :
//   - REACTION : les espèces, leurs coefficients et leur rôle ;
//   - DONNEES  : M(I₂), l'étiquette du Lugol, V_A, c_B, la burette ;
//   - solution(params)        : c_A, n₀(I₂) et le volume équivalent V_éq = 2·c_A·V_A / c_B ;
//   - quantites(mod, V)       : n(I₂), n(S₂O₃²⁻), n(S₄O₆²⁻), n(I⁻) en mol (tableau d'avancement) ;
//   - concentrationI2(mod, V) : c(I₂) dans le bécher, en mol/L ;
//   - absorbances(c, ind)     : absorbances rouge, vert, bleu de la solution (loi de Beer-Lambert) ;
//   - couleurSolution(c, ind) : la couleur affichée, « rgb(…) », avec ou sans thiodène.
//  Le scénario (Lugol à 1,00 g de diiode pour 100 mL, thiosulfate à 0,0500 mol/L, prise d'essai de 10,0 mL)
//  reprend le TP « Titrage du diiode contenu dans le Lugol » de la Paillasse virtuelle de Nils Aronssohn.
//  Le code est réécrit : la couleur vient ici de la loi de Beer-Lambert (pas d'un dégradé choisi à la main).
// ============================================================

export const REACTION = {
  equation: "I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻",
  especes: [
    { id: "I2", nom: "I₂", coef: 1, role: "titré", couleur: "#b45309" },
    { id: "S2O3", nom: "S₂O₃²⁻", coef: 2, role: "titrant", couleur: "#2563eb" },
    { id: "I", nom: "I⁻", coef: 2, role: "produit", couleur: "#16a34a" },
    { id: "S4O6", nom: "S₄O₆²⁻", coef: 1, role: "produit", couleur: "#9333ea" },
  ],
};

export const DONNEES = {
  M_I2: 253.8,        // g/mol (2 × 126,90)
  etiquette: 1.0,     // g de diiode pour 100 mL de Lugol
  VA: 10.0,           // mL de Lugol, prélevés à la pipette jaugée
  cB: 0.05,           // mol/L de thiosulfate de sodium, dans la burette
  V_BURETTE: 25,      // mL
  goutte: 0.05,       // mL
};

// Le titrage : à partir de t (g de diiode pour 100 mL) ou directement de c_A (mol/L).
export function solution({ t = DONNEES.etiquette, cA, VA = DONNEES.VA, cB = DONNEES.cB } = {}) {
  const c = Number.isFinite(cA) ? cA : (t * 10) / DONNEES.M_I2;   // t g pour 100 mL → t × 10 g/L
  const nI2 = (c * VA) / 1000;
  return { t: Number.isFinite(cA) ? (cA * DONNEES.M_I2) / 10 : t, VA, cB, cA: c, nI2, Veq: ((2 * nI2) / cB) * 1000 };
}

// Tableau d'avancement : la réaction est totale, l'avancement suit le titrant tant qu'il reste du diiode.
export function quantites(mod, V) {
  const nB = (mod.cB * Math.max(0, V)) / 1000;
  const x = Math.min(nB / 2, mod.nI2);
  return { I2: mod.nI2 - x, S2O3: nB - 2 * x, I: 2 * x, S4O6: x };
}

export function concentrationI2(mod, V) {
  return quantites(mod, V).I2 / ((mod.VA + Math.max(0, V)) / 1000);
}

// --- La couleur : loi de Beer-Lambert, A = ε·ℓ·c, sur trois bandes (rouge, vert, bleu) ---
// ε en L·mol⁻¹·cm⁻¹ (valeurs approchées) ; ℓ = 2 cm (épaisseur de solution vue à travers le bécher).
// Le diiode (en présence d'ions iodure) absorbe surtout le bleu : rouge-brun concentré, jaune dilué.
// Le complexe diiode-thiodène absorbe surtout le rouge : bleu très foncé, même à très faible concentration.
export const EPAISSEUR = 2;
export const EPSILON = {
  diiode: [15, 60, 2600],        // rouge, vert, bleu
  thiodene: [40000, 15000, 2000],
};
export function absorbances(cI2, indicateur = false) {
  const c = Math.max(0, cI2);
  return [0, 1, 2].map((k) => EPAISSEUR * c * (EPSILON.diiode[k] + (indicateur ? EPSILON.thiodene[k] : 0)));
}
const versSRGB = (t) => (t <= 0.0031308 ? 12.92 * t : 1.055 * t ** (1 / 2.4) - 0.055);
export function couleurSolution(cI2, indicateur = false) {
  const fond = 0.95; // l'eau seule, devant un fond blanc
  const [r, v, b] = absorbances(cI2, indicateur).map((A) => Math.round(255 * versSRGB(fond * 10 ** -A)));
  return `rgb(${r}, ${v}, ${b})`;
}
