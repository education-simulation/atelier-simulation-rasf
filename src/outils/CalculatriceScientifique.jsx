// Fenêtre flottante qui ouvre la calculatrice scientifique (src/Calculatrice.jsx)
// par-dessus une simulation. Même nom et mêmes réglages que l'ancienne calculatrice :
// les simulations qui l'utilisent (MasseVolumiqueHubbard) n'ont rien à changer.
//   onClose   : fermer la fenêtre
//   onInserer : reçoit le résultat sous forme de texte, avec une virgule (« 0,998 »)
import { useEffect, useRef, useState } from "react";
import Calculatrice from "./Calculatrice";

const LARGEUR = 380;

// Nombre → texte pour un champ de réponse : 10 chiffres significatifs, virgule décimale.
function versReponse(v) {
  return String(Number(v.toPrecision(10))).replace(".", ",");
}

export function CalculatriceScientifique({ onClose, onInserer }) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(8, window.innerWidth - LARGEUR - 20),
    y: Math.min(100, Math.max(8, window.innerHeight - 640)),
  }));
  const glisse = useRef(null);
  // Repliée : seule la barre de titre reste (le calcul en cours est gardé). Retenu au rechargement.
  const [repliee, setRepliee] = useState(() => { try { return localStorage.getItem("calc.repliee") === "1"; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem("calc.repliee", repliee ? "1" : "0"); } catch { /* sans importance */ } }, [repliee]);

  // Déplacement à la souris ET au doigt (Pointer Events), borné à l'écran.
  function debutGlisser(e) {
    if (e.target.closest("button")) return;
    glisse.current = { x: e.clientX, y: e.clientY, depart: pos };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function glisser(e) {
    const g = glisse.current;
    if (!g) return;
    const largeur = Math.min(LARGEUR, window.innerWidth - 16);
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - largeur - 8, g.depart.x + e.clientX - g.x)),
      y: Math.max(8, Math.min(window.innerHeight - 60, g.depart.y + e.clientY - g.y)),
    });
  }
  function finGlisser() { glisse.current = null; }

  // Échap ferme la fenêtre quand le calcul est déjà vide (et qu'elle est dépliée).
  useEffect(() => {
    const surTouche = (e) => {
      if (repliee) return;
      if (e.key === "Escape" && !document.querySelector(".calc-saisie")?.textContent.trim()) onClose();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onClose, repliee]);

  return (
    <div
      role="dialog"
      aria-label="Calculatrice scientifique"
      style={{
        position: "fixed", left: pos.x, top: pos.y, zIndex: 10000,
        width: `min(${LARGEUR}px, calc(100vw - 16px))`, maxHeight: "calc(100vh - 16px)", overflow: "auto",
        background: "#fff", borderRadius: 20, boxShadow: "0 18px 50px rgba(15,23,42,.28)", border: "1px solid #d6dde5",
      }}
    >
      <div
        onPointerDown={debutGlisser}
        onPointerMove={glisser}
        onPointerUp={finGlisser}
        onPointerCancel={finGlisser}
        onDoubleClick={(e) => { if (!e.target.closest("button")) setRepliee((r) => !r); }}
        title="Double-clic pour replier ou déplier"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          padding: "8px 10px 8px 14px", cursor: "grab", touchAction: "none", userSelect: "none",
          borderBottom: repliee ? "none" : "1px solid #e2e8f0", fontWeight: 700, fontSize: 14, color: "#334155",
        }}
      >
        <span>🧮 Calculatrice <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12 }}>· glisser pour déplacer</span></span>
        <span style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
        <button
          type="button"
          onClick={() => setRepliee((r) => !r)}
          aria-label={repliee ? "Déplier la calculatrice" : "Replier la calculatrice"}
          aria-expanded={!repliee}
          title={repliee ? "Déplier" : "Replier"}
          style={{ border: 0, background: "#f1f5f9", borderRadius: 8, width: 30, height: 30, fontSize: 14, cursor: "pointer", color: "#475569" }}
        >
          {repliee ? "▢" : "—"}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la calculatrice"
          style={{ border: 0, background: "#f1f5f9", borderRadius: 8, width: 30, height: 30, fontSize: 16, cursor: "pointer", color: "#475569" }}
        >
          ✕
        </button>
        </span>
      </div>
      {!repliee && (
        <div style={{ padding: 6 }}>
          <Calculatrice compacte onInserer={(v) => { onInserer?.(versReponse(v)); onClose?.(); }} />
        </div>
      )}
    </div>
  );
}

export default CalculatriceScientifique;
