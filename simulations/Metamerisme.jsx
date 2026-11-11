// ============================================================
//  MÉTAMÉRISME — exemple-exercice de l'Atelier simulation RASF : apprendre à écrire un prompt.
//  Ce fichier ne contient QUE la simulation, que l'on construit avec l'agent, étape par étape.
//  Au départ : une cabine de lumière en 3D (ses boutons A, D65, F11 ne fonctionnent pas encore)
//  et deux cartes de contraste vierges (moitié blanches, moitié noires).
//  ETAT_ACTUEL décrit ce que fait la simulation en ce moment : l'agent le tient à jour à chaque changement.
//  Le cadre de l'exercice (guide, mots clés, sauvegardes, « Tout recommencer ») est dans
//  src/outils/exercice/ : ne pas le modifier. Les étapes et leurs critères : src/outils/exercice/metamerisme.js.
//  Pour calculer les couleurs à partir des spectres : src/outils/colorimetrie.js.
//  AGENT : relis AGENTS.md (section « L'exercice Métamérisme ») à CHAQUE message : les règles ont changé.
//  Il n'y a AUCUNE formule à recopier : ne demande jamais d'écrire « Exercice Métamérisme, étape N — analyse d'abord… ».
// ============================================================
import { CadreExercice } from "../src/outils/exercice/Exercice.jsx";
import { ETAPES, IDEES, MOTS_CLES } from "../src/outils/exercice/metamerisme.js";

// Ce que fait la simulation EN CE MOMENT (affiché dans le guide). À mettre à jour après chaque changement.
// Boîte à outils : true = on utilise colorimetrie.js (fournie) ; false = on construit la sienne à l'étape 0
// (src/outils/maColorimetrie.js) et on n'utilise PAS colorimetrie.js. Choisi avec le bouton « 🧰 » du guide.
const AVEC_COLORIMETRIE = false;

// Étapes du parcours guidé VALIDÉES PAR L'IA (leur numéro ; 0 = construire le modèle couleur) : l'agent ajoute le numéro quand l'étape marche.
const ETAPES_VALIDEES = [];

const ETAT_ACTUEL = [
  "🃏 Les deux cartes de contraste sont vierges et pour le moment immobiles.",
  "💡 Les trois boutons de la cabine de lumière ne fonctionnent pas.",
  "📈 Aucune distribution spectrale des illuminants, aucune courbe de réflectance spectrale.",
];

// --- Survol : chaque objet s'entoure et affiche son nom (les mêmes mots que dans les mots clés) ---
const STYLE_SURVOL = `
  .mm-objet { transition: transform .15s, box-shadow .15s, outline-color .15s; outline: 3px solid transparent; outline-offset: 3px; }
  .mm-objet:hover { outline-color: #f59e0b; box-shadow: 0 0 0 7px rgba(245,158,11,.25), 0 8px 18px rgba(0,0,0,.25); z-index: 5; }
  .mm-carte:hover { transform: translateY(-4px) scale(1.04); }
  .mm-etiquette { position: absolute; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fff; font-size: 12.5px; font-weight: 800;
    padding: 4px 9px; border-radius: 8px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity .15s; z-index: 10; }
  .mm-objet:hover > .mm-etiquette { opacity: 1; }
  .mm-cabine:has(.mm-bouton:hover) > .mm-etiquette { opacity: 0; }
  .mm-bouton { position: relative; transition: background .15s, border-color .15s, color .15s; }
  .mm-bouton:hover { background: #52525b !important; border-color: #f59e0b !important; color: #fff !important; }
`;

// --- Une carte de contraste vierge : moitié blanche en haut, moitié noire en bas ---
function CarteContraste({ numero, style }) {
  return (
    <div className="mm-objet mm-carte" style={{ position: "absolute", width: "12%", aspectRatio: "3 / 4", borderRadius: 4, ...style }}>
      <span className="mm-etiquette" style={{ bottom: "calc(100% + 8px)" }}>🃏 Carte de contraste {numero}</span>
      <div style={{ width: "100%", height: "100%", borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,.25)", border: "2px solid #e5e7eb",
        display: "grid", gridTemplateRows: "1fr 1fr", boxSizing: "border-box" }}>
        <div style={{ background: "#ffffff" }} />
        <div style={{ background: "#111827", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
          <span style={{ background: "rgba(255,255,255,.9)", borderRadius: 6, padding: "1px 6px", fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{numero}</span>
        </div>
      </div>
    </div>
  );
}

// --- La cabine de lumière en 3D, éteinte, avec ses trois boutons (qui ne font encore rien) ---
function Cabine({ style }) {
  return (
    <div className="mm-objet mm-cabine" style={{ position: "absolute", borderRadius: 10, ...style }}>
      <span className="mm-etiquette" style={{ top: "55%" }}>💡 Cabine de lumière 3D</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#27272a", borderRadius: "10px 10px 0 0", padding: "6px 10px", flexWrap: "wrap" }}>
        <span style={{ color: "#e4e4e7", fontSize: 12.5, fontWeight: 800, flex: 1, whiteSpace: "nowrap" }}>💡 Cabine de lumière</span>
        {["A", "D65", "F11"].map((id) => (
          <button key={id} type="button" className="mm-bouton" title="Ce bouton ne fonctionne pas encore (étape 1)"
            style={{ border: "1px solid #52525b", background: "#3f3f46", color: "#d4d4d8", borderRadius: 8, padding: "3px 10px", fontSize: 12.5, fontWeight: 800, cursor: "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: "#52525b" }} />{id}
            <span className="mm-etiquette mm-etiquette-bouton" style={{ top: "calc(100% + 8px)" }}>🔘 Bouton illuminant {id}</span>
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

// --- Un soleil simple au-dessus des cartes : la table est à la lumière du jour (D65) ---
function Soleil({ style }) {
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden="true" style={{ position: "absolute", width: "clamp(44px, 8%, 70px)", ...style }}>
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="0" y1="-30" x2="0" y2="-44" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" transform={`rotate(${i * 30})`} />
      ))}
      <circle r="22" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
    </svg>
  );
}

// --- La scène : la table à la lumière du jour, deux cartes vierges, la cabine ---
function Scene() {
  return (
    <div role="img" aria-label="Une table avec deux cartes de contraste vierges et une cabine de lumière en 3D éteinte"
      style={{ position: "relative", height: "clamp(260px, 40vw, 380px)", borderRadius: 18, overflow: "hidden",
        background: "linear-gradient(#eef2f7 0 70%, #d6c3a5 70% 100%)", border: "1px solid #d5dfeb" }}>
      <style>{STYLE_SURVOL}</style>
      <span style={{ position: "absolute", left: "3%", top: "6%", fontSize: 13, fontWeight: 800, color: "#475569" }}>Table, à la lumière du jour</span>
      <Soleil style={{ left: "13%", top: "15%" }} />
      <CarteContraste numero={1} style={{ left: "6%", top: "40%" }} />
      <CarteContraste numero={2} style={{ left: "21%", top: "40%" }} />
      <Cabine style={{ right: "4%", top: "7%", width: "min(53%, 430px)" }} />
    </div>
  );
}

export default function Metamerisme() {
  return (
    <CadreExercice page="Metamerisme" sujet="métamérisme" etapes={ETAPES} idees={IDEES} motsCles={MOTS_CLES} etat={ETAT_ACTUEL} validees={ETAPES_VALIDEES} avecOutils={AVEC_COLORIMETRIE}>
      <Scene />
    </CadreExercice>
  );
}
