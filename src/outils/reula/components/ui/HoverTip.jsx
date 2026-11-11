import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// Infobulle de l'application, à la place de l'attribut `title=` du navigateur
// (Marco, 03/11/2026, plan « Hover tips ») : celui-ci attend une seconde, ne
// s'affiche pas sur un contrôle désactivé, ne se style pas, et ni le clavier
// ni le doigt ne l'ouvrent.
//
// - S'ouvre TOUT DE SUITE au survol ou au focus clavier ; se ferme quand le
//   pointeur part, au blur, avec Échap, ou au moindre défilement (écouté en
//   capture, pour que les listes qui défilent comptent aussi) : un défilement
//   déplace l'ancre, le tip se ferme plutôt que de flotter loin d'elle.
// - Rendu dans <body> en `position: fixed` : aucun `overflow` ne le coupe.
//   Au-dessus de l'ancre à 6 px, en dessous si l'ancre est à moins de 90 px du
//   haut ; gardé à 8 px des bords ; 300 px de large au plus.
// - Panneau PLEIN, jamais translucide, bordure d'accent : les couleurs sont
//   des jetons du thème (`--tip-*`, src/index.css), clair et sombre.
// - Texte vide = rien du tout : l'enfant s'affiche tel quel.
//
// Une information essentielle ne vit JAMAIS que dans un tip (fiche 005 : au
// doigt, il n'y a pas de survol). Le tip ajoute du détail.

const GAP = 6
const EDGE = 8

// `placement: "left"` : à gauche de l'ancre, centré sur elle (une liste collée
// au bord droit). `placement: "top"` : au-dessus même près du haut de la page,
// tant que le tip y tient (Marco, 04/11/2026) ; sinon dessous.
// `placement: "bottom"` : dessous tant qu'il y tient (carte du mélange, 04/11/2026) ; sinon dessus. `glass` : panneau en verre translucide, l'exception voulue
// par Marco pour la liste des solvants de la 3D (04/11/2026) — ailleurs le
// panneau reste plein.
function TipPanel({ rect, text, placement, glass }) {
  const ref = useRef(null)
  const [left, setLeft] = useState(null)
  const [sideTop, setSideTop] = useState(null)
  // `placement: "right"` : à droite de l'ancre, centré sur elle (la colonne
  // d'outils de Hansen 2D, collée au bord gauche ; Marco, 04/11/2026).
  const side = placement === "left" || placement === "right"
  const [noRoomAbove, setNoRoomAbove] = useState(false)
  const [noRoomBelow, setNoRoomBelow] = useState(false)
  const below = !side && (placement === "top" ? noRoomAbove : placement === "bottom" ? !noRoomBelow : rect.top < 90)
  useLayoutEffect(() => {
    const w = ref.current?.offsetWidth || 0
    const h = ref.current?.offsetHeight || 0
    const max = window.innerWidth - EDGE - w
    if (placement === "top") setNoRoomAbove(rect.top - GAP - h < EDGE)
    if (placement === "bottom") setNoRoomBelow(rect.bottom + GAP + h > window.innerHeight - EDGE)
    if (side) {
      setLeft(placement === "right" ? Math.min(max, rect.right + GAP) : Math.max(EDGE, rect.left - GAP - w))
      setSideTop(Math.max(EDGE, Math.min(window.innerHeight - EDGE - h, rect.top + rect.height / 2 - h / 2)))
    } else {
      setLeft(Math.max(EDGE, Math.min(max, rect.left + rect.width / 2 - w / 2)))
    }
  }, [rect, text, side, placement])
  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      className="outil-reula"
      style={{
        position: "fixed", zIndex: 2000, pointerEvents: "none",
        top: side ? (sideTop ?? 0) : below ? rect.bottom + GAP : rect.top - GAP,
        left: left ?? 0, visibility: left == null ? "hidden" : "visible",
        transform: side || below ? "none" : "translateY(-100%)",
        maxWidth: 300, width: "max-content",
        ...(glass
          ? { background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px) saturate(1.5)", WebkitBackdropFilter: "blur(12px) saturate(1.5)",
              color: "#0f172a", border: "1px solid rgba(255,255,255,0.75)", borderRadius: 10,
              boxShadow: "0 8px 28px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.6)" }
          : { background: "var(--tip-bg)", color: "var(--tip-text)",
              border: "1px solid var(--tip-border)", borderRadius: 8,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)" }),
        padding: "10px 12px", fontSize: 12, fontWeight: 500, lineHeight: 1.5,
        textAlign: "left", whiteSpace: "normal", overflowWrap: "anywhere",
        letterSpacing: "normal", textTransform: "none",
      }}
    >
      {text}
    </div>,
    document.body,
  )
}

// Le tip accroché à un élément existant, sans enveloppe : pour un bouton, un
// second élément focalisable ferait s'arrêter Tab deux fois. On étale
// `anchorProps` sur l'ancre et on rend `tip` à côté. `focus: false` pour un
// champ de saisie, où le tip gênerait la frappe.
export function useHoverTip(text, { focus = true, placement, glass = false } = {}) {
  const ref = useRef(null)
  const [rect, setRect] = useState(null)
  const show = () => { if (text && ref.current) setRect(ref.current.getBoundingClientRect()) }
  const hide = () => setRect(null)

  useEffect(() => {
    if (!rect) return undefined
    const close = () => setRect(null)
    const onKey = e => { if (e.key === "Escape") close() }
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
      window.removeEventListener("keydown", onKey)
    }
  }, [rect])

  // Le texte disparaît (contrôle réactivé, ligne corrigée) : le tip aussi.
  useEffect(() => { if (!text) setRect(null) }, [text])

  const anchorProps = text
    ? {
        ref,
        onPointerEnter: show, onPointerLeave: hide,
        ...(focus ? { onFocus: show, onBlur: hide } : null),
      }
    : {}
  return { anchorProps, tip: rect && text ? <TipPanel rect={rect} text={text} placement={placement} glass={glass} /> : null }
}

// Combine nos gestionnaires avec ceux que l'appelant a déjà posés.
function merge(own, theirs) {
  const out = { ...theirs, ...own }
  for (const k of ["onPointerEnter", "onPointerLeave", "onFocus", "onBlur"]) {
    if (own[k] && theirs[k]) out[k] = e => { theirs[k](e); own[k](e) }
  }
  return out
}

// Enveloppe : `as="span"` (défaut) à côté d'un libellé ou d'un chiffre,
// `as="div"` autour d'une tuile entière. `focusable` (vrai par défaut) donne
// l'arrêt de tabulation ; on le passe à faux quand l'enveloppe contient déjà
// un contrôle focalisable, ou à `disabled` autour d'un contrôle désactivé —
// c'est alors l'enveloppe qui porte la raison jusqu'au clavier.
export function HoverTip({ text, as: Comp = "span", focusable = true, placement, glass = false, children, style, ...rest }) {
  const { anchorProps, tip } = useHoverTip(text, { placement, glass })
  if (!text) return <Comp style={style} {...rest}>{children}</Comp>
  return (
    <>
      <Comp
        {...merge(anchorProps, rest)}
        tabIndex={focusable ? 0 : undefined}
        aria-label={Comp === "span" && focusable && typeof text === "string" ? text : rest["aria-label"]}
        style={{ cursor: "help", ...style }}
      >
        {children}
      </Comp>
      {tip}
    </>
  )
}

// Un <button> ordinaire avec son tip (`tip=` remplace `title=`). Désactivé, un
// bouton ne reçoit plus aucun événement : le tip passe alors sur une
// enveloppe, qui prend l'arrêt de tabulation pour que la raison reste
// atteignable au clavier.
export function TipButton({ tip: text, disabled, placement, children, ...rest }) {
  const { anchorProps, tip } = useHoverTip(disabled ? "" : text, { placement })
  if (disabled && text) {
    return (
      <HoverTip text={text} focusable placement={placement} style={{ display: "inline-flex", cursor: "not-allowed" }}>
        <button type="button" disabled {...rest} style={{ ...rest.style, pointerEvents: "none" }}>{children}</button>
      </HoverTip>
    )
  }
  return (
    <>
      <button type="button" disabled={disabled} {...merge(anchorProps, rest)}>{children}</button>
      {tip}
    </>
  )
}
