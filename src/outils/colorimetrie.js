// ============================================================
//  COLORIMÉTRIE (outil partagé, ne pas modifier) — utilisé par l'exemple « Métamérisme ».
//  Spectres de 380 à 780 nm, pas de 5 nm :
//   - observateur CIE 1931 (2°) : approximation analytique de Wyman, Sloan & Shirley (2013),
//     à moins de 1 % près des tables officielles ;
//   - illuminant A : formule de Planck définie par la CIE (2856 K) ;
//   - illuminant D65 : table CIE (10 nm), interpolée à 5 nm ;
//   - illuminant F11 : table CIE (5 nm), fluorescent à trois bandes.
//  Fournit XYZ, L*a*b*, ΔE*ab, et une couleur d'écran (sRGB) avec adaptation de l'œil à la lumière.
// ============================================================

export const LONGUEURS = Array.from({ length: 81 }, (_, i) => 380 + 5 * i);

// --- Observateur CIE 1931 (approximation à plusieurs lobes gaussiens) ---
const g = (l, mu, s1, s2) => { const s = l < mu ? s1 : s2; return Math.exp(-0.5 * ((l - mu) / s) ** 2); };
export const XBAR = LONGUEURS.map((l) => 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2));
export const YBAR = LONGUEURS.map((l) => 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1));
export const ZBAR = LONGUEURS.map((l) => 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8));

// --- Illuminants (puissance relative, 100 à 560 nm) ---
const A = LONGUEURS.map((l) => 100 * (560 / l) ** 5 * (Math.exp(1.435e7 / (2848 * 560)) - 1) / (Math.exp(1.435e7 / (2848 * l)) - 1));

const D65_10 = [49.98, 54.65, 82.75, 91.49, 93.43, 86.68, 104.87, 117.01, 117.81, 114.86, 115.92, 108.81, 109.35, 107.80, 104.79,
  107.69, 104.41, 104.05, 100.00, 96.33, 95.79, 88.69, 90.01, 89.60, 87.70, 83.29, 83.70, 80.03, 80.21, 82.28, 78.28, 69.72, 71.61,
  74.35, 61.60, 69.89, 75.09, 63.59, 46.42, 66.81, 63.38]; // 380 → 780 nm, tous les 10 nm
const D65 = LONGUEURS.map((l, i) => (i % 2 === 0 ? D65_10[i / 2] : (D65_10[(i - 1) / 2] + D65_10[(i + 1) / 2]) / 2));

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
const BRAD = [[0.8951, 0.2664, -0.1614], [-0.7502, 1.7135, 0.0367], [0.0389, -0.0685, 1.0296]];
const BRAD_INV = [[0.9869929, -0.1470543, 0.1599627], [0.4323053, 0.5183603, 0.0492912], [-0.0085287, 0.0400428, 0.9684867]];
const mul = (M, v) => M.map((l) => l[0] * v[0] + l[1] * v[1] + l[2] * v[2]);
const BLANC_D65 = blanc(D65);

export function versEcran(XYZ, blancSource, degre = 1) {
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
export function paireMetamere(R1, perturbation, cibleDeltaEsousA = 8) {
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

// Longueurs d'onde où deux courbes se croisent (interpolation linéaire).
export function croisements(R1, R2) {
  const res = [];
  for (let i = 1; i < LONGUEURS.length; i++) {
    const d0 = R1[i - 1] - R2[i - 1], d1 = R1[i] - R2[i];
    if (d0 === 0 || d0 * d1 < 0) res.push(LONGUEURS[i - 1] + (5 * d0) / (d0 - d1));
  }
  return res;
}
