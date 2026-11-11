import { createContext, useCallback, useContext, useRef, useState } from "react"
import { Modal } from "./Modal"
import { Button } from "./Button"
import { Input } from "./Input"
import { Banner } from "./Banner"

// ConfirmProvider + useConfirm() : dialog de confirmation imperative.
//
// Usage :
//   const confirm = useConfirm()
//   const ok = await confirm({
//     title: "Supprimer le compte",
//     description: "Action irréversible.",  // string ou ReactNode
//     variant: "danger",                     // primary | danger
//     confirmText: "Supprimer",
//     cancelText: "Annuler",
//     requireType: "SUPPRIMER",              // optionnel : exige de retaper ce mot
//     tone: "warning",                       // teinte de la bannière (warning|error|info)
//   })
//   if (!ok) return

const ConfirmCtx = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const [typed, setTyped] = useState("")
  const resolverRef = useRef(null)

  const confirm = useCallback((opts = {}) => {
    setState({
      title:       opts.title       ?? "Êtes-vous sûr ?",
      description: opts.description ?? "",
      variant:     opts.variant     ?? "primary",
      confirmText: opts.confirmText ?? "Confirmer",
      cancelText:  opts.cancelText  ?? "Annuler",
      requireType: opts.requireType ?? null,
      tone:        opts.tone        ?? null,
    })
    setTyped("")
    return new Promise(resolve => { resolverRef.current = resolve })
  }, [])

  const close = (result) => {
    setState(null); setTyped("")
    const r = resolverRef.current
    resolverRef.current = null
    if (r) r(result)
  }

  const canConfirm = !state?.requireType || typed === state.requireType

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Modal
        open={!!state}
        onClose={() => close(false)}
        title={state?.title}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => close(false)}>
              {state?.cancelText}
            </Button>
            <Button
              variant={state?.variant === "danger" ? "danger" : "primary"}
              size="sm"
              onClick={() => close(true)}
              disabled={!canConfirm}
            >
              {state?.confirmText}
            </Button>
          </>
        }
      >
        {state && (
          <div className="space-y-3">
            {state.tone ? (
              <Banner tone={state.tone}>{state.description}</Banner>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-line">{state.description}</div>
            )}
            {state.requireType && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Tape <span className="font-mono font-bold text-gray-800">{state.requireType}</span> pour confirmer
                </label>
                <Input
                  size="md"
                  value={typed}
                  onChange={e => setTyped(e.target.value)}
                  autoFocus
                  placeholder={state.requireType}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </ConfirmCtx.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx)
  if (!ctx) throw new Error("useConfirm doit être utilisé dans un <ConfirmProvider>")
  return ctx
}
