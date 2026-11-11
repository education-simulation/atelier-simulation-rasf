// ============================================================
//  TITRAGE DIRECT — exercice de l'Atelier simulation RASF : apprendre à écrire un prompt.
//  Ce fichier ne contient QUE la simulation, que l'on construit avec l'agent, étape par étape.
//  Au départ : une paillasse avec une burette et un bécher VIDES, un agitateur magnétique éteint,
//  une pipette jaugée et trois flacons (Lugol, thiosulfate de sodium, thiodène). Rien ne fonctionne.
//  Scénario repris du TP « Titrage du diiode contenu dans le Lugol » de la Paillasse virtuelle de Nils Aronssohn.
//  ETAT_ACTUEL décrit ce que fait la simulation en ce moment : l'agent le tient à jour à chaque changement.
//  Le cadre de l'exercice (guide, mots clés, sauvegardes, « Tout recommencer ») est dans
//  src/outils/exercice/ : ne pas le modifier. Les étapes et leurs critères : src/outils/exercice/titrageDirect.js.
//  Pour calculer volumes, quantités de matière et couleurs : le modèle ACTIF, avec modeleChimique(AVEC_MODELE)
//  (src/outils/exercice/modeleChimique.js), jamais en important un fichier de modèle directement.
//  AGENT : relis AGENTS.md (section « L'exercice Titrage direct ») à CHAQUE message.
// ============================================================
import { CadreExercice } from "../src/outils/exercice/Exercice.jsx";
import { ETAPES, IDEES, MOTS_CLES } from "../src/outils/exercice/titrageDirect.js";

// Modèle chimique : true = le modèle par défaut ; false = celui que l'on construit à l'étape 0.
// Choisi avec le sélecteur « 🧰 Modèle chimique » du guide.
const AVEC_MODELE = true;

// Étapes du parcours guidé VALIDÉES PAR L'IA (leur numéro ; 0 = construire le modèle chimique) : l'agent ajoute le numéro quand l'étape marche.
const ETAPES_VALIDEES = [];

// Ce que fait la simulation EN CE MOMENT (affiché dans le guide). À mettre à jour après chaque changement.
const ETAT_ACTUEL = [
  "🧪 La burette et le bécher sont vides.",
  "🔴 Le robinet, l'agitateur et le flacon de thiodène ne fonctionnent pas.",
  "📈 Aucun volume versé, aucune courbe de quantité de matière.",
];

// --- Survol : chaque objet s'entoure et affiche son nom (les mêmes mots que dans les mots clés) ---
const STYLE_SURVOL = `
  .td-objet { cursor: default; }
  .td-objet .td-contour { transition: stroke .15s, stroke-width .15s; }
  .td-objet:hover .td-contour { stroke: #f59e0b; stroke-width: 3.5; }
  .td-etiquette { opacity: 0; transition: opacity .15s; pointer-events: none; }
  .td-objet:hover .td-etiquette { opacity: 1; }
`;

// Une étiquette noire, au survol (en coordonnées du dessin).
function Etiquette({ x, y, texte }) {
  const l = 9 + texte.length * 7.4;
  return (
    <g className="td-etiquette">
      <rect x={x - l / 2} y={y - 15} width={l} height={22} rx="7" fill="#0f172a" />
      <text x={x} y={y} fontSize="12.5" fontWeight="800" fill="#fff" textAnchor="middle">{texte}</text>
    </g>
  );
}

// Un flacon posé sur la paillasse.
function Flacon({ x, l, h, verre, bouchon, nom, sousNom, etiquette }) {
  const y = 262 - h;
  return (
    <g className="td-objet">
      <rect className="td-contour" x={x} y={y} width={l} height={h} rx="7" fill={verre} stroke="#475569" strokeWidth="1.5" />
      <rect x={x + l * 0.3} y={y - 14} width={l * 0.4} height={15} rx="3" fill={bouchon} stroke="#475569" />
      <rect x={x + 4} y={y + h * 0.3} width={l - 8} height={h * 0.42} rx="3" fill="#fff" stroke="#cbd5e1" />
      <text x={x + l / 2} y={y + h * 0.3 + 15} fontSize="11" fontWeight="800" fill="#0f172a" textAnchor="middle">{nom}</text>
      {sousNom && <text x={x + l / 2} y={y + h * 0.3 + 28} fontSize="9.5" fill="#475569" textAnchor="middle">{sousNom}</text>}
      <Etiquette x={x + l / 2} y={y - 22} texte={etiquette} />
    </g>
  );
}

// --- La scène : la paillasse, le montage de titrage (vide) et les flacons ---
function Scene() {
  const yZero = 34, yFin = 166; // burette : 0 mL en haut, 25 mL en bas
  return (
    <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid #d5dfeb", background: "#eef2f7" }}>
      <style>{STYLE_SURVOL}</style>
      <svg viewBox="0 0 640 300" role="img" aria-label="Une paillasse avec une burette vide, un bécher vide sur un agitateur magnétique éteint, une pipette jaugée et trois flacons"
        style={{ display: "block", width: "100%", height: "auto", maxHeight: 380 }}>
        <rect x="0" y="262" width="640" height="38" fill="#d6c3a5" />
        <text x="626" y="24" fontSize="13" fontWeight="800" fill="#475569" textAnchor="end">Paillasse : titrage direct du diiode du Lugol</text>

        {/* potence */}
        <g className="td-objet">
          <rect className="td-contour" x="150" y="252" width="190" height="10" rx="2" fill="#94a3b8" stroke="#64748b" />
          <rect className="td-contour" x="318" y="28" width="8" height="226" fill="#94a3b8" stroke="#64748b" />
          <rect x="242" y="98" width="80" height="7" fill="#94a3b8" />
          <Etiquette x="322" y="44" texte="🔩 Potence" />
        </g>

        {/* burette graduée, vide */}
        <g className="td-objet">
          <rect className="td-contour" x="222" y={yZero - 14} width="20" height={yFin - yZero + 14} fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          {Array.from({ length: 26 }, (_, v) => {
            const y = yZero + (v / 25) * (yFin - yZero);
            return (
              <g key={v}>
                <line x1="242" y1={y} x2={v % 5 === 0 ? 252 : 247} y2={y} stroke="#334155" strokeWidth="1" />
                {v % 5 === 0 && <text x="255" y={y + 4} fontSize="10" fill="#334155">{v}</text>}
              </g>
            );
          })}
          <path className="td-contour" d={`M 222 ${yFin} L 229 ${yFin + 18} L 235 ${yFin + 18} L 242 ${yFin} Z`} fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          <line x1="232" y1={yFin + 26} x2="232" y2={yFin + 36} stroke="#334155" strokeWidth="3" />
          <Etiquette x="200" y="62" texte="🧪 Burette graduée" />
        </g>

        {/* robinet (fermé, ne fonctionne pas) */}
        <g className="td-objet">
          <rect className="td-contour" x="223" y={yFin + 18} width="18" height="8" rx="2" fill="#dc2626" stroke="#7f1d1d" />
          <rect x="241" y={yFin + 20} width="12" height="4" rx="2" fill="#7f1d1d" />
          <Etiquette x="292" y={yFin + 26} texte="🔴 Robinet" />
        </g>

        {/* agitateur magnétique, éteint */}
        <g className="td-objet">
          <rect className="td-contour" x="172" y="236" width="120" height="26" rx="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          <circle cx="192" cy="249" r="5" fill="#fff" stroke="#475569" />
          <circle cx="210" cy="249" r="5" fill="#fff" stroke="#475569" />
          <Etiquette x="232" y="290" texte="🌀 Agitateur magnétique" />
        </g>

        {/* bécher, vide */}
        <g className="td-objet">
          <path className="td-contour" d="M 196 192 L 196 234 Q 196 236 198 236 L 266 236 Q 268 236 268 234 L 268 192 M 196 192 L 191 188" fill="rgba(255,255,255,.55)" stroke="#334155" strokeWidth="2" />
          <rect x="224" y="229" width="16" height="4" rx="2" fill="#fff" stroke="#64748b" />
          {[206, 220].map((y, i) => <line key={y} x1="200" y1={y} x2="210" y2={y} stroke="#94a3b8" strokeWidth="1" opacity={1 - i * 0.2} />)}
          <Etiquette x="150" y="214" texte="🥛 Bécher" />
        </g>

        {/* pipette jaugée, posée sur la paillasse */}
        <g className="td-objet">
          <path className="td-contour" d="M 370 281 L 440 281 L 450 276 L 490 276 L 500 281 L 590 281 L 590 284 L 500 284 L 490 289 L 450 289 L 440 284 L 370 284 Z" fill="#f8fafc" stroke="#334155" strokeWidth="1.3" />
          <line x1="545" y1="279" x2="545" y2="286" stroke="#334155" strokeWidth="1.5" />
          <text x="470" y="285.5" fontSize="8" fill="#334155" textAnchor="middle">10 mL</text>
          <Etiquette x="480" y="266" texte="💧 Pipette jaugée" />
        </g>

        {/* flacons */}
        <Flacon x={380} l={58} h={86} verre="#92400e" bouchon="#1f2937" nom="Lugol" sousNom="diiode I₂" etiquette="🟤 Flacon de Lugol" />
        <Flacon x={458} l={64} h={96} verre="#e0f2fe" bouchon="#1d4ed8" nom="Thiosulfate" sousNom="de sodium" etiquette="⚪ Thiosulfate de sodium" />
        <Flacon x={546} l={44} h={58} verre="#f1f5f9" bouchon="#7c3aed" nom="Thiodène" etiquette="🔵 Flacon de thiodène" />
      </svg>
    </div>
  );
}

export default function TitrageDirect() {
  return (
    <CadreExercice page="TitrageDirect" sujet="titrage direct" etapes={ETAPES} idees={IDEES} motsCles={MOTS_CLES} etat={ETAT_ACTUEL} validees={ETAPES_VALIDEES} avecOutils={AVEC_MODELE}>
      <Scene />
    </CadreExercice>
  );
}
