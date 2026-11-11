// Banner d'info/erreur/warning/succès — petit bandeau coloré pour messages
// non-bloquants (échecs RPC, info contextuelle, etc.).
//
// Usage :
//   <Banner tone="error">Quelque chose s'est mal passé</Banner>
//   <Banner tone="info" icon="💡">Astuce…</Banner>

const TONES = {
  info:    { wrap: "bg-blue-50 border-blue-200 text-blue-800",       icon: "ℹ️" },
  success: { wrap: "bg-emerald-50 border-emerald-200 text-emerald-800", icon: "✅" },
  warning: { wrap: "bg-amber-50 border-amber-200 text-amber-900",    icon: "⚠️" },
  error:   { wrap: "bg-red-50 border-red-200 text-red-700",          icon: "⚠️" },
}

export function Banner({ tone = "info", icon, className = "", children, ...rest }) {
  const t = TONES[tone] ?? TONES.info
  const ic = icon ?? t.icon
  return (
    <div
      className={`text-sm border rounded-lg px-3 py-2 flex items-start gap-2 ${t.wrap} ${className}`}
      {...rest}
    >
      {ic && <span className="leading-none flex-shrink-0">{ic}</span>}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
