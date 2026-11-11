// Calque d'annotations interactives : zones colorées, flèches, étiquettes texte.
// Coordonnées exprimées en mm (mêmes unités que le viewBox).
import { useRef } from "react"

const HANDLE_R = 1.4

// Convertit un point écran (clientX, clientY) en coordonnées SVG (mm)
// en utilisant la matrice inverse du SVG. Robuste au resize/zoom.
function clientToSvg(svg, clientX, clientY) {
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const inv = ctm.inverse()
  const p = pt.matrixTransform(inv)
  return { x: p.x, y: p.y }
}

export default function AnnotationLayer({
  svgRef, annotations, onChange,
  selectedId, onSelect,
  interactive = true,
}) {
  return (
    <g>
      {annotations.map(a => (
        <Annotation
          key={a.id}
          ann={a}
          svgRef={svgRef}
          selected={selectedId === a.id}
          onSelect={() => onSelect?.(a.id)}
          onChange={patch => onChange(a.id, patch)}
          interactive={interactive}
        />
      ))}
    </g>
  )
}

function Annotation({ ann, svgRef, selected, onSelect, onChange, interactive }) {
  if (ann.type === "zone")  return <Zone  ann={ann} svgRef={svgRef} selected={selected} onSelect={onSelect} onChange={onChange} interactive={interactive} />
  if (ann.type === "arrow") return <Arrow ann={ann} svgRef={svgRef} selected={selected} onSelect={onSelect} onChange={onChange} interactive={interactive} />
  if (ann.type === "text")  return <TextLabel ann={ann} svgRef={svgRef} selected={selected} onSelect={onSelect} onChange={onChange} interactive={interactive} />
  return null
}

// ─── Hook commun : drag d'un point (x,y) ───────────────────────────────────
function useDrag(svgRef, getXY, setXY, interactive) {
  const stateRef = useRef(null)

  const onPointerDown = e => {
    if (!interactive) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const svg = svgRef.current
    if (!svg) return
    const start = clientToSvg(svg, e.clientX, e.clientY)
    const init = getXY()
    stateRef.current = { startSvg: start, init }
  }

  const onPointerMove = e => {
    if (!stateRef.current) return
    const svg = svgRef.current
    if (!svg) return
    const p = clientToSvg(svg, e.clientX, e.clientY)
    const dx = p.x - stateRef.current.startSvg.x
    const dy = p.y - stateRef.current.startSvg.y
    setXY(stateRef.current.init.x + dx, stateRef.current.init.y + dy)
  }

  const onPointerUp = e => {
    if (!stateRef.current) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    stateRef.current = null
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}

// ─── Zone colorée (rectangle) ──────────────────────────────────────────────
function Zone({ ann, svgRef, selected, onSelect, onChange, interactive }) {
  const drag = useDrag(
    svgRef,
    () => ({ x: ann.x, y: ann.y }),
    (x, y) => onChange({ x, y }),
    interactive,
  )
  const cursor = interactive ? "move" : "default"
  return (
    <g onPointerDown={() => onSelect()}>
      <rect
        x={ann.x} y={ann.y} width={ann.w} height={ann.h}
        fill={ann.fill || "#3b82f6"} fillOpacity={ann.opacity ?? 0.18}
        stroke={ann.stroke || ann.fill || "#3b82f6"} strokeOpacity={0.55} strokeWidth={0.25}
        style={{ cursor }}
        {...drag}
      />
      {selected && interactive && <Handles ann={ann} svgRef={svgRef} onChange={onChange} kind="rect" />}
    </g>
  )
}

// ─── Flèche / ligne ────────────────────────────────────────────────────────
function Arrow({ ann, svgRef, selected, onSelect, onChange, interactive }) {
  const drag = useDrag(
    svgRef,
    () => ({ x: ann.x1, y: ann.y1 }),
    (x1, y1) => onChange({ x1, y1, x2: ann.x2 + (x1 - ann.x1), y2: ann.y2 + (y1 - ann.y1) }),
    interactive,
  )
  const cursor = interactive ? "move" : "default"
  const stroke = ann.stroke || "#111"
  const sw = ann.width ?? 0.4
  return (
    <g onPointerDown={() => onSelect()}>
      <line
        x1={ann.x1} y1={ann.y1} x2={ann.x2} y2={ann.y2}
        stroke={stroke} strokeWidth={sw}
        markerEnd={ann.arrow ? "url(#graph-arrowhead)" : undefined}
        style={{ cursor }}
        {...drag}
      />
      {/* zone de capture invisible plus large pour faciliter le clic */}
      <line
        x1={ann.x1} y1={ann.y1} x2={ann.x2} y2={ann.y2}
        stroke="transparent" strokeWidth={Math.max(sw * 6, 2.5)}
        style={{ cursor }}
        {...drag}
      />
      {selected && interactive && <Handles ann={ann} svgRef={svgRef} onChange={onChange} kind="line" />}
    </g>
  )
}

// ─── Étiquette texte ───────────────────────────────────────────────────────
function TextLabel({ ann, svgRef, selected, onSelect, onChange, interactive }) {
  const drag = useDrag(
    svgRef,
    () => ({ x: ann.x, y: ann.y }),
    (x, y) => onChange({ x, y }),
    interactive,
  )
  const cursor = interactive ? "move" : "default"
  return (
    <g onPointerDown={() => onSelect()}>
      <text
        x={ann.x} y={ann.y}
        fontFamily="system-ui, sans-serif"
        fontSize={ann.size || 3.2}
        fontWeight={ann.bold ? 700 : 400}
        fill={ann.color || "#111"}
        textAnchor={ann.align || "start"}
        style={{ cursor, userSelect: "none" }}
        {...drag}
      >
        {ann.text || "…"}
      </text>
      {selected && interactive && (
        <rect
          x={ann.x - 1} y={ann.y - (ann.size || 3.2)}
          width={Math.max(ann.text?.length || 1, 2) * (ann.size || 3.2) * 0.55 + 2}
          height={(ann.size || 3.2) + 1.5}
          fill="none" stroke="#3b82f6" strokeWidth={0.15} strokeDasharray="0.7 0.5"
          pointerEvents="none"
        />
      )}
    </g>
  )
}

// ─── Poignées de redimensionnement ─────────────────────────────────────────
function Handles({ ann, svgRef, onChange, kind }) {
  if (kind === "rect") {
    return (
      <>
        <Handle svgRef={svgRef} cx={ann.x} cy={ann.y}
          onMove={(x, y) => onChange({ x, y, w: ann.w + (ann.x - x), h: ann.h + (ann.y - y) })} />
        <Handle svgRef={svgRef} cx={ann.x + ann.w} cy={ann.y}
          onMove={(x, y) => onChange({ y, w: x - ann.x, h: ann.h + (ann.y - y) })} />
        <Handle svgRef={svgRef} cx={ann.x} cy={ann.y + ann.h}
          onMove={(x, y) => onChange({ x, w: ann.w + (ann.x - x), h: y - ann.y })} />
        <Handle svgRef={svgRef} cx={ann.x + ann.w} cy={ann.y + ann.h}
          onMove={(x, y) => onChange({ w: x - ann.x, h: y - ann.y })} />
      </>
    )
  }
  if (kind === "line") {
    return (
      <>
        <Handle svgRef={svgRef} cx={ann.x1} cy={ann.y1} onMove={(x, y) => onChange({ x1: x, y1: y })} />
        <Handle svgRef={svgRef} cx={ann.x2} cy={ann.y2} onMove={(x, y) => onChange({ x2: x, y2: y })} />
      </>
    )
  }
  return null
}

function Handle({ svgRef, cx, cy, onMove }) {
  const draggingRef = useRef(false)
  const onPointerDown = e => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
  }
  const onPointerMove = e => {
    if (!draggingRef.current) return
    const svg = svgRef.current
    if (!svg) return
    const p = clientToSvg(svg, e.clientX, e.clientY)
    onMove(p.x, p.y)
  }
  const onPointerUp = e => {
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    draggingRef.current = false
  }
  return (
    <circle cx={cx} cy={cy} r={HANDLE_R}
      fill="#fff" stroke="#3b82f6" strokeWidth={0.35}
      style={{ cursor: "nwse-resize" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  )
}
