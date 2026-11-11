// Grilles semi-log et log-log.
// axisType: "lin" ou "log" pour chaque axe.
import { linearScale, linearTicks, logScale, logDecades, logMinorTicks, fmtNum } from "../lib/geometry"

export default function LogScale({ plot, axes, xType, yType }) {
  const { w, h } = plot

  const sx = xType === "log" ? logScale(axes.x.min, axes.x.max, w)
                              : linearScale(axes.x.min, axes.x.max, w)
  const sy = yType === "log" ? logScale(axes.y.min, axes.y.max, h)
                              : linearScale(axes.y.min, axes.y.max, h)

  const xMajor = xType === "log" ? logDecades(axes.x.min, axes.x.max)
                                  : linearTicks(axes.x.min, axes.x.max, axes.x.majorTicks)
  const yMajor = yType === "log" ? logDecades(axes.y.min, axes.y.max)
                                  : linearTicks(axes.y.min, axes.y.max, axes.y.majorTicks)

  const xMinor = xType === "log" ? logMinorTicks(axes.x.min, axes.x.max) : []
  const yMinor = yType === "log" ? logMinorTicks(axes.y.min, axes.y.max) : []

  return (
    <g>
      <g stroke="#dddddd" strokeWidth={0.1} fill="none">
        {xMinor.map((v, i) => (
          <line key={`mx-${i}`} x1={sx(v)} y1={0} x2={sx(v)} y2={h} />
        ))}
        {yMinor.map((v, i) => (
          <line key={`my-${i}`} x1={0} y1={h - sy(v)} x2={w} y2={h - sy(v)} />
        ))}
      </g>
      <g stroke="#9ca3af" strokeWidth={0.18} fill="none">
        {xMajor.map((v, i) => (
          <line key={`gx-${i}`} x1={sx(v)} y1={0} x2={sx(v)} y2={h} />
        ))}
        {yMajor.map((v, i) => (
          <line key={`gy-${i}`} x1={0} y1={h - sy(v)} x2={w} y2={h - sy(v)} />
        ))}
      </g>
      <rect x={0} y={0} width={w} height={h} fill="none" stroke="#111" strokeWidth={0.35} />
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
