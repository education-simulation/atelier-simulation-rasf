// ============================================================
//  DIAGRAMME TERNAIRE — outil repris de reula.fr (BTS Métiers de la chimie).
//  Deux modes : « Construire » (placer ses propres mélanges) et « S'exercer » (lire et placer des points).
//  Le code de l'outil est dans src/outils/reula/ : ne pas le modifier, il est partagé avec le graphe vierge.
// ============================================================
import { useState } from "react";
import TernaryBuilderPage from "../src/outils/reula/apps/doe/melange/TernaryBuilderPage.jsx";
import TernaryPracticePage from "../src/outils/reula/apps/doe/melange/TernaryPracticePage.jsx";
import "../src/outils/reula/reula.css";

const MODES = [["construire", "✏️ Construire"], ["exercer", "📐 S'exercer"]];

export default function DiagrammeTernaire() {
  const [mode, setMode] = useState(() => { try { return localStorage.getItem("ternaire.mode") || "construire"; } catch { return "construire"; } });
  const choisir = (m) => { setMode(m); try { localStorage.setItem("ternaire.mode", m); } catch { /* sans importance */ } };
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 14 }}>
      <div role="tablist" style={{ display: "flex", gap: 6 }}>
        {MODES.map(([id, nom]) => (
          <button key={id} role="tab" aria-selected={mode === id} onClick={() => choisir(id)}
            style={{ padding: "9px 16px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14.5,
              background: mode === id ? "var(--accent)" : "#fff", color: mode === id ? "#fff" : "#334155", boxShadow: "inset 0 0 0 1px #d5dfeb" }}>{nom}</button>
        ))}
      </div>
      <div className="outil-reula">
        {mode === "construire" ? <TernaryBuilderPage /> : <TernaryPracticePage />}
      </div>
    </div>
  );
}
