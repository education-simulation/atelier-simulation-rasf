// ============================================================
//  CADRE D'EXERCICE (outil partagé, ne pas modifier) — « construis cette simulation avec l'IA ».
//  Autour de la simulation (children) :
//   - en haut : « ↺ Tout recommencer » (fenêtre de confirmation) — sur l'ordinateur seulement ;
//   - le guide, en deux modes : 🧭 Parcours guidé (toutes les étapes, en sections repliables)
//     et 🧪 Exploration libre (idées à copier) ;
//   - les sauvegardes (sauver / reprendre une version) — sur l'ordinateur seulement ;
//   - à droite (en dessous sur petit écran) : le journal des prompts et des conseils de l'IA,
//     que l'agent écrit dans journal/<page>.json — sur l'ordinateur seulement.
//  Les écritures sur l'ordinateur passent par le serveur d'aperçu (vite.config.js) : jamais en ligne.
// ============================================================
import { useEffect, useRef, useState } from "react";
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

// --- Le journal : lu dans journal/<page>.json, mis à jour toutes les 5 secondes ---
function useJournal(page) {
  const [entrees, setEntrees] = useState([]);
  useEffect(() => {
    if (!estApercu) return undefined;
    let fini = false;
    const charger = () => fetch(`journal/${page}.json?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : "[]"))
      .then((t) => { if (fini || /<html/i.test(t)) return; try { const j = JSON.parse(t); setEntrees(Array.isArray(j) ? j : []); } catch { /* en cours d'écriture */ } })
      .catch(() => {});
    charger();
    const id = setInterval(charger, 5000);
    return () => { fini = true; clearInterval(id); };
  }, [page]);
  return entrees;
}
const couleurAppreciation = (a = "") => (/presque/i.test(a) ? "#b45309" : /compléter/i.test(a) ? "#b91c1c" : "#15803d");

function Journal({ entrees }) {
  const liste = [...entrees].reverse();
  const puces = (titre, l, c) => (Array.isArray(l) && l.length ? <div style={{ marginTop: 4 }}><span style={{ fontWeight: 800, color: c }}>{titre}</span>
    <ul style={{ margin: "2px 0 0", paddingLeft: 18 }}>{l.map((x, i) => <li key={i}>{x}</li>)}</ul></div> : null);
  return (
    <aside className="ex-journal" aria-label="Mes prompts et les conseils de l'IA">
      <strong style={{ display: "block", fontSize: 15, marginBottom: 2 }}>📜 Mes prompts et les conseils de l'IA</strong>
      <span style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 8 }}>🔒 Visible seulement sur ton ordinateur · {entrees.length} prompt{entrees.length > 1 ? "s" : ""}</span>
      {liste.length === 0
        ? <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>Rien pour l'instant. Écris ta demande à l'agent dans Antigravity : il la note ici, avec ses conseils.</p>
        : <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          {liste.map((e, i) => (
            <li key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 10px", fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "baseline" }}>
                <strong>{e.etape ? `🧭 Étape ${e.etape}` : "🧪 Libre"}</strong>
                <span style={{ color: "#64748b" }}>{e.date}</span>
              </div>
              {e.appreciation && <div style={{ fontWeight: 800, color: couleurAppreciation(e.appreciation) }}>{e.appreciation}{e.execute ? " · exécuté" : ""}</div>}
              <blockquote style={{ margin: "6px 0", padding: "4px 8px", borderLeft: "3px solid #94a3b8", background: "#f8fafc", color: "#0f172a" }}>{e.prompt}</blockquote>
              {puces("✅ Réussi", e.reussi, "#15803d")}
              {puces("⚠️ À améliorer", e.a_ameliorer, "#b45309")}
              {e.astuce && <div style={{ marginTop: 4 }}><span style={{ fontWeight: 800, color: "#4338ca" }}>💡</span> {e.astuce}</div>}
              {e.resultat && <div style={{ marginTop: 4 }}><span style={{ fontWeight: 800 }}>👀</span> {e.resultat}</div>}
            </li>
          ))}
        </ol>}
    </aside>
  );
}

// --- Une étape du parcours guidé : section repliable ---
function Etape({ page, numero, etape, ouverte, basculer, dernier }) {
  const [indices, setIndices] = useState(() => lire(`${page}.indices.${numero}`, 0));
  const [voirProposition, setVoirProposition] = useState(false);
  const [copie, copier] = useCopie();
  const plusUn = () => { const v = Math.min(etape.indices.length, indices + 1); setIndices(v); ecrire(`${page}.indices.${numero}`, v); };
  const fini = indices >= etape.indices.length;
  return (
    <details open={ouverte} onToggle={(e) => { if (e.currentTarget.open !== ouverte) basculer(); }}
      style={{ background: "#fff", border: "1px solid #d5dfeb", borderRadius: 12, padding: "0 14px" }}>
      <summary style={{ cursor: "pointer", padding: "11px 0", fontWeight: 800, fontSize: 15.5, display: "flex", gap: 8, alignItems: "center", listStyle: "none" }}>
        <span aria-hidden="true" style={{ fontSize: 11, color: "#64748b", width: 12 }}>{ouverte ? "▼" : "▶"}</span>
        <span style={{ flex: 1 }}>{numero}. {etape.titre}</span>
        {dernier && <span style={{ fontSize: 12.5, fontWeight: 800, color: couleurAppreciation(dernier.appreciation) }}>{dernier.execute ? "✓ " : ""}{dernier.appreciation || ""}</span>}
      </summary>
      <div style={{ paddingBottom: 14 }}>
        <p style={{ margin: "0 0 10px", fontSize: 15 }}>✍️ <strong>{etape.consigne}</strong></p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" style={{ ...bouton(), opacity: fini ? 0.5 : 1 }} disabled={fini} onClick={plusUn}>💡 {indices === 0 ? "Un indice" : fini ? "Plus d'indice" : "Un autre indice"}</button>
          <button type="button" style={bouton()} onClick={() => setVoirProposition((v) => !v)}>{voirProposition ? "🙈 Cacher la proposition" : "👀 Proposition de réponse"}</button>
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
          const texte = `Dans la page Métamérisme, ${idee}.`;
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
function Sauvegardes({ page }) {
  const [nom, setNom] = useState("");
  const [liste, setListe] = useState(null);
  const [confirmer, setConfirmer] = useState(null);
  const [message, setMessage] = useState("");
  const charger = async () => { const j = await fetch(`__atelier/versions?page=${page}`).then((r) => r.json()); setListe(j.fichiers || []); };
  const sauver = async () => {
    try { const j = await appel("sauver", { page, nom }); setMessage(`✅ Sauvegardé : versions/${page}/${j.fichier}`); setNom(""); if (liste) charger(); }
    catch (e) { setMessage(`⚠️ ${e.message}`); }
  };
  const reprendre = async (fichier) => {
    if (confirmer !== fichier) return setConfirmer(fichier);
    try { setMessage("⏳ Reprise…"); await appel("restaurer", { page, fichier }); setMessage("✅ Version reprise : la page se recharge."); }
    catch (e) { setMessage(`⚠️ ${e.message}`); }
  };
  const lisible = (f) => f.replace(/\.jsx$/, "").replace(/^(\d{4})-(\d\d)-(\d\d)_(\d\d)h(\d\d)-\d\d-?/, "$3/$2/$1 à $4h$5 · ").replace(/-/g, " ");
  return (
    <div style={{ padding: "12px 14px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12 }}>
      <strong style={{ fontSize: 14 }}>💾 Sauvegardes</strong>
      <span style={{ fontSize: 12.5, color: "#64748b" }}> · 🔒 sur ton ordinateur, dans le dossier <code>versions/{page}</code></span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, alignItems: "center" }}>
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom (facultatif) : étape 2 réussie…" maxLength={40}
          style={{ flex: "1 1 180px", minWidth: 0, padding: "8px 10px", borderRadius: 10, border: "1px solid #cbd5e1", font: "inherit", fontSize: 13.5 }} />
        <button type="button" style={bouton()} onClick={sauver}>💾 Sauvegarder cette version</button>
        <button type="button" style={bouton()} onClick={() => (liste ? setListe(null) : charger())}>{liste ? "📂 Fermer la liste" : "📂 Reprendre une version"}</button>
      </div>
      {liste && (
        <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "grid", gap: 6 }}>
          {liste.length === 0 && <li style={{ fontSize: 13.5, color: "#64748b" }}>Aucune sauvegarde pour l'instant.</li>}
          {liste.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13.5 }}>
              <span style={{ flex: 1, minWidth: 0 }}>{lisible(f)}</span>
              <button type="button" style={bouton()} onClick={() => reprendre(f)}>{confirmer === f ? "⚠️ Clique encore pour reprendre" : "Reprendre"}</button>
            </li>
          ))}
        </ul>
      )}
      {message && <p style={{ margin: "8px 0 0", fontSize: 13.5 }}>{message}</p>}
    </div>
  );
}

// --- « Tout recommencer » : fenêtre de confirmation ---
function ToutRecommencer({ page, fermer, remiseAZero }) {
  const [effacerJournal, setEffacerJournal] = useState(false);
  const [etat, setEtat] = useState("");
  const boite = useRef(null);
  useEffect(() => {
    const echap = (e) => { if (e.key === "Escape") fermer(); };
    document.addEventListener("keydown", echap);
    return () => document.removeEventListener("keydown", echap);
  }, [fermer]);
  const valider = async () => {
    try {
      setEtat("⏳ Retour au départ…");
      remiseAZero();
      await appel("zero", { page, effacerJournal });
      setEtat("✅ C'est reparti du début : la page se recharge.");
      setTimeout(fermer, 1500);
    } catch (e) { setEtat(`⚠️ ${e.message}`); }
  };
  return (
    <div onPointerDown={(e) => { if (boite.current && !boite.current.contains(e.target)) fermer(); }}
      style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div ref={boite} role="dialog" aria-label="Tout recommencer"
        style={{ background: "#fff", borderRadius: 18, width: "min(480px, 100%)", padding: "18px 20px", boxShadow: "0 20px 40px rgba(0,0,0,.25)" }}>
        <strong style={{ fontSize: 18 }}>↺ Tout recommencer ?</strong>
        <ul style={{ margin: "10px 0", paddingLeft: 20, lineHeight: 1.6, fontSize: 14.5 }}>
          <li>La page revient au <strong>point de départ</strong> : la cabine et les deux cartes.</li>
          <li>Les étapes se replient, les indices se cachent.</li>
          <li>Ta version actuelle est <strong>sauvegardée automatiquement</strong> avant : tu pourras la reprendre.</li>
        </ul>
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, margin: "4px 0 14px", cursor: "pointer" }}>
          <input type="checkbox" checked={effacerJournal} onChange={(e) => setEffacerJournal(e.target.checked)} style={{ marginTop: 3 }} />
          <span>Effacer aussi <strong>mes prompts et les conseils de l'IA</strong> (le journal est sauvegardé avant).</span>
        </label>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" style={bouton()} onClick={fermer}>Annuler</button>
          <button type="button" style={{ ...bouton("danger"), background: "#dc2626", color: "#fff", boxShadow: "none" }} onClick={valider}>↺ Tout recommencer</button>
        </div>
        {etat && <p style={{ margin: "10px 0 0", fontSize: 14 }}>{etat}</p>}
      </div>
    </div>
  );
}

// --- Le cadre complet ---
export function CadreExercice({ page, sujet, etapes, idees, children }) {
  const [mode, setMode] = useState(() => (lire(`${page}.mode`, "guide") === "libre" ? "libre" : "guide"));
  const [ouvertes, setOuvertes] = useState(() => lire(`${page}.ouvertes`, [0]));
  const [recommencer, setRecommencer] = useState(false);
  const entrees = useJournal(page);
  const choisirMode = (m) => { setMode(m); ecrire(`${page}.mode`, m); };
  const basculer = (i) => setOuvertes((o) => { const n = o.includes(i) ? o.filter((x) => x !== i) : [...o, i]; ecrire(`${page}.ouvertes`, n); return n; });
  const remiseAZero = () => { ecrire(`${page}.ouvertes`, [0]); etapes.forEach((_, i) => ecrire(`${page}.indices.${i + 1}`, 0)); };
  const dernierPour = (num) => [...entrees].reverse().find((e) => e.etape === num);

  return (
    <div className={`ex-cadre${estApercu ? " avec-journal" : ""}`}>
      <style>{`
        .ex-cadre { max-width: 1320px; margin: 0 auto; display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
        .ex-principal { display: grid; gap: 14px; min-width: 0; }
        .ex-journal { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 14px; padding: 12px 12px; }
        @media (min-width: 1080px) {
          .ex-cadre.avec-journal { grid-template-columns: minmax(0, 1fr) 330px; align-items: start; }
          .ex-cadre.avec-journal .ex-journal { position: sticky; top: 64px; max-height: calc(100vh - 80px); overflow-y: auto; }
        }
      `}</style>
      <div className="ex-principal">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          <p style={{ margin: 0, flex: "1 1 320px" }}>Deux cartes de même couleur et une cabine de lumière : c'est le point de départ. À toi de construire la simulation du <strong>{sujet}</strong> en écrivant tes demandes à l'agent, dans Antigravity.</p>
          {estApercu && <button type="button" style={bouton("danger")} onClick={() => setRecommencer(true)}>↺ Tout recommencer</button>}
        </div>

        {children}

        <section aria-label="Construis cette simulation avec l'IA" style={{ background: "#f8fafc", border: "2px solid var(--accent)", borderRadius: 18, padding: "14px 16px", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <strong style={{ fontSize: 17, flex: "1 1 auto" }}>🤖 Construis cette simulation avec l'IA</strong>
            <div role="tablist" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["guide", "🧭 Parcours guidé"], ["libre", "🧪 Exploration libre"]].map(([id, nom]) => (
                <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => choisirMode(id)}
                  style={{ ...bouton(mode === id ? "principal" : "normal") }}>{nom}</button>
              ))}
            </div>
          </div>
          {mode === "guide"
            ? etapes.map((etape, i) => (
              <Etape key={i} page={page} numero={i + 1} etape={etape} ouverte={ouvertes.includes(i)} basculer={() => basculer(i)} dernier={dernierPour(i + 1)} />
            ))
            : <ExplorationLibre idees={idees} />}
        </section>

        {estApercu && <Sauvegardes page={page} />}
      </div>
      {estApercu && <Journal entrees={entrees} />}
      {recommencer && <ToutRecommencer page={page} fermer={() => setRecommencer(false)} remiseAZero={remiseAZero} />}
    </div>
  );
}
