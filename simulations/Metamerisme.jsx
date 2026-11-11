// ============================================================
//  MÉTAMÉRISME — exemple-exercice de l'Atelier simulation RASF.
//  Au départ, la page ne montre qu'une scène fixe : une cabine de lumière et deux cartes de même couleur.
//  En dessous, un guide donne, une étape à la fois, la demande à faire à l'IA pour construire la simulation.
//  Le prof copie la demande (il peut la modifier), la donne à l'agent, regarde le résultat, puis clique « Suivant ».
//  Pour calculer les couleurs à partir des spectres, l'agent peut utiliser src/outils/colorimetrie.js
//  (observateur CIE 1931, illuminants A, D65, F11, paire de cartes métamères, ΔE*ab).
// ============================================================
import { useState } from "react";

const ETAPES = [
  {
    titre: "Choisir la lumière de la cabine",
    demande: `Dans la page Métamérisme, ajoute au-dessus de la scène trois boutons pour choisir la lumière de la cabine : A (lampe à incandescence), D65 (lumière du jour) et F11 (tube fluorescent). L'intérieur de la cabine prend la teinte de la lumière choisie. Retiens le choix au rechargement de la page.`,
  },
  {
    titre: "Faire glisser les cartes dans la cabine",
    demande: `Dans la page Métamérisme, rends les deux cartes déplaçables : on peut les faire glisser, à la souris ou au doigt, de la table jusque dans la cabine. Ajoute aussi un bouton « Mettre les deux cartes dans la cabine » pour le téléphone. Une carte dans la cabine prend la lumière de la cabine ; sur la table, elle reste à la lumière du jour.`,
  },
  {
    titre: "Calculer les couleurs à partir des spectres",
    demande: `Dans la page Métamérisme, calcule la couleur des cartes à partir des spectres, avec src/outils/colorimetrie.js : observateur CIE 1931, illuminants A, D65 et F11. Les deux cartes forment une paire métamère : exactement la même couleur sous D65, mais une différence nette sous A. Affiche sous la scène l'écart ΔE*ab entre les deux cartes quand elles sont toutes les deux dans la cabine, avec une phrase qui dit si la différence se voit.`,
  },
  {
    titre: "Montrer les spectres des illuminants",
    demande: `Dans la page Métamérisme, ajoute un bouton « Spectres des illuminants » qui ouvre une fenêtre avec un graphique : les spectres de A, D65 et F11 entre 380 et 780 nm, ramenés à la même luminosité, avec une légende. Ajoute une phrase : A est très fort dans le rouge, D65 est presque plat, F11 a trois raies étroites.`,
  },
  {
    titre: "Montrer les spectres des deux cartes",
    demande: `Dans la page Métamérisme, ajoute un bouton « Spectres des deux cartes » qui ouvre une fenêtre avec leurs spectres de réflexion superposés (380 à 780 nm). On doit voir que les deux courbes sont très proches, se croisent en 3 points (marque-les avec leur longueur d'onde) et divergent surtout dans le rouge (surligne la zone 600-700 nm). Explique en deux phrases pourquoi les cartes paraissent différentes sous A.`,
  },
  {
    titre: "Le message à retenir",
    demande: `Dans la page Métamérisme, ajoute en bas un encadré « À retenir » : deux couleurs identiques sous une lumière peuvent être différentes sous une autre ; c'est le métamérisme. Pour comparer deux couleurs, on les regarde toujours sous la même lumière, et de préférence sous plusieurs lumières (cabine de lumière). Puis retire de la page le guide « Construis cette simulation avec l'IA ».`,
  },
];

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

// --- Le guide : une étape à la fois ---
function Guide() {
  const [n, setN] = useState(() => { try { return Math.min(ETAPES.length - 1, +localStorage.getItem("metamerisme.etape") || 0); } catch { return 0; } });
  const [textes, setTextes] = useState(() => ETAPES.map((e) => e.demande));
  const [copie, setCopie] = useState(false);
  const aller = (i) => { setN(i); setCopie(false); try { localStorage.setItem("metamerisme.etape", String(i)); } catch { /* sans importance */ } };
  const etape = ETAPES[n];
  const bouton = (principal) => ({ padding: "9px 16px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 14.5, border: "none",
    background: principal ? "var(--accent)" : "#fff", color: principal ? "#fff" : "#334155", boxShadow: "inset 0 0 0 1px #d5dfeb" });

  return (
    <section aria-label="Construis cette simulation avec l'IA" style={{ background: "#fff", border: "2px solid var(--accent)", borderRadius: 18, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 17 }}>🤖 Construis cette simulation avec l'IA</strong>
        <span style={{ fontSize: 14, color: "#64748b", fontWeight: 700 }}>Étape {n + 1} / {ETAPES.length}</span>
      </div>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, margin: "10px 0 14px", overflow: "hidden" }}>
        <div style={{ width: `${((n + 1) / ETAPES.length) * 100}%`, height: "100%", background: "var(--accent)", transition: "width .2s" }} />
      </div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{n + 1}. {etape.titre}</h3>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "#475569" }}>
        Copie cette demande (tu peux la modifier avant), colle-la dans la conversation avec l'agent, puis regarde le résultat dans l'aperçu. Quand c'est bon, clique sur « Suivant ».
      </p>
      <textarea value={textes[n]} onChange={(e) => setTextes((t) => t.map((x, i) => (i === n ? e.target.value : x)))} rows={5}
        style={{ width: "100%", boxSizing: "border-box", font: "inherit", fontSize: 14.5, lineHeight: 1.55, padding: "10px 12px", borderRadius: 12, border: "1.5px solid #cbd5e1", resize: "vertical" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        <button type="button" style={bouton(false)} onClick={() => navigator.clipboard?.writeText(textes[n]).then(() => { setCopie(true); setTimeout(() => setCopie(false), 2000); })}>
          {copie ? "✓ Copié !" : "📋 Copier la demande"}
        </button>
        <span style={{ flex: 1 }} />
        {n > 0 && <button type="button" style={bouton(false)} onClick={() => aller(n - 1)}>← Précédent</button>}
        {n < ETAPES.length - 1
          ? <button type="button" style={bouton(true)} onClick={() => aller(n + 1)}>Suivant →</button>
          : <span style={{ alignSelf: "center", fontWeight: 800, color: "#15803d" }}>🎉 Dernière étape</span>}
      </div>
    </section>
  );
}

export default function Metamerisme() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 14 }}>
      <p style={{ margin: 0 }}>Deux cartes de même couleur et une cabine de lumière : c'est le point de départ. À toi de construire la simulation du <strong>métamérisme</strong> en guidant l'IA, une étape à la fois.</p>
      <Scene />
      <Guide />
    </div>
  );
}
