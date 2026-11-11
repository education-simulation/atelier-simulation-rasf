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
function EtatActuel({ etat }) {
  if (!etat?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #fcd34d", borderLeft: "5px solid #f59e0b", borderRadius: 10, padding: "8px 12px", fontSize: 14, lineHeight: 1.55 }}>
      <strong>📍 État actuel de la simulation</strong>
      <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>{etat.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}

// --- Une étape du parcours guidé : section repliable ---
function Etape({ page, numero, etape, ouverte, basculer, faite, parIA, verrouillee, cocher }) {
  const [indices, setIndices] = useState(() => lire(`${page}.indices.${numero}`, 0));
  const [voirProposition, setVoirProposition] = useState(false);
  const [copie, copier] = useCopie();
  const plusUn = () => { const v = Math.min(etape.indices.length, indices + 1); setIndices(v); ecrire(`${page}.indices.${numero}`, v); };
  const fini = indices >= etape.indices.length;
  return (
    <details open={ouverte && !verrouillee} onToggle={(e) => { if (!verrouillee && e.currentTarget.open !== ouverte) basculer(); }}
      style={{ background: verrouillee ? "#f1f5f9" : "#fff", border: `1px solid ${faite ? "#86efac" : "#d5dfeb"}`, borderRadius: 12, padding: "0 14px", opacity: verrouillee ? 0.65 : 1 }}>
      <summary onClick={(e) => { if (verrouillee) e.preventDefault(); }} aria-disabled={verrouillee || undefined}
        title={verrouillee ? `Coche d'abord « Étape terminée » à l'étape ${numero - 1}` : undefined}
        style={{ cursor: verrouillee ? "not-allowed" : "pointer", padding: "11px 0", fontWeight: 800, fontSize: 15.5, display: "flex", gap: 8, alignItems: "center", listStyle: "none" }}>
        <span aria-hidden="true" style={{ fontSize: 11, color: "#64748b", width: 12 }}>{verrouillee ? "" : ouverte ? "▼" : "▶"}</span>
        <span style={{ flex: 1 }}>{numero}. {etape.titre}</span>
        {faite && <span style={{ fontSize: 12.5, color: "#15803d", background: "#dcfce7", borderRadius: 999, padding: "2px 9px", whiteSpace: "nowrap" }}>{parIA ? "✅ validée par l'IA" : "✅ terminée"}</span>}
        {verrouillee && <span style={{ fontSize: 12.5, color: "#64748b", whiteSpace: "nowrap" }}>🔒 termine l'étape {numero - 1}</span>}
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
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontSize: 14.5, fontWeight: 700,
          background: faite ? "#dcfce7" : "#f8fafc", border: `2px ${faite ? "solid #22c55e" : "dashed #94a3b8"}` }}>
          <input type="checkbox" checked={faite} disabled={parIA} onChange={cocher} style={{ width: 18, height: 18, accentColor: "#16a34a", cursor: parIA ? "default" : "pointer" }} />
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
    try { setMessage("⏳ Reprise…"); await appel("restaurer", { page, fichier }); setMessage("✅ Version reprise : la page se recharge. Dans Antigravity, ouvre une nouvelle conversation (bouton +) : l'agent repartira de cette version."); }
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
      await appel("zero", { page });
      setEtat("✅ C'est reparti du début. Dans Antigravity, ouvre une nouvelle conversation (bouton +) : sinon l'agent croit que tout est encore fait.");
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
          <li>La page revient au <strong>point de départ</strong> : la cabine éteinte et les deux cartes vierges.</li>
          <li>Les étapes se replient, les indices se cachent, et « État actuel » revient au départ.</li>
          <li>Ta version actuelle est <strong>sauvegardée automatiquement</strong> avant : tu pourras la reprendre.</li>
          <li>💬 Ensuite, dans Antigravity, <strong>ouvre une nouvelle conversation</strong> (bouton <strong>+</strong>) : sinon l'agent peut croire que tout est encore fait.</li>
        </ul>
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
export function CadreExercice({ page, sujet, etapes, idees, motsCles = [], etat = [], validees = [], children }) {
  const [mode, setMode] = useState(() => (lire(`${page}.mode`, "guide") === "libre" ? "libre" : "guide"));
  const [ouvertes, setOuvertes] = useState(() => lire(`${page}.ouvertes`, [0]));
  const [recommencer, setRecommencer] = useState(false);
  const choisirMode = (m) => { setMode(m); ecrire(`${page}.mode`, m); };
  const basculer = (i) => setOuvertes((o) => { const n = o.includes(i) ? o.filter((x) => x !== i) : [...o, i]; ecrire(`${page}.ouvertes`, n); return n; });
  // Étapes terminées (cochées) : chaque étape ne s'ouvre qu'une fois la précédente cochée.
  const [cochees, setFaites] = useState(() => lire(`${page}.faites`, []));
  // Étapes validées par l'IA : écrites dans la page (ETAPES_VALIDEES, numéros à partir de 1) par l'agent.
  const parIA = validees.map((n) => n - 1);
  const faites = [...new Set([...cochees, ...parIA])];
  // Une étape que l'IA vient de valider : on la replie et on ouvre la suivante (une seule fois).
  const cleVues = validees.join(",");
  useEffect(() => {
    const vues = lire(`${page}.valideesVues`, []);
    const nouvelles = parIA.filter((i) => !vues.includes(i));
    ecrire(`${page}.valideesVues`, parIA);
    if (!nouvelles.length) return;
    setOuvertes((o) => {
      let m = o.filter((x) => !nouvelles.includes(x));
      for (const i of nouvelles) if (i + 1 < etapes.length && !parIA.includes(i + 1) && !m.includes(i + 1)) m = [...m, i + 1];
      ecrire(`${page}.ouvertes`, m); return m;
    });
  }, [cleVues]); // eslint-disable-line react-hooks/exhaustive-deps
  const cocher = (i) => {
    if (parIA.includes(i)) return;
    const n = cochees.includes(i) ? cochees.filter((x) => x !== i) : [...cochees, i];
    setFaites(n); ecrire(`${page}.faites`, n);
    if (!cochees.includes(i)) { // cochée : on replie celle-ci et on ouvre la suivante
      setOuvertes((o) => { const m = [...o.filter((x) => x !== i), ...(i + 1 < etapes.length && !o.includes(i + 1) ? [i + 1] : [])]; ecrire(`${page}.ouvertes`, m); return m; });
    }
  };
  // Étapes dont on surligne les mots clés : celles qui sont ouvertes (et déverrouillées), sinon l'étape en cours.
  const verrouillee = (i) => i > 0 && !faites.includes(i - 1);
  const ouvertesLibres = ouvertes.filter((i) => i < etapes.length && !verrouillee(i)).sort((a, b) => a - b);
  const enCours = etapes.findIndex((_, i) => !faites.includes(i));
  const actives = mode !== "guide" ? [] : ouvertesLibres.length ? ouvertesLibres : enCours >= 0 ? [enCours] : [];
  const remiseAZero = () => { ecrire(`${page}.ouvertes`, [0]); ecrire(`${page}.faites`, []); ecrire(`${page}.valideesVues`, []); etapes.forEach((_, i) => ecrire(`${page}.indices.${i + 1}`, 0)); };

  return (
    <div className="ex-conteneur">
    <div className={`ex-cadre${motsCles.length ? " avec-colonne" : ""}`}>
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
      `}</style>
      <div className="ex-principal">
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
          <p style={{ margin: 0, flex: "1 1 320px" }}>À toi de construire la simulation du <strong>{sujet}</strong> en écrivant tes demandes à l'agent, dans Antigravity. Regarde d'abord l'<strong>état actuel</strong> dans le guide, puis aide-toi des <strong>mots clés</strong>.</p>
          {estApercu && <button type="button" style={bouton("danger")} onClick={() => setRecommencer(true)}>↺ Tout recommencer</button>}
        </div>

        {children}

        <section aria-label="Construis cette simulation avec l'IA" style={{ background: "#f8fafc", border: "2px solid var(--accent)", borderRadius: 18, padding: "14px 16px", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <strong style={{ fontSize: 17, flex: "1 1 auto" }}>🤖 Construis cette simulation avec l'IA</strong>
            <div role="tablist" aria-label="Mode" className="ex-bascule">
              {[["guide", "🧭 Parcours guidé"], ["libre", "🧪 Exploration libre"]].map(([id, nom]) => (
                <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => choisirMode(id)}>{nom}</button>
              ))}
            </div>
          </div>
          <EtatActuel etat={etat} />
          {mode === "guide"
            ? etapes.map((etape, i) => (
              <Etape key={i} page={page} numero={i + 1} etape={etape} ouverte={ouvertes.includes(i)} basculer={() => basculer(i)}
                faite={faites.includes(i)} parIA={parIA.includes(i)} verrouillee={i > 0 && !faites.includes(i - 1)} cocher={() => cocher(i)} />
            ))
            : <ExplorationLibre idees={idees} />}
        </section>

        {estApercu && <Sauvegardes page={page} />}
      </div>
      {motsCles.length > 0 && <MotsCles groupes={motsCles} surlignes={new Set(actives.flatMap((i) => etapes[i].motsCles || []))} pourEtapes={actives.map((i) => i + 1)} />}
      {recommencer && <ToutRecommencer page={page} fermer={() => setRecommencer(false)} remiseAZero={remiseAZero} />}
    </div>
    </div>
  );
}
