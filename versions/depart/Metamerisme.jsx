// ============================================================
//  MÉTAMÉRISME — exemple-exercice de l'Atelier simulation RASF : apprendre à écrire un prompt.
//  Au départ, la page ne montre qu'une scène fixe : une cabine de lumière et deux cartes de même couleur.
//  En dessous, un guide propose 6 étapes. Pour chacune : un objectif et une consigne. Le prof écrit son prompt
//  DANS ANTIGRAVITY, en commençant par « Exercice Métamérisme, étape N : ». L'agent vérifie d'abord le prompt
//  avec les critères de l'étape (les « indices » ci-dessous), fait ses remarques, puis l'exécute si le prof le veut.
//  Aides dans la page : des indices (un à la fois) et une proposition de réponse (cachée tant qu'on ne la demande pas).
//  Pour calculer les couleurs à partir des spectres, l'agent peut utiliser src/outils/colorimetrie.js.
// ============================================================
import { useState } from "react";
import { estApercu } from "../src/moteur/Apercu";

const ETAPES = [
  {
    titre: "Ajouter le choix des illuminants",
    consigne: "Rédige un prompt pour demander à l'IA d'ajouter plusieurs illuminants : on doit pouvoir choisir la lumière de la cabine.",
    indices: [
      "Nomme précisément les illuminants voulus et ce qu'ils représentent (A : lampe à incandescence, D65 : lumière du jour, F11 : tube fluorescent).",
      "Dis où mettre le choix (par exemple trois boutons au-dessus de la scène) et ce qui doit changer quand on clique (la teinte de l'intérieur de la cabine).",
      "Pense au confort : le choix doit être retenu quand on recharge la page. Et précise bien la page concernée (« Dans la page Métamérisme… »).",
    ],
    proposition: "Dans la page Métamérisme, ajoute au-dessus de la scène trois boutons pour choisir la lumière de la cabine : A (lampe à incandescence), D65 (lumière du jour) et F11 (tube fluorescent). L'intérieur de la cabine prend la teinte de la lumière choisie. Retiens le choix au rechargement de la page.",
  },
  {
    titre: "Faire glisser les cartes dans la cabine",
    consigne: "Rédige un prompt pour que l'on puisse déplacer les deux cartes de la table jusque dans la cabine.",
    indices: [
      "Comment déplace-t-on les cartes ? Pense à la souris ET au doigt (tablette, téléphone).",
      "Sur un petit écran, glisser est difficile : demande aussi un bouton qui place les deux cartes dans la cabine.",
      "Dis ce qui change quand une carte entre dans la cabine (elle prend la lumière de la cabine) et quand elle est sur la table (lumière du jour).",
    ],
    proposition: "Dans la page Métamérisme, rends les deux cartes déplaçables : on peut les faire glisser, à la souris ou au doigt, de la table jusque dans la cabine. Ajoute aussi un bouton « Mettre les deux cartes dans la cabine » pour le téléphone. Une carte dans la cabine prend la lumière de la cabine ; sur la table, elle reste à la lumière du jour.",
  },
  {
    titre: "Calculer les couleurs à partir des spectres",
    consigne: "Rédige un prompt pour que les couleurs des cartes soient calculées (et non choisies à la main), avec une différence visible sous l'illuminant A.",
    indices: [
      "À partir de quoi calcule-t-on une couleur ? Des spectres (de la lumière et de la carte) et de l'observateur CIE 1931. Le site a déjà un outil pour ça : src/outils/colorimetrie.js.",
      "Que doit-on observer ? Les deux cartes ont la même couleur sous D65, mais pas sous A : c'est une « paire métamère ».",
      "Comment mesurer la différence ? Demande d'afficher l'écart ΔE*ab entre les deux cartes, avec une phrase qui dit si la différence se voit.",
    ],
    proposition: "Dans la page Métamérisme, calcule la couleur des cartes à partir des spectres, avec src/outils/colorimetrie.js : observateur CIE 1931, illuminants A, D65 et F11. Les deux cartes forment une paire métamère : exactement la même couleur sous D65, mais une différence nette sous A. Affiche sous la scène l'écart ΔE*ab entre les deux cartes quand elles sont toutes les deux dans la cabine, avec une phrase qui dit si la différence se voit.",
  },
  {
    titre: "Montrer les spectres des illuminants",
    consigne: "Rédige un prompt pour afficher, dans une fenêtre, les spectres des trois illuminants.",
    indices: [
      "Où les afficher ? Par exemple un bouton qui ouvre une fenêtre (popup), pour ne pas encombrer la page.",
      "Quel graphique ? Les longueurs d'onde de 380 à 780 nm, les trois courbes ramenées à la même luminosité pour pouvoir les comparer, avec une légende.",
      "Quel message ? Une phrase qui fait remarquer que A est très fort dans le rouge, D65 presque plat, F11 fait de trois raies étroites.",
    ],
    proposition: "Dans la page Métamérisme, ajoute un bouton « Spectres des illuminants » qui ouvre une fenêtre avec un graphique : les spectres de A, D65 et F11 entre 380 et 780 nm, ramenés à la même luminosité, avec une légende. Ajoute une phrase : A est très fort dans le rouge, D65 est presque plat, F11 a trois raies étroites.",
  },
  {
    titre: "Montrer les spectres des deux cartes",
    consigne: "Rédige un prompt pour afficher les spectres de réflexion des deux cartes et faire comprendre pourquoi elles paraissent différentes sous A.",
    indices: [
      "Les deux spectres doivent être superposés sur le même graphique, pour pouvoir les comparer.",
      "Qu'est-ce qui doit sauter aux yeux ? Les courbes sont très proches et se croisent en 3 points : demande de marquer ces points avec leur longueur d'onde.",
      "Où sont-elles différentes ? Surtout dans le rouge : demande de surligner cette zone, et d'expliquer le lien avec l'illuminant A.",
    ],
    proposition: "Dans la page Métamérisme, ajoute un bouton « Spectres des deux cartes » qui ouvre une fenêtre avec leurs spectres de réflexion superposés (380 à 780 nm). On doit voir que les deux courbes sont très proches, se croisent en 3 points (marque-les avec leur longueur d'onde) et divergent surtout dans le rouge (surligne la zone 600-700 nm). Explique en deux phrases pourquoi les cartes paraissent différentes sous A.",
  },
  {
    titre: "Le message à retenir",
    consigne: "Rédige un prompt pour ajouter la conclusion de la simulation, puis terminer la page.",
    indices: [
      "Quelle forme ? Un encadré « À retenir », bien visible en bas de la page.",
      "Quel contenu ? La définition du métamérisme, et une conséquence pratique : comment comparer correctement deux couleurs.",
      "Pour finir la page : le guide « Construis cette simulation avec l'IA » n'a plus lieu d'être. Demande de le retirer.",
    ],
    proposition: "Dans la page Métamérisme, ajoute en bas un encadré « À retenir » : deux couleurs identiques sous une lumière peuvent être différentes sous une autre ; c'est le métamérisme. Pour comparer deux couleurs, on les regarde toujours sous la même lumière, et de préférence sous plusieurs lumières (cabine de lumière). Puis retire de la page le guide « Construis cette simulation avec l'IA ».",
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

// Lecture et écriture prudentes dans la mémoire du navigateur (le brouillon de chaque étape est retenu).
const lire = (cle, defaut) => { try { const v = localStorage.getItem(cle); return v === null ? defaut : JSON.parse(v); } catch { return defaut; } };
const ecrire = (cle, v) => { try { localStorage.setItem(cle, JSON.stringify(v)); } catch { /* sans importance */ } };

// --- Sauvegardes (seulement sur l'ordinateur, pendant l'aperçu) ---
// Copies de cette page dans le dossier versions/Metamerisme du site ; « Recommencer à zéro » remet la page de départ.
// Avant une reprise ou un retour à zéro, l'état actuel est toujours sauvegardé : on ne perd rien.
function Sauvegardes({ page, remiseAZero }) {
  const [nom, setNom] = useState("");
  const [liste, setListe] = useState(null);      // null = fermée
  const [confirmer, setConfirmer] = useState(null); // "zero" ou nom de fichier à reprendre
  const [message, setMessage] = useState("");
  const appel = async (action, corps) => {
    const r = await fetch(`__atelier/versions/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ page, ...corps }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erreur || `erreur ${r.status}`);
    return j;
  };
  const charger = async () => {
    const r = await fetch(`__atelier/versions?page=${page}`);
    const j = await r.json();
    setListe(j.fichiers || []);
  };
  const sauver = async () => {
    try { const j = await appel("sauver", { nom }); setMessage(`✅ Sauvegardé : versions/${page}/${j.fichier}`); setNom(""); if (liste) charger(); }
    catch (e) { setMessage(`⚠️ ${e.message}`); }
  };
  const reprendre = async (fichier) => {
    if (confirmer !== fichier) return setConfirmer(fichier);
    try { setMessage("⏳ Reprise…"); await appel("restaurer", { fichier }); setMessage("✅ Version reprise : la page se recharge."); }
    catch (e) { setMessage(`⚠️ ${e.message}`); }
  };
  const zero = async () => {
    if (confirmer !== "zero") return setConfirmer("zero");
    try { remiseAZero(); setMessage("⏳ Retour au départ…"); await appel("zero", {}); setMessage("✅ Page de départ remise : la page se recharge."); }
    catch (e) { setMessage(`⚠️ ${e.message}`); }
  };
  const lisible = (f) => f.replace(/\.jsx$/, "").replace(/^(\d{4})-(\d\d)-(\d\d)_(\d\d)h(\d\d)-\d\d-?/, "$3/$2/$1 à $4h$5 · ").replace(/-/g, " ");
  const bouton = (danger) => ({ padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 800, fontSize: 13.5, border: "none",
    background: danger ? "#fef2f2" : "#fff", color: danger ? "#b91c1c" : "#334155", boxShadow: `inset 0 0 0 1px ${danger ? "#fecaca" : "#d5dfeb"}` });

  return (
    <div style={{ marginTop: 14, padding: "12px 14px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12 }}>
      <strong style={{ fontSize: 14 }}>💾 Sauvegardes</strong>
      <span style={{ fontSize: 12.5, color: "#64748b" }}> · rangées sur ton ordinateur, dans le dossier <code>versions/{page}</code> de ton site (visible seulement ici)</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, alignItems: "center" }}>
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom (facultatif) : étape 2 réussie…" maxLength={40}
          style={{ flex: "1 1 180px", minWidth: 0, padding: "8px 10px", borderRadius: 10, border: "1px solid #cbd5e1", font: "inherit", fontSize: 13.5 }} />
        <button type="button" style={bouton(false)} onClick={sauver}>💾 Sauvegarder cette version</button>
        <button type="button" style={bouton(false)} onClick={() => (liste ? setListe(null) : charger())}>{liste ? "📂 Fermer la liste" : "📂 Reprendre une version"}</button>
        <button type="button" style={bouton(true)} onClick={zero}>{confirmer === "zero" ? "⚠️ Sûr ? Clique encore pour tout recommencer" : "↺ Recommencer à zéro"}</button>
      </div>
      {liste && (
        <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "grid", gap: 6 }}>
          {liste.length === 0 && <li style={{ fontSize: 13.5, color: "#64748b" }}>Aucune sauvegarde pour l'instant.</li>}
          {liste.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 13.5 }}>
              <span style={{ flex: 1, minWidth: 0 }}>{lisible(f)}</span>
              <button type="button" style={bouton(false)} onClick={() => reprendre(f)}>{confirmer === f ? "⚠️ Clique encore pour reprendre" : "Reprendre"}</button>
            </li>
          ))}
        </ul>
      )}
      {message && <p style={{ margin: "8px 0 0", fontSize: 13.5 }}>{message}</p>}
    </div>
  );
}

// --- Exploration libre : pas d'étapes, on demande ce qu'on veut ---
const IDEES_LIBRES = [
  "ajoute une troisième carte, d'une autre couleur, qui reste identique sous les trois lumières (elle sert de témoin)",
  "ajoute un curseur pour régler la température de couleur de la lampe de la cabine, de 2700 K à 6500 K",
  "affiche en grand, sous la scène, l'écart ΔE*ab entre les deux cartes, avec une couleur verte, orange ou rouge selon qu'il se voit ou non",
  "ajoute une question à choix pour l'élève : « Sous quelle lumière les deux cartes sont-elles différentes ? », avec la correction",
];
function ExplorationLibre({ copier, copie, bouton }) {
  const debut = "Exercice Métamérisme, exploration libre : ";
  return (
    <div>
      <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.55 }}>
        🧪 <strong>Pas d'étapes :</strong> demande à l'agent ce que tu veux ajouter ou changer dans cette page. Il le fait directement, puis te dit en deux lignes ce qu'il a fait et comment rendre ta demande plus précise.
      </p>
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", lineHeight: 1.6, fontSize: 14.5 }}>
        👉 <strong>Écris ton prompt dans la conversation avec l'agent, dans Antigravity</strong>, en commençant par :
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "6px 0 0" }}>
          <code style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "4px 10px", fontSize: 14.5 }}>{debut}</code>
          <button type="button" style={bouton(false)} onClick={() => copier("debut-libre", debut)}>{copie === "debut-libre" ? "✓ Copié !" : "📋 Copier ce début"}</button>
        </div>
      </div>
      <p style={{ margin: "14px 0 6px", fontWeight: 800, fontSize: 14.5 }}>💡 Besoin d'une idée ?</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
        {IDEES_LIBRES.map((idee, i) => (
          <li key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 14, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "6px 10px" }}>
            <span style={{ flex: "1 1 260px" }}>{idee.charAt(0).toUpperCase() + idee.slice(1)}.</span>
            <button type="button" style={bouton(false)} onClick={() => copier(`idee-${i}`, `${debut}dans la page Métamérisme, ${idee}.`)}>{copie === `idee-${i}` ? "✓ Copié !" : "📋 Copier"}</button>
          </li>
        ))}
      </ul>
      <p style={{ margin: "10px 0 0", fontSize: 13, color: "#64748b" }}>Pense à sauvegarder avant de te lancer : tu pourras toujours revenir en arrière, ou reprendre le parcours guidé.</p>
    </div>
  );
}

// --- Le guide : une étape à la fois ---
function Guide() {
  const [n, setN] = useState(() => Math.min(ETAPES.length - 1, Math.max(0, lire("metamerisme.etape", 0))));
  const [mode, setMode] = useState(() => (lire("metamerisme.mode", "guide") === "libre" ? "libre" : "guide")); // parcours guidé ou exploration libre
  const choisirMode = (m) => { setMode(m); ecrire("metamerisme.mode", m); };
  const [indices, setIndices] = useState(() => lire("metamerisme.indices", ETAPES.map(() => 0)));    // nombre d'indices montrés
  const [voirProposition, setVoirProposition] = useState(false);
  const [copie, setCopie] = useState(null);
  const etape = ETAPES[n];
  // La consigne d'analyse est DANS le texte copié : l'agent ne peut pas la manquer, même s'il a lu un ancien AGENTS.md.
  const debut = `Exercice Métamérisme, étape ${n + 1} — analyse d'abord mon prompt sans coder ni me donner la réponse, puis demande-moi si je l'exécute : `;

  const aller = (i) => { setN(i); setVoirProposition(false); setCopie(null); ecrire("metamerisme.etape", i); };
  const indiceSuivant = () => { const t = indices.map((x, i) => (i === n ? Math.min(etape.indices.length, x + 1) : x)); setIndices(t); ecrire("metamerisme.indices", t); };
  const copier = (quoi, valeur) => navigator.clipboard?.writeText(valeur).then(() => { setCopie(quoi); setTimeout(() => setCopie(null), 2000); });

  const bouton = (principal, inactif = false) => ({ padding: "9px 14px", borderRadius: 12, cursor: inactif ? "not-allowed" : "pointer", fontWeight: 800, fontSize: 14, border: "none",
    background: principal ? "var(--accent)" : "#fff", color: principal ? "#fff" : "#334155", boxShadow: "inset 0 0 0 1px #d5dfeb", opacity: inactif ? 0.5 : 1 });

  return (
    <section aria-label="Construis cette simulation avec l'IA" style={{ background: "#fff", border: "2px solid var(--accent)", borderRadius: 18, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 17 }}>🤖 Construis cette simulation avec l'IA</strong>
        {mode === "guide" && <span style={{ fontSize: 14, color: "#64748b", fontWeight: 700 }}>Étape {n + 1} / {ETAPES.length}</span>}
      </div>
      <div role="tablist" style={{ display: "flex", gap: 6, margin: "10px 0 0", flexWrap: "wrap" }}>
        {[["guide", "🧭 Parcours guidé"], ["libre", "🧪 Exploration libre"]].map(([id, nom]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} onClick={() => choisirMode(id)}
            style={{ padding: "8px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14,
              background: mode === id ? "var(--accent)" : "#fff", color: mode === id ? "#fff" : "#334155", boxShadow: "inset 0 0 0 1px #d5dfeb" }}>{nom}</button>
        ))}
      </div>
      {mode === "guide" ? (<>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, margin: "10px 0 14px", overflow: "hidden" }}>
        <div style={{ width: `${((n + 1) / ETAPES.length) * 100}%`, height: "100%", background: "var(--accent)", transition: "width .2s" }} />
      </div>

      <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>{n + 1}. {etape.titre}</h3>
      <p style={{ margin: "0 0 12px", fontSize: 15, color: "#0f172a" }}>✍️ <strong>{etape.consigne}</strong></p>

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", lineHeight: 1.6, fontSize: 14.5 }}>
        👉 <strong>Écris ton prompt dans la conversation avec l'agent, dans Antigravity</strong>, en commençant par :
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "6px 0" }}>
          <code style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, padding: "4px 10px", fontSize: 14.5 }}>{debut}</code>
          <button type="button" style={bouton(false)} onClick={() => copier("debut", debut)}>{copie === "debut" ? "✓ Copié !" : "📋 Copier ce début"}</button>
        </div>
        L'agent <strong>vérifie d'abord ton prompt</strong> : il te dit ce qui est réussi et ce qui manque, sans te donner la réponse. Ensuite, à toi de choisir : corriger ton prompt, ou le faire exécuter. Regarde le résultat dans l'aperçu, puis passe à l'étape suivante.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        <button type="button" style={bouton(false, indices[n] >= etape.indices.length)} onClick={indiceSuivant} disabled={indices[n] >= etape.indices.length}>
          💡 {indices[n] === 0 ? "Un indice" : indices[n] < etape.indices.length ? "Un autre indice" : "Plus d'indice"}
        </button>
        <button type="button" style={bouton(false)} onClick={() => setVoirProposition((v) => !v)}>{voirProposition ? "🙈 Cacher la proposition" : "👀 Proposition de réponse"}</button>
      </div>

      {indices[n] > 0 && (
        <ol style={{ margin: "12px 0 0", padding: "10px 14px 10px 32px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, lineHeight: 1.55, fontSize: 14.5 }}>
          {etape.indices.slice(0, indices[n]).map((t, i) => <li key={i} style={{ margin: "3px 0" }}>{t}</li>)}
        </ol>
      )}
      {voirProposition && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12 }}>
          <strong style={{ fontSize: 14 }}>Une proposition (il y en a d'autres de justes) :</strong>
          <p style={{ margin: "6px 0 8px", fontSize: 14.5, lineHeight: 1.55 }}>{etape.proposition}</p>
          <button type="button" style={bouton(false)} onClick={() => copier("proposition", debut + etape.proposition)}>{copie === "proposition" ? "✓ Copié !" : "📋 Copier la proposition"}</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
        {n > 0 && <button type="button" style={bouton(false)} onClick={() => aller(n - 1)}>← Précédent</button>}
        {n < ETAPES.length - 1
          ? <button type="button" style={bouton(true)} onClick={() => aller(n + 1)}>Suivant →</button>
          : <span style={{ alignSelf: "center", fontWeight: 800, color: "#15803d" }}>🎉 Dernière étape</span>}
      </div>
      </>) : <div style={{ marginTop: 12 }}><ExplorationLibre copier={copier} copie={copie} bouton={bouton} /></div>}
      {estApercu && <Sauvegardes page="Metamerisme" remiseAZero={() => { ecrire("metamerisme.etape", 0); ecrire("metamerisme.indices", ETAPES.map(() => 0)); }} />}
    </section>
  );
}

export default function Metamerisme() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 14 }}>
      <p style={{ margin: 0 }}>Deux cartes de même couleur et une cabine de lumière : c'est le point de départ. À toi de construire la simulation du <strong>métamérisme</strong> en écrivant toi-même tes demandes à l'agent, dans Antigravity, une étape à la fois.</p>
      <Scene />
      <Guide />
    </div>
  );
}
