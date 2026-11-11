// Bouton générique Tailwind. Variants couleur + tailles.
//
// Usage :
//   <Button>Action</Button>                              (primary md)
//   <Button variant="secondary" size="sm">Annuler</Button>
//   <Button variant="danger">🗑 Supprimer</Button>
//   <Button variant="link" onClick={onBack}>← Retour</Button>
//   <Button as="a" href="...">Lien</Button>
//   <Button tip="Ce que fait le clic">…</Button>   (infobulle immédiate, à la place de title=)

import { HoverTip, useHoverTip } from "./HoverTip.jsx"

const VARIANTS = {
  primary:   "bg-green-700 hover:bg-green-800 text-white border border-green-700",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300",
  danger:    "bg-red-600 hover:bg-red-700 text-white border border-red-600",
  ghost:     "bg-transparent hover:bg-gray-100 text-gray-600 border border-transparent",
  link:      "bg-transparent text-green-700 hover:underline border-0 p-0",
}

const SIZES = {
  xs: "text-xs px-2 py-1 rounded-md gap-1",
  sm: "text-sm px-2.5 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-3 py-2 rounded-lg gap-2",
  lg: "text-base px-4 py-2.5 rounded-lg gap-2",
}

export function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  type = "button",
  tip,
  children,
  ...rest
}) {
  const { anchorProps, tip: tipNode } = useHoverTip(disabled ? "" : tip)
  const base = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
  const variantCls = VARIANTS[variant] ?? VARIANTS.primary
  const sizeCls = variant === "link" ? "text-sm gap-1" : (SIZES[size] ?? SIZES.md)
  const extra = Comp === "button" ? { type } : {}
  const node = (
    <Comp
      className={`${base} ${variantCls} ${sizeCls} ${className}`}
      disabled={disabled}
      {...extra}
      {...rest}
      {...anchorProps}
    >
      {children}
    </Comp>
  )
  // Désactivé, le bouton ne reçoit plus d'événement : la raison passe sur une
  // enveloppe focalisable (voir HoverTip.jsx).
  if (disabled && tip) return <HoverTip text={tip} style={{ display: "inline-flex", cursor: "not-allowed" }}>{node}</HoverTip>
  return <>{node}{tipNode}</>
}
