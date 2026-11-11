// ============================================================
//  MÉTAMÉRISME — exemple-exercice de l'Atelier simulation RASF : apprendre à écrire un prompt.
//  Ce fichier ne contient QUE la simulation, que l'on construit avec l'agent, étape par étape.
//  Au départ : une scène fixe (une cabine de lumière et deux cartes de même couleur).
//  Le cadre de l'exercice (guide, journal des prompts, sauvegardes, « Tout recommencer ») est dans
//  src/outils/exercice/ : ne pas le modifier. Les étapes et leurs critères : src/outils/exercice/metamerisme.js.
//  Pour calculer les couleurs à partir des spectres : src/outils/colorimetrie.js.
// ============================================================
import { CadreExercice } from "../src/outils/exercice/Exercice.jsx";
import { ETAPES, IDEES } from "../src/outils/exercice/metamerisme.js";

// --- La scène de départ : une cabine de lumière et deux cartes, sans aucune action possible ---
function Scene() {
  return (
    <div role="img" aria-label="Une table avec deux cartes vertes identiques et une cabine de lumière vide"
      style={{ position: "relative", height: "clamp(240px, 38vw, 340px)", borderRadius: 18, overflow: "hidden",
        background: "linear-gradient(#eef2f7 0 70%, #d6c3a5 70% 100%)", border: "1px solid #d5dfeb" }}>
      <span style={{ position: "absolute", left: "3%", top: "6%", fontSize: 13, fontWeight: 800, color: "#475569" }}>☀️ Table, à la lumière du jour</span>
      <div style={{ position: "absolute", left: "46%", top: "6%", width: "52%", height: "88%", background: "#f4f1ea",
        border: "10px solid #3f3f46", borderTopWidth: 26, borderRadius: 8, boxShadow: "inset 0 10px 30px rgba(0,0,0,.2)" }}>
        <span style={{ position: "absolute", top: -22, left: 8, color: "#fff", fontSize: 12.5, fontWeight: 800 }}>💡 Cabine de lumière</span>
      </div>
      {[0.06, 0.21].map((x, i) => (
        <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: "42%", width: "13%", aspectRatio: "3 / 4", background: "rgb(151,177,158)",
          borderRadius: 6, boxShadow: "0 4px 10px rgba(0,0,0,.25)", border: "2px solid #fff", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
          <span style={{ background: "rgba(255,255,255,.85)", borderRadius: 6, padding: "1px 6px", fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

export default function Metamerisme() {
  return (
    <CadreExercice page="Metamerisme" sujet="métamérisme" etapes={ETAPES} idees={IDEES}>
      <Scene />
    </CadreExercice>
  );
}
