// ============================================================
//  COLORIMÉTRIE (outil partagé, ne pas modifier) — utilisé par l'exemple « Métamérisme ».
//  Spectres de 380 à 780 nm, pas de 5 nm :
//   - observateur CIE 1931 (2°) : table officielle de la CIE (tous les 5 nm) ;
//   - illuminant A : formule de Planck définie par la CIE (2856 K) ;
//   - illuminant D65 : table officielle de la CIE (tous les 5 nm) ;
//   - illuminant F11 : table CIE (5 nm), fluorescent à trois bandes.
//  Fournit XYZ, L*a*b*, ΔE*ab, une couleur d'écran (sRGB) avec adaptation de l'œil à la lumière,
//  et des paires métamères vérifiées (au moins 3 croisements, écart surtout dans le rouge).
// ============================================================

export const LONGUEURS = Array.from({ length: 81 }, (_, i) => 380 + 5 * i);

// --- Observateur CIE 1931 (2°) : table officielle de la CIE (CIE 018:2019, table 6 ; DOI 10.25039/CIE.DS.xvudnb9b), 380 → 780 nm, tous les 5 nm ---
export const XBAR = [
  0.001368, 0.002236, 0.004243, 0.00765, 0.01431, 0.02319, 0.04351, 0.07763, 0.13438, 0.21477,
  0.2839, 0.3285, 0.34828, 0.34806, 0.3362, 0.3187, 0.2908, 0.2511, 0.19536, 0.1421,
  0.09564, 0.05795, 0.03201, 0.0147, 0.0049, 0.0024, 0.0093, 0.0291, 0.06327, 0.1096,
  0.1655, 0.22575, 0.2904, 0.3597, 0.43345, 0.51205, 0.5945, 0.6784, 0.7621, 0.8425,
  0.9163, 0.9786, 1.0263, 1.0567, 1.0622, 1.0456, 1.0026, 0.9384, 0.85445, 0.7514,
  0.6424, 0.5419, 0.4479, 0.3608, 0.2835, 0.2187, 0.1649, 0.1212, 0.0874, 0.0636,
  0.04677, 0.0329, 0.0227, 0.01584, 0.0113592, 0.00811092, 0.00579035, 0.00410946, 0.00289933, 0.00204919,
  0.00143997, 0.000999949, 0.000690079, 0.000476021, 0.000332301, 0.000234826, 0.000166151, 0.000117413, 8.30753e-05, 5.87065e-05,
  4.15099e-05,
];
export const YBAR = [
  3.9e-05, 6.4e-05, 0.00012, 0.000217, 0.000396, 0.00064, 0.00121, 0.00218, 0.004, 0.0073,
  0.0116, 0.01684, 0.023, 0.0298, 0.038, 0.048, 0.06, 0.0739, 0.09098, 0.1126,
  0.13902, 0.1693, 0.20802, 0.2586, 0.323, 0.4073, 0.503, 0.6082, 0.71, 0.7932,
  0.862, 0.91485, 0.954, 0.9803, 0.99495, 1, 0.995, 0.9786, 0.952, 0.9154,
  0.87, 0.8163, 0.757, 0.6949, 0.631, 0.5668, 0.503, 0.4412, 0.381, 0.321,
  0.265, 0.217, 0.175, 0.1382, 0.107, 0.0816, 0.061, 0.04458, 0.032, 0.0232,
  0.017, 0.01192, 0.00821, 0.005723, 0.004102, 0.002929, 0.002091, 0.001484, 0.001047, 0.00074,
  0.00052, 0.0003611, 0.0002492, 0.0001719, 0.00012, 8.48e-05, 6e-05, 4.24e-05, 3e-05, 2.12e-05,
  1.499e-05,
];
export const ZBAR = [
  0.00645, 0.01055, 0.02005, 0.03621, 0.06785, 0.1102, 0.2074, 0.3713, 0.6456, 1.03905,
  1.3856, 1.62296, 1.74706, 1.7826, 1.77211, 1.7441, 1.6692, 1.5281, 1.28764, 1.0419,
  0.81295, 0.6162, 0.46518, 0.3533, 0.272, 0.2123, 0.1582, 0.1117, 0.07825, 0.05725,
  0.04216, 0.02984, 0.0203, 0.0134, 0.00875, 0.00575, 0.0039, 0.00275, 0.0021, 0.0018,
  0.00165, 0.0014, 0.0011, 0.001, 0.0008, 0.0006, 0.00034, 0.00024, 0.00019, 0.0001,
  5e-05, 3e-05, 2e-05, 1e-05, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0,
];

// --- Illuminants (puissance relative, 100 à 560 nm) ---
const A = LONGUEURS.map((l) => 100 * (560 / l) ** 5 * (Math.exp(1.435e7 / (2848 * 560)) - 1) / (Math.exp(1.435e7 / (2848 * l)) - 1));

// D65 : table officielle de la CIE (ISO/CIE 11664-2), 380 → 780 nm, tous les 5 nm.
const D65 = [
  49.9755, 52.3118, 54.6482, 68.7015, 82.7549, 87.1204, 91.486, 92.4589, 93.4318, 90.057,
  86.6823, 95.7736, 104.865, 110.936, 117.008, 117.41, 117.812, 116.336, 114.861, 115.392,
  115.923, 112.367, 108.811, 109.082, 109.354, 108.578, 107.802, 106.296, 104.79, 106.239,
  107.689, 106.047, 104.405, 104.225, 104.046, 102.023, 100, 98.1671, 96.3342, 96.0611,
  95.788, 92.2368, 88.6856, 89.3459, 90.0062, 89.8026, 89.5991, 88.6489, 87.6987, 85.4936,
  83.2886, 83.4939, 83.6992, 81.863, 80.0268, 80.1207, 80.2146, 81.2462, 82.2778, 80.281,
  78.2842, 74.0027, 69.7213, 70.6652, 71.6091, 72.979, 74.349, 67.9765, 61.604, 65.7448,
  69.8856, 72.4863, 75.087, 69.3398, 63.5927, 55.0054, 46.4182, 56.6118, 66.8054, 65.0941,
  63.3828,
];

const F11 = [0.91, 0.63, 0.46, 0.37, 1.29, 12.68, 1.59, 1.79, 2.46, 3.33, 4.49, 33.94, 12.13, 6.95, 7.19, 7.12, 6.72, 6.13, 5.46, 4.79,
  5.66, 14.29, 14.96, 8.97, 4.72, 2.33, 1.47, 1.10, 0.89, 0.83, 1.18, 4.90, 39.59, 72.84, 32.61, 7.52, 2.83, 1.96, 1.67, 4.43, 11.28,
  14.76, 12.73, 9.74, 7.33, 9.72, 55.27, 42.58, 13.18, 13.16, 12.26, 5.11, 2.07, 2.34, 3.58, 3.01, 2.48, 2.14, 1.54, 1.33, 1.46, 1.94,
  2.00, 1.20, 1.35, 4.10, 5.58, 2.51, 0.57, 0.27, 0.23, 0.21, 0.24, 0.24, 0.20, 0.24, 0.32, 0.26, 0.16, 0.12, 0.09]; // 380 → 780 nm, tous les 5 nm

export const ILLUMINANTS = {
  D65: { nom: "D65", detail: "lumière du jour moyenne (6500 K)", spectre: D65, couleur: "#2563eb" },
  A: { nom: "A", detail: "lampe à incandescence (2856 K)", spectre: A, couleur: "#ea580c" },
  F11: { nom: "F11", detail: "tube fluorescent à trois bandes (4000 K)", spectre: F11, couleur: "#16a34a" },
};

const somme = (f) => LONGUEURS.reduce((t, _, i) => t + f(i), 0);

// Tristimulus d'une réflectance R sous l'illuminant S, normalisés pour que le blanc parfait ait Y = 100.
export function xyz(R, S) {
  const k = 100 / somme((i) => S[i] * YBAR[i]);
  return [k * somme((i) => S[i] * R[i] * XBAR[i]), k * somme((i) => S[i] * R[i] * YBAR[i]), k * somme((i) => S[i] * R[i] * ZBAR[i])];
}
export const blanc = (S) => xyz(LONGUEURS.map(() => 1), S);

export function lab([X, Y, Z], [Xn, Yn, Zn]) {
  const f = (t) => (t > (6 / 29) ** 3 ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29);
  const fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
export const deltaE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Couleur d'écran : adaptation de Bradford du blanc de l'illuminant vers D65 (l'œil s'habitue à la lumière),
// avec un degré d'adaptation (1 = complète : un blanc paraît blanc ; < 1 : on voit encore la teinte de la lampe).
// Par défaut 0,4 (choix pédagogique, volontairement marqué) : dans la cabine, la teinte de la lampe saute aux yeux,
// et l'écart entre deux cartes métamères aussi.
export const ADAPTATION = 0.4;
const BRAD = [[0.8951, 0.2664, -0.1614], [-0.7502, 1.7135, 0.0367], [0.0389, -0.0685, 1.0296]];
const BRAD_INV = [[0.9869929, -0.1470543, 0.1599627], [0.4323053, 0.5183603, 0.0492912], [-0.0085287, 0.0400428, 0.9684867]];
const mul = (M, v) => M.map((l) => l[0] * v[0] + l[1] * v[1] + l[2] * v[2]);
const BLANC_D65 = blanc(D65);

export function versEcran(XYZ, blancSource, degre = ADAPTATION) {
  const c = mul(BRAD, XYZ), ws = mul(BRAD, blancSource), wd = mul(BRAD, BLANC_D65);
  const adapte = mul(BRAD_INV, c.map((v, i) => v * (degre * wd[i] / ws[i] + (1 - degre))));
  const [X, Y, Z] = adapte.map((v) => v / 100);
  const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.2040 * Y + 1.0570 * Z];
  const gamma = (u) => { u = Math.min(1, Math.max(0, u)); return u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055; };
  return `rgb(${lin.map((u) => Math.round(255 * gamma(u))).join(",")})`;
}

// --- Paire métamère : deux réflectances qui donnent EXACTEMENT les mêmes XYZ sous D65 ---
// R2 = R1 + k·b, où b est un « noir métamérique » pour D65 : une courbe invisible sous D65
// (sa contribution à X, Y et Z est nulle). b croise forcément zéro au moins 3 fois → les deux courbes se croisent.
function paireBrute(R1, perturbation, cibleDeltaEsousA) {
  const S = D65;
  const bases = [XBAR, YBAR, ZBAR].map((c) => LONGUEURS.map((_, i) => S[i] * c[i]));
  const ortho = [];
  for (const v of bases) {
    let u = v.slice();
    for (const o of ortho) { const p = u.reduce((t, x, i) => t + x * o[i], 0); u = u.map((x, i) => x - p * o[i]); }
    const n = Math.hypot(...u); ortho.push(u.map((x) => x / n));
  }
  let b = perturbation.slice();
  for (const o of ortho) { const p = b.reduce((t, x, i) => t + x * o[i], 0); b = b.map((x, i) => x - p * o[i]); }
  // k : la différence sous A vaut à peu près cibleDeltaEsousA, sans sortir des réflectances possibles (entre 2 % et 95 %).
  const dE = (k) => { const R2 = R1.map((r, i) => r + k * b[i]); const w = blanc(A); return deltaE(lab(xyz(R1, A), w), lab(xyz(R2, A), w)); };
  let k = cibleDeltaEsousA / dE(1);
  const kMax = Math.min(...R1.map((r, i) => (b[i] > 0 ? (0.95 - r) / b[i] : b[i] < 0 ? (r - 0.02) / -b[i] : Infinity)));
  k = Math.min(k, kMax);
  return R1.map((r, i) => r + k * b[i]);
}

// Perturbations essayées par défaut : une bosse dans le ROUGE, pour que les deux courbes s'écartent dans le rouge.
const BOSSES_ROUGES = [[650, 35], [640, 30], [660, 40], [630, 30], [670, 35]]
  .map(([c, w]) => LONGUEURS.map((l) => Math.exp(-(((l - c) / w) ** 2))));

// Une vraie paire métamère pour l'exercice : mêmes XYZ sous D65, AU MOINS 3 croisements,
// et le plus grand écart dans le rouge (600 à 700 nm).
export function verifierPaire(R1, R2, minCroisements = 3) {
  const n = croisements(R1, R2).length;
  const d = R1.map((v, i) => Math.abs(v - R2[i]));
  const pic = LONGUEURS[d.indexOf(Math.max(...d))];
  const ecart = (S) => { const w = blanc(S); return deltaE(lab(xyz(R1, S), w), lab(xyz(R2, S), w)); };
  const ecartD65 = ecart(D65), ecartA = ecart(A);
  const divergeRouge = pic >= 600 && pic <= 700;
  return { croisements: n, pic, divergeRouge, ecartD65, ecartA, ok: n >= minCroisements && divergeRouge && ecartD65 < 0.1 && ecartA > 1 };
}

// Fabrique la carte 2 à partir de la carte 1. Chaque essai est vérifié (verifierPaire) : un essai qui ne
// respecte pas les règles est REFUSÉ et on recommence avec une autre perturbation.
export function paireMetamere(R1, perturbation, cibleDeltaEsousA = 12) {
  const essais = [...(perturbation ? [perturbation] : []), ...BOSSES_ROUGES];
  let meilleur = null;
  for (const p of essais) {
    const R2 = paireBrute(R1, p, cibleDeltaEsousA);
    const v = verifierPaire(R1, R2);
    if (v.ok) return R2;
    if (!meilleur || v.croisements > meilleur.v.croisements) meilleur = { R2, v };
  }
  console.warn("paireMetamere : aucune paire ne respecte toutes les règles pour cette couleur", meilleur.v);
  return meilleur.R2;
}

// Couleur d'une surface blanche (murs, fond, sol de la cabine) sous un illuminant, vue comme les cartes :
// à utiliser pour peindre la cabine, plutôt que des couleurs choisies à la main.
export function couleurLumiere(S, facteur = 0.85) {
  const R = LONGUEURS.map(() => facteur);
  return versEcran(xyz(R, S), blanc(S));
}

// Longueurs d'onde où deux courbes se croisent (interpolation linéaire).
export function croisements(R1, R2) {
  const res = [];
  for (let i = 1; i < LONGUEURS.length; i++) {
    const d0 = R1[i - 1] - R2[i - 1], d1 = R1[i] - R2[i];
    if (d0 === 0 || d0 * d1 < 0) res.push(LONGUEURS[i - 1] + (5 * d0) / (d0 - d1));
  }
  return res;
}
