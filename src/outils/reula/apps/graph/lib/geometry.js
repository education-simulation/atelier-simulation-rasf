// Géométrie partagée des graphes vierges.
// Toutes les coordonnées SVG sont exprimées en millimètres : viewBox = dimensions
// physiques du papier (A4 = 210×297 mm). Cela permet :
//   • un export PDF direct (jsPDF travaille en mm) ;
//   • des annotations dimensionnées en mm, indépendantes de la taille d'affichage.

export const A4 = { portrait: { w: 210, h: 297 }, landscape: { w: 297, h: 210 } }

// Marges par défaut autour de la zone de tracé (mm).
export const DEFAULT_MARGINS = { top: 24, right: 15, bottom: 22, left: 22 }

export function pageSize(orientation) {
  return A4[orientation] || A4.portrait
}

// Zone utile (plot area) en coordonnées SVG (origine en haut-gauche de la page).
export function plotArea(orientation, margins = DEFAULT_MARGINS) {
  const { w, h } = pageSize(orientation)
  return {
    x: margins.left,
    y: margins.top,
    w: w - margins.left - margins.right,
    h: h - margins.top - margins.bottom,
  }
}

// Mapping linéaire d'une valeur dans [min,max] vers un pixel dans [0,length].
export function linearScale(min, max, length) {
  const span = max - min || 1
  return v => ((v - min) / span) * length
}

// Mapping logarithmique base 10.
export function logScale(min, max, length) {
  const a = Math.log10(min)
  const b = Math.log10(max)
  const span = b - a || 1
  return v => ((Math.log10(v) - a) / span) * length
}

// Génère un tableau de N+1 valeurs régulières entre min et max (inclus).
export function linearTicks(min, max, count) {
  if (count < 1) return [min, max]
  const out = []
  const step = (max - min) / count
  for (let i = 0; i <= count; i++) out.push(min + i * step)
  return out
}

// Décades pour échelle log : les puissances de 10 dans [min,max].
export function logDecades(min, max) {
  const out = []
  const start = Math.ceil(Math.log10(min) - 1e-9)
  const end = Math.floor(Math.log10(max) + 1e-9)
  for (let k = start; k <= end; k++) out.push(Math.pow(10, k))
  return out
}

// Sous-graduations log : 2..9 entre chaque décade.
export function logMinorTicks(min, max) {
  const out = []
  const start = Math.floor(Math.log10(min))
  const end = Math.ceil(Math.log10(max))
  for (let k = start; k < end; k++) {
    const base = Math.pow(10, k)
    for (let i = 2; i <= 9; i++) {
      const v = i * base
      if (v >= min && v <= max) out.push(v)
    }
  }
  return out
}

// Formatage compact d'un nombre pour les étiquettes.
export function fmtNum(v) {
  if (v === 0) return "0"
  const abs = Math.abs(v)
  if (abs >= 1000 || abs < 0.01) {
    const exp = Math.floor(Math.log10(abs))
    const mant = v / Math.pow(10, exp)
    if (Math.abs(mant - Math.round(mant)) < 1e-6) return `${Math.round(mant)}·10${supScript(exp)}`
    return `${mant.toFixed(1)}·10${supScript(exp)}`
  }
  // 0.01 ≤ |v| < 1000 : 3 chiffres significatifs
  return Number(v.toPrecision(3)).toString()
}

function supScript(n) {
  const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" }
  return String(n).split("").map(c => map[c] || c).join("")
}
