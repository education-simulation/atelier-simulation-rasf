// ============================================================
//  MÉTAMÉRISME — exemple de l'Atelier simulation RASF.
//  Deux cartes de même couleur à la lumière du jour. On les fait glisser dans une cabine de lumière
//  dont on choisit l'illuminant (A, D65, F11) : sous A, elles deviennent différentes.
//  Les couleurs sont CALCULÉES à partir des spectres (observateur CIE 1931, src/outils/colorimetrie.js) :
//  les deux cartes ont exactement les mêmes X, Y, Z sous D65, mais pas sous A.
//  Le bouton « Le prompt de cet exemple » montre la demande qui a servi à créer cette page.
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { LONGUEURS, YBAR, ILLUMINANTS, xyz, blanc, lab, deltaE, versEcran, paireMetamere, croisements } from "../src/outils/colorimetrie.js";

// --- Les deux cartes (réflectances, de 0 à 1) ---
const sig = (x) => 1 / (1 + Math.exp(-x));
const CARTE_1 = LONGUEURS.map((l) => 0.30 + 0.15 * Math.exp(-(((l - 530) / 70) ** 2)));          // vert sauge
const CARTE_2 = paireMetamere(CARTE_1, LONGUEURS.map((l) => sig((l - 640) / 15) - 0.2 * Math.exp(-(((l - 440) / 25) ** 2))), 7);
const CROISEMENTS = croisements(CARTE_1, CARTE_2);

const DEGRE_CABINE = 0.75; // l'œil s'habitue en partie à la lampe : on voit encore sa teinte, comme dans une vraie cabine
const fr = (x, n = 1) => x.toLocaleString("fr-FR", { minimumFractionDigits: n, maximumFractionDigits: n });

const PROMPT = `Crée une simulation sur le métamérisme, dans le menu Exemples.

La scène : une cabine de lumière, où l'on choisit l'illuminant (A, D65 ou F11). Hors de la cabine, sur la table, deux cartes qui ont la même couleur à la lumière du jour.

Ce qu'on manipule : on fait glisser les cartes dans la cabine (avec un bouton aussi, pour le téléphone) et on change d'illuminant. Sous A, on doit voir une différence entre les deux cartes.

Ce qu'on affiche : des boutons qui ouvrent des fenêtres :
- les spectres des illuminants A, D65 et F11 ;
- les spectres de réflexion des deux cartes, superposés.
On doit voir que les deux spectres sont très proches, se croisent en 3 points et divergent surtout dans le rouge, là où l'illuminant A est fort.

Le message à retenir : deux couleurs identiques sous une lumière peuvent être différentes sous une autre ; c'est le métamérisme.

Exigence : les couleurs sont calculées à partir des spectres (observateur CIE 1931, écart ΔE*ab affiché), pas choisies à la main.`;

// --- Fenêtre (popup) ---
function Fenetre({ titre, fermer, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const echap = (e) => { if (e.key === "Escape") fermer(); };
    document.addEventListener("keydown", echap);
    return () => document.removeEventListener("keydown", echap);
  }, [fermer]);
  return (
    <div onPointerDown={(e) => { if (ref.current && !ref.current.contains(e.target)) fermer(); }}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div ref={ref} role="dialog" aria-label={titre}
        style={{ background: "#fff", borderRadius: 18, width: "min(760px, 100%)", maxHeight: "92vh", overflow: "auto", padding: "16px 18px", boxShadow: "0 20px 40px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <strong style={{ flex: 1, fontSize: 17 }}>{titre}</strong>
          <button type="button" onClick={fermer} aria-label="Fermer" style={{ border: "none", background: "#f1f5f9", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Graphique de spectres (SVG) ---
function Graphique({ courbes, ymax, unite, zones = [], points = [] }) {
  const W = 700, H = 312, g = 46, d = 14, h = 28, b = 34;
  const X = (l) => g + ((l - 380) / 400) * (W - g - d);
  const Y = (v) => H - b - (Math.min(v, ymax * 1.04) / ymax) * (H - h - b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Spectres">
      {zones.map((z, i) => <g key={i}><rect x={X(z.de)} y={h} width={X(z.a) - X(z.de)} height={H - h - b} fill={z.couleur} opacity="0.12" />
        <text x={(X(z.de) + X(z.a)) / 2} y={h + 14} textAnchor="middle" fontSize="12" fill={z.couleur} fontWeight="700">{z.texte}</text></g>)}
      {[400, 450, 500, 550, 600, 650, 700, 750].map((l) => <g key={l}>
        <line x1={X(l)} x2={X(l)} y1={h} y2={H - b} stroke="#e2e8f0" />
        <text x={X(l)} y={H - b + 16} textAnchor="middle" fontSize="12" fill="#64748b">{l}</text></g>)}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => <g key={f}>
        <line x1={g} x2={W - d} y1={Y(f * ymax)} y2={Y(f * ymax)} stroke="#f1f5f9" />
        <text x={g - 6} y={Y(f * ymax) + 4} textAnchor="end" fontSize="11" fill="#64748b">{fr(f * ymax, ymax < 5 ? 2 : 0)}</text></g>)}
      <text x={(W + g) / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#475569">longueur d'onde (nm)</text>
      <text x={8} y={14} fontSize="12" fill="#475569">{unite}</text>
      {courbes.map((c) => <polyline key={c.nom} fill="none" stroke={c.couleur} strokeWidth={c.epais || 2.5} strokeDasharray={c.tirets || undefined}
        points={LONGUEURS.map((l, i) => `${X(l).toFixed(1)},${Y(c.valeurs[i]).toFixed(1)}`).join(" ")} />)}
      {points.map((p, i) => <g key={i}><circle cx={X(p.l)} cy={Y(p.v)} r="5" fill="#fff" stroke="#0f172a" strokeWidth="2" />
        <text x={X(p.l)} y={Y(p.v) - 10} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#0f172a">{fr(p.l, 0)} nm</text></g>)}
    </svg>
  );
}

function Legende({ elements }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontSize: 13.5, margin: "6px 0" }}>
    {elements.map((e) => <span key={e.nom} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 18, height: 0, borderTop: `3px ${e.tirets ? "dashed" : "solid"} ${e.couleur}` }} />{e.nom}</span>)}
  </div>;
}

// --- Page ---
export default function Metamerisme() {
  const [illum, setIllum] = useState(() => { try { return localStorage.getItem("metamerisme.illuminant") || "A"; } catch { return "A"; } });
  const choisirIllum = (k) => { setIllum(k); try { localStorage.setItem("metamerisme.illuminant", k); } catch { /* sans importance */ } };
  const DEPART = [{ x: 0.06, y: 0.42 }, { x: 0.21, y: 0.42 }];
  const [pos, setPos] = useState(DEPART);
  const [fenetre, setFenetre] = useState(null); // "illuminants" | "cartes" | "prompt"
  const [copie, setCopie] = useState(false);
  const scene = useRef(null);
  const glisse = useRef(null);

  const CABINE = { x0: 0.46, x1: 0.98, y0: 0.06, y1: 0.94 }; // en fraction de la scène
  const dansCabine = (p) => p.x + 0.065 > CABINE.x0 && p.x + 0.065 < CABINE.x1 && p.y > CABINE.y0 && p.y + 0.2 < CABINE.y1;

  const S = ILLUMINANTS[illum].spectre;
  const D65 = ILLUMINANTS.D65.spectre;
  const couleurs = useMemo(() => {
    const wS = blanc(S), wD = blanc(D65);
    return {
      table: [CARTE_1, CARTE_2].map((R) => versEcran(xyz(R, D65), wD, 1)),
      cabine: [CARTE_1, CARTE_2].map((R) => versEcran(xyz(R, S), wS, DEGRE_CABINE)),
      mur: versEcran(xyz(LONGUEURS.map(() => 0.85), S), wS, DEGRE_CABINE),
      ecart: deltaE(lab(xyz(CARTE_1, S), wS), lab(xyz(CARTE_2, S), wS)),
    };
  }, [S, D65]);

  function debut(i, e) {
    const r = scene.current.getBoundingClientRect();
    glisse.current = { i, dx: (e.clientX - r.left) / r.width - pos[i].x, dy: (e.clientY - r.top) / r.height - pos[i].y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function deplace(e) {
    if (!glisse.current) return;
    const r = scene.current.getBoundingClientRect(), { i, dx, dy } = glisse.current;
    const x = Math.min(0.87, Math.max(0, (e.clientX - r.left) / r.width - dx)), y = Math.min(0.72, Math.max(0, (e.clientY - r.top) / r.height - dy));
    setPos((p) => p.map((q, j) => (j === i ? { x, y } : q)));
  }
  const fin = () => { glisse.current = null; };
  const toutesDedans = pos.every(dansCabine), aucuneDedans = !pos.some(dansCabine);
  const bouger = (dedans) => setPos(dedans ? [{ x: 0.56, y: 0.42 }, { x: 0.74, y: 0.42 }] : DEPART);

  const bouton = (actif) => ({ padding: "8px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 14.5, border: "none",
    background: actif ? "var(--accent)" : "#fff", color: actif ? "#fff" : "#334155", boxShadow: "inset 0 0 0 1px #d5dfeb" });

  // Spectres des illuminants, ramenés à la même luminosité (même Y) pour être comparables.
  const illumNormalises = Object.entries(ILLUMINANTS).map(([k, il]) => {
    const yS = il.spectre.reduce((t, v, i) => t + v * YBAR[i], 0); // luminosité de l'illuminant
    return { k, il, yS };
  });
  const yRef = illumNormalises.find((x) => x.k === "D65").yS;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 14 }}>
      <p style={{ margin: 0 }}>Ces deux cartes ont <strong>la même couleur à la lumière du jour</strong>. Fais-les glisser dans la cabine de lumière, puis change d'illuminant : sont-elles toujours identiques ?</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <strong>Lumière de la cabine :</strong>
        {Object.entries(ILLUMINANTS).map(([k, il]) => (
          <button key={k} type="button" onClick={() => choisirIllum(k)} style={bouton(illum === k)} title={il.detail}>{il.nom}</button>
        ))}
        <span style={{ color: "#64748b", fontSize: 14 }}>{ILLUMINANTS[illum].detail}</span>
      </div>

      <div ref={scene} onPointerMove={deplace} onPointerUp={fin} onPointerCancel={fin}
        style={{ position: "relative", height: "clamp(260px, 42vw, 360px)", borderRadius: 18, overflow: "hidden", touchAction: "none", userSelect: "none",
          background: "linear-gradient(#eef2f7 0 70%, #d6c3a5 70% 100%)", border: "1px solid #d5dfeb" }}>
        <span style={{ position: "absolute", left: "3%", top: "6%", fontSize: 13, fontWeight: 800, color: "#475569" }}>☀️ Table, à la lumière du jour (D65)</span>
        {/* Cabine de lumière */}
        <div style={{ position: "absolute", left: `${CABINE.x0 * 100}%`, top: `${CABINE.y0 * 100}%`, width: `${(CABINE.x1 - CABINE.x0) * 100}%`, height: `${(CABINE.y1 - CABINE.y0) * 100}%`,
          background: couleurs.mur, border: "10px solid #3f3f46", borderTopWidth: 26, borderRadius: 8, boxShadow: "inset 0 10px 30px rgba(0,0,0,.25)" }}>
          <span style={{ position: "absolute", top: -22, left: 8, color: "#fff", fontSize: 12.5, fontWeight: 800 }}>💡 Cabine de lumière · {illum}</span>
        </div>
        {/* Cartes */}
        {pos.map((p, i) => {
          const dedans = dansCabine(p);
          return (
            <div key={i} onPointerDown={(e) => debut(i, e)} role="img" aria-label={`Carte ${i + 1}${dedans ? " dans la cabine" : " sur la table"}`}
              style={{ position: "absolute", left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: "13%", aspectRatio: "3 / 4", cursor: "grab",
                background: dedans ? couleurs.cabine[i] : couleurs.table[i], borderRadius: 6, boxShadow: "0 4px 10px rgba(0,0,0,.25)", border: "2px solid #fff",
                display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4 }}>
              <span style={{ background: "rgba(255,255,255,.85)", borderRadius: 6, padding: "1px 6px", fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{i + 1}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button type="button" style={bouton(false)} onClick={() => bouger(!toutesDedans)}>{toutesDedans ? "↩ Remettre les cartes sur la table" : "➡ Mettre les deux cartes dans la cabine"}</button>
        <button type="button" style={bouton(false)} onClick={() => setFenetre("illuminants")}>📈 Spectres des illuminants</button>
        <button type="button" style={bouton(false)} onClick={() => setFenetre("cartes")}>📈 Spectres des deux cartes</button>
        <button type="button" style={bouton(false)} onClick={() => setFenetre("prompt")}>📝 Le prompt de cet exemple</button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #d5dfeb", borderRadius: 16, padding: "12px 16px", lineHeight: 1.6 }}>
        {toutesDedans ? (<>
          Dans la cabine, sous <strong>{illum}</strong> : écart entre les cartes <strong>ΔE*ab = {fr(couleurs.ecart)}</strong> →{" "}
          {couleurs.ecart < 1 ? "aucune différence visible : les cartes sont identiques." : couleurs.ecart < 3 ? "une petite différence, visible pour un œil exercé." : "une différence nette : c'est le métamérisme !"}
        </>) : aucuneDedans ? (<>À la lumière du jour, les deux cartes sont identiques (ΔE*ab = 0,0). Mets-les dans la cabine pour les comparer sous une autre lumière.</>)
          : (<>Mets aussi l'autre carte dans la cabine : on ne compare deux couleurs que sous la <strong>même</strong> lumière.</>)}
      </div>

      {fenetre === "illuminants" && (
        <Fenetre titre="Spectres des illuminants" fermer={() => setFenetre(null)}>
          <Graphique unite="puissance relative" ymax={2.5}
            courbes={illumNormalises.map(({ k, il, yS }) => ({ nom: k, couleur: il.couleur, valeurs: il.spectre.map((v) => (v / yS) * (yRef / 100)), epais: k === illum ? 3.5 : 2 }))}
            zones={[{ de: 600, a: 700, couleur: "#dc2626", texte: "rouge" }]} />
          <Legende elements={Object.entries(ILLUMINANTS).map(([k, il]) => ({ nom: `${k} : ${il.detail}`, couleur: il.couleur }))} />
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#334155" }}>Courbes ramenées à la même quantité totale de lumière. <strong>A</strong> monte fort vers le rouge ; <strong>D65</strong> est presque plat ; <strong>F11</strong> concentre sa lumière dans trois raies étroites (bleu, vert, orangé), qui sortent du cadre.</p>
        </Fenetre>
      )}

      {fenetre === "cartes" && (
        <Fenetre titre="Spectres de réflexion des deux cartes" fermer={() => setFenetre(null)}>
          <Graphique unite="réflectance" ymax={1}
            courbes={[{ nom: "Carte 1", couleur: "#0f766e", valeurs: CARTE_1 }, { nom: "Carte 2", couleur: "#9333ea", valeurs: CARTE_2, tirets: "7 5" }]}
            zones={[{ de: 600, a: 700, couleur: "#dc2626", texte: "écart dans le rouge" }]}
            points={CROISEMENTS.map((l) => { const i = Math.round((l - 380) / 5); return { l, v: CARTE_1[i] }; })} />
          <Legende elements={[{ nom: "Carte 1", couleur: "#0f766e" }, { nom: "Carte 2", couleur: "#9333ea", tirets: true }]} />
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#334155", lineHeight: 1.55 }}>
            Les deux courbes sont très proches et <strong>se croisent en {CROISEMENTS.length} points</strong> ({CROISEMENTS.map((l) => `${fr(l, 0)} nm`).join(", ")}) : sous D65, les écarts se compensent et l'œil voit la même couleur.
            Elles <strong>divergent surtout dans le rouge</strong> : sous <strong>A</strong>, très riche en rouge, cet écart pèse beaucoup plus et les cartes paraissent différentes.
          </p>
        </Fenetre>
      )}

      {fenetre === "prompt" && (
        <Fenetre titre="📝 Le prompt de cet exemple" fermer={() => setFenetre(null)}>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: "#334155" }}>Voici la demande donnée à l'IA pour créer cette page. Copie-la, change ce que tu veux (le sujet, la scène, ce qu'on manipule, ce qu'on affiche) et donne-la à l'agent pour créer ta propre simulation.</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.55, fontFamily: "inherit", margin: 0 }}>{PROMPT}</pre>
          <button type="button" style={{ ...bouton(true), marginTop: 10 }}
            onClick={() => navigator.clipboard?.writeText(PROMPT).then(() => { setCopie(true); setTimeout(() => setCopie(false), 2000); })}>
            {copie ? "✓ Copié !" : "📋 Copier le prompt"}
          </button>
        </Fenetre>
      )}
    </div>
  );
}
