// Diagramme ternaire vierge (triangle équilatéral).
// Coordonnées barycentriques (a,b,c) avec a+b+c=1.
// • A en bas-gauche, B en bas-droite, C en haut.
// • step en pourcents (10 → 11 lignes d'iso-composition par côté).
//
// Pour éviter les doubles flips, on calcule toutes les positions directement
// dans le repère SVG (origine en haut-gauche de la plot area, Y vers le bas).
// Le sommet C est donc au-dessus = y le plus PETIT.

const SQRT3_2 = Math.sqrt(3) / 2

// Convertit des coords barycentriques (a,b,c) en coords SVG (x,y).
//  • A en bas-gauche  (a=1 → ce sommet)
//  • B en bas-droite  (b=1)
//  • C en haut        (c=1)
function bary(a, b, c, anchor, side) {
  const x = anchor.x + b * side + c * (side / 2)
  const y = anchor.y - c * (side * SQRT3_2)
  return { x, y }
}

export default function Ternary({ plot, ternary }) {
  const { w, h } = plot
  const side = Math.min(w, h / SQRT3_2) * 0.92
  const triH = side * SQRT3_2
  // Anchor = position du sommet A (bas-gauche) dans le repère plot area.
  const anchor = { x: (w - side) / 2, y: (h + triH) / 2 }

  const A = bary(1, 0, 0, anchor, side)
  const B = bary(0, 1, 0, anchor, side)
  const C = bary(0, 0, 1, anchor, side)

  const step = Math.max(2, Math.min(50, Number(ternary.step) || 10))
  const n = Math.round(100 / step)

  // Lignes d'iso-a, iso-b, iso-c
  const lines = []
  for (let k = 1; k < n; k++) {
    const t = k / n
    lines.push({ p1: bary(t, 1 - t, 0, anchor, side), p2: bary(t, 0, 1 - t, anchor, side) }) // iso-a
    lines.push({ p1: bary(1 - t, t, 0, anchor, side), p2: bary(0, t, 1 - t, anchor, side) }) // iso-b
    lines.push({ p1: bary(1 - t, 0, t, anchor, side), p2: bary(0, 1 - t, t, anchor, side) }) // iso-c
  }

  // Graduations + étiquettes sur chaque côté, k de 1 à n-1.
  const ticks = []
  for (let i = 1; i < n; i++) {
    const k = i / n
    const pct = Math.round(k * 100)
    // Côté AB (bas) : indique le % de B → étiquette sous le côté.
    const ab = bary(1 - k, k, 0, anchor, side)
    ticks.push({ p: ab, dx: 0, dy: 3.4, anchor: "middle", pct, normal: { x: 0, y: 1 } })
    // Côté BC (droite) : indique le % de C → étiquette à droite.
    const bc = bary(0, 1 - k, k, anchor, side)
    ticks.push({ p: bc, dx: 3.2, dy: 0.9, anchor: "start", pct, normal: { x: 1, y: -0.5 } })
    // Côté CA (gauche) : indique le % de A → étiquette à gauche.
    const ca = bary(k, 0, 1 - k, anchor, side)
    ticks.push({ p: ca, dx: -3.2, dy: 0.9, anchor: "end", pct, normal: { x: -1, y: -0.5 } })
  }

  return (
    <g>
      {/* Quadrillage interne */}
      <g stroke="#bcbcbc" strokeWidth={0.15} fill="none">
        {lines.map((l, i) => (
          <line key={i} x1={l.p1.x} y1={l.p1.y} x2={l.p2.x} y2={l.p2.y} />
        ))}
      </g>

      {/* Triangle extérieur */}
      <polygon
        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
        fill="none" stroke="#111" strokeWidth={0.4}
      />

      {/* Tirets de graduation vers l'extérieur (1.2 mm) */}
      <g stroke="#111" strokeWidth={0.2}>
        {ticks.map((t, i) => (
          <line key={i}
            x1={t.p.x} y1={t.p.y}
            x2={t.p.x + t.normal.x * 1.2}
            y2={t.p.y + t.normal.y * 1.2}
          />
        ))}
      </g>

      {/* Étiquettes numériques */}
      <g fontFamily="system-ui, sans-serif" fontSize={2.2} fill="#111">
        {ticks.map((t, i) => (
          <text key={i}
            x={t.p.x + t.dx} y={t.p.y + t.dy}
            textAnchor={t.anchor}
          >{t.pct}</text>
        ))}
      </g>

      {/* Étiquettes des sommets */}
      <g fontFamily="system-ui, sans-serif" fontSize={4.5} fontWeight={700} fill="#111">
        <text x={A.x - 2}   y={A.y + 4}  textAnchor="end">{ternary.labelA}</text>
        <text x={B.x + 2}   y={B.y + 4}  textAnchor="start">{ternary.labelB}</text>
        <text x={C.x}       y={C.y - 2.5} textAnchor="middle">{ternary.labelC}</text>
      </g>
    </g>
  )
}
