// Exporteurs : SVG, PNG, PDF, presse-papier.
// Le SVG sert de source unique : on le sérialise, puis on le convertit pour
// PNG/PDF/presse-papier.

import { jsPDF } from "jspdf"
import { pageSize } from "./geometry"

// Sérialise un nœud SVG en chaîne, en injectant le namespace si absent.
function serializeSvg(svgEl) {
  const clone = svgEl.cloneNode(true)
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  if (!clone.getAttribute("xmlns:xlink")) clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  return new XMLSerializer().serializeToString(clone)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function safeName(name) {
  return (name || "graphe").replace(/[^a-zA-Z0-9-_]+/g, "_")
}

// ─── SVG ────────────────────────────────────────────────────────────────────
export function exportSvg(svgEl, filename) {
  const text = serializeSvg(svgEl)
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${text}`], { type: "image/svg+xml;charset=utf-8" })
  downloadBlob(blob, `${safeName(filename)}.svg`)
}

// ─── PNG (via canvas) ───────────────────────────────────────────────────────
// On rastérise à ~150 dpi pour conserver une qualité d'impression correcte.
const PNG_DPI = 150
const MM_PER_INCH = 25.4

async function svgToPngBlob(svgEl, orientation) {
  const { w, h } = pageSize(orientation)
  const pxW = Math.round((w / MM_PER_INCH) * PNG_DPI)
  const pxH = Math.round((h / MM_PER_INCH) * PNG_DPI)
  const text = serializeSvg(svgEl)
  const blob = new Blob([text], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  try {
    const img = await loadImage(url)
    const canvas = document.createElement("canvas")
    canvas.width = pxW
    canvas.height = pxH
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, pxW, pxH)
    ctx.drawImage(img, 0, 0, pxW, pxH)
    return await new Promise(res => canvas.toBlob(res, "image/png"))
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function exportPng(svgEl, orientation, filename) {
  const blob = await svgToPngBlob(svgEl, orientation)
  if (!blob) throw new Error("PNG export failed")
  downloadBlob(blob, `${safeName(filename)}.png`)
}

// ─── PDF (jsPDF) ────────────────────────────────────────────────────────────
export async function exportPdf(svgEl, orientation, filename) {
  const { w, h } = pageSize(orientation)
  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4", compress: true })
  // jsPDF n'a pas de rendu SVG natif robuste pour les markers (flèches).
  // On rastérise en PNG haute résolution puis on l'insère plein page.
  const blob = await svgToPngBlob(svgEl, orientation)
  const dataUrl = await blobToDataURL(blob)
  pdf.addImage(dataUrl, "PNG", 0, 0, w, h, undefined, "FAST")
  pdf.save(`${safeName(filename)}.pdf`)
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// ─── Presse-papier ──────────────────────────────────────────────────────────
// Copie un PNG dans le presse-papier (collable dans Word/Google Docs/Slides).
export async function copyPngToClipboard(svgEl, orientation) {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("clipboard-unsupported")
  }
  const blob = await svgToPngBlob(svgEl, orientation)
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
}
