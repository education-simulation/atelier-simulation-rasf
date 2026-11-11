import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

// ── Déplacer une fenêtre, au doigt comme à la souris ─────────────────────────
// Une fenêtre de saisie cache forcément une partie de ce qu'on est en train de
// remplir : le pavé des pourcentages recouvre le tableau de la formule, celui
// des masses recouvre la ligne qu'on pèse. Plutôt que de deviner où la poser,
// on laisse l'utilisateur la pousser où il veut.
//
// POINTER EVENTS, JAMAIS LE DRAG HTML5 (fiche de décision 005). Le
// glisser-déposer natif (`draggable` / `dragstart`) ne se déclenche PAS sur
// écran tactile : il n'échoue pas bruyamment, il ne se passe rien, et l'élève
// croit s'y être mal pris. Trois écrans du projet sont déjà inutilisables sur
// tablette pour cette raison exacte. Les Pointer Events unifient souris, doigt
// et stylet, et `setPointerCapture` garde le geste même quand le doigt sort de
// la poignée.
//
// LE GESTE PART D'UNE POIGNÉE, pas de la fenêtre entière : sur un pavé
// numérique, un glissement qui commence sur une touche doit rester un appui sur
// cette touche. La poignée est l'en-tête de la fenêtre.
//
// Usage :
//   const drag = useDraggableWindow("pave-masse", open)
//   <div ref={drag.ref} style={drag.style}>
//     <header {...drag.handleProps}>… {drag.moved && <button onClick={drag.recenter}/>}</header>

const storageKey = (key) => `ui.window.pos:${key}`

// Marge minimale entre la fenêtre et le bord : une fenêtre collée au bord d'un
// écran tactile est difficile à rattraper, le geste part dans les gestes système.
const MARGE = 8

// Mode `overflow` : la fenêtre peut SORTIR de l'écran — Marco, 13/09/2026, pour
// les fenêtres flottantes du module Solubilité : « la popup on peut la déplacer
// aussi en dehors de l'écran ». Le motif du bornage (fiche 020 : une fenêtre
// poussée dehors ne se rattrape plus) est tenu autrement : un morceau de sa
// BARRE reste toujours à l'écran, assez pour la reprendre au doigt. Le haut de
// la fenêtre ne passe jamais au-dessus de l'écran, sinon la barre disparaît.
const VISIBLE_X = 90   // largeur de barre toujours visible, en px
const VISIBLE_Y = 44   // hauteur de barre toujours visible en bas, en px

function lirePosition(key) {
  if (!key) return null
  try {
    const v = JSON.parse(localStorage.getItem(storageKey(key)))
    return v && Number.isFinite(v.x) && Number.isFinite(v.y) ? { x: v.x, y: v.y } : null
  } catch { return null }
}

export function useDraggableWindow(key, open, enabled = true, { overflow = false } = {}) {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const posRef = useRef(pos)
  const gesteRef = useRef(null)
  posRef.current = pos

  // Borne le déplacement aux limites de l'écran. Sans ça une fenêtre poussée
  // trop loin sort du champ : on ne peut plus la rattraper ni la fermer, il
  // faut recharger la page.
  //
  // `natural` est la position de la fenêtre SANS translation ; on la mesure une
  // fois au début du geste plutôt qu'à chaque déplacement, sinon la mesure
  // inclut la translation qu'on est en train de calculer.
  const borner = useCallback((p, natural) => {
    if (!natural) return p
    if (overflow) {
      return {
        x: Math.min(Math.max(p.x, VISIBLE_X - natural.left - natural.width), window.innerWidth - VISIBLE_X - natural.left),
        y: Math.min(Math.max(p.y, MARGE - natural.top), window.innerHeight - VISIBLE_Y - natural.top),
      }
    }
    const minX = MARGE - natural.left
    const maxX = window.innerWidth - MARGE - natural.width - natural.left
    const minY = MARGE - natural.top
    const maxY = window.innerHeight - MARGE - natural.height - natural.top
    // Fenêtre plus grande que l'écran (paysage serré) : `maxX < minX`. On garde
    // alors le coin haut-gauche visible — c'est là que sont le titre et la
    // fermeture — plutôt que de renvoyer une borne incohérente.
    return {
      x: Math.max(Math.min(p.x, maxX), Math.min(minX, maxX)),
      y: Math.max(Math.min(p.y, maxY), Math.min(minY, maxY)),
    }
  }, [overflow])

  const mesureNaturelle = useCallback(() => {
    const el = ref.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      left: r.left - posRef.current.x,
      top: r.top - posRef.current.y,
      width: r.width,
      height: r.height,
    }
  }, [])

  // À l'ouverture, on restaure la position retenue — mais bornée à l'écran
  // COURANT : une position enregistrée en paysage devient absurde en portrait,
  // et une fenêtre qui rouvre hors champ est une fenêtre perdue.
  useLayoutEffect(() => {
    if (!open || !enabled) return
    const saved = lirePosition(key)
    if (!saved) { setPos({ x: 0, y: 0 }); return }
    posRef.current = { x: 0, y: 0 }
    setPos(borner(saved, mesureNaturelle()))
  }, [open, enabled, key, borner, mesureNaturelle])

  // Rotation de la tablette ou clavier virtuel qui s'ouvre : on ramène la
  // fenêtre dans l'écran au lieu d'attendre que l'utilisateur la cherche.
  useEffect(() => {
    if (!open || !enabled) return
    const on = () => setPos(p => borner(p, mesureNaturelle()))
    window.addEventListener("resize", on)
    window.addEventListener("orientationchange", on)
    return () => {
      window.removeEventListener("resize", on)
      window.removeEventListener("orientationchange", on)
    }
  }, [open, enabled, borner, mesureNaturelle])

  const onPointerDown = useCallback((e) => {
    if (!enabled) return
    // Un bouton dans l'en-tête (fermer, recentrer) reste un bouton : sans ça le
    // `preventDefault` ci-dessous avalerait son clic.
    if (e.target.closest?.("button")) return
    if (e.button != null && e.button !== 0) return
    e.preventDefault()
    // `setPointerCapture` lève NotFoundError si le pointeur n'est déjà plus
    // actif. Perdre la capture n'est pas grave, planter en plein geste le serait.
    try { e.currentTarget.setPointerCapture?.(e.pointerId) } catch { /* sans capture */ }
    gesteRef.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: posRef.current.x,
      oy: posRef.current.y,
      natural: mesureNaturelle(),
    }
    setDragging(true)
  }, [enabled, mesureNaturelle])

  const onPointerMove = useCallback((e) => {
    const g = gesteRef.current
    if (!g || g.id !== e.pointerId) return
    setPos(borner({ x: g.ox + e.clientX - g.sx, y: g.oy + e.clientY - g.sy }, g.natural))
  }, [borner])

  const finir = useCallback((e) => {
    const g = gesteRef.current
    if (!g || (e && g.id !== e.pointerId)) return
    gesteRef.current = null
    setDragging(false)
    try { e?.currentTarget?.releasePointerCapture?.(e.pointerId) } catch { /* déjà relâché */ }
    if (!key) return
    const p = posRef.current
    try {
      if (p.x === 0 && p.y === 0) localStorage.removeItem(storageKey(key))
      else localStorage.setItem(storageKey(key), JSON.stringify(p))
    } catch { /* stockage indisponible : la fenêtre reste déplaçable, sans mémoire */ }
  }, [key])

  // La fenêtre a changé de TAILLE sans que l'écran change (repliée puis
  // dépliée) : la ramener dans l'écran, sinon son haut peut en sortir.
  const rebound = useCallback(() => {
    setPos(p => borner(p, mesureNaturelle()))
  }, [borner, mesureNaturelle])

  // Pousser la fenêtre d'un décalage, borné, et le retenir comme un geste.
  const nudge = useCallback((dx, dy) => {
    const p = borner({ x: posRef.current.x + dx, y: posRef.current.y + dy }, mesureNaturelle())
    posRef.current = p
    setPos(p)
    if (!key) return
    try { localStorage.setItem(storageKey(key), JSON.stringify(p)) } catch { /* sans mémoire */ }
  }, [borner, mesureNaturelle, key])

  const recenter = useCallback(() => {
    setPos({ x: 0, y: 0 })
    try { localStorage.removeItem(storageKey(key)) } catch { /* rien à oublier */ }
  }, [key])

  return {
    ref,
    dragging,
    moved: pos.x !== 0 || pos.y !== 0,
    recenter,
    rebound,
    nudge,
    pos,
    style: enabled && (pos.x || pos.y)
      ? { transform: `translate(${pos.x}px, ${pos.y}px)` }
      : undefined,
    handleProps: enabled ? {
      onPointerDown,
      onPointerMove,
      onPointerUp: finir,
      onPointerCancel: finir,
      // `touch-action: none` est indispensable : sans lui le navigateur prend le
      // geste pour un défilement et annule le pointeur au bout de quelques pixels.
      style: { touchAction: "none", cursor: dragging ? "grabbing" : "grab" },
    } : {},
  }
}
