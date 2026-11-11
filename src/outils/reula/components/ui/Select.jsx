import { Listbox, Transition } from "@headlessui/react"
import { Fragment, useMemo } from "react"

// Select stylisé Tailwind basé sur Headless UI Listbox.
// Le dropdown est entièrement contrôlé en CSS (contrairement au <select>
// natif), keyboard nav et ARIA gérés par Headless UI.
//
// ⚠ UN SEUL CONTRAT D'APPEL, quel que soit le mode : onChange reçoit TOUJOURS
// un faux event { target: { value } }, JAMAIS la valeur nue. Écrire
// onChange={setV} y stocke l'objet entier — un filtre cesse alors de filtrer
// en silence, et une RPC qui attend du texte reçoit un objet. C'est arrivé sur
// trois appels de l'écran « Utilisateurs », et l'exemple donné ici y était pour
// quelque chose : il montrait onChange={setV}. Toujours e.target.value.
//
// Deux modes d'écriture des options, même contrat :
//   1) Via la prop `options` :
//        <Select size="xs" value={v} onChange={e => setV(e.target.value)} options={[
//          { value: "a", label: "Option A" },
//          { value: "",  label: "—" },
//        ]} />
//
//   2) Rétro-compatible <option> (drop-in d'un <select> natif) :
//        <Select value={v} onChange={e => setV(e.target.value)}>
//          <option value="a">A</option>
//        </Select>

const SIZES = {
  xs: { btn: "text-xs px-2 py-1 pr-7  min-h-[26px]", chev: "w-3.5 h-3.5", opt: "text-xs px-2 py-1" },
  sm: { btn: "text-sm px-2.5 py-1.5 pr-8 min-h-[32px]", chev: "w-4 h-4", opt: "text-sm px-2.5 py-1.5" },
  md: { btn: "text-sm px-3 py-2 pr-8 min-h-[38px]", chev: "w-4 h-4", opt: "text-sm px-3 py-2" },
}

// Extrait des <option> JSX un tableau [{ value, label, disabled }].
function optionsFromChildren(children) {
  const out = []
  const walk = (node) => {
    if (!node) return
    if (Array.isArray(node)) { node.forEach(walk); return }
    if (typeof node !== "object") return
    if (node.type === "option") {
      out.push({
        value: node.props.value ?? "",
        label: node.props.children ?? "",
        disabled: !!node.props.disabled,
      })
    } else if (node.props?.children) {
      walk(node.props.children)
    }
  }
  walk(children)
  return out
}

export function Select({
  size = "sm",
  className = "",
  wrapperClassName = "",
  disabled,
  value,
  onChange,
  options,
  children,
  placeholder,
  ...rest
}) {
  const s = SIZES[size] ?? SIZES.sm
  const opts = useMemo(
    () => options ?? optionsFromChildren(children),
    [options, children]
  )
  const current = opts.find(o => String(o.value) === String(value ?? ""))
  const displayLabel = current?.label ?? placeholder ?? "—"

  // Compat : si onChange n'a pas été appelé avec un event (legacy DOM), on
  // wrappe la valeur dans un fake event pour les anciens callsites.
  const handleChange = (v) => {
    if (!onChange) return
    // Détection : la signature historique est `onChange={e => setV(e.target.value)}`
    // On simule un event pour rester drop-in.
    onChange({ target: { value: v } })
  }

  return (
    <Listbox value={value ?? ""} onChange={handleChange} disabled={disabled}>
      <div className={`relative inline-block ${wrapperClassName}`} {...rest}>
        <Listbox.Button
          className={`relative w-full text-left bg-white border border-gray-300 text-gray-700 rounded-lg transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${s.btn} ${className}`}
        >
          <span className="block truncate">{displayLabel}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
            <svg viewBox="0 0 20 20" className={s.chev} fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5.5 7.5L10 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Listbox.Options
            anchor={{ to: "bottom start", gap: 4 }}
            className="z-[200] max-h-72 min-w-[--button-width] w-max overflow-auto rounded-lg bg-white border border-gray-200 shadow-xl focus:outline-none py-1"
          >
            {opts.map(o => (
              <Listbox.Option
                key={String(o.value)}
                value={o.value}
                disabled={o.disabled}
                className={({ active, selected }) =>
                  `${s.opt} cursor-pointer select-none flex items-center gap-2 ${
                    active ? "bg-green-50 text-green-900" : "text-gray-700"
                  } ${selected ? "font-semibold" : ""} ${o.disabled ? "opacity-40 cursor-not-allowed" : ""}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className="w-3 inline-block text-green-700">{selected ? "✓" : ""}</span>
                    <span className="truncate">{o.label}</span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
