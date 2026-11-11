// ============================================================
//  MÉTAMÉRISME — exemple-exercice de l'Atelier simulation RASF : apprendre à écrire un prompt.
//  Ce fichier ne contient QUE la simulation, que l'on construit avec l'agent, étape par étape.
//  Au départ : une cabine de lumière en 3D (ses boutons A, D65, F11 ne fonctionnent pas encore)
//  et deux cartes de contraste vierges (moitié blanches, moitié noires).
//  ETAT_ACTUEL décrit ce que fait la simulation en ce moment : l'agent le tient à jour à chaque changement.
//  Le cadre de l'exercice (guide, mots clés, sauvegardes, « Tout recommencer ») est dans
//  src/outils/exercice/ : ne pas le modifier. Les étapes et leurs critères : src/outils/exercice/metamerisme.js.
//  Pour calculer les couleurs à partir des spectres : src/outils/colorimetrie.js.
// ============================================================
import { CadreExercice } from "../src/outils/exercice/Exercice.jsx";
import { ETAPES, IDEES, MOTS_CLES } from "../src/outils/exercice/metamerisme.js";

// Ce que fait la simulation EN CE MOMENT (affiché dans le guide). À mettre à jour après chaque changement.
const ETAT_ACTUEL = [
  "🃏 Les deux cartes sont vierges : des cartes de contraste, moitié blanches, moitié noires, sans aucune couleur dessus.",
  "💡 La cabine de lumière (en 3D) a trois boutons A, D65 et F11 sur son bord, mais ils ne fonctionnent pas encore : la lumière ne change pas.",
  "🖐 Les cartes restent sur la table : on ne peut pas encore les déplacer.",
  "📈 Aucun calcul de couleur ni aucun spectre pour l'instant.",
];

// --- Une carte de contraste vierge : moitié blanche en haut, moitié noire en bas ---
function CarteContraste({ numero, style }) {
  return (
    <div style={{ position: "absolute", width: "12%", aspectRatio: "3 / 4", borderRadius: 4, overflow: "hidden",
      boxShadow: "0 4px 10px rgba(0,0,0,.25)", border: "2px solid #e5e7eb", display: "grid", gridTemplateRows: "1fr 1fr", ...style }}>
      <div style={{ background: "#ffffff" }} />
      <div style={{ background: "#111827", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
        <span style={{ background: "rgba(255,255,255,.9)", borderRadius: 6, padding: "1px 6px", fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{numero}</span>
      </div>
    </div>
  );
}

// --- La cabine de lumière en 3D, éteinte, avec ses trois boutons (qui ne font encore rien) ---
function Cabine({ style }) {
  return (
    <div style={{ position: "absolute", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#27272a", borderRadius: "10px 10px 0 0", padding: "6px 10px", flexWrap: "wrap" }}>
        <span style={{ color: "#e4e4e7", fontSize: 12.5, fontWeight: 800, flex: 1, whiteSpace: "nowrap" }}>💡 Cabine de lumière</span>
        {["A", "D65", "F11"].map((id) => (
          <button key={id} type="button" title="Ce bouton ne fonctionne pas encore (étape 1)"
            style={{ border: "1px solid #52525b", background: "#3f3f46", color: "#d4d4d8", borderRadius: 8, padding: "3px 10px", fontSize: 12.5, fontWeight: 800, cursor: "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: "#52525b" }} />{id}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 400 260" style={{ display: "block", width: "100%", height: "auto", background: "#27272a", borderRadius: "0 0 10px 10px", padding: 8, boxSizing: "border-box" }}
        role="img" aria-label="Intérieur de la cabine, éteint">
        <polygon points="0,0 400,0 320,60 80,60" fill="#d4d4d8" />
        <polygon points="0,0 80,60 80,190 0,260" fill="#c4c4c8" />
        <polygon points="400,0 400,260 320,190 320,60" fill="#cbcbcf" />
        <polygon points="80,190 320,190 400,260 0,260" fill="#b4b4b8" />
        <rect x="80" y="60" width="240" height="130" fill="#e4e4e7" />
        <rect x="150" y="6" width="100" height="10" rx="3" fill="#a1a1aa" />
      </svg>
    </div>
  );
}

// --- La scène : la table à la lumière du jour, deux cartes vierges, la cabine ---
function Scene() {
  return (
    <div role="img" aria-label="Une table avec deux cartes de contraste vierges et une cabine de lumière en 3D éteinte"
      style={{ position: "relative", height: "clamp(260px, 40vw, 380px)", borderRadius: 18, overflow: "hidden",
        background: "linear-gradient(#eef2f7 0 70%, #d6c3a5 70% 100%)", border: "1px solid #d5dfeb" }}>
      <span style={{ position: "absolute", left: "3%", top: "6%", fontSize: 13, fontWeight: 800, color: "#475569" }}>☀️ Table, à la lumière du jour</span>
      <CarteContraste numero={1} style={{ left: "6%", top: "40%" }} />
      <CarteContraste numero={2} style={{ left: "21%", top: "40%" }} />
      <Cabine style={{ left: "44%", top: "6%", width: "53%" }} />
    </div>
  );
}

export default function Metamerisme() {
  return (
    <CadreExercice page="Metamerisme" sujet="métamérisme" etapes={ETAPES} idees={IDEES} motsCles={MOTS_CLES} etat={ETAT_ACTUEL}>
      <Scene />
    </CadreExercice>
  );
}
