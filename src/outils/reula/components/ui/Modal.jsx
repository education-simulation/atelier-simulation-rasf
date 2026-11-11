import { useEffect } from "react"
import { createPortal } from "react-dom"
import { useDraggableWindow } from "./useDraggableWindow.js"

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

// Modal centrée avec overlay. Échap pour fermer. Click overlay = close (sauf si `dismissible={false}`).
//
// Usage :
//   <Modal open={open} onClose={() => setOpen(false)} title="Connexion">…</Modal>
//   <Modal open={open} onClose={...} size="lg" title="…" footer={<Button>OK</Button>}>…</Modal>
//
// DÉFILEMENT SUR TABLETTE. Une fenêtre qui contient une page entière crée deux
// zones défilantes superposées ; au doigt, on ne sait plus laquelle on fait
// bouger. Trois garanties sont posées ICI, une seule fois, pour que toute
// fenêtre de l'application en hérite au lieu de les redécouvrir :
//   · le fond ne défile pas — `body { overflow: hidden }` pendant l'ouverture ;
//   · l'en-tête et le pied restent figés — seul le corps défile (`flex-1`) ;
//   · le défilement du corps ne se PROPAGE pas au fond arrivé en butée :
//     `overscroll-contain`. Sans lui, iPadOS reprend le geste et fait rebondir
//     la page derrière, qui n'est pourtant plus censée bouger.
// Le pincer-pour-zoomer reste possible : on ne pose PAS `touch-action: none`,
// parce qu'on doit pouvoir agrandir un INCI écrit en 11 px.
//
// LA FENÊTRE DOIT TENIR ENTIÈRE DANS L'ÉCRAN (Marco, 08/09/2026). Sur un écran
// bas — portable, tablette couchée — les 14 px d'en-tête, 20 px de corps et
// 12 px de pied suffisaient à faire déborder une fenêtre qui, elle, n'avait pas
// changé. Ces trois marges se resserrent donc avec la hauteur disponible
// (`svh`) : à partir d'environ 800 px de haut elles valent exactement ce
// qu'elles valaient, en dessous elles rendent jusqu'à 40 px de contenu. C'est
// une CONSÉQUENCE de la hauteur d'écran, jamais une décision de l'appelant :
// une fenêtre qui déborde est une fenêtre dont on ne voit pas le bouton.

// PILE DES FENÊTRES OUVERTES. Deux fenêtres peuvent légitimement se
// superposer — le pavé de saisie d'une masse par-dessus une fabrication, une
// confirmation par-dessus un formulaire. Sans cette pile, CHAQUE fenêtre
// ouverte écoute Échap sur le document, et une seule frappe les ferme TOUTES :
// on annule une pesée et perd la fabrication avec. Seule la fenêtre du
// dessus répond donc à Échap. (Le clic sur le voile n'a jamais eu le problème :
// chaque voile est son propre élément.)
const pileOuverte = []

// FENÊTRE DÉPLAÇABLE (option). `draggable` + `dragKey` rendent la fenêtre
// déplaçable par son en-tête et retiennent sa position par type de fenêtre. La
// mécanique du geste vit dans `useDraggableWindow` ; ici on ne fait que la
// brancher. Le voile s'éclaircit quand la fenêtre est déplaçable : on la pousse
// justement pour lire ce qu'il y a derrière, un voile à 40 % annulerait le
// bénéfice. La fenêtre reste modale — le fond n'est toujours pas cliquable.

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  dismissible = true,
  className = "",
  footer,
  draggable = false,
  dragKey = null,
  // Le libellé du bouton « recentrer » est passé par l'appelant : `Modal` est un
  // composant de base et ne dépend d'aucun contexte, i18n compris. Les fenêtres
  // qui l'utilisent traduisent, elles.
  recenterLabel = "Recentrer",
  children,
}) {
  const drag = useDraggableWindow(dragKey, open, draggable)

  useEffect(() => {
    if (!open) return
    const jeton = {}
    pileOuverte.push(jeton)
    const onKey = e => {
      if (e.key !== "Escape" || !dismissible) return
      if (pileOuverte[pileOuverte.length - 1] !== jeton) return   // pas la fenêtre du dessus
      onClose?.()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      const i = pileOuverte.indexOf(jeton)
      if (i >= 0) pileOuverte.splice(i, 1)
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, dismissible, onClose])

  if (!open) return null

  const sizeCls = SIZES[size] ?? SIZES.md

  return createPortal(
    <div
      className={`outil-reula fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none ${draggable ? "bg-black/20" : "bg-black/40"}`}
      onClick={() => dismissible && onClose?.()}
    >
      <div
        ref={drag.ref}
        style={drag.style}
        className={`relative w-full ${sizeCls} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)] ${className}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div
            {...drag.handleProps}
            className={`px-5 py-[clamp(6px,1.7svh,14px)] border-b border-gray-200 flex items-center justify-between gap-3 ${draggable ? "select-none" : ""}`}
          >
            <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {/* La position retenue peut devenir absurde en changeant d'écran
                  ou d'orientation : il faut une porte de sortie évidente. Elle
                  n'apparaît que si la fenêtre a bougé, pour ne pas encombrer. */}
              {draggable && drag.moved && (
                <button
                  onClick={drag.recenter}
                  className="text-gray-400 hover:text-gray-700 w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 touch-manipulation"
                  title={recenterLabel}
                  aria-label={recenterLabel}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <circle cx="8" cy="8" r="3.2" /><path d="M8 .8v3M8 12.2v3M.8 8h3M12.2 8h3" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              {dismissible && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-700 text-xl leading-none w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-gray-100 touch-manipulation"
                  aria-label="Fermer"
                >×</button>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain p-[clamp(12px,2.6svh,20px)]">{children}</div>
        {footer && <div className="px-5 py-[clamp(6px,1.6svh,12px)] border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2 flex-wrap">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
