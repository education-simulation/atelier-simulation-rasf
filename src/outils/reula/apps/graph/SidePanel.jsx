// Panneau latéral : édition titre, axes, annotations, sauvegardes.
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import { useLang } from "../../i18n"
import { newId } from "./lib/defaults"

const FIELD = "flex items-center gap-2"
const NUM   = "w-20"
const LBL   = "text-xs text-gray-500 w-12 shrink-0"

export default function SidePanel({
  config, setConfig,
  selectedId, setSelectedId,
  onSaveClick, onLoadClick,
}) {
  const { t } = useLang()
  const isTernary = config.type === "ternary"

  const patch = (p) => setConfig(c => ({ ...c, ...p }))
  const patchAxes = (axis, p) =>
    setConfig(c => ({ ...c, axes: { ...c.axes, [axis]: { ...c.axes[axis], ...p } } }))
  const patchTernary = (p) =>
    setConfig(c => ({ ...c, ternary: { ...c.ternary, ...p } }))

  const addAnnotation = (type) => {
    const base = { id: newId(), type }
    let ann
    if (type === "text")  ann = { ...base, text: t("graph.ann.newText"), x: 30, y: 30, size: 4, color: "#111", bold: false }
    if (type === "zone")  ann = { ...base, x: 60, y: 80, w: 40, h: 25, fill: "#3b82f6", opacity: 0.18 }
    if (type === "arrow") ann = { ...base, x1: 60, y1: 80, x2: 110, y2: 60, stroke: "#111", width: 0.5, arrow: true }
    setConfig(c => ({ ...c, annotations: [...(c.annotations || []), ann] }))
    setSelectedId(ann.id)
  }

  const updateAnnotation = (id, p) =>
    setConfig(c => ({
      ...c,
      annotations: (c.annotations || []).map(a => a.id === id ? { ...a, ...p } : a),
    }))

  const deleteAnnotation = (id) => {
    setConfig(c => ({ ...c, annotations: (c.annotations || []).filter(a => a.id !== id) }))
    if (selectedId === id) setSelectedId(null)
  }

  const selectedAnn = (config.annotations || []).find(a => a.id === selectedId)

  return (
    <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
      {/* ─── Titre / sous-titre ─── */}
      <Card title={t("graph.panel.title")}>
        <Input value={config.title || ""} placeholder={t("graph.panel.titlePh")} onChange={e => patch({ title: e.target.value })} />
        <Input value={config.subtitle || ""} placeholder={t("graph.panel.subtitlePh")} onChange={e => patch({ subtitle: e.target.value })} />
      </Card>

      {/* ─── Axes (sauf ternaire) ─── */}
      {!isTernary && (
        <Card title={t("graph.panel.axes")}>
          <AxisRow axis="x" label="X" data={config.axes.x} onPatch={p => patchAxes("x", p)} type={config.type} />
          <AxisRow axis="y" label="Y" data={config.axes.y} onPatch={p => patchAxes("y", p)} type={config.type} />
        </Card>
      )}

      {/* ─── Ternaire ─── */}
      {isTernary && (
        <Card title={t("graph.panel.ternary")}>
          <div className={FIELD}>
            <span className={LBL}>A</span>
            <Input value={config.ternary.labelA} onChange={e => patchTernary({ labelA: e.target.value })} />
          </div>
          <div className={FIELD}>
            <span className={LBL}>B</span>
            <Input value={config.ternary.labelB} onChange={e => patchTernary({ labelB: e.target.value })} />
          </div>
          <div className={FIELD}>
            <span className={LBL}>C</span>
            <Input value={config.ternary.labelC} onChange={e => patchTernary({ labelC: e.target.value })} />
          </div>
          <div className={FIELD}>
            <span className={LBL}>{t("graph.panel.step")}</span>
            <Input type="number" min="2" max="50" className={NUM}
              value={config.ternary.step}
              onChange={e => patchTernary({ step: Number(e.target.value) || 10 })}
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        </Card>
      )}

      {/* ─── Annotations ─── */}
      <Card title={t("graph.panel.annotations")}>
        <div className="flex flex-wrap gap-1.5">
          <Button size="xs" variant="secondary" onClick={() => addAnnotation("text")}>
            <PlusIcon className="w-3 h-3" /> {t("graph.ann.text")}
          </Button>
          <Button size="xs" variant="secondary" onClick={() => addAnnotation("zone")}>
            <PlusIcon className="w-3 h-3" /> {t("graph.ann.zone")}
          </Button>
          <Button size="xs" variant="secondary" onClick={() => addAnnotation("arrow")}>
            <PlusIcon className="w-3 h-3" /> {t("graph.ann.arrow")}
          </Button>
        </div>
        {(config.annotations || []).length === 0 && (
          <p className="text-xs text-gray-400 italic">{t("graph.ann.empty")}</p>
        )}
        {(config.annotations || []).map(a => (
          <AnnotationRow
            key={a.id} ann={a}
            selected={selectedId === a.id}
            onSelect={() => setSelectedId(a.id)}
            onChange={p => updateAnnotation(a.id, p)}
            onDelete={() => deleteAnnotation(a.id)}
          />
        ))}
        {selectedAnn && (
          <AnnotationDetails ann={selectedAnn} onChange={p => updateAnnotation(selectedAnn.id, p)} />
        )}
      </Card>

      {/* ─── Sauvegardes ─── */}
      <Card title={t("graph.panel.saves")}>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSaveClick}>{t("graph.save")}</Button>
          <Button size="sm" variant="secondary" onClick={onLoadClick}>{t("graph.load")}</Button>
        </div>
      </Card>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function AxisRow({ axis, label, data, onPatch, type }) {
  const isLog =
    (axis === "x" && (type === "semilogX" || type === "loglog")) ||
    (axis === "y" && (type === "semilogY" || type === "loglog"))
  return (
    <div className="flex flex-col gap-1.5 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
      <div className={FIELD}>
        <span className={LBL}>{label}</span>
        <Input value={data.label || ""} placeholder="label" onChange={e => onPatch({ label: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <span className={LBL}>{isLog ? "min/max log" : "min/max"}</span>
        <Input type="number" className={NUM} value={data.min} onChange={e => onPatch({ min: Number(e.target.value) })} />
        <Input type="number" className={NUM} value={data.max} onChange={e => onPatch({ max: Number(e.target.value) })} />
      </div>
      {!isLog && (
        <div className="flex items-center gap-2">
          <span className={LBL}>ticks</span>
          <Input type="number" min="1" className={NUM} value={data.majorTicks} onChange={e => onPatch({ majorTicks: Math.max(1, Number(e.target.value)) })} />
          <span className="text-xs text-gray-400">·</span>
          <Input type="number" min="1" className={NUM} value={data.minorTicks} onChange={e => onPatch({ minorTicks: Math.max(1, Number(e.target.value)) })} />
        </div>
      )}
    </div>
  )
}

function AnnotationRow({ ann, selected, onSelect, onDelete }) {
  const icon = ann.type === "text" ? "T" : ann.type === "zone" ? "▭" : "↗"
  const summary =
    ann.type === "text"  ? (ann.text || "…")
    : ann.type === "zone"  ? `zone ${Math.round(ann.w)}×${Math.round(ann.h)}`
    : `flèche`
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer ${selected ? "bg-green-50 border border-green-200" : "hover:bg-gray-50 border border-transparent"}`}
    >
      <span className="w-4 text-center text-gray-500">{icon}</span>
      <span className="flex-1 truncate">{summary}</span>
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="text-gray-400 hover:text-red-600"
        aria-label="Supprimer"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function AnnotationDetails({ ann, onChange }) {
  if (ann.type === "text") {
    return (
      <div className="mt-1 p-2 bg-gray-50 rounded space-y-1.5">
        <Input value={ann.text || ""} placeholder="texte" onChange={e => onChange({ text: e.target.value })} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12">taille</span>
          <Input type="number" min="1" step="0.5" className="w-20" value={ann.size} onChange={e => onChange({ size: Number(e.target.value) })} />
          <input type="color" value={ann.color || "#111"} onChange={e => onChange({ color: e.target.value })} className="w-7 h-7 rounded border border-gray-300" />
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" checked={!!ann.bold} onChange={e => onChange({ bold: e.target.checked })} />
            gras
          </label>
        </div>
      </div>
    )
  }
  if (ann.type === "zone") {
    return (
      <div className="mt-1 p-2 bg-gray-50 rounded space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12">couleur</span>
          <input type="color" value={ann.fill || "#3b82f6"} onChange={e => onChange({ fill: e.target.value })} className="w-7 h-7 rounded border border-gray-300" />
          <span className="text-xs text-gray-500">opacité</span>
          <input type="range" min="0" max="1" step="0.05" value={ann.opacity ?? 0.18} onChange={e => onChange({ opacity: Number(e.target.value) })} className="flex-1" />
        </div>
      </div>
    )
  }
  if (ann.type === "arrow") {
    return (
      <div className="mt-1 p-2 bg-gray-50 rounded space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12">couleur</span>
          <input type="color" value={ann.stroke || "#111"} onChange={e => onChange({ stroke: e.target.value })} className="w-7 h-7 rounded border border-gray-300" />
          <span className="text-xs text-gray-500">épaisseur</span>
          <Input type="number" min="0.1" step="0.1" className="w-20" value={ann.width ?? 0.5} onChange={e => onChange({ width: Number(e.target.value) })} />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-600">
          <input type="checkbox" checked={!!ann.arrow} onChange={e => onChange({ arrow: e.target.checked })} />
          pointe de flèche
        </label>
      </div>
    )
  }
  return null
}
