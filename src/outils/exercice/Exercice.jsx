// ============================================================
//  CADRE D'EXERCICE (outil partagé, ne pas modifier) — « construis cette simulation avec l'IA ».
//  Autour de la simulation (children) :
//   - en haut : « ↺ Tout recommencer » (fenêtre de confirmation) — sur l'ordinateur seulement ;
//   - le guide, en deux modes : 🧭 Parcours guidé (toutes les étapes, en sections repliables)
//     et 🧪 Exploration libre (idées à copier) ;
//   - les sauvegardes (sauver / reprendre une version) — sur l'ordinateur seulement ;
//   - dans le guide (les deux modes) : « 📍 État actuel de la simulation », fourni par la page (prop etat),
//     que l'agent tient à jour à chaque changement ;
//   - à droite (en dessous sur petit écran) : les mots clés qui rendent un prompt précis (un clic copie le mot).
//  Les écritures sur l'ordinateur passent par le serveur d'aperçu (vite.config.js) : jamais en ligne.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { courbesPubliees, useCourbesPubliees, oublierCourbes } from "./courbes.js";
import { estApercu } from "../../moteur/Apercu";

const lire = (cle, defaut) => { try { const v = localStorage.getItem(cle); return v === null ? defaut : JSON.parse(v); } catch { return defaut; } };
const ecrire = (cle, v) => { try { localStorage.setItem(cle, JSON.stringify(v)); } catch { /* sans importance */ } };
const bouton = (style = "normal") => ({
  padding: "8px 13px", borderRadius: 11, cursor: "pointer", fontWeight: 800, fontSize: 13.5, border: "none",
  background: style === "principal" ? "var(--accent)" : style === "danger" ? "#fef2f2" : "#fff",
  color: style === "principal" ? "#fff" : style === "danger" ? "#b91c1c" : "#334155",
  boxShadow: `inset 0 0 0 1px ${style === "danger" ? "#fecaca" : "#d5dfeb"}`,
});
const appel = async (action, corps) => {
  const r = await fetch(`__atelier/versions/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erreur || `erreur ${r.status}`);
  return j;
};
function useCopie() {
  const [copie, setCopie] = useState(null);
  const copier = (quoi, valeur) => navigator.clipboard?.writeText(valeur).then(() => { setCopie(quoi); setTimeout(() => setCopie(null), 2000); });
  return [copie, copier];
}

// --- Mots clés : le vocabulaire qui rend un prompt précis (un clic copie le mot) ---
function MotsCles({ groupes, surlignes = new Set(), pourEtapes = [] }) {
  const [copie, copier] = useCopie();
  return (
    <aside className="ex-mots" aria-label="Mots clés pour un prompt précis">
      <strong style={{ display: "block", fontSize: 15, marginBottom: 2 }}>🔑 Mots clés pour un prompt précis</strong>
      <span style={{ display: "block", fontSize: 12.5, color: "#64748b", marginBottom: 8 }}>Utilise-les dans tes demandes à l'agent. Un clic copie le mot.</span>
      {pourEtapes.length > 0 && (
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: "#854d0e", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 8, padding: "4px 8px", marginBottom: 8 }}>
          🟡 En jaune : les mots utiles pour l'étape {pourEtapes.join(" et ")}
        </span>
      )}
      <div style={{ display: "grid", gap: 10 }}>
        {groupes.map((g) => (
          <div key={g.titre}>
            <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 4 }}>{g.titre}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {g.mots.map((m) => {
                const s = surlignes.has(m), attenue = surlignes.size > 0 && !s;
                return (
                  <button key={m} type="button" onClick={() => copier(m, m)} title="Copier"
                    style={{ border: `1px solid ${s ? "#eab308" : "#c7d2fe"}`, background: copie === m ? "#4f46e5" : s ? "#fde047" : "#fff",
                      color: copie === m ? "#fff" : s ? "#422006" : "#312e81", opacity: attenue ? 0.55 : 1, boxShadow: s ? "0 1px 3px rgba(161,98,7,.35)" : "none",
                      borderRadius: 999, padding: "3px 10px", fontSize: 12.5, fontWeight: s ? 800 : 700, cursor: "pointer", transition: "background .2s, opacity .2s" }}>{copie === m ? "✓ copié" : m}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// --- État actuel de la simulation : ce qui existe déjà et ce qui ne marche pas encore ---
function EtatActuel({ etat, ligneModele }) {
  if (!etat?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #fcd34d", borderLeft: "5px solid #f59e0b", borderRadius: 10, padding: "8px 12px", fontSize: 14, lineHeight: 1.55 }}>
      <strong>📍 État actuel de la simulation</strong>
      <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>{etat.map((l, i) => <li key={i}>{l}</li>)}{ligneModele && <li>{ligneModele}</li>}</ul>
    </div>
  );
}

// --- Boîte à outils : une ligne compacte (choix fournie / construite) + « ❓ À quoi sert … ? » en popup ---
// Le choix est ÉCRIT dans la page (AVEC_COLORIMETRIE) par le serveur d'aperçu : l'agent le lit.
function BoiteOutils({ page, avec, outils, choix }) {
  const [message, setMessage] = useState("");
  const [aide, setAide] = useState(null);
  const choisir = async (v) => {
    if (v === avec) return;
    try { setMessage("⏳"); await appel("outils", { page, avec: v }); setMessage(""); }
    catch (e) { setMessage(`⚠️ ${e.message}`); }
  };
  const o = outils?.[0];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 13.5, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 10px" }}>
      <span style={{ fontWeight: 800 }}>🧰 {o?.nomModele || "Modèles couleur"}</span>
      {choix && (
        <div role="tablist" aria-label={o?.nomModele || "Modèles couleur"} className="ex-bascule ex-bascule-petite">
          <button type="button" role="tab" aria-selected={avec} onClick={() => choisir(true)}>Par défaut</button>
          <button type="button" role="tab" aria-selected={!avec} onClick={() => choisir(false)}>🔨 À construire</button>
        </div>
      )}
      {message && <span>{message}</span>}
      {o && (
        <button type="button" onClick={() => setAide(o)} style={{ marginLeft: "auto", border: "none", background: "none", padding: "4px 2px", font: "inherit", fontSize: 13.5, fontWeight: 700, color: "var(--accent)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
          ❓ {o?.libelleVoir || "Voir les modèles"} {avec ? "par défaut" : "à construire"}
        </button>
      )}
      {aide && <AideOutil outil={aide} fermer={() => setAide(null)} />}
    </div>
  );
}

// --- Un graphique de courbes spectrales (380 à 780 nm), avec légende et téléchargement CSV ---
// Axe des abscisses : par défaut les longueurs d'onde (380 à 780 nm) ; un graphique peut en donner un autre (g.axeX, g.abscisses).
const AXE_SPECTRAL = { titre: "Longueur d'onde λ (nm)", min: 380, max: 780, graduations: [400, 450, 500, 550, 600, 650, 700, 750] };
const abscissesDe = (g) => g.abscisses || g.longueurs;
// Pas « rond » des graduations (1, 2 ou 5 × 10ⁿ), pour les graphiques qui ont leur propre axe.
const pasRond = (max) => { const b = 10 ** Math.floor(Math.log10(max / 4)), r = max / 4 / b; return (r >= 5 ? 5 : r >= 2 ? 2 : 1) * b; };
// Deux courbes comparées (paire métamère) : où elles se croisent, la plus grande zone où elles diffèrent beaucoup,
// et la plus grande zone où elles sont quasi identiques.
function comparerCourbes(g, X) {
  const [a, b] = g.series; if (!a || !b) return null;
  const xs = a.x || X, d = a.valeurs.map((v, i) => b.valeurs[i] - v);
  const croisements = []; let dernier = -1;
  d.forEach((v, i) => {
    if (Math.abs(v) < 0.01) return;
    if (dernier >= 0 && Math.sign(v) !== Math.sign(d[dernier])) {
      const t = d[dernier] / (d[dernier] - v), l = xs[dernier] + t * (xs[i] - xs[dernier]);
      croisements.push({ l, v: a.valeurs[dernier] + t * (a.valeurs[i] - a.valeurs[dernier]) });
    }
    dernier = i;
  });
  const plusGrande = (test) => {
    let best = null, debut = null;
    d.forEach((v, i) => {
      if (test(Math.abs(v))) { if (debut === null) debut = i; }
      if ((!test(Math.abs(v)) || i === d.length - 1) && debut !== null) {
        const fin = test(Math.abs(v)) ? i : i - 1;
        if (!best || xs[fin] - xs[debut] > best.a - best.de) best = { de: xs[debut], a: xs[fin] };
        debut = null;
      }
    });
    return best;
  };
  const tresDiff = plusGrande((e) => e > 0.2);
  // Quasi identiques : toute la zone du début du spectre jusqu'à la dernière intersection (les courbes s'y compensent).
  const finCroise = croisements.length ? croisements[croisements.length - 1].l : null;
  const proches = finCroise !== null ? [{ type: "proches", de: xs[0], a: tresDiff ? Math.min(finCroise + 4, tresDiff.de) : finCroise + 4 }] : [];
  return { croisements, zones: [...(tresDiff ? [{ type: "differentes", ...tresDiff }] : []), ...proches] };
}

function Graphique({ g, ouvert = false, prefixe = "colorimetrie" }) {
  const L = 560, H = 220, mg = { g: 58, d: 10, h: 10, b: 32 };
  const ax = g.axeX || AXE_SPECTRAL, X = abscissesDe(g);
  const max = Math.max(...g.series.flatMap((s) => s.valeurs)) * 1.05, min = Math.min(0, ...g.series.flatMap((s) => s.valeurs));
  const x = (l) => mg.g + ((l - ax.min) / (ax.max - ax.min)) * (L - mg.g - mg.d);
  const y = (v) => H - mg.b - ((v - min) / (max - min)) * (H - mg.h - mg.b);
  const pas = g.axeX ? pasRond(max || 1) : max > 20 ? 50 : max > 1.2 ? 0.5 : 0.2;
  const graduations = []; for (let v = 0; v <= max; v += pas) graduations.push(Number(v.toFixed(g.axeX ? 6 : 2)));
  const comp = g.comparer ? comparerCourbes(g, X) : null;
  return (
    <details open={ouvert || undefined} style={{ margin: "10px 0 0", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 12 }}>
      <summary style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", cursor: "pointer", padding: "8px 0", listStyle: "none" }}>
        <span aria-hidden="true" className="ex-fleche" style={{ fontSize: 11, color: "#64748b" }}>▶</span>
        <strong style={{ flex: 1, fontSize: 14.5 }}>{g.titre}</strong>
        {!g.tableau && <button type="button" style={bouton()} onClick={(e) => { e.preventDefault(); e.stopPropagation(); telechargerCSV(`${prefixe}-${g.id}`, [g]); }}>⬇️ CSV</button>}
      </summary>
      <figure style={{ margin: 0, paddingBottom: 8 }}>
      <svg viewBox={`0 0 ${L} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={g.titre}>
        {graduations.map((v) => (
          <g key={v}><line x1={mg.g} x2={L - mg.d} y1={y(v)} y2={y(v)} stroke="#e2e8f0" /><text x={mg.g - 5} y={y(v) + 4} fontSize="10" textAnchor="end" fill="#64748b">{g.axeX ? v.toLocaleString("fr-FR") : String(v).replace(".", ",")}</text></g>
        ))}
        {ax.graduations.map((l) => (
          <text key={l} x={x(l)} y={H - mg.b + 14} fontSize="10" textAnchor="middle" fill="#64748b">{l}</text>
        ))}
        <line x1={mg.g} x2={mg.g} y1={mg.h} y2={H - mg.b} stroke="#475569" />
        <line x1={mg.g} x2={L - mg.d} y1={y(0)} y2={y(0)} stroke="#475569" />
        <text x={(mg.g + L - mg.d) / 2} y={H - 3} fontSize="11" textAnchor="middle" fill="#334155" fontWeight="700">{ax.titre}</text>
        <text transform={`translate(13 ${(mg.h + H - mg.b) / 2}) rotate(-90)`} fontSize="11" textAnchor="middle" fill="#334155" fontWeight="700">{g.unite.charAt(0).toUpperCase() + g.unite.slice(1)}</text>
        {comp && comp.zones.map((z, k) => (
          <g key={k}>
            <rect x={x(z.de)} y={mg.h} width={x(z.a) - x(z.de)} height={H - mg.b - mg.h} fill={z.type === "differentes" ? "rgba(220,38,38,.12)" : "rgba(22,163,74,.13)"} />
            <text x={(x(z.de) + x(z.a)) / 2} y={mg.h + 11} fontSize="10" fontWeight="800" textAnchor="middle" fill={z.type === "differentes" ? "#b91c1c" : "#15803d"}>{z.type === "differentes" ? "très différentes" : "quasi identiques"}</text>
          </g>
        ))}
        {g.series.map((s) => (
          <polyline key={s.nom} fill="none" stroke={s.couleur} strokeWidth="2.2" strokeDasharray={s.tirets ? "6 4" : undefined}
            points={s.valeurs.map((v, i) => `${x((s.x || X)[i]).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} />
        ))}
        {comp && comp.croisements.map((c, k) => (
          <g key={k}>
            <circle cx={x(c.l)} cy={y(c.v)} r="7" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx={x(c.l) + 9} cy={y(c.v) - 10} r="7" fill="#f59e0b" />
            <text x={x(c.l) + 9} y={y(c.v) - 6.5} fontSize="9.5" fontWeight="800" textAnchor="middle" fill="#1f1300">{k + 1}</text>
          </g>
        ))}
      </svg>
      <figcaption style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
        <span style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 2 }}>
          {g.series.map((s) => <span key={s.nom}><span style={{ display: "inline-block", width: 16, height: 3, background: s.couleur, verticalAlign: "middle", marginRight: 4 }} />{s.nom}</span>)}
        </span>
        {comp && (
          <span style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "2px 0 4px", fontWeight: 700 }}>
            <span><span style={{ color: "#f59e0b" }}>●</span> {comp.croisements.length} intersection{comp.croisements.length > 1 ? "s" : ""} (vers {comp.croisements.map((c) => Math.round(c.l)).join(", ")} nm)</span>
            {comp.zones.filter((z) => z.type === "differentes").map((z) => <span key="d"><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, verticalAlign: "-1px", marginRight: 4, background: "rgba(220,38,38,.35)" }} />Très différentes : {Math.round(z.de)} à {Math.round(z.a)} nm</span>)}
            {comp.zones.some((z) => z.type === "proches") && <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, verticalAlign: "-1px", marginRight: 4, background: "rgba(22,163,74,.35)" }} />Quasi identiques : {Math.round(comp.zones.find((z) => z.type === "proches").de)} à {Math.round(comp.zones.find((z) => z.type === "proches").a)} nm</span>}
          </span>
        )}
        {g.explication}
      </figcaption>
      </figure>
      {g.tableau && (
        <div style={{ margin: "4px 0 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 6px" }}>
            <strong style={{ flex: 1, fontSize: 14 }}>📋 Les valeurs ({X.length} lignes)</strong>
            <button type="button" style={bouton()} onClick={() => telechargerCSV(`${prefixe}-${g.id}`, [g])}>⬇️ CSV</button>
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
              <thead>
                <tr>
                  <th style={{ position: "sticky", top: 0, background: "#f1f5f9", textAlign: "left", padding: "5px 10px", borderBottom: "1px solid #cbd5e1" }}>{(g.axeX || AXE_SPECTRAL).titre}</th>
                  {g.series.map((s) => <th key={s.nom} style={{ position: "sticky", top: 0, background: "#f1f5f9", textAlign: "right", padding: "5px 10px", borderBottom: "1px solid #cbd5e1", color: s.couleur }}>{s.nom}</th>)}
                </tr>
              </thead>
              <tbody>
                {X.map((l, i) => (
                  <tr key={l} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: "3px 10px" }}>{l}</td>
                    {g.series.map((s) => <td key={s.nom} style={{ padding: "3px 10px", textAlign: "right" }}>{Number(s.valeurs[i]).toFixed(4).replace(".", ",")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </details>
  );
}

// Télécharge un ou plusieurs graphiques en CSV (séparateur « ; », virgule décimale : s'ouvre tel quel dans Excel en français).
function telechargerCSV(nom, graphiques) {
  // Graphiques aux abscisses différentes : un bloc par graphique, séparés par une ligne vide.
  if (graphiques.some((g) => abscissesDe(g) !== abscissesDe(graphiques[0]))) {
    return enregistrerCSV(nom, graphiques.map((g) => csvDe([g])).join("\n\n"));
  }
  enregistrerCSV(nom, csvDe(graphiques));
}
function csvDe(graphiques) {
  const L = abscissesDe(graphiques[0]);
  const tete = [graphiques[0].axeX ? graphiques[0].axeX.titre : "longueur d'onde (nm)", ...graphiques.flatMap((g) => g.series.map((s) => `${g.id} : ${s.nom}`))];
  const lignes = L.map((l, i) => [String(l).replace(".", ","), ...graphiques.flatMap((g) => g.series.map((s) => s.valeurs[i].toPrecision(6).replace(".", ",")))].join(";"));
  return [tete.join(";"), ...lignes].join("\n");
}
function enregistrerCSV(nom, texte) {
  const blob = new Blob(["\ufeff" + texte], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `${nom}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// --- Fenêtre « 📈 Voir … » d'une étape : les courbes du modèle couleur choisi (par défaut ou construit) ---
// Contrôle automatique d'une paire publiée : au moins 3 croisements, écart surtout dans le rouge.
function explicationPaire(series, outil) {
  const base = "Les courbes actuelles de ta simulation : elles changent quand tu choisis une autre couleur.";
  if (series.length < 2 || !outil.controlePaire) return base;
  const c = outil.controlePaire(series[0].valeurs, series[1].valeurs);
  return `${base} Contrôle : ${c.croisements} croisement${c.croisements > 1 ? "s" : ""} ${c.croisements >= 3 ? "✅" : "❌ (il en faut au moins 3)"} · plus grand écart à ${c.pic} nm ${c.rouge ? "✅ dans le rouge" : "❌ (il doit être dans le rouge, 600 à 700 nm)"}.`;
}

function FenetreGraphiques({ outil, ids, fermer }) {
  const boite = useRef(null);
  const [donnees, setDonnees] = useState(outil.donnees ? outil.donnees() : "chargement");
  useEffect(() => {
    const echap = (e) => { if (e.key === "Escape") fermer(); };
    document.addEventListener("keydown", echap);
    return () => document.removeEventListener("keydown", echap);
  }, [fermer]);
  useEffect(() => {
    if (outil.donnees || !outil.charger) return;
    outil.charger().then((m) => setDonnees(m ? outil.donneesDe(m) || "erreur" : "absent")).catch(() => setDonnees("erreur"));
  }, [outil]);
  // Les réflectances : celles que la simulation a publiées (ses cartes actuelles), sinon l'exemple du modèle.
  const publiees = courbesPubliees();
  const liste = (Array.isArray(donnees) ? donnees.filter((g) => ids.includes(g.id)) : []).map((g) => outil.avecPubliees ? outil.avecPubliees(g, publiees) : (g.id === "paire-metamere" && publiees && !publiees.some((s) => s.x)
    ? { ...g, titre: "🎨 Réflectances spectrales de tes deux cartes", series: publiees.map((c, i) => ({ ...c, tirets: i > 0 })), explication: explicationPaire(publiees, outil) }
    : g.id === "paire-metamere" ? { ...g, explication: `${g.explication} (Exemple tiré des modèles : ta simulation ne montre pas encore ses propres cartes ici.)` } : g));
  return createPortal(
    <div onPointerDown={(e) => { if (boite.current && !boite.current.contains(e.target)) fermer(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10050, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div ref={boite} role="dialog" aria-label={`Courbes : ${(outil.nomModele || "Modèles couleur").toLowerCase()}`}
        style={{ background: "#fff", borderRadius: 18, width: "min(760px, 100%)", maxHeight: "calc(100vh - 28px)", overflowY: "auto", padding: "18px 20px", boxShadow: "0 20px 40px rgba(0,0,0,.25)", fontSize: 14.5, lineHeight: 1.6, color: "#0f172a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ fontSize: 18, flex: 1 }}>📈 {outil.donnees ? (outil.titreDefautCourt || "Modèles par défaut") : (outil.nomPerso || "Tes modèles couleur")}</strong>
          <button type="button" onClick={fermer} aria-label="Fermer" style={{ border: "none", background: "#f1f5f9", borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 15 }}>✕</button>
        </div>
        {donnees === "chargement" && <p>⏳ Lecture de tes modèles…</p>}
        {donnees === "absent" && <p>📭 Tes modèles n'existent pas encore : fais l'étape 0.</p>}
        {donnees === "erreur" && <p>⚠️ Tes modèles contiennent une erreur : demande à l'agent de la corriger.</p>}
        {liste.map((g) => <Graphique key={g.id} g={g} ouvert prefixe={outil.prefixeCSV} />)}
      </div>
    </div>,
    document.body,
  );
}

// --- « 📄 PDF » : télécharge un VRAI fichier PDF lisible (modèles, équations, limites, courbes) ---
// Fabriqué dans la page (html2pdf.js, chargé seulement au clic) : pas besoin de la fenêtre d'impression.
async function telechargerPDF(outil, equations, boite, setEtat) {
  const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const courbes = boite ? [...boite.querySelectorAll("figure")].map((f) => {
    const titre = f.closest("details")?.querySelector("summary strong")?.textContent || "";
    const svg = f.querySelector("svg")?.outerHTML || "";
    const legende = f.querySelector("figcaption")?.innerText || "";
    return `<section style="break-inside:avoid;page-break-inside:avoid"><h3>${esc(titre)}</h3>${svg}<p class="petit">${esc(legende)}</p></section>`;
  }).join("") : "";
  const doc = document.createElement("div");
  doc.style.cssText = "position:fixed;left:-10000px;top:0;width:720px;background:#fff";
  doc.innerHTML = `<style>
    .pdf{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#0f172a;line-height:1.5;font-size:13px;padding:4px}
    .pdf h1{font-size:21px;margin:0 0 8px} .pdf h2{font-size:16px;margin:18px 0 6px;border-bottom:2px solid #e2e8f0;padding-bottom:3px} .pdf h3{font-size:13.5px;margin:10px 0 4px}
    .pdf .formules{font-family:"Cambria Math","STIX Two Math",Georgia,serif;font-size:14.5px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;margin:4px 0}
    .pdf .petit{font-size:11.5px;color:#475569;margin:2px 0 6px} .pdf .limites{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:6px 10px}
    .pdf svg{width:100%;height:auto} .pdf .bloc{break-inside:avoid;page-break-inside:avoid}
  </style><div class="pdf">
  <h1>🧰 ${esc(outil.titre || outil.nom)}</h1>
  <p>${esc(outil.resume)}</p>
  <ul>${(outil.contenu || []).map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
  ${outil.limites ? `<p class="limites">⚠️ <strong>Les limites des modèles :</strong> ${esc(outil.limites)}</p>` : ""}
  ${equations?.length ? `<h2>🧮 Les équations</h2>${equations.map((q) => `<div class="bloc"><h3>${esc(q.titre)}</h3><div class="formules">${q.formules.map((f) => `<div>${esc(f)}</div>`).join("")}</div>${q.note ? `<p class="petit">${esc(q.note)}</p>` : ""}</div>`).join("")}` : ""}
  ${courbes ? `<h2>📈 Les courbes</h2>${courbes}` : ""}
  </div>`;
  document.body.appendChild(doc);
  try {
    setEtat("⏳");
    const { default: html2pdf } = await import("html2pdf.js");
    const nom = (outil.titre || "modeles").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    await html2pdf().set({
      margin: 10, filename: `${nom}.pdf`, image: { type: "jpeg", quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff" }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: [".bloc", "section"] },
    }).from(doc.querySelector(".pdf")).save();
    setEtat("");
  } catch (e) { setEtat(`⚠️ ${e.message}`); }
  finally { doc.remove(); }
}

function AideOutil({ outil, fermer }) {
  const boite = useRef(null);
  const [etatPDF, setEtatPDF] = useState("");
  // Modèle fourni : données tout de suite. Modèle construit : on charge le fichier (s'il existe) et on le vérifie.
  const [perso, setPerso] = useState(outil.charger ? "chargement" : null);
  useEffect(() => {
    if (!outil.charger) return;
    outil.charger().then((m) => setPerso(m || "absent")).catch(() => setPerso("erreur"));
  }, [outil]);
  const modele = perso && typeof perso === "object" ? perso : null;
  const donnees = outil.donnees ? outil.donnees() : modele && outil.donneesDe ? outil.donneesDe(modele) : null;
  const verifs = modele && outil.verifier ? outil.verifier(modele) : null;
  // Équations : celles des modèles par défaut, ou celles que la personne a fait écrire dans SES modèles (rien sinon).
  const equations = outil.equations || (modele && Array.isArray(modele.EQUATIONS) ? modele.EQUATIONS : null);
  // Des onglets plutôt qu'une longue page : les modèles, les équations, les données (un sous-onglet par graphique).
  const [onglet, setOnglet] = useState("modeles");
  const [graphe, setGraphe] = useState(0);
  const onglets = [["modeles", "📋 Les modèles"], ...(equations ? [["equations", "🧮 Les équations"]] : []), ...(donnees?.length ? [["donnees", "📈 Les données"]] : [])];
  useEffect(() => {
    const echap = (e) => { if (e.key === "Escape") fermer(); };
    document.addEventListener("keydown", echap);
    return () => document.removeEventListener("keydown", echap);
  }, [fermer]);
  return createPortal(
    <div onPointerDown={(e) => { if (boite.current && !boite.current.contains(e.target)) fermer(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10050, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div ref={boite} role="dialog" aria-label={outil.titre || outil.nom}
        style={{ background: "#fff", borderRadius: 18, width: outil.donnees || outil.charger ? "min(760px, 100%)" : "min(520px, 100%)", maxHeight: "calc(100vh - 28px)", overflowY: "auto",
          // Même taille pour tous les onglets : la fenêtre ne saute pas quand on change d'onglet.
          ...(equations || donnees ? { height: "min(700px, calc(100vh - 28px))" } : {}), padding: "18px 20px", boxShadow: "0 20px 40px rgba(0,0,0,.25)", fontSize: 14.5, lineHeight: 1.6, color: "#0f172a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ fontSize: 18, flex: 1 }}>🧰 {(verifs && outil.titreComplet && verifs.every((v) => v.ok) ? outil.titreComplet : outil.titre) || outil.nom}</strong>
          <button type="button" onClick={fermer} aria-label="Fermer" style={{ border: "none", background: "#f1f5f9", borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 15 }}>✕</button>
        </div>
        <style>{`
          .ao-onglets { display:flex; gap:4px; flex-wrap:wrap; margin:12px 0 4px; border-bottom:2px solid #e2e8f0; position:sticky; top:-18px; z-index:3; background:#fff; padding-top:6px; }
          .ao-onglets button { border:none; background:none; font:inherit; font-weight:800; font-size:14.5px; color:#64748b; padding:8px 12px; cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-2px; }
          .ao-onglets button[aria-selected="true"] { color:#0f172a; border-bottom-color:var(--accent, #2563eb); }
          .ao-sous { display:flex; gap:6px; flex-wrap:wrap; margin:10px 0 0; }
          .ao-sous button { border:1px solid #cbd5e1; background:#fff; border-radius:99px; padding:5px 12px; font:inherit; font-size:13px; font-weight:700; color:#334155; cursor:pointer; }
          .ao-sous button[aria-pressed="true"] { background:#0f172a; color:#fff; border-color:#0f172a; }
          .ao-graphe summary { pointer-events:none; } .ao-graphe summary button { pointer-events:auto; } .ao-graphe .ex-fleche { display:none; }
        `}</style>
        {onglets.length > 1 && (
          <div role="tablist" className="ao-onglets">
            {onglets.map(([id, nom]) => <button key={id} type="button" role="tab" aria-selected={onglet === id} onClick={() => setOnglet(id)}>{nom}</button>)}
          </div>
        )}
        {onglet === "modeles" && <>
        <p style={{ margin: "10px 0 6px" }}>{outil.resume}</p>
        {verifs ? (
          <ul style={{ margin: "0 0 10px", padding: 0, listStyle: "none", display: "grid", gap: 3 }}>
            {verifs.map((v) => <li key={v.texte}>{v.ok ? "✅" : "❌"} {v.texte}</li>)}
          </ul>
        ) : (
          <ul style={{ margin: "0 0 10px", paddingLeft: 20 }}>{outil.contenu.map((l, i) => <li key={i}>{l}</li>)}</ul>
        )}
        {perso === "chargement" && <p style={{ margin: "0 0 10px" }}>⏳ Lecture de tes modèles…</p>}
        {perso === "absent" && <p style={{ margin: "0 0 10px", padding: "8px 12px", background: "#f1f5f9", borderRadius: 10 }}>📭 <strong>Tes modèles n'existent pas encore.</strong> Fais l'étape 0 : ses éléments apparaîtront ici, vérifiés un par un, avec leurs courbes.</p>}
        {perso === "erreur" && <p style={{ margin: "0 0 10px", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10 }}>⚠️ <strong>Tes modèles contiennent une erreur</strong> et ne peuvent pas être lus. Demande à l'agent de la corriger.</p>}
        {outil.limites && <p style={{ margin: "0 0 10px", padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>⚠️ <strong>Les limites des modèles :</strong> {outil.limites}</p>}
        {outil.conseil && <p style={{ margin: 0, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10 }}>💡 {outil.conseil}</p>}
        {outil.chemin && <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "#64748b" }}>📁 Pour les curieux : {outil.nomModele && !/s$/.test(outil.nomModele.split(" ")[0]) ? "le modèle est" : "les modèles sont"} dans le fichier <code>{outil.chemin}</code>.</p>}
        </>}
        {onglet === "equations" && equations && (
          <div style={{ margin: "12px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "4px 0 10px" }}>
              <strong style={{ flex: 1, fontSize: 14.5 }}>🧮 {outil.equations ? (outil.titreEquations || "Les modèles mathématiques : de la réflectance à la couleur") : "Les équations de tes modèles"}</strong>
              <button type="button" style={bouton()} onClick={(e) => { e.preventDefault(); e.stopPropagation(); telechargerPDF(outil, equations, boite.current, setEtatPDF); }}>{etatPDF || "📄 PDF"}</button>
              {outil.code && <button type="button" style={bouton()} title="Le code des modèles, à redonner à l'agent" onClick={async (e) => {
                e.preventDefault(); e.stopPropagation();
                const texte = await outil.code.lire();
                if (!texte) return;
                const lien = document.createElement("a");
                lien.href = URL.createObjectURL(new Blob([texte], { type: "text/javascript;charset=utf-8" }));
                lien.download = outil.code.nom; lien.click();
                setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
              }}>⬇️ JS</button>}
            </div>
            <div style={{ display: "grid", gap: 10, paddingBottom: 10 }}>
              {equations.map((q) => (
                <div key={q.titre}>
                  <strong style={{ fontSize: 14 }}>{q.titre}</strong>
                  <div style={{ margin: "4px 0", padding: "6px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontFamily: "'Cambria Math', 'STIX Two Math', Georgia, serif", fontSize: 15, lineHeight: 1.7 }}>
                    {q.formules.map((f) => <div key={f}>{f}</div>)}
                  </div>
                  <span style={{ fontSize: 12.5, color: "#475569" }}>{q.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {onglet === "donnees" && donnees && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "14px 0 4px" }}>
              <strong style={{ flex: 1 }}>{outil.titreDonnees || "Les données des modèles (380 à 780 nm, pas de 5 nm)"}</strong>
              <button type="button" style={bouton()} onClick={() => telechargerCSV(`${outil.prefixeCSV || "colorimetrie"}-toutes-les-donnees`, donnees)}>⬇️ Tout télécharger (CSV)</button>
            </div>
            <div className="ao-sous">
              {donnees.map((g, k) => <button key={g.id} type="button" aria-pressed={graphe === k} onClick={() => setGraphe(k)}>{g.onglet || g.titre.replace(/\s*\(.*\)\s*$/, "")}</button>)}
            </div>
            {donnees[graphe] && <div className="ao-graphe" key={donnees[graphe].id}><Graphique g={donnees[graphe]} ouvert prefixe={outil.prefixeCSV} /></div>}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

// --- Contrôle EN DIRECT : à la lumière du jour, les deux cartes doivent avoir exactement la même couleur ---
function ControleJour({ outil }) {
  const series = useCourbesPubliees();
  if (!series || series.length < 2 || !outil?.ecartJour || series.some((s) => s.x)) return null; // pas les courbes d'un autre exercice
  const dE = outil.ecartJour(series[0].valeurs, series[1].valeurs);
  if (!Number.isFinite(dE)) return null;
  const ok = dE < 0.5;
  return (
    <div role="status" style={{ padding: "8px 12px", borderRadius: 10, fontSize: 14.5, lineHeight: 1.5,
      background: ok ? "#f0fdf4" : "#fef2f2", border: `2px solid ${ok ? "#22c55e" : "#ef4444"}` }}>
      {ok
        ? <>✅ <strong>Sur la table (lumière du jour, D65), les deux cartes ont la même couleur</strong> (ΔE*ab = {dE.toFixed(1).replace(".", ",")}). C'est bien une paire métamère.</>
        : <>❌ <strong>Sur la table (lumière du jour, D65), les deux cartes n'ont PAS la même couleur</strong> (ΔE*ab = {dE.toFixed(1).replace(".", ",")}). Ce n'est pas une paire métamère : la carte 2 doit être recalculée.</>}
    </div>
  );
}

// --- Contrôle EN DIRECT fourni par le modèle (outil.controleDirect(courbes) → null | { ok, titre, detail }) ---
function ControleDirect({ outil }) {
  const series = useCourbesPubliees();
  const c = series ? outil.controleDirect(series) : null;
  if (!c) return null;
  return (
    <div role="status" style={{ padding: "8px 12px", borderRadius: 10, fontSize: 14.5, lineHeight: 1.5,
      background: c.ok ? "#f0fdf4" : "#fef2f2", border: `2px solid ${c.ok ? "#22c55e" : "#ef4444"}` }}>
      {c.ok ? "✅" : "❌"} <strong>{c.titre}</strong> {c.detail}
    </div>
  );
}

// --- Une étape du parcours guidé : section repliable ---
function Etape({ page, numero, etape, ouverte, basculer, faite, parIA, verrouillee, cocher, precedente, outil, controle, bloquee }) {
  const [voirCourbes, setVoirCourbes] = useState(false);
  const [indices, setIndices] = useState(() => lire(`${page}.indices.${numero}`, 0));
  const [voirProposition, setVoirProposition] = useState(false);
  const [copie, copier] = useCopie();
  const plusUn = () => { const v = Math.min(etape.indices.length, indices + 1); setIndices(v); ecrire(`${page}.indices.${numero}`, v); };
  const fini = indices >= etape.indices.length;
  return (
    <details open={ouverte && !verrouillee} onToggle={(e) => { if (!verrouillee && e.currentTarget.open !== ouverte) basculer(); }}
      style={{ background: verrouillee ? "#f1f5f9" : ouverte ? "color-mix(in srgb, var(--accent) 7%, #fff)" : "#fff",
        border: ouverte && !verrouillee ? "2px solid var(--accent)" : `1px solid ${faite ? "#86efac" : "#d5dfeb"}`,
        boxShadow: ouverte && !verrouillee ? "0 2px 10px color-mix(in srgb, var(--accent) 22%, transparent)" : "none",
        borderRadius: 12, padding: ouverte && !verrouillee ? "0 13px" : "0 14px", opacity: verrouillee ? 0.65 : 1, transition: "background .2s, box-shadow .2s" }}>
      <summary onClick={(e) => { if (verrouillee) e.preventDefault(); }} aria-disabled={verrouillee || undefined}
        title={verrouillee ? `Coche d'abord « Étape terminée » à l'étape ${precedente}` : undefined}
        style={{ cursor: verrouillee ? "not-allowed" : "pointer", padding: "11px 0", fontWeight: 800, fontSize: 15.5, color: ouverte && !verrouillee ? "var(--accent)" : undefined, display: "flex", gap: 8, alignItems: "center", listStyle: "none" }}>
        <span aria-hidden="true" style={{ fontSize: 11, color: "#64748b", width: 12 }}>{verrouillee ? "" : ouverte ? "▼" : "▶"}</span>
        <span style={{ flex: 1 }}>{numero}. {etape.titre}</span>
        {faite && <span style={{ fontSize: 12.5, color: "#15803d", background: "#dcfce7", borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap" }}>{parIA ? "✅ validée par l'IA" : "✅ terminée"}</span>}
        {bloquee && controle && controle !== "absent" && <span style={{ fontSize: 12.5, color: "#b91c1c", background: "#fee2e2", borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap" }}>❌ modèles à corriger</span>}
        {verrouillee && <span style={{ fontSize: 12.5, color: "#64748b", whiteSpace: "nowrap" }}>🔒 termine l'étape {precedente}</span>}
      </summary>
      <div style={{ paddingBottom: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: 15 }}>✍️ <strong>{etape.consigne}</strong></p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" style={{ ...bouton(), opacity: fini ? 0.5 : 1 }} disabled={fini} onClick={plusUn}>💡 {indices === 0 ? "Un indice" : fini ? "Plus d'indice" : "Un autre indice"}</button>
          <button type="button" style={bouton()} onClick={() => setVoirProposition((v) => !v)}>{voirProposition ? "🙈 Cacher la proposition" : "👀 Proposition de réponse"}</button>
          {etape.graphiques && outil && <button type="button" style={bouton()} onClick={() => setVoirCourbes(true)}>{etape.boutonGraphiques || "📈 Voir les distributions spectrales"}</button>}
        </div>
        {indices > 0 && (
          <ol style={{ margin: "10px 0 0", padding: "8px 12px 8px 30px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, lineHeight: 1.55, fontSize: 14 }}>
            {etape.indices.slice(0, indices).map((t, i) => <li key={i} style={{ margin: "3px 0" }}>{t}</li>)}
          </ol>
        )}
        {voirProposition && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10 }}>
            <strong style={{ fontSize: 13.5 }}>Une proposition (il y en a d'autres de justes) :</strong>
            <p style={{ margin: "6px 0 8px", fontSize: 14, lineHeight: 1.55 }}>{etape.proposition}</p>
            <button type="button" style={bouton()} onClick={() => copier("p", etape.proposition)}>{copie === "p" ? "✓ Copié !" : "📋 Copier la proposition"}</button>
          </div>
        )}
        {voirCourbes && <FenetreGraphiques outil={outil} ids={etape.graphiques} fermer={() => setVoirCourbes(false)} />}
        {controle && controle !== "absent" && (
          <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 10, fontSize: 14, background: bloquee ? "#fef2f2" : "#f0fdf4", border: `1px solid ${bloquee ? "#fecaca" : "#bbf7d0"}` }}>
            <strong>🔎 Contrôle automatique de tes modèles</strong>
            {controle === "erreur" && <div>⚠️ Les modèles contiennent une erreur et ne peuvent pas être lus.</div>}
            {Array.isArray(controle) && (
              <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 2 }}>
                {controle.map((v) => <li key={v.texte}>{v.ok ? "✅" : "❌"} {v.texte}</li>)}
              </ul>
            )}
            {bloquee && Array.isArray(controle) && <div style={{ marginTop: 4, fontWeight: 700 }}>Tant qu'une ligne est ❌, l'étape n'est pas terminée : demande à l'IA de corriger ses modèles.</div>}
          </div>
        )}
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontSize: 14.5, fontWeight: 700,
          background: faite ? "#dcfce7" : "#f8fafc", border: `2px ${faite ? "solid #22c55e" : "dashed #94a3b8"}` }}>
          <input type="checkbox" checked={faite} disabled={parIA || bloquee} onChange={cocher} style={{ width: 18, height: 18, accentColor: "#16a34a", cursor: parIA ? "default" : "pointer" }} />
          {parIA ? "✅ Étape validée par l'IA : le résultat marche dans la simulation" : <>✅ Étape terminée : le résultat marche dans la simulation{faite ? "" : " (ouvre l'étape suivante)"}</>}
        </label>
      </div>
    </details>
  );
}

function ExplorationLibre({ idees }) {
  const [copie, copier] = useCopie();
  return (
    <div>
      <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.55 }}>🧪 <strong>Pas d'étapes :</strong> demande à l'agent, dans Antigravity, ce que tu veux ajouter ou changer dans cette page. Il le fait directement, puis te dit ce qu'il a fait et comment rendre ta demande plus précise.</p>
      <p style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 14.5 }}>💡 Besoin d'une idée ?</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
        {idees.map((idee, i) => {
          const texte = `${idee.charAt(0).toUpperCase() + idee.slice(1)}.`;
          return (
            <li key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 14, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 10px" }}>
              <span style={{ flex: "1 1 240px" }}>{idee.charAt(0).toUpperCase() + idee.slice(1)}.</span>
              <button type="button" style={bouton()} onClick={() => copier(i, texte)}>{copie === i ? "✓ Copié !" : "📋 Copier"}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// --- Sauvegardes (sauver / reprendre) ---
// --- Les versions enregistrées (page + modèle construit) : liste et reprise ---
function ListeVersions({ page, modele }) {
  const [liste, setListe] = useState(null);
  const [confirmer, setConfirmer] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => { fetch(`__atelier/versions?page=${page}`).then((r) => r.json()).then((j) => setListe(j.fichiers || [])).catch(() => setListe([])); }, [page]);
  const reprendre = async (fichier) => {
    if (confirmer !== fichier) return setConfirmer(fichier);
    try { setMessage("⏳ Reprise…"); await appel("restaurer", { page, fichier, modele }); setMessage("✅ Reprise : la page se recharge."); setTimeout(() => window.location.reload(), 1200); }
    catch (e) { setMessage(`⚠️ ${e.message}`); }
  };
  const lisible = (f) => f.replace(/\.jsx$/, "").replace(/^(\d{4})-(\d\d)-(\d\d)_(\d\d)h(\d\d)-\d\d-?/, "$3/$2/$1 à $4h$5 · ").replace(/-/g, " ");
  if (!liste) return <p style={{ margin: "8px 0 0", fontSize: 13.5 }}>⏳</p>;
  return (
    <div style={{ marginTop: 10 }}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6, maxHeight: 240, overflowY: "auto" }}>
        {liste.length === 0 && <li style={{ fontSize: 13.5, color: "#64748b" }}>Aucune version enregistrée.</li>}
        {liste.map((f) => (
          <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13.5 }}>
            <span style={{ flex: 1, minWidth: 0 }}>{lisible(f)}</span>
            <button type="button" style={bouton()} onClick={() => reprendre(f)}>{confirmer === f ? "⚠️ Confirmer" : "Reprendre"}</button>
          </li>
        ))}
      </ul>
      {message && <p style={{ margin: "8px 0 0", fontSize: 13.5 }}>{message}</p>}
    </div>
  );
}

// --- « Tout recommencer » : une question, enregistrer ou non la version actuelle ---
function ToutRecommencer({ page, fermer, remiseAZero, modele }) {
  const [etat, setEtat] = useState("");
  const [versions, setVersions] = useState(false);
  const boite = useRef(null);
  useEffect(() => {
    const echap = (e) => { if (e.key === "Escape") fermer(); };
    document.addEventListener("keydown", echap);
    return () => document.removeEventListener("keydown", echap);
  }, [fermer]);
  const recommencer = async (garder) => {
    try {
      setEtat("⏳");
      remiseAZero();
      await appel("zero", { page, modele, garder });
      setEtat("✅ C'est reparti. Ouvre une nouvelle conversation dans Antigravity.");
      setTimeout(() => window.location.reload(), 1200); // recharge complète : rien ne reste de l'ancienne version
    } catch (e) { setEtat(`⚠️ ${e.message}`); }
  };
  return (
    <div onPointerDown={(e) => { if (boite.current && !boite.current.contains(e.target)) fermer(); }}
      style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div ref={boite} role="dialog" aria-label="Tout recommencer"
        style={{ background: "#fff", borderRadius: 18, width: "min(440px, 100%)", padding: "18px 20px", boxShadow: "0 20px 40px rgba(0,0,0,.25)", fontSize: 14.5 }}>
        <strong style={{ fontSize: 18 }}>↺ Tout recommencer ?</strong>
        <p style={{ margin: "8px 0 12px" }}>Enregistrer d'abord la version actuelle ?</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={{ ...bouton(), background: "var(--accent)", color: "#fff", boxShadow: "none" }} onClick={() => recommencer(true)}>💾 Oui, enregistrer</button>
          <button type="button" style={bouton("danger")} onClick={() => recommencer(false)}>Non</button>
          <button type="button" style={bouton()} onClick={fermer}>Annuler</button>
        </div>
        {etat && <p style={{ margin: "10px 0 0" }}>{etat}</p>}
        <button type="button" onClick={() => setVersions((v) => !v)}
          style={{ marginTop: 12, border: "none", background: "none", padding: 0, font: "inherit", fontSize: 13, color: "#64748b", cursor: "pointer", textDecoration: "underline" }}>
          {versions ? "Fermer" : "📂 Reprendre une version enregistrée"}
        </button>
        {versions && <ListeVersions page={page} modele={modele} />}
      </div>
    </div>
  );
}

// --- Le cadre complet ---

// --- Vue « atelier » (page …/?atelier=<id>) : d'abord le choix du mode, puis une page de progression de l'atelier ---
// Même principe que la page de progression de l'installation : une barre d'étapes, seule l'étape en cours est affichée,
// un clic sur un rond vert réaffiche une étape passée. Étapes : 1. l'état actuel de la page, 2. les modèles de la
// simulation, puis les étapes de construction de l'exercice (celles du parcours guidé).
function VueAtelier({ page, sujet, mode, choisirMode, etat, liste, faites, cocher, etapeProps, ouvertes, basculer, scene, motsCles, outils, sans, idees, etapes, recommencer }) {
  const [choisi, setChoisi] = useState(() => lire(`${page}.atelierModeChoisi`, false) === true);
  const [intro, setIntro] = useState(() => lire(`${page}.atelierIntro`, []));
  const [revues, setRevues] = useState(() => new Set());
  const [aide, setAide] = useState(null);   // la fenêtre « les modèles déjà installés »
  const choisir = (m) => { choisirMode(m); setChoisi(true); ecrire(`${page}.atelierModeChoisi`, true); };
  const changerDeMode = () => { setChoisi(false); ecrire(`${page}.atelierModeChoisi`, false); };
  const finirIntro = (id) => { const m = [...new Set([...intro, id])]; setIntro(m); ecrire(`${page}.atelierIntro`, m); };
  const nomModele = outils?.[0]?.nomModele || "modèles";

  if (!choisi) return (
    <div className="va">
      <h2 className="va-question">Comment veux-tu construire la simulation du <b>{sujet}</b> ?</h2>
      <div className="va-choix">
        <button type="button" className="va-tuile premier" onClick={() => choisir("guide")}>
          <span className="va-ic" aria-hidden="true">🧭</span><b>Parcours guidé</b><span>Étape par étape : à chaque étape, tu écris ta demande à l'IA, elle la vérifie et l'exécute.</span><em>conseillé pour commencer</em>
        </button>
        <button type="button" className="va-tuile" onClick={() => choisir("libre")}>
          <span className="va-ic" aria-hidden="true">🧪</span><b>Exploration libre</b><span>Pas d'étapes : tu demandes à l'IA ce que tu veux ajouter ou changer.</span>
        </button>
      </div>
    </div>
  );

  if (mode === "libre") return (
    <div className="va">
      <div className="va-tete"><b>🧪 Exploration libre</b><button type="button" className="va-lien" onClick={changerDeMode}>Changer de mode</button></div>
      {scene}
      <div className="va-carte-claire"><ExplorationLibre idees={idees} /></div>
      {motsCles}
    </div>
  );

  // Parcours guidé : les étapes de l'atelier
  const toutes = [
    { id: "etat", titre: "L'état actuel de la page", fait: intro.includes("etat") },
    { id: "modeles", titre: "Les modèles de la simulation", fait: intro.includes("modeles") },
    ...liste.map(({ num, etape }) => ({ id: `e${num}`, num, etape, titre: etape.titre, fait: faites.includes(num) })),
  ];
  const ici = toutes.findIndex((e) => !e.fait);
  const basculerRevue = (id) => setRevues((r) => { const n = new Set(r); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const visibles = toutes.map((e, i) => ({ e, i })).filter(({ e, i }) => i === ici || (e.fait && revues.has(e.id))).reverse();

  const contenu = (e) => {
    if (e.id === "etat") return (
      <>
        <p className="va-texte">Avant de demander quoi que ce soit à l'IA, <b>regarde ce que fait la page maintenant</b> : c'est ton point de départ.</p>
        <div className="va-carte-claire"><EtatActuel etat={etat} /></div>
        {scene}
        {!e.fait && <button type="button" className="va-suivant" onClick={() => finirIntro("etat")}>J'ai regardé, étape suivante ›</button>}
      </>
    );
    if (e.id === "modeles") return (
      <>
        <p className="va-texte">Pour <b>toute</b> simulation, il faut d'abord trouver les <b>modèles</b> : les lois, les formules et les données qui décrivent le phénomène. Puis il faut <b>les donner à l'IA</b> : sans modèle, elle invente, et la simulation est fausse.</p>
        <p className="va-texte">Ici, les modèles sont <b>déjà installés</b> dans ton interface : l'IA s'en servira à chaque étape.</p>
        {outils?.[0] && <button type="button" className="va-lien" style={{ justifySelf: "start", fontSize: 15, padding: "8px 14px" }} onClick={() => setAide(outils[0])}>🧰 Voir les modèles déjà installés</button>}
        {aide && <AideOutil outil={aide} fermer={() => setAide(null)} />}
        {!e.fait && <button type="button" className="va-suivant" onClick={() => finirIntro("modeles")}>J'ai compris, étape suivante ›</button>}
      </>
    );
    return (
      <>
        <div className="va-carte-claire"><Etape {...etapeProps(e.num)} ouverte={true} basculer={() => {}} /></div>
        {scene}
        {motsCles}
      </>
    );
  };

  return (
    <div className="va">
      <div className="va-tete"><b>🧭 Parcours guidé</b><button type="button" className="va-lien" onClick={changerDeMode}>Changer de mode</button>{recommencer}</div>
      <ol className="st va-st" aria-label="Les étapes de l'atelier" style={{ gridTemplateColumns: `repeat(${toutes.length}, minmax(0,1fr))` }}>
        {toutes.map((e, i) => {
          const etatRond = e.fait ? "fait" : i === ici ? "ici" : "avenir";
          const rond = <span className="st-rond" aria-hidden="true">{e.fait ? "✓" : i + 1}</span>;
          return (
            <li key={e.id} className={`st-etape ${etatRond}`}>
              {e.fait ? <button type="button" className={`st-bouton${revues.has(e.id) ? " ouvert" : ""}`} onClick={() => basculerRevue(e.id)} title={revues.has(e.id) ? "Masquer cette étape" : "Revoir cette étape"}>{rond}</button> : rond}
              <span className="st-nom">{e.titre}</span>
            </li>
          );
        })}
      </ol>
      {ici === -1 && <p className="va-bravo">🎉 Tu as fini l'atelier !</p>}
      <ol className="ga-etapes">
        {visibles.map(({ e, i }) => (
          <li key={e.id} className={e.fait ? "fait" : "encours"}>
            <div className="ga-ligne">
              <span className="ga-icone" aria-hidden="true">{e.fait ? "✅" : "👉"}</span>
              <div className="ga-texte"><h2>{i + 1}. {e.titre} {!e.fait && <span className="ga-badge">en cours</span>}</h2></div>
            </div>
            <div className="va-corps">{contenu(e)}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const STYLE_VUE_ATELIER = `
.va { display:grid; gap:16px; color:#e4e4e7; }
.va-question { margin:6px 0 4px; text-align:center; font:800 clamp(20px,3vw,28px)/1.25 'Outfit',sans-serif; color:#fff; }
.va-question b { color:#fde68a; }
.va-choix { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; }
.va-tuile { all:unset; cursor:pointer; display:flex; flex-direction:column; gap:10px; background:#16161b; border:1px solid #3f3f46; border-radius:18px; padding:22px; transition:transform .15s, border-color .15s; }
.va-tuile:hover, .va-tuile:focus-visible { transform:translateY(-3px); border-color:#f59e0b; }
.va-tuile.premier { border:2px solid #f59e0b; background:#1f1a10; }
.va-tuile b { font:800 22px 'Outfit',sans-serif; color:#fff; }
.va-tuile span { color:#d4d4d8; font-size:16px; line-height:1.45; }
.va-tuile em { align-self:flex-start; font-style:normal; font-weight:800; font-size:12px; background:#f59e0b; color:#1f1300; border-radius:99px; padding:2px 10px; }
.va-tuile .va-ic { font-size:44px; line-height:1; }
.va-tete { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.va-tete b { font:800 20px 'Outfit',sans-serif; color:#fff; flex:1; }
.va-lien { all:unset; cursor:pointer; color:#fde68a; border:1px solid #a16207; border-radius:8px; padding:4px 10px; font-weight:800; font-size:13px; }
.va-lien.danger { color:#fecaca; border-color:#7f1d1d; }
.va-corps { display:grid; gap:12px; margin-top:12px; }
.va-texte { margin:0; font-size:17px; line-height:1.5; color:#e4e4e7; }
.va-texte b { color:#fff; }
.va-carte-claire { color:#0f172a; }
.va-suivant { all:unset; cursor:pointer; justify-self:start; background:#f59e0b; color:#1f1300; font-weight:800; border-radius:12px; padding:10px 16px; }
.va-suivant:hover { background:#fbbf24; }
.va-bravo { margin:0; text-align:center; font-weight:800; font-size:20px; color:#86efac; }
`;

export function CadreExercice({ page, sujet, etapes, idees, motsCles = [], etat = [], validees = [], avecOutils = true, children }) {
  // Sans la boîte à outils fournie : une étape 0 pour la construire, et les textes renvoient au fichier construit.
  const sans = avecOutils === false && etapes.etapeOutils;
  const adapter = (t) => (sans && typeof t === "string" && !t.includes("n'utilise pas") ? t.replace(/(^|[^A-Za-z])colorimetrie\.js/g, `$1${etapes.fichierPerso}`) : t);
  const liste = [
    ...(sans ? [{ num: 0, etape: etapes.etapeOutils }] : []),
    ...etapes.map((e, i) => ({ num: i + 1, etape: sans ? { ...e, consigne: adapter(e.consigne), indices: e.indices.map(adapter), proposition: adapter(e.proposition), motsCles: (e.motsCles || []).map(adapter) } : e })),
  ];
  const nums = liste.map((x) => x.num);
  const outils = sans ? etapes.outilsSans || [] : etapes.outils || [];
  const groupesMots = sans ? motsCles.map((g) => ({ ...g, mots: g.mots.map(adapter) })) : motsCles.map((g) => ({ ...g, mots: g.mots.filter((m) => !(etapes.motsSansSeulement || []).includes(m)) }));

  // Oublie les courbes d'une version précédente de la page (avant que la scène ne publie les siennes).
  useState(() => { oublierCourbes(); return null; });
  const [mode, setMode] = useState(() => (lire(`${page}.mode`, "guide") === "libre" ? "libre" : "guide"));
  // « 🙈 Masquer le guide » : la simulation seule, sans toucher au code (retenu au rechargement).
  const [guideMasque, setGuideMasque] = useState(() => lire(`${page}.guideMasque`, false) === true);
  const basculerGuide = () => setGuideMasque((v) => { ecrire(`${page}.guideMasque`, !v); return !v; });
  // Tout est repéré par le NUMÉRO de l'étape (0 = boîte à outils), pour ne rien décaler quand l'étape 0 apparaît.
  const [ouvertes, setOuvertes] = useState(() => lire(`${page}.ouvertesN`, [nums[0]]));
  const [recommencer, setRecommencer] = useState(false);
  const choisirMode = (m) => { setMode(m); ecrire(`${page}.mode`, m); };
  const basculer = (n) => setOuvertes((o) => { const m = o.includes(n) ? o.filter((x) => x !== n) : [...o, n]; ecrire(`${page}.ouvertesN`, m); return m; });
  const suivante = (n) => nums[nums.indexOf(n) + 1];
  // Étapes terminées : cochées ici, ou validées par l'IA dans la page (ETAPES_VALIDEES).
  const [cochees, setCochees] = useState(() => lire(`${page}.faitesN`, []));
  // Modèle construit : on le contrôle ici. L'étape 0 n'est terminée que si TOUT est ✅ (même si elle a été cochée ou validée).
  const [controle, setControle] = useState(null); // null | "absent" | "erreur" | [{ texte, ok }]
  useEffect(() => {
    if (!sans || !outils[0]?.charger) { setControle(null); return; }
    outils[0].charger().then((m) => setControle(m ? outils[0].verifier(m) : "absent")).catch(() => setControle("erreur"));
  }, [Boolean(sans)]); // eslint-disable-line react-hooks/exhaustive-deps
  const modeleValide = Array.isArray(controle) && controle.every((v) => v.ok);
  const bloqueeParControle = (n) => n === 0 && sans && etapes.etapeOutils?.exigeModeleValide && !modeleValide;
  const parIA = validees.filter((n) => !bloqueeParControle(n));
  const faites = [...new Set([...cochees, ...parIA])].filter((n) => !bloqueeParControle(n));
  // Une étape que l'IA vient de valider : on la replie et on ouvre la suivante (une seule fois).
  const cleVues = validees.join(",");
  useEffect(() => {
    const vues = lire(`${page}.valideesVuesN`, []);
    const nouvelles = parIA.filter((n) => !vues.includes(n));
    ecrire(`${page}.valideesVuesN`, parIA);
    if (!nouvelles.length) return;
    setOuvertes((o) => {
      let m = o.filter((x) => !nouvelles.includes(x));
      for (const n of nouvelles) { const s2 = suivante(n); if (s2 !== undefined && !parIA.includes(s2) && !m.includes(s2)) m = [...m, s2]; }
      ecrire(`${page}.ouvertesN`, m); return m;
    });
  }, [cleVues]); // eslint-disable-line react-hooks/exhaustive-deps
  // On vient de choisir de construire sa boîte à outils : l'étape 0 s'ouvre.
  useEffect(() => {
    if (sans && !faites.includes(0)) setOuvertes((o) => { if (o.includes(0)) return o; const m = [0, ...o.filter((x) => x !== 1)]; ecrire(`${page}.ouvertesN`, m); return m; });
  }, [Boolean(sans)]); // eslint-disable-line react-hooks/exhaustive-deps
  const cocher = (n) => {
    if (parIA.includes(n) || bloqueeParControle(n)) return;
    const m = cochees.includes(n) ? cochees.filter((x) => x !== n) : [...cochees, n];
    setCochees(m); ecrire(`${page}.faitesN`, m);
    if (!cochees.includes(n)) { // cochée : on replie celle-ci et on ouvre la suivante
      const s2 = suivante(n);
      setOuvertes((o) => { const k = [...o.filter((x) => x !== n), ...(s2 !== undefined && !o.includes(s2) ? [s2] : [])]; ecrire(`${page}.ouvertesN`, k); return k; });
    }
  };
  // Une étape est verrouillée tant qu'UNE des étapes précédentes n'est pas terminée (en cascade).
  const verrouillee = (n) => nums.slice(0, nums.indexOf(n)).some((x) => !faites.includes(x));
  const premiereNonFaite = (n) => nums.slice(0, nums.indexOf(n)).find((x) => !faites.includes(x));
  // Étapes dont on surligne les mots clés : celles qui sont ouvertes (et déverrouillées), sinon l'étape en cours.
  const ouvertesLibres = nums.filter((n) => ouvertes.includes(n) && !verrouillee(n));
  const enCours = nums.find((n) => !faites.includes(n));
  const actives = mode !== "guide" ? [] : ouvertesLibres.length ? ouvertesLibres : enCours !== undefined ? [enCours] : [];
  const parNum = Object.fromEntries(liste.map((x) => [x.num, x.etape]));
  const remiseAZero = () => {
    ecrire(`${page}.ouvertesN`, [0, 1]); ecrire(`${page}.faitesN`, []); ecrire(`${page}.valideesVuesN`, []);
    ecrire(`${page}.atelierIntro`, []);   // l'atelier repart de sa 1re étape (« L'état actuel de la page »)
    [0, ...etapes.map((_, i) => i + 1)].forEach((n) => ecrire(`${page}.indices.${n}`, 0));
  };
  // Page d'atelier (…/?atelier=<id>, sur l'ordinateur) : la vue « progression de l'atelier ».
  if (estApercu && new URLSearchParams(window.location.search).has("atelier")) {
    const etapeProps = (num) => ({ page, numero: num, etape: parNum[num], faite: faites.includes(num), parIA: parIA.includes(num), verrouillee: false,
      cocher: () => cocher(num), precedente: undefined, outil: outils[0], controle: num === 0 && sans ? controle : null, bloquee: bloqueeParControle(num) });
    const motsBloc = groupesMots.length > 0 ? <div className="va-carte-claire"><MotsCles groupes={groupesMots} surlignes={new Set(actives.flatMap((n) => parNum[n]?.motsCles || []))} pourEtapes={actives} /></div> : null;
    return (
      <div className="ex-conteneur">
        <style>{STYLE_VUE_ATELIER}</style>
        <VueAtelier page={page} sujet={sujet} mode={mode} choisirMode={choisirMode} etat={etat} liste={liste} faites={faites} cocher={cocher}
          etapeProps={etapeProps} ouvertes={ouvertes} basculer={basculer} scene={children} motsCles={motsBloc} outils={outils} sans={sans}
          idees={sans && etapes.ideeOutils ? [etapes.ideeOutils, ...idees] : idees} etapes={etapes}
          recommencer={<button type="button" className="va-lien danger" onClick={() => setRecommencer(true)}>↺ Tout recommencer</button>} />
        {recommencer && <ToutRecommencer page={page} fermer={() => setRecommencer(false)} remiseAZero={remiseAZero} modele={etapes.outilsSans?.[0]?.chemin} />}
      </div>
    );
  }
  return (
    <div className="ex-conteneur">
    <div className={`ex-cadre${motsCles.length && !guideMasque ? " avec-colonne" : ""}`}>
      <style>{`
        .ex-conteneur { container-type: inline-size; }
        .ex-cadre { max-width: 1360px; margin: 0 auto; display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
        .ex-principal { display: grid; gap: 14px; min-width: 0; }
        .ex-mots { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 12px 12px; }
        /* Les mots clés ne passent à droite que s'il RESTE assez de place pour la simulation (quel que soit le style du site) */
        @container (min-width: 1020px) {
          .ex-cadre.avec-colonne { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; }
          .ex-cadre.avec-colonne .ex-mots { position: sticky; top: 64px; max-height: calc(100vh - 80px); overflow-y: auto; }
        }
        .ex-bascule { display: inline-flex; background: #e2e8f0; border-radius: 999px; padding: 3px; gap: 2px; }
        .ex-bascule button { border: none; background: transparent; border-radius: 999px; padding: 7px 14px; font: inherit; font-size: 13.5px; font-weight: 800; color: #475569; cursor: pointer; white-space: nowrap; }
        .ex-bascule button[aria-selected="true"] { background: #fff; color: var(--accent); box-shadow: 0 1px 3px rgba(15,23,42,.18); }
        .ex-bascule-petite { padding: 2px; }
        details[open] > summary > .ex-fleche { display: inline-block; transform: rotate(90deg); }
        .ex-bascule-petite button { padding: 4px 10px; font-size: 12.5px; }
      `}</style>
      <div className="ex-principal">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          {!guideMasque && <p style={{ margin: 0, flex: "1 1 320px" }}>À toi de construire la simulation du <strong>{sujet}</strong> en écrivant tes demandes à l'agent, dans Antigravity. Regarde d'abord l'<strong>état actuel</strong> dans le guide, puis aide-toi des <strong>mots clés</strong>.</p>}
          <span style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
            <button type="button" style={bouton()} onClick={basculerGuide}>{guideMasque ? "🧭 Afficher le guide" : "🙈 Masquer le guide"}</button>
            {estApercu && !guideMasque && <button type="button" style={bouton("danger")} onClick={() => setRecommencer(true)}>↺ Tout recommencer</button>}
          </span>
        </div>

        {etapes.credit && (
          <p style={{ margin: "-4px 0 0", fontSize: 12.5, color: "#64748b" }}>
            🙏 {etapes.credit.texte} : <a href={etapes.credit.lien} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontWeight: 700 }}>{etapes.credit.lienTexte || etapes.credit.lien}</a>.
          </p>
        )}

        {children}

        {!guideMasque && <section aria-label="Construis cette simulation avec l'IA" style={{ background: "#f8fafc", border: "2px solid var(--accent)", borderRadius: 18, padding: "14px 16px", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <strong style={{ fontSize: 17, flex: "1 1 auto" }}>🤖 Construis cette simulation avec l'IA</strong>
            <div role="tablist" aria-label="Mode" className="ex-bascule">
              {[["guide", "🧭 Parcours guidé"], ["libre", "🧪 Exploration libre"]].map(([id, nom]) => (
                <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => choisirMode(id)}>{nom}</button>
              ))}
            </div>
          </div>
          <EtatActuel etat={etat} ligneModele={estApercu && etapes.etapeOutils ? (etapes.ligneModele ? etapes.ligneModele(Boolean(sans)) : sans
            ? "🧰 Tu construis tes propres modèles couleur (étape 0). Tu peux revenir aux modèles par défaut avec « Modèles couleur » ci-dessous."
            : "🧰 Les modèles couleur par défaut sont prêts. Tu peux aussi construire les tiens : « Modèles couleur » → « À construire ».") : null} />
          {outils[0]?.controleDirect ? <ControleDirect outil={outils[0]} /> : <ControleJour outil={outils[0]} />}
          <BoiteOutils page={page} avec={!sans} outils={outils} choix={estApercu && !!etapes.etapeOutils} />
          {mode === "guide"
            ? liste.map(({ num, etape }) => (
              <Etape key={num} page={page} numero={num} etape={etape} ouverte={ouvertes.includes(num)} basculer={() => basculer(num)}
                faite={faites.includes(num)} parIA={parIA.includes(num)} verrouillee={verrouillee(num)} cocher={() => cocher(num)}
                precedente={premiereNonFaite(num) ?? nums[nums.indexOf(num) - 1]} outil={outils[0]} controle={num === 0 && sans ? controle : null} bloquee={bloqueeParControle(num)} />
            ))
            : <ExplorationLibre idees={sans && etapes.ideeOutils ? [etapes.ideeOutils, ...idees] : idees} />}
        </section>}

      </div>
      {!guideMasque && groupesMots.length > 0 && <MotsCles groupes={groupesMots} surlignes={new Set(actives.flatMap((n) => parNum[n]?.motsCles || []))} pourEtapes={actives} />}
      {recommencer && <ToutRecommencer page={page} fermer={() => setRecommencer(false)} remiseAZero={remiseAZero} modele={etapes.outilsSans?.[0]?.chemin} />}
    </div>
    </div>
  );
}
