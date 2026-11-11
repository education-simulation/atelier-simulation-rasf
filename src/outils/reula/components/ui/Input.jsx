// Input texte standard Tailwind. Wrapper minimal pour cohérence visuelle.
//
// Usage :
//   <Input value={v} onChange={e => setV(e.target.value)} placeholder="…" />
//   <Input size="md" />

const SIZES = {
  xs: "text-xs px-2 py-1 rounded-lg",
  sm: "text-sm px-2.5 py-1.5 rounded-lg",
  md: "text-sm px-3 py-2 rounded-lg",
}

export function Input({
  size = "sm",
  className = "",
  ...rest
}) {
  const sizeCls = SIZES[size] ?? SIZES.sm
  return (
    <input
      className={`w-full border border-gray-300 bg-white text-gray-700 transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${sizeCls} ${className}`}
      {...rest}
    />
  )
}
