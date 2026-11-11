// Canvas SVG principal : assemble la grille (selon type) + titre + axes + annotations.
import { forwardRef } from "react"
import Cartesian from "./canvas/Cartesian"
import LogScale from "./canvas/LogScale"
import Ternary from "./canvas/Ternary"
import AnnotationLayer from "./AnnotationLayer"
import { pageSize, plotArea } from "./lib/geometry"

// `interactive` à false pour rendre statiquement (clipboard/export PDF off-screen).
const GraphCanvas = forwardRef(function GraphCanvas(
  { config, selectedAnnotationId, onSelectAnnotation, onChangeAnnotation, interactive = true, className, style },
  ref,
) {
  const page = pageSize(config.orientation)
  const plot = plotArea(config.orientation)

  // Grille selon le type
  let grid = null
  if (config.type === "cartesian" || config.type === "milli") {
    grid = <Cartesian plot={plot} axes={config.axes} />
  } else if (config.type === "semilogX") {
    grid = <LogScale plot={plot} axes={config.axes} xType="log" yType="lin" />
  } else if (config.type === "semilogY") {
    grid = <LogScale plot={plot} axes={config.axes} xType="lin" yType="log" />
  } else if (config.type === "loglog") {
    grid = <LogScale plot={plot} axes={config.axes} xType="log" yType="log" />
  } else if (config.type === "ternary") {
    grid = <Ternary plot={plot} ternary={config.ternary} />
  }

  // Étiquettes d'axes (sauf ternaire)
  const showAxes = config.type !== "ternary"

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${page.w} ${page.h}`}
      width="100%"
      height="100%"
      className={className}
      style={style}
      onPointerDown={() => onSelectAnnotation?.(null)}
    >
      {/* Marker pour les flèches (réutilisable par toutes les annotations) */}
      <defs>
        <marker id="graph-arrowhead" viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#111" />
        </marker>
      </defs>

      {/* Fond blanc — important pour l'export PNG/PDF */}
      <rect x={0} y={0} width={page.w} height={page.h} fill="#ffffff" />

      {/* Titre et sous-titre, centrés au-dessus de la zone de tracé */}
      {(config.title || config.subtitle) && (
        <g fontFamily="system-ui, sans-serif" fill="#111">
          {config.title && (
            <text x={page.w / 2} y={plot.y - 9} textAnchor="middle" fontSize={5.5} fontWeight={700}>
              {config.title}
            </text>
          )}
          {config.subtitle && (
            <text x={page.w / 2} y={plot.y - 3.5} textAnchor="middle" fontSize={3.2} fill="#444">
              {config.subtitle}
            </text>
          )}
        </g>
      )}

      {/* Zone de tracé */}
      <g transform={`translate(${plot.x} ${plot.y})`}>
        {grid}
      </g>

      {/* Étiquettes d'axes (cartésien / log) */}
      {showAxes && (
        <g fontFamily="system-ui, sans-serif" fontSize={3.6} fill="#111">
          {config.axes.x.label && (
            <text x={plot.x + plot.w / 2} y={plot.y + plot.h + 12} textAnchor="middle">
              {config.axes.x.label}
            </text>
          )}
          {config.axes.y.label && (
            <text
              x={0} y={0}
              textAnchor="middle"
              transform={`translate(${plot.x - 14} ${plot.y + plot.h / 2}) rotate(-90)`}
            >
              {config.axes.y.label}
            </text>
          )}
        </g>
      )}

      {/* Annotations interactives */}
      <AnnotationLayer
        svgRef={ref}
        annotations={config.annotations || []}
        onChange={onChangeAnnotation}
        selectedId={selectedAnnotationId}
        onSelect={onSelectAnnotation}
        interactive={interactive}
      />
    </svg>
  )
})

export default GraphCanvas
