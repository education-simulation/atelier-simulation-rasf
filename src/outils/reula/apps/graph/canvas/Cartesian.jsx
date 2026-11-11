// Grille cartésienne linéaire (et papier millimétré : même rendu, paramètres différents).
import { linearScale, linearTicks, fmtNum } from "../lib/geometry"

export default function Cartesian({ plot, axes }) {
  const { w, h } = plot
  const sx = linearScale(axes.x.min, axes.x.max, w)
  const sy = linearScale(axes.y.min, axes.y.max, h)

  const xMajor = linearTicks(axes.x.min, axes.x.max, axes.x.majorTicks)
  const yMajor = linearTicks(axes.y.min, axes.y.max, axes.y.majorTicks)

  // Sous-graduations : N par intervalle majeur.
  const xMinor = []
  const yMinor = []
  if (axes.x.minorTicks > 1 && axes.x.majorTicks > 0) {
    const step = (axes.x.max - axes.x.min) / axes.x.majorTicks / axes.x.minorTicks
    for (let v = axes.x.min; v <= axes.x.max + 1e-9; v += step) xMinor.push(v)
  }
  if (axes.y.minorTicks > 1 && axes.y.majorTicks > 0) {
    const step = (axes.y.max - axes.y.min) / axes.y.majorTicks / axes.y.minorTicks
    for (let v = axes.y.min; v <= axes.y.max + 1e-9; v += step) yMinor.push(v)
  }

  return (
    <g>
      {/* Sous-quadrillage clair */}
      <g stroke="#dddddd" strokeWidth={0.1} fill="none">
        {xMinor.map((v, i) => (
          <line key={`mx-${i}`} x1={sx(v)} y1={0} x2={sx(v)} y2={h} />
        ))}
        {yMinor.map((v, i) => (
          <line key={`my-${i}`} x1={0} y1={h - sy(v)} x2={w} y2={h - sy(v)} />
        ))}
      </g>
      {/* Quadrillage principal */}
      <g stroke="#9ca3af" strokeWidth={0.18} fill="none">
        {xMajor.map((v, i) => (
          <line key={`gx-${i}`} x1={sx(v)} y1={0} x2={sx(v)} y2={h} />
        ))}
        {yMajor.map((v, i) => (
          <line key={`gy-${i}`} x1={0} y1={h - sy(v)} x2={w} y2={h - sy(v)} />
        ))}
      </g>
      {/* Cadre */}
      <rect x={0} y={0} width={w} height={h} fill="none" stroke="#111" strokeWidth={0.35} />
      {/* Étiquettes des graduations majeures */}
      <g fontFamily="system-ui, sans-serif" fontSize={2.6} fill="#111">
        {xMajor.map((v, i) => (
          <text key={`lx-${i}`} x={sx(v)} y={h + 3.5} textAnchor="middle">{fmtNum(v)}</text>
        ))}
        {yMajor.map((v, i) => (
          <text key={`ly-${i}`} x={-1.5} y={h - sy(v) + 0.9} textAnchor="end">{fmtNum(v)}</text>
        ))}
      </g>
    </g>
  )
}
