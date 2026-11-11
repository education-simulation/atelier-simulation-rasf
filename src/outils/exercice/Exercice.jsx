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
      <span style={{ fontWeight: 800 }}>🧰 Modèle couleur</span>
      {choix && (
        <div role="tablist" aria-label="Modèle couleur" className="ex-bascule ex-bascule-petite">
          <button type="button" role="tab" aria-selected={avec} onClick={() => choisir(true)}>Par défaut</button>
          <button type="button" role="tab" aria-selected={!avec} onClick={() => choisir(false)}>🔨 À construire</button>
        </div>
      )}
      {message && <span>{message}</span>}
      {o && (
        <button type="button" onClick={() => setAide(o)} style={{ marginLeft: "auto", border: "none", background: "none", padding: "4px 2px", font: "inherit", fontSize: 13.5, fontWeight: 700, color: "var(--accent)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
          ❓ Voir le modèle {avec ? "par défaut" : "à construire"}
        </button>
      )}
      {aide && <AideOutil outil={aide} fermer={() => setAide(null)} />}
    </div>
  );
}

// --- Un graphique de courbes spectrales (380 à 780 nm), avec légende et téléchargement CSV ---
function Graphique({ g, ouvert = false }) {
  const L = 560, H = 220, mg = { g: 58, d: 10, h: 10, b: 32 };
  const max = Math.max(...g.series.flatMap((s) => s.valeurs)) * 1.05, min = Math.min(0, ...g.series.flatMap((s) => s.valeurs));
  const x = (l) => mg.g + ((l - 380) / 400) * (L - mg.g - mg.d);
  const y = (v) => H - mg.b - ((v - min) / (max - min)) * (H - mg.h - mg.b);
  const pas = max > 20 ? 50 : max > 1.2 ? 0.5 : 0.2;
  const graduations = []; for (let v = 0; v <= max; v += pas) graduations.push(Number(v.toFixed(2)));
  return (
    <details open={ouvert || undefined} style={{ margin: "10px 0 0", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 12 }}>
      <summary style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", cursor: "pointer", padding: "8px 0", listStyle: "none" }}>
        <span aria-hidden="true" className="ex-fleche" style={{ fontSize: 11, color: "#64748b" }}>▶</span>
        <strong style={{ flex: 1, fontSize: 14.5 }}>{g.titre}</strong>
        <button type="button" style={bouton()} onClick={(e) => { e.preventDefault(); e.stopPropagation(); telechargerCSV(`colorimetrie-${g.id}`, [g]); }}>⬇️ CSV</button>
      </summary>
      <figure style={{ margin: 0, paddingBottom: 8 }}>
      <svg viewBox={`0 0 ${L} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={g.titre}>
        {graduations.map((v) => (
          <g key={v}><line x1={mg.g} x2={L - mg.d} y1={y(v)} y2={y(v)} stroke="#e2e8f0" /><text x={mg.g - 5} y={y(v) + 4} fontSize="10" textAnchor="end" fill="#64748b">{String(v).replace(".", ",")}</text></g>
        ))}
        {[400, 450, 500, 550, 600, 650, 700, 750].map((l) => (
          <text key={l} x={x(l)} y={H - mg.b + 14} fontSize="10" textAnchor="middle" fill="#64748b">{l}</text>
        ))}
        <line x1={mg.g} x2={mg.g} y1={mg.h} y2={H - mg.b} stroke="#475569" />
        <line x1={mg.g} x2={L - mg.d} y1={y(0)} y2={y(0)} stroke="#475569" />
        <text x={(mg.g + L - mg.d) / 2} y={H - 3} fontSize="11" textAnchor="middle" fill="#334155" fontWeight="700">Longueur d'onde λ (nm)</text>
        <text transform={`translate(13 ${(mg.h + H - mg.b) / 2}) rotate(-90)`} fontSize="11" textAnchor="middle" fill="#334155" fontWeight="700">{g.unite.charAt(0).toUpperCase() + g.unite.slice(1)}</text>
        {g.series.map((s) => (
          <polyline key={s.nom} fill="none" stroke={s.couleur} strokeWidth="2.2" strokeDasharray={s.tirets ? "6 4" : undefined}
            points={s.valeurs.map((v, i) => `${x(g.longueurs[i]).toFixed(1)},${y(v).toFixed(1)}`).join(" ")} />
        ))}
      </svg>
      <figcaption style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
        <span style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 2 }}>
          {g.series.map((s) => <span key={s.nom}><span style={{ display: "inline-block", width: 16, height: 3, background: s.couleur, verticalAlign: "middle", marginRight: 4 }} />{s.nom}</span>)}
        </span>
        {g.explication}
      </figcaption>
      </figure>
    </details>
  );
}

// Télécharge un ou plusieurs graphiques en CSV (séparateur « ; », virgule décimale : s'ouvre tel quel dans Excel en français).
function telechargerCSV(nom, graphiques) {
  const L = graphiques[0].longueurs;
  const tete = ["longueur d'onde (nm)", ...graphiques.flatMap((g) => g.series.map((s) => `${g.id} : ${s.nom}`))];
  const lignes = L.map((l, i) => [l, ...graphiques.flatMap((g) => g.series.map((s) => s.valeurs[i].toPrecision(6).replace(".", ",")))].join(";"));
  const blob = new Blob(["\ufeff" + [tete.join(";"), ...lignes].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `${nom}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// --- Fenêtre « 📈 Voir … » d'une étape : les courbes du modèle couleur choisi (par défaut ou construit) ---
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
  const liste = Array.isArray(donnees) ? donnees.filter((g) => ids.includes(g.id)) : [];
  return createPortal(
    <div onPointerDown={(e) => { if (boite.current && !boite.current.contains(e.target)) fermer(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10050, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div ref={boite} role="dialog" aria-label="Courbes du modèle couleur"
        style={{ background: "#fff", borderRadius: 18, width: "min(760px, 100%)", maxHeight: "calc(100vh - 28px)", overflowY: "auto", padding: "18px 20px", boxShadow: "0 20px 40px rgba(0,0,0,.25)", fontSize: 14.5, lineHeight: 1.6, color: "#0f172a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ fontSize: 18, flex: 1 }}>📈 {outil.donnees ? "Modèle par défaut" : "Ton modèle couleur"}</strong>
          <button type="button" onClick={fermer} aria-label="Fermer" style={{ border: "none", background: "#f1f5f9", borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 15 }}>✕</button>
        </div>
        {donnees === "chargement" && <p>⏳ Lecture de ton modèle…</p>}
        {donnees === "absent" && <p>📭 Ton modèle n'existe pas encore : fais l'étape 0.</p>}
        {donnees === "erreur" && <p>⚠️ Ton modèle contient une erreur : demande à l'agent de la corriger.</p>}
        {liste.map((g) => <Graphique key={g.id} g={g} ouvert />)}
      </div>
    </div>,
    document.body,
  );
}

function AideOutil({ outil, fermer }) {
  const boite = useRef(null);
  // Modèle fourni : données tout de suite. Modèle construit : on charge le fichier (s'il existe) et on le vérifie.
  const [perso, setPerso] = useState(outil.charger ? "chargement" : null);
  useEffect(() => {
    if (!outil.charger) return;
    outil.charger().then((m) => setPerso(m || "absent")).catch(() => setPerso("erreur"));
  }, [outil]);
  const modele = perso && typeof perso === "object" ? perso : null;
  const donnees = outil.donnees ? outil.donnees() : modele && outil.donneesDe ? outil.donneesDe(modele) : null;
  const verifs = modele && outil.verifier ? outil.verifier(modele) : null;
  useEffect(() => {
    const echap = (e) => { if (e.key === "Escape") fermer(); };
    document.addEventListener("keydown", echap);
    return () => document.removeEventListener("keydown", echap);
  }, [fermer]);
  return createPortal(
    <div onPointerDown={(e) => { if (boite.current && !boite.current.contains(e.target)) fermer(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10050, background: "rgba(15,23,42,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <div ref={boite} role="dialog" aria-label={outil.titre || outil.nom}
        style={{ background: "#fff", borderRadius: 18, width: outil.donnees || outil.charger ? "min(760px, 100%)" : "min(520px, 100%)", maxHeight: "calc(100vh - 28px)", overflowY: "auto", padding: "18px 20px", boxShadow: "0 20px 40px rgba(0,0,0,.25)", fontSize: 14.5, lineHeight: 1.6, color: "#0f172a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ fontSize: 18, flex: 1 }}>🧰 {(verifs && outil.titreComplet && verifs.every((v) => v.ok) ? outil.titreComplet : outil.titre) || outil.nom}</strong>
          <button type="button" onClick={fermer} aria-label="Fermer" style={{ border: "none", background: "#f1f5f9", borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 15 }}>✕</button>
        </div>
        <p style={{ margin: "10px 0 6px" }}>{outil.resume}</p>
        {verifs ? (
          <ul style={{ margin: "0 0 10px", padding: 0, listStyle: "none", display: "grid", gap: 3 }}>
            {verifs.map((v) => <li key={v.texte}>{v.ok ? "✅" : "❌"} {v.texte}</li>)}
          </ul>
        ) : (
          <ul style={{ margin: "0 0 10px", paddingLeft: 20 }}>{outil.contenu.map((l, i) => <li key={i}>{l}</li>)}</ul>
        )}
        {perso === "chargement" && <p style={{ margin: "0 0 10px" }}>⏳ Lecture de ton modèle…</p>}
        {perso === "absent" && <p style={{ margin: "0 0 10px", padding: "8px 12px", background: "#f1f5f9", borderRadius: 10 }}>📭 <strong>Ton modèle n'existe pas encore.</strong> Fais l'étape 0 : ses éléments apparaîtront ici, vérifiés un par un, avec leurs courbes.</p>}
        {perso === "erreur" && <p style={{ margin: "0 0 10px", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10 }}>⚠️ <strong>Ton modèle contient une erreur</strong> et ne peut pas être lu. Demande à l'agent de la corriger.</p>}
        {outil.limites && <p style={{ margin: "0 0 10px", padding: "8px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>⚠️ <strong>Les limites du modèle :</strong> {outil.limites}</p>}
        <p style={{ margin: 0, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10 }}>💡 {outil.conseil}</p>
        {outil.equations && (
          <details style={{ margin: "14px 0 0", padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 12 }}>
            <summary style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 0", listStyle: "none" }}>
              <span aria-hidden="true" className="ex-fleche" style={{ fontSize: 11, color: "#64748b" }}>▶</span>
              <strong style={{ flex: 1, fontSize: 14.5 }}>🧮 Le modèle mathématique : de la réflectance à la couleur</strong>
            </summary>
            <div style={{ display: "grid", gap: 10, paddingBottom: 10 }}>
              {outil.equations.map((q) => (
                <div key={q.titre}>
                  <strong style={{ fontSize: 14 }}>{q.titre}</strong>
                  <div style={{ margin: "4px 0", padding: "6px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontFamily: "'Cambria Math', 'STIX Two Math', Georgia, serif", fontSize: 15, lineHeight: 1.7 }}>
                    {q.formules.map((f) => <div key={f}>{f}</div>)}
                  </div>
                  <span style={{ fontSize: 12.5, color: "#475569" }}>{q.note}</span>
                </div>
              ))}
            </div>
          </details>
        )}
        {donnees && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "14px 0 4px" }}>
              <strong style={{ flex: 1 }}>Les données du modèle (380 à 780 nm, pas de 5 nm)</strong>
              <button type="button" style={bouton()} onClick={() => telechargerCSV("colorimetrie-toutes-les-donnees", donnees)}>⬇️ Tout télécharger (CSV)</button>
            </div>
            {donnees.map((g) => <Graphique key={g.id} g={g} />)}
          </>
        )}
        <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "#64748b" }}>📁 Pour les curieux : le modèle est dans le fichier <code>{outil.chemin}</code>.</p>
      </div>
    </div>,
    document.body,
  );
}

// --- Une étape du parcours guidé : section repliable ---
function Etape({ page, numero, etape, ouverte, basculer, faite, parIA, verrouillee, cocher, precedente, outil }) {
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

  const [mode, setMode] = useState(() => (lire(`${page}.mode`, "guide") === "libre" ? "libre" : "guide"));
  // Tout est repéré par le NUMÉRO de l'étape (0 = boîte à outils), pour ne rien décaler quand l'étape 0 apparaît.
  const [ouvertes, setOuvertes] = useState(() => lire(`${page}.ouvertesN`, [nums[0]]));
  const [recommencer, setRecommencer] = useState(false);
  const choisirMode = (m) => { setMode(m); ecrire(`${page}.mode`, m); };
  const basculer = (n) => setOuvertes((o) => { const m = o.includes(n) ? o.filter((x) => x !== n) : [...o, n]; ecrire(`${page}.ouvertesN`, m); return m; });
  const suivante = (n) => nums[nums.indexOf(n) + 1];
  // Étapes terminées : cochées ici, ou validées par l'IA dans la page (ETAPES_VALIDEES).
  const [cochees, setCochees] = useState(() => lire(`${page}.faitesN`, []));
  const parIA = validees;
  const faites = [...new Set([...cochees, ...parIA])];
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
    if (parIA.includes(n)) return;
    const m = cochees.includes(n) ? cochees.filter((x) => x !== n) : [...cochees, n];
    setCochees(m); ecrire(`${page}.faitesN`, m);
    if (!cochees.includes(n)) { // cochée : on replie celle-ci et on ouvre la suivante
      const s2 = suivante(n);
      setOuvertes((o) => { const k = [...o.filter((x) => x !== n), ...(s2 !== undefined && !o.includes(s2) ? [s2] : [])]; ecrire(`${page}.ouvertesN`, k); return k; });
    }
  };
  const verrouillee = (n) => { const k = nums.indexOf(n); return k > 0 && !faites.includes(nums[k - 1]); };
  // Étapes dont on surligne les mots clés : celles qui sont ouvertes (et déverrouillées), sinon l'étape en cours.
  const ouvertesLibres = nums.filter((n) => ouvertes.includes(n) && !verrouillee(n));
  const enCours = nums.find((n) => !faites.includes(n));
  const actives = mode !== "guide" ? [] : ouvertesLibres.length ? ouvertesLibres : enCours !== undefined ? [enCours] : [];
  const parNum = Object.fromEntries(liste.map((x) => [x.num, x.etape]));
  const remiseAZero = () => {
    ecrire(`${page}.ouvertesN`, [0, 1]); ecrire(`${page}.faitesN`, []); ecrire(`${page}.valideesVuesN`, []);
    [0, ...etapes.map((_, i) => i + 1)].forEach((n) => ecrire(`${page}.indices.${n}`, 0));
  };
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
        .ex-bascule-petite { padding: 2px; }
        details[open] > summary > .ex-fleche { display: inline-block; transform: rotate(90deg); }
        .ex-bascule-petite button { padding: 4px 10px; font-size: 12.5px; }
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
          <BoiteOutils page={page} avec={!sans} outils={outils} choix={estApercu && !!etapes.etapeOutils} />
          {mode === "guide"
            ? liste.map(({ num, etape }) => (
              <Etape key={num} page={page} numero={num} etape={etape} ouverte={ouvertes.includes(num)} basculer={() => basculer(num)}
                faite={faites.includes(num)} parIA={parIA.includes(num)} verrouillee={verrouillee(num)} cocher={() => cocher(num)}
                precedente={nums[nums.indexOf(num) - 1]} outil={outils[0]} />
            ))
            : <ExplorationLibre idees={idees} />}
        </section>

        {estApercu && <Sauvegardes page={page} />}
      </div>
      {groupesMots.length > 0 && <MotsCles groupes={groupesMots} surlignes={new Set(actives.flatMap((n) => parNum[n]?.motsCles || []))} pourEtapes={actives} />}
      {recommencer && <ToutRecommencer page={page} fermer={() => setRecommencer(false)} remiseAZero={remiseAZero} />}
    </div>
    </div>
  );
}
