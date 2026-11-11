// Module Outils › Graphe — générateur de graphes vierges exportables.
import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeftIcon, ArrowDownTrayIcon, ClipboardDocumentIcon, ArrowPathIcon, TrashIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline"
import { Button } from "../../components/ui/Button"
import { Select } from "../../components/ui/Select"
import { Input } from "../../components/ui/Input"
import { Modal } from "../../components/ui/Modal"
import { useConfirm } from "../../components/ui/Confirm"
import { useLang } from "../../i18n"
import GraphCanvas from "./GraphCanvas"
import SidePanel from "./SidePanel"
import { GRAPH_TYPES, defaultConfig } from "./lib/defaults"
import { exportSvg, exportPng, exportPdf, copyPngToClipboard } from "./lib/exporters"
import { listConfigs, saveConfig, updateConfig, deleteConfig } from "./lib/graphStore"

export default function GraphApp({ onBack }) {
  const { t } = useLang()
  // Ici, pas de compte : les graphes sont enregistrés dans ce navigateur (lib/graphStore.js).
  const user = { local: true }
  const confirm = useConfirm()
  const svgRef = useRef(null)

  const [config, setConfig] = useState(() => defaultConfig("cartesian"))
  const [selectedAnnId, setSelectedAnnId] = useState(null)
  const [currentId, setCurrentId] = useState(null) // id Supabase si chargé
  const [name, setName] = useState("")
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")
  const [savesOpen, setSavesOpen] = useState(false)
  const [saveDialog, setSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")

  // Reset annotation sélectionnée quand le type change (les coordonnées
  // peuvent être hors zone, on n'efface pas — juste désélection).
  const onChangeType = (newType) => {
    setConfig(c => {
      const tmpl = defaultConfig(newType)
      // On garde les annotations, le titre, le sous-titre et l'orientation.
      return {
        ...tmpl,
        orientation: c.orientation,
        title: c.title,
        subtitle: c.subtitle,
        annotations: c.annotations || [],
      }
    })
    setSelectedAnnId(null)
  }

  const onChangeAnnotation = (id, patch) => {
    setConfig(c => ({
      ...c,
      annotations: (c.annotations || []).map(a => a.id === id ? { ...a, ...patch } : a),
    }))
  }

  const typeOptions = useMemo(
    () => GRAPH_TYPES.map(o => ({ value: o.id, label: t(o.labelKey) })),
    [t],
  )

  // ─── Actions export ─────────────────────────────────────────────────────
  const fname = (config.title || "graphe").trim() || "graphe"

  async function doExport(kind) {
    if (!svgRef.current) return
    setError("")
    setBusy(kind)
    try {
      if (kind === "svg")  exportSvg(svgRef.current, fname)
      if (kind === "png")  await exportPng(svgRef.current, config.orientation, fname)
      if (kind === "pdf")  await exportPdf(svgRef.current, config.orientation, fname)
      if (kind === "copy") await copyPngToClipboard(svgRef.current, config.orientation)
    } catch (e) {
      setError(e.message === "clipboard-unsupported" ? t("graph.clipboardUnsupported") : (e.message || String(e)))
    } finally {
      setBusy("")
    }
  }

  // ─── Sauvegardes ────────────────────────────────────────────────────────
  const onSaveClick = () => {
    if (!user) { setError(t("graph.signinToSave")); return }
    setSaveName(name || config.title || "")
    setSaveDialog(true)
  }

  async function doSave() {
    if (!user) return
    setError("")
    setBusy("save")
    try {
      if (currentId) {
        const row = await updateConfig(currentId, { name: saveName, config })
        setName(row.name)
      } else {
        const row = await saveConfig({ name: saveName, config })
        setCurrentId(row.id)
        setName(row.name)
      }
      setSaveDialog(false)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy("")
    }
  }

  async function doSaveAsNew() {
    if (!user) return
    setError("")
    setBusy("save")
    try {
      const row = await saveConfig({ name: saveName, config })
      setCurrentId(row.id)
      setName(row.name)
      setSaveDialog(false)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy("")
    }
  }

  const onLoadClick = () => setSavesOpen(true)

  function applyLoaded(row) {
    setConfig({ ...defaultConfig(row.data?.type || "cartesian"), ...row.data })
    setCurrentId(row.id)
    setName(row.name)
    setSelectedAnnId(null)
    setSavesOpen(false)
  }

  function newGraph() {
    setConfig(defaultConfig("cartesian"))
    setCurrentId(null)
    setName("")
    setSelectedAnnId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-2 flex-wrap">
        {onBack && <>
          <Button variant="link" onClick={onBack}>
            <ArrowLeftIcon className="w-4 h-4" /> {t("common.back")}
          </Button>
          <span className="text-gray-300">·</span>
        </>}
        <Select size="sm" value={config.type} onChange={e => onChangeType(e.target.value)} options={typeOptions} />
        <Select size="sm" value={config.orientation} onChange={e => setConfig(c => ({ ...c, orientation: e.target.value }))}
          options={[
            { value: "portrait",  label: t("graph.orientation.portrait")  },
            { value: "landscape", label: t("graph.orientation.landscape") },
          ]}
        />
        {name && <span className="text-xs text-gray-500 truncate max-w-[180px]" title={name}>· {name}</span>}

        <div className="ml-auto flex items-center gap-1.5 flex-wrap">
          <Button size="sm" variant="secondary" onClick={newGraph}>
            <ArrowPathIcon className="w-4 h-4" /> {t("graph.new")}
          </Button>
          <Button size="sm" variant="secondary" disabled={busy === "png"} onClick={() => doExport("png")}>
            <ArrowDownTrayIcon className="w-4 h-4" /> PNG
          </Button>
          <Button size="sm" variant="secondary" disabled={busy === "pdf"} onClick={() => doExport("pdf")}>
            <DocumentArrowDownIcon className="w-4 h-4" /> PDF
          </Button>
          <Button size="sm" variant="secondary" disabled={busy === "svg"} onClick={() => doExport("svg")}>
            <ArrowDownTrayIcon className="w-4 h-4" /> SVG
          </Button>
          <Button size="sm" variant="secondary" disabled={busy === "copy"} onClick={() => doExport("copy")}>
            <ClipboardDocumentIcon className="w-4 h-4" /> {t("graph.copy")}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* ─── Layout principal ─── */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-2 flex items-center justify-center overflow-auto">
            <div
              className="bg-white shadow-md"
              style={{
                aspectRatio: config.orientation === "portrait" ? "210 / 297" : "297 / 210",
                width: "100%",
                maxWidth: config.orientation === "portrait" ? "min(70vh * 210 / 297, 100%)" : "100%",
                maxHeight: "calc(100vh - 200px)",
              }}
            >
              <GraphCanvas
                ref={svgRef}
                config={config}
                selectedAnnotationId={selectedAnnId}
                onSelectAnnotation={setSelectedAnnId}
                onChangeAnnotation={onChangeAnnotation}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {t("graph.canvas.hint")}
          </p>
        </div>

        {/* Side panel */}
        <SidePanel
          config={config}
          setConfig={setConfig}
          selectedId={selectedAnnId}
          setSelectedId={setSelectedAnnId}
          onSaveClick={onSaveClick}
          onLoadClick={onLoadClick}
        />
      </div>

      {/* ─── Saves drawer ─── */}
      <SavesDrawer
        open={savesOpen}
        onClose={() => setSavesOpen(false)}
        onLoad={applyLoaded}
        confirm={confirm}
      />

      {/* ─── Save dialog ─── */}
      <Modal
        open={saveDialog}
        onClose={() => setSaveDialog(false)}
        title={currentId ? t("graph.dialog.update") : t("graph.dialog.save")}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSaveDialog(false)}>{t("common.cancel")}</Button>
            {currentId && (
              <Button variant="secondary" size="sm" disabled={busy === "save"} onClick={doSaveAsNew}>
                {t("graph.dialog.saveNew")}
              </Button>
            )}
            <Button size="sm" disabled={busy === "save" || !saveName.trim()} onClick={doSave}>
              {currentId ? t("graph.dialog.updateBtn") : t("common.save")}
            </Button>
          </>
        }
      >
        <label className="text-xs text-gray-600">{t("graph.dialog.name")}</label>
        <Input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder={t("graph.dialog.namePh")} autoFocus />
      </Modal>
    </div>
  )
}

function SavesDrawer({ open, onClose, onLoad, confirm }) {
  const { t } = useLang()
  const [items, setItems] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setError("")
    setItems(null)
    listConfigs().then(setItems).catch(e => setError(e.message))
  }, [open])

  if (!open) return null

  async function handleDelete(item) {
    const ok = await confirm({
      title: t("graph.delete.title"),
      description: t("graph.delete.desc", { name: item.name }),
      variant: "danger",
      confirmText: t("common.delete"),
    })
    if (!ok) return
    await deleteConfig(item.id)
    setItems(items.filter(i => i.id !== item.id))
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div onClick={e => e.stopPropagation()} className="w-[min(420px,92vw)] h-full bg-white border-l border-gray-200 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">{t("graph.saves.title")}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none w-7 h-7 inline-flex items-center justify-center rounded hover:bg-gray-100">×</button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {items === null && !error && <p className="text-xs text-gray-400">{t("common.loading")}</p>}
        {items && items.length === 0 && <p className="text-xs text-gray-400 italic">{t("graph.saves.empty")}</p>}
        {items && items.map(it => (
          <div key={it.id} className="border border-gray-200 rounded-lg p-3 mb-2 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{it.name}</p>
              <p className="text-xs text-gray-400">{new Date(it.updated_at || it.created_at).toLocaleString()} · {labelForType(it.data?.type, t)}</p>
            </div>
            <Button size="xs" onClick={() => onLoad(it)}>{t("common.load")}</Button>
            <button onClick={() => handleDelete(it)} className="text-gray-400 hover:text-red-600" aria-label={t("common.delete")}>
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function labelForType(typeId, t) {
  const o = GRAPH_TYPES.find(x => x.id === typeId)
  return o ? t(o.labelKey) : typeId || "—"
}
