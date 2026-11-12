// ============================================================
//  GUIDE (moteur, ne pas modifier) — la page « Ton site, étape par étape », à l'adresse  …/?guide
//  Seulement sur l'ordinateur (aperçu) : elle n'existe pas sur le site en ligne.
//  Elle relit PROGRESSION.md toutes les 2 secondes (via le serveur d'aperçu, voir vite.config.js) :
//  quand l'agent coche une étape, la page se met à jour toute seule.
// ============================================================
import { useEffect, useState } from "react";

// Envoi du mail d'instructions (depuis assistantia@rasf.fr) : c'est la personne qui clique, jamais l'agent.
const ADRESSE_ENVOI = "https://n8n.srv757556.hstgr.cloud/webhook/atelier-accueil";
const CLE_MAIL = "atelier.mailInstructions";
const lireMail = () => { try { return localStorage.getItem(CLE_MAIL) || ""; } catch { return ""; } };

function CarteMail({ suivi }) {
  const [envoyeA, setEnvoyeA] = useState(lireMail);
  const [adresse, setAdresse] = useState("");
  const [etat, setEtat] = useState("");
  const valable = /^[^@\s]+@rasf\.fr$/i.test(adresse.trim());

  async function envoyer(e) {
    e.preventDefault();
    if (!valable) { setEtat("erreur"); return; }
    setEtat("envoi");
    try {
      // Le mail s'adapte à l'endroit où en est la personne : étapes faites, dossier, adresse en ligne.
      const p = new URLSearchParams({ a: adresse.trim(), faites: [...suivi.faites].join(","), dossier: suivi.dossier || "", lieu: suivi.lieu || "", adresse: suivi.adresse || "" });
      await fetch(`${ADRESSE_ENVOI}?${p}`, { mode: "no-cors" });
      try { localStorage.setItem(CLE_MAIL, adresse.trim()); } catch { /* rien */ }
      setEnvoyeA(adresse.trim()); setEtat("");
    } catch { setEtat("panne"); }
  }

  return (
    <section className="g-carte g-mail" aria-labelledby="g-mail">
      <h2 id="g-mail"><span aria-hidden="true">📧</span> Reçois les instructions sur ton mail RASF</h2>
      {envoyeA ? (
        <p className="g-ok">✅ C'est envoyé à <b>{envoyeA}</b>. Regarde ta boîte mail dans une minute (et les courriers indésirables s'il n'arrive pas). <button type="button" className="g-lien" onClick={() => { setEnvoyeA(""); setAdresse(envoyeA); }}>Renvoyer</button></p>
      ) : (
        <>
          <p>Un mail qui fait le point sur <b>là où tu en es</b>, explique comment tout fonctionne (Antigravity, Gemini, ton dossier, Vercel) et comment reprendre un autre jour. Tu peux le redemander à chaque étape.</p>
          <form className="g-form" onSubmit={envoyer}>
            <input type="email" inputMode="email" autoComplete="email" placeholder="prenom.nom@rasf.fr" value={adresse}
              onChange={(e) => { setAdresse(e.target.value); if (etat === "erreur") setEtat(""); }} aria-label="Ton adresse mail RASF" />
            <button type="submit" className="g-bouton bleu" disabled={etat === "envoi"}>{etat === "envoi" ? "Envoi…" : "M'envoyer les instructions"}</button>
          </form>
          {etat === "erreur" && <p className="g-alerte">Il faut ton adresse RASF, celle qui finit par <b>@rasf.fr</b>.</p>}
          {etat === "panne" && <p className="g-alerte">L'envoi n'a pas marché : vérifie ta connexion à Internet, puis réessaie.</p>}
        </>
      )}
    </section>
  );
}

const ETAPES = [
  { emoji: "📦", titre: "Ton site arrive sur ton ordinateur", texte: "L'IA Gemini copie ton site sur ton ordinateur et l'installe." },
  { emoji: "👋", titre: "Faire connaissance", texte: "Cinq questions dans Antigravity : réponds en écrivant le numéro de ton choix.",
    sous: [
      ["Le nom de ton site", "Écris 1, 2 ou 3 pour un nom proposé, ou tape directement le nom que tu veux."],
      ["Sa couleur", "Écris le numéro de la couleur qui te plaît (ou son nom, par exemple « rouge »)."],
      ["Son style", "Regarde les 3 styles, puis écris 1, 2 ou 3."],
      ["Ton établissement", "Écris son nom tel qu'il doit s'afficher, ou le numéro de « Je le dirai plus tard »."],
      ["Ton nom ou ton pseudo", "Écris ton nom ou un pseudo : il s'affiche en bas de ton site."],
    ] },
  { emoji: "👀", titre: "Voir ton site", texte: "Ton site s'affiche ici, sur ton ordinateur : c'est ton brouillon (localhost), toi seul le vois.",
    infos: [
      "Les menus : « Construire avec l'IA » (s'entraîner à écrire ses demandes), « Exemples » (ce qu'on peut faire), A, B et C (pages vides, à toi de les remplir), « Outils ».",
      "Les boutons ronds en bas à droite : 🗺️ revenir à ce guide · 👆 montrer à l'IA ce que tu veux changer · 🎨 changer de style.",
    ], boutonSite: true },
  { emoji: "🚀", titre: "Le mettre en ligne", texte: "Vercel le publie gratuitement, à une adresse que tu pourras partager." },
  { emoji: "✨", titre: "La suite", texte: "Des idées à cliquer : ta première simulation, renommer les menus…" },
];

const CHOIX_FENETRE = [
  ["Yes, allow this time", "Oui, cette fois seulement"],
  ["Yes, and always allow in this conversation", "Oui, toujours dans cette conversation"],
  ["Yes, and always allow", "Oui, toujours : c'est celui-là", true],
  ["No (tell the agent what to do instead)", "Non (dire à l'IA quoi faire)"],
];

const LEXIQUE = [
  ["Allow", "autoriser"], ["Submit", "valider ma réponse"], ["Skip", "passer"],
  ["Other (write your answer)", "autre : écris ta réponse"], ["Continue with Google", "continuer avec Google"],
];

// Lit PROGRESSION.md : les étapes cochées « - [x] Étape N » et l'adresse du site en ligne.
function lire(texte) {
  const faites = new Set([...texte.matchAll(/^\s*-\s*\[x\]\s*Étape\s*(\d+)(?![.\d])/gim)].map((m) => Number(m[1])));
  // Sous-étapes cochées « - [x] Étape 1.3 — … » (les questions de l'étape « Faire connaissance »).
  const sousFaites = new Set([...texte.matchAll(/^\s*-\s*\[x\]\s*Étape\s*(\d+)\.(\d+)/gim)].map((m) => `${m[1]}.${m[2]}`));
  const adresse = texte.match(/Adresse du site\s*:\s*(https?:\/\/\S+)/i)?.[1];
  // Connexion Vercel en attente (écrite par l'agent) : « Connexion Vercel : https://vercel.com/… (code : ABCD-EFGH) »
  const m = texte.match(/Connexion Vercel\s*:\s*(https:\/\/vercel\.com\/[^\s)]+)(?:[^\n]*?code\s*:\s*([A-Z0-9-]+))?/i);
  const connexion = m ? { lien: m[1], code: m[2] || "" } : null;
  // Dossier du site, d'après la ligne « (Dossier du site : …/Desktop/mon-site) » : son nom et son endroit.
  const chemin = texte.match(/Dossier du site\s*:\s*([^)\n]+)/i)?.[1]?.trim() || "";
  const morceaux = chemin.split(/[\\/]/).filter(Boolean);
  const dossier = morceaux.at(-1) || "";
  const lieu = /documents/i.test(morceaux.at(-2) || "") ? "Documents" : "Bureau";
  return { faites, sousFaites, adresse, connexion, dossier, lieu };
}

function useProgression() {
  const [etat, setEtat] = useState({ faites: new Set(), sousFaites: new Set(), adresse: null, connexion: null, dossier: "", lieu: "", pret: false });
  useEffect(() => {
    let fini = false;
    const charger = () => fetch("./__atelier/progression", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { texte: "" }))
      .then(({ texte }) => { if (!fini) setEtat({ ...lire(texte || ""), pret: true }); })
      .catch(() => {});
    charger();
    const id = setInterval(charger, 2000);
    return () => { fini = true; clearInterval(id); };
  }, []);
  return etat;
}

const CSS = `
.g { --g-bleu:#2563eb; --g-vert:#16a34a; --g-orange:#f59e0b; min-height:100vh; background:linear-gradient(160deg,#eef4ff 0%,#fdf6ec 100%); color:#0f172a; padding:28px 16px 60px; }
.g * { box-sizing:border-box; }
.g-col { max-width:880px; margin:0 auto; display:flex; flex-direction:column; gap:22px; }
.g-hero { text-align:center; padding:10px 0 4px; }
.g-hero .g-main { font-size:56px; display:inline-block; animation:g-salut 2.4s ease-in-out infinite; transform-origin:70% 80%; }
@keyframes g-salut { 0%,60%,100%{transform:rotate(0)} 10%,30%{transform:rotate(16deg)} 20%,40%{transform:rotate(-8deg)} }
.g h1 { font:800 clamp(30px,5vw,46px)/1.1 'Outfit',sans-serif; letter-spacing:-.03em; margin:8px 0 10px; }
.g-sous { font-size:18px; color:#334155; margin:0 auto; max-width:620px; }
.g-carte { background:#fff; border-radius:22px; padding:22px 24px; box-shadow:0 1px 2px rgba(15,23,42,.06),0 8px 28px rgba(15,23,42,.07); }
.g h2 { font:800 22px/1.2 'Outfit',sans-serif; margin:0 0 14px; display:flex; align-items:center; gap:10px; }
.g-barre { height:14px; border-radius:99px; background:#e2e8f0; overflow:hidden; margin:4px 0 6px; }
.g-barre > div { height:100%; border-radius:99px; background:linear-gradient(90deg,#60a5fa,#22c55e); transition:width .8s cubic-bezier(.2,.8,.2,1); }
.g-compte { font-weight:800; color:#475569; font-size:15px; }
.g-etapes { list-style:none; margin:14px 0 0; padding:0; display:flex; flex-direction:column; gap:10px; }
.g-etape { display:flex; gap:14px; align-items:flex-start; padding:14px 16px; border-radius:16px; border:2px solid #e2e8f0; background:#f8fafc; transition:all .3s; }
.g-etape .g-pastille { width:46px; height:46px; flex-shrink:0; border-radius:14px; display:grid; place-items:center; font-size:24px; background:#e2e8f0; }
.g-etape h3 { margin:0; font:800 18px/1.25 'Outfit',sans-serif; display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.g-etape p { margin:4px 0 0; color:#475569; font-size:15.5px; line-height:1.45; }
.g-num { color:#94a3b8; font-weight:800; }
.g-etape.faite { background:#f0fdf4; border-color:#bbf7d0; }
.g-etape.faite .g-pastille { background:#dcfce7; }
.g-etape.faite h3 { color:#166534; }
.g-etape.encours { background:#fffbeb; border-color:var(--g-orange); box-shadow:0 0 0 5px rgba(245,158,11,.15); transform:scale(1.015); }
.g-etape.encours .g-pastille { background:#fde68a; animation:g-pulse 1.8s ease-in-out infinite; }
@keyframes g-pulse { 50% { transform:scale(1.1); } }
.g-etape.avenir { opacity:.62; }
.g-badge { font:800 12.5px 'Nunito',sans-serif; padding:3px 10px; border-radius:99px; background:var(--g-orange); color:#3a2500; }
.g-badge.ok { background:#22c55e; color:#fff; }
.g-fenetre { background:#141418; color:#e5e7eb; border-radius:18px; padding:16px 16px 12px; font-family:system-ui,sans-serif; max-width:560px; }
.g-fenetre-titre { font-weight:700; font-size:16px; margin:0 0 10px; display:flex; gap:8px; align-items:center; }
.g-choix { display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:12px; font-size:15px; position:relative; }
.g-choix .n { width:24px; height:24px; border-radius:7px; background:#2a2a31; display:grid; place-items:center; font-size:13px; color:#a1a1aa; flex-shrink:0; }
.g-choix small { display:block; color:#9ca3af; font-size:13px; margin-top:1px; }
.g-choix.bon { background:#1d3a24; outline:2px solid #22c55e; }
.g-choix.bon small { color:#86efac; font-weight:700; }
.g-fleche { margin-left:auto; font-size:22px; animation:g-pointe 1.2s ease-in-out infinite; }
@keyframes g-pointe { 50% { transform:translateX(-6px); } }
.g-regle { font-size:17px; margin:14px 0 0; }
.g-lexique { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:8px; margin-top:14px; }
.g-mot { background:#f1f5f9; border-radius:12px; padding:8px 12px; font-size:15px; }
.g-mot b { font-family:system-ui,sans-serif; }
.g-boutons { display:flex; flex-wrap:wrap; gap:12px; }
.g-bouton { display:inline-flex; align-items:center; gap:8px; padding:13px 20px; border-radius:14px; font:800 16px 'Nunito',sans-serif; text-decoration:none; transition:transform .15s, box-shadow .15s; }
.g-bouton:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(15,23,42,.15); }
.g-bouton.noir { background:#0f172a; color:#fff; }
.g-bouton.bleu { background:var(--g-bleu); color:#fff; }
.g-bouton.vert { background:var(--g-vert); color:#fff; }
.g-vercel { background:linear-gradient(135deg,#0f172a,#1e293b); color:#e2e8f0; }
.g-vercel h2 { color:#fff; }
.g-vercel p { margin:0 0 12px; font-size:16.5px; line-height:1.5; }
.g-vercel ol { margin:0 0 16px; padding-left:22px; display:flex; flex-direction:column; gap:6px; font-size:16px; }
.g-vercel b { color:#fff; }
.g-vercel .g-bouton { background:#fff; color:#0f172a; font-size:17px; padding:14px 24px; }
.g-mail p { margin:0 0 12px; color:#334155; }
.g-form { display:flex; flex-wrap:wrap; gap:10px; }
.g-form input { flex:1 1 240px; min-width:0; font:inherit; font-size:16px; padding:12px 14px; border-radius:12px; border:2px solid #cbd5e1; }
.g-form input:focus { outline:none; border-color:var(--g-bleu); box-shadow:0 0 0 4px rgba(37,99,235,.15); }
.g-form button { border:0; cursor:pointer; }
.g-form button:disabled { opacity:.6; cursor:wait; }
.g-mail .g-alerte { color:#b91c1c; font-weight:700; margin:10px 0 0 !important; }
.g-mail .g-ok { color:#166534 !important; font-size:16.5px; margin:0 !important; }
.g-lien { background:none; border:0; padding:0; color:var(--g-bleu); font:inherit; font-weight:700; text-decoration:underline; cursor:pointer; margin-left:6px; }
.g-connexion { box-shadow:0 0 0 5px rgba(245,158,11,.35); }
.g-code { font-family:Menlo,Consolas,monospace; background:#fde68a; color:#3a2500 !important; padding:1px 8px; border-radius:6px; letter-spacing:.06em; }
.g-repondre p { margin:0 0 8px; font-size:16.5px; color:#1e293b; }
.g-repondre .g-bouton { border:0; cursor:pointer; margin-top:6px; }
.g-voile { position:fixed; inset:0; background:rgba(15,23,42,.6); display:grid; place-items:center; padding:16px; z-index:50; animation:g-fondu .2s; }
@keyframes g-fondu { from { opacity:0; } }
.g-fenetre-aide { background:#fff; border-radius:20px; width:min(860px,100%); max-height:calc(100vh - 32px); overflow:auto; padding:20px 22px 24px; box-shadow:0 20px 60px rgba(0,0,0,.35); }
.g-aide-tete { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.g-aide-tete h2 { margin:0; }
.g-fermer { border:0; background:#f1f5f9; width:38px; height:38px; border-radius:50%; font-size:24px; line-height:1; cursor:pointer; color:#334155; }
.g-fermer:hover { background:#e2e8f0; }
.g-parties { list-style:none; margin:16px 0 0; padding:0; display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:10px; }
.g-parties li { display:flex; gap:10px; background:#f8fafc; border-radius:12px; padding:10px 12px; border:2px solid transparent; cursor:default; transition:border-color .15s, background .15s; }
.g-parties li.actif { border-color:#f59e0b; background:#fffbeb; }
.g-aide-astuce { margin:0 0 10px; color:#64748b; font-size:14.5px; }
.g-pastille-svg { cursor:pointer; outline:none; }
.g-zone { animation:g-zone 1.2s ease-in-out infinite; }
@keyframes g-zone { 50% { stroke-opacity:.45; } }
.g-parties p { margin:3px 0 0; font-size:14.5px; color:#475569; line-height:1.4; }
.g-num-partie { flex-shrink:0; min-width:26px; padding:0 4px; height:26px; border-radius:13px; background:#f59e0b; color:#1f1300; font-weight:800; display:grid; place-items:center; font-size:14px; }
.g-sous-etapes { list-style:none; margin:10px 0 0; padding:0; display:flex; flex-direction:column; gap:5px; }
.g-sous-etapes li { font-size:15px; color:#64748b; display:flex; align-items:center; flex-wrap:wrap; gap:6px; }
.g-sous-etapes li.fait { color:#166534; }
.g-sous-etapes li.encours { color:#0f172a; font-weight:800; }
.g-aide-sous { flex-basis:100%; margin:0 0 2px 26px; font-size:14px; font-weight:600; color:#92400e; }
.g-sous-etapes li:not(.encours) .g-aide-sous { color:#94a3b8; font-weight:400; }
.g-bouton-etape { margin-top:10px; font-size:15px; padding:10px 16px; }
.g-infos { margin:8px 0 0; padding-left:18px; display:flex; flex-direction:column; gap:4px; font-size:14.5px; color:#475569; }
.g-mini { border:1.5px solid #c4b5fd; background:#f5f3ff; color:#5b21b6; border-radius:99px; padding:3px 10px; font:700 13.5px 'Nunito',sans-serif; cursor:pointer; }
.g-mini:hover { background:#ede9fe; }
.g-styles { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
.g-style { margin:0; background:#f8fafc; border-radius:14px; padding:10px; border:2px solid #e2e8f0; }
.g-style svg { width:100%; height:auto; display:block; border-radius:8px; box-shadow:0 2px 8px rgba(15,23,42,.12); }
.g-style figcaption { margin-top:8px; display:flex; flex-direction:column; gap:3px; font-size:14.5px; color:#475569; }
.g-style figcaption b { color:#0f172a; font-size:15.5px; }
.g-pliable summary { list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:10px; }
.g-pliable summary::-webkit-details-marker { display:none; }
.g-pliable summary h2 { margin:0; }
.g-pliable[open] summary { margin-bottom:14px; }
.g-chevron { flex-shrink:0; border:2px solid #2563eb; color:#2563eb; background:#eff6ff; border-radius:99px; padding:5px 14px; font:800 14.5px 'Nunito',sans-serif; white-space:nowrap; }
.g-pliable summary:hover .g-chevron { background:#2563eb; color:#fff; }
.g-note { font-size:14.5px; color:#64748b; margin:10px 0 0; }
.g-bravo { text-align:center; font:800 22px 'Outfit',sans-serif; color:#166534; }
@media (max-width:560px) { .g-carte { padding:18px 16px; } .g-etape { padding:12px; } }
@media (prefers-reduced-motion:reduce) { .g * { animation:none !important; transition:none !important; } }
`;

// --- « Antigravity en un coup d'œil » : un schéma de la fenêtre. Survoler un numéro (ou sa fiche) encadre la zone concernée. ---
const PARTIES = [
  { id: "1a", titre: "Réduire la barre de gauche", texte: "Le petit bouton en forme de rectangle, tout en haut à gauche, à côté des trois ronds. Un clic cache la barre de gauche pour gagner de la place ; un 2e clic la rouvre." },
  { id: "1b", titre: "La barre de gauche", texte: "Tes conversations. « New Conversation » en ouvre une nouvelle ; un clic sur une conversation y revient. Tout en bas : Settings (les réglages)." },
  { id: "2", titre: "La conversation", texte: "Ce que l'IA Gemini te dit. Ses messages pour toi commencent par 💬 Pour toi. Le reste (« Ran commands », « Explored file »…) est technique : tu peux l'ignorer." },
  { id: "3", titre: "La zone de message", texte: "Tout en bas (« Ask anything… »). Écris-y le numéro de ta réponse, ou ta question, puis appuie sur Entrée. Le micro 🎤 permet de dicter." },
  { id: "4", titre: "Le choix du modèle", texte: "Sous la zone de message, à gauche (par exemple « Gemini 3.8 Flash »). Un clic ouvre la liste des modèles : choisis-en un pour la suite." },
  { id: "5", titre: "Ton usage", texte: "Dans ce même menu des modèles : « View Usage » montre ce qu'il te reste (limite des 5 heures et de la semaine). Si Antigravity affiche « Model quota reached », choisis un autre modèle." },
  { id: "6a", titre: "Le navigateur d'Antigravity", texte: "Le volet de droite est un navigateur intégré à Antigravity, avec des onglets, comme Chrome : ta page guide, ton site (localhost)… Clique sur un onglet pour passer de l'un à l'autre ; le × d'un onglet le ferme ; ↗ ouvre l'onglet dans ton navigateur habituel." },
  { id: "6b", titre: "Ouvrir un nouvel onglet", texte: "Le bouton + à droite des onglets ouvre un onglet vide. Tapes-y l'adresse de ton site (par exemple http://localhost:5799/) pour le voir à côté de ta page guide." },
  { id: "7a", titre: "Fermer le volet de droite", texte: "Le bouton en forme de rectangle, tout en haut à droite : un clic ferme le volet de droite, un 2e clic le rouvre." },
  { id: "7b", titre: "Agrandir le volet de droite", texte: "Le bouton ⤢, tout en haut à droite : le volet prend toute la fenêtre. Un 2e clic le remet à côté de la conversation." },
];

// Zone encadrée pour chaque numéro (coordonnées du schéma) et position de sa pastille.
const ZONES = {
  "1a": { x: 59, y: 3, w: 28, h: 26, px: 102, py: 16 },
  "1b": { x: 2, y: 34, w: 146, h: 394, px: 128, py: 82 },
  "2": { x: 158, y: 40, w: 312, h: 290, px: 400, py: 140 },
  "3": { x: 158, y: 338, w: 304, h: 78, px: 474, py: 352 },
  "4": { x: 168, y: 386, w: 116, h: 22, px: 206, py: 424 },
  "5": { x: 168, y: 386, w: 116, h: 22, px: 300, py: 398 },
  "6a": { x: 476, y: 32, w: 284, h: 398, px: 722, py: 110 },
  "6b": { x: 644, y: 35, w: 20, h: 20, px: 654, py: 76 },
  "7a": { x: 702, y: 3, w: 26, h: 26, px: 680, py: 16 },
  "7b": { x: 731, y: 3, w: 24, h: 26, px: 744, py: 44 },
};

function Pastille({ id, actif, setActif }) {
  const z = ZONES[id], on = actif === id;
  return (
    <g className="g-pastille-svg" tabIndex={0} role="button" aria-label={`Partie ${id}`}
      onMouseEnter={() => setActif(id)} onMouseLeave={() => setActif(null)} onFocus={() => setActif(id)} onBlur={() => setActif(null)}>
      <circle cx={z.px} cy={z.py} r={on ? 15 : 13} fill={on ? "#fbbf24" : "#f59e0b"} stroke="#fff" strokeWidth="2.5" />
      <text x={z.px} y={z.py + 4.5} textAnchor="middle" fontSize={id.length > 1 ? 11.5 : 14} fontWeight="800" fill="#1f1300" fontFamily="Nunito, sans-serif" pointerEvents="none">{id}</text>
    </g>
  );
}

function SchemaAntigravity({ actif, setActif }) {
  const t = { fontFamily: "Nunito, system-ui, sans-serif" };
  const z = actif && ZONES[actif];
  return (
    <svg viewBox="0 0 760 430" role="img" aria-label="Schéma de la fenêtre d'Antigravity, avec ses parties numérotées" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="0" y="0" width="760" height="430" rx="14" fill="#0b0b0f" />
      {/* barre du haut */}
      <circle cx="18" cy="16" r="5" fill="#3f3f46" /><circle cx="34" cy="16" r="5" fill="#3f3f46" /><circle cx="50" cy="16" r="5" fill="#3f3f46" />
      <rect x="64" y="7" width="18" height="18" rx="3" fill="none" stroke="#a1a1aa" strokeWidth="1.6" /><line x1="70" y1="9" x2="70" y2="23" stroke="#a1a1aa" strokeWidth="1.6" />
      <rect x="706" y="7" width="18" height="18" rx="3" fill="none" stroke="#a1a1aa" strokeWidth="1.6" /><line x1="718" y1="9" x2="718" y2="23" stroke="#a1a1aa" strokeWidth="1.6" />
      <text x="743" y="22" fontSize="15" fill="#a1a1aa" textAnchor="middle" style={t}>⤢</text>
      {/* barre de gauche */}
      <rect x="0" y="32" width="150" height="398" fill="#16161b" />
      <rect x="10" y="44" width="130" height="22" rx="6" fill="#26262e" /><text x="20" y="59" fontSize="11" fill="#e4e4e7" style={t}>+ New Conversation</text>
      <text x="16" y="92" fontSize="10" fill="#71717a" style={t}>Conversations</text>
      <rect x="10" y="100" width="130" height="20" rx="5" fill="#26262e" /><text x="18" y="114" fontSize="10" fill="#d4d4d8" style={t}>Création de mon site</text>
      <text x="16" y="414" fontSize="10" fill="#a1a1aa" style={t}>⚙ Settings</text>
      {/* conversation */}
      <rect x="166" y="48" width="200" height="34" rx="10" fill="#1e1e25" /><text x="176" y="69" fontSize="10" fill="#d4d4d8" style={t}>Crée mon site avec le modèle…</text>
      <text x="166" y="106" fontSize="10" fill="#71717a" style={t}>Ran commands ›</text>
      <text x="166" y="132" fontSize="11" fill="#fff" fontWeight="700" style={t}>💬 Pour toi :</text>
      <text x="166" y="152" fontSize="10.5" fill="#e4e4e7" style={t}>Quel nom pour ton site ?</text>
      <text x="166" y="174" fontSize="10.5" fill="#d4d4d8" style={t}>1. Mon labo virtuel</text>
      <text x="166" y="190" fontSize="10.5" fill="#d4d4d8" style={t}>2. La paillasse virtuelle</text>
      <text x="166" y="206" fontSize="10.5" fill="#d4d4d8" style={t}>3. 😕 Je suis perdu·e</text>
      <text x="166" y="228" fontSize="10" fill="#a1a1aa" fontStyle="italic" style={t}>✍️ Écris le numéro dans la zone de message</text>
      {/* zone de message */}
      <rect x="160" y="340" width="300" height="74" rx="14" fill="#1e1e25" stroke="#3f3f46" />
      <text x="176" y="366" fontSize="11" fill="#71717a" style={t}>Ask anything…   ← écris ici</text>
      <text x="176" y="401" fontSize="10.5" fill="#d4d4d8" style={t}>+   Gemini 3.8 Flash ⌃</text>
      <text x="360" y="401" fontSize="10.5" fill="#d4d4d8" style={t}>Auto   🎤</text>
      <circle cx="440" cy="397" r="10" fill="#fff" /><text x="440" y="401" fontSize="11" textAnchor="middle" fill="#0b0b0f" style={t}>↑</text>
      {/* volet de droite */}
      <rect x="476" y="32" width="284" height="398" fill="#f1f5f9" />
      <rect x="476" y="32" width="284" height="26" fill="#1c1c22" />
      <rect x="482" y="36" width="84" height="18" rx="5" fill="#3a3a44" /><text x="489" y="49" fontSize="9.5" fill="#fff" style={t}>Page guide  ×</text>
      <rect x="570" y="36" width="70" height="18" rx="5" fill="#26262e" /><text x="577" y="49" fontSize="9.5" fill="#a1a1aa" style={t}>Mon site  ×</text>
      <text x="654" y="50" fontSize="14" fill="#d4d4d8" textAnchor="middle" style={t}>+</text>
      <text x="700" y="49" fontSize="12" fill="#a1a1aa" textAnchor="middle" style={t}>↗</text>
      <rect x="482" y="62" width="272" height="16" rx="8" fill="#e2e8f0" /><text x="492" y="73" fontSize="8.5" fill="#64748b" style={t}>localhost:5799/?guide</text>
      <text x="610" y="104" fontSize="15" fontWeight="800" fill="#0f172a" textAnchor="middle" style={t}>Ta page guide</text>
      <rect x="496" y="118" width="244" height="40" rx="8" fill="#fff" /><rect x="496" y="168" width="244" height="80" rx="8" fill="#fff" />
      <rect x="506" y="182" width="224" height="18" rx="5" fill="#dcfce7" /><rect x="506" y="206" width="224" height="18" rx="5" fill="#fef3c7" stroke="#f59e0b" />
      {/* menu des modèles, montré pour 4 et 5 */}
      {(actif === "4" || actif === "5") && (
        <g>
          <rect x="168" y="270" width="190" height="112" rx="10" fill="#26262e" stroke="#52525b" />
          <text x="182" y="292" fontSize="10.5" fill="#e4e4e7" style={t}>✓ Gemini 3.8 Flash</text>
          <text x="182" y="314" fontSize="10.5" fill="#d4d4d8" style={t}>Gemini 3.8 Pro</text>
          <text x="182" y="336" fontSize="10.5" fill="#d4d4d8" style={t}>Claude…   GPT-OSS…</text>
          <rect x="174" y="348" width="178" height="24" rx="6" fill={actif === "5" ? "#f59e0b" : "#33333c"} />
          <text x="182" y="364" fontSize="10.5" fontWeight="700" fill={actif === "5" ? "#1f1300" : "#e4e4e7"} style={t}>View Usage</text>
        </g>
      )}
      {/* zone encadrée */}
      {z && (
        <rect className="g-zone" x={z.x} y={z.y} width={z.w} height={z.h} rx="8" fill="rgba(245,158,11,.16)" stroke="#f59e0b" strokeWidth="3" pointerEvents="none" />
      )}
      {PARTIES.map((p) => <Pastille key={p.id} id={p.id} actif={actif} setActif={setActif} />)}
    </svg>
  );
}

function FenetreAntigravity({ fermer }) {
  const [actif, setActif] = useState(null);
  useEffect(() => {
    const touche = (e) => { if (e.key === "Escape") fermer(); };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [fermer]);
  return (
    <div className="g-voile" onClick={fermer}>
      <div className="g-fenetre-aide" role="dialog" aria-modal="true" aria-labelledby="g-aide-titre" onClick={(e) => e.stopPropagation()}>
        <div className="g-aide-tete">
          <h2 id="g-aide-titre"><span aria-hidden="true">🧭</span> Antigravity en un coup d'œil</h2>
          <button type="button" className="g-fermer" onClick={fermer} aria-label="Fermer">×</button>
        </div>
        <p className="g-aide-astuce">Passe la souris sur un numéro (ou sur une fiche) : la partie correspondante s'entoure en orange.</p>
        <SchemaAntigravity actif={actif} setActif={setActif} />
        <ol className="g-parties">
          {PARTIES.map((p) => (
            <li key={p.id} className={actif === p.id ? "actif" : ""} onMouseEnter={() => setActif(p.id)} onMouseLeave={() => setActif(null)}>
              <span className="g-num-partie" aria-hidden="true">{p.id}</span><div><b>{p.titre}</b><p>{p.texte}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// --- Les 3 styles du site, côte à côte (même maquette que le vrai site, en miniature) ---
const STYLES_SITE = [
  { id: "blocs", nom: "1. Blocs de couleur", texte: "Menus en haut, accueil en grands blocs colorés. Joyeux et très visuel." },
  { id: "lateral", nom: "2. Barre latérale", texte: "Menus dans une barre sombre à gauche, accueil sobre en cartes. Fait « application »." },
  { id: "liste", nom: "3. Liste", texte: "Menus en haut, accueil en simple liste. Le plus rapide à lire." },
];
const COULEURS_MENUS = ["#2563eb", "#16a34a", "#f59e0b", "#db2777"];

function MiniSite({ id }) {
  const haut = (
    <g><rect x="0" y="0" width="200" height="18" fill="#0b4f94" /><rect x="8" y="6" width="44" height="6" rx="3" fill="#fff" />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={92 + k * 26} y="6" width="20" height="6" rx="3" fill="#bfdbfe" />)}</g>
  );
  if (id === "blocs") return (
    <svg viewBox="0 0 200 130" aria-hidden="true"><rect width="200" height="130" fill="#eef3f9" />{haut}
      <rect x="10" y="26" width="90" height="10" rx="3" fill="#0f172a" />
      {COULEURS_MENUS.map((c, k) => <rect key={k} x={10 + (k % 2) * 92} y={44 + Math.floor(k / 2) * 42} width="86" height="36" rx="6" fill={c} />)}
    </svg>
  );
  if (id === "lateral") return (
    <svg viewBox="0 0 200 130" aria-hidden="true"><rect width="200" height="130" fill="#f8fafc" />
      <rect x="0" y="0" width="48" height="130" fill="#1e293b" /><rect x="8" y="8" width="32" height="6" rx="3" fill="#fff" />
      {[0, 1, 2, 3, 4].map((k) => <rect key={k} x="8" y={24 + k * 12} width="30" height="5" rx="2.5" fill="#64748b" />)}
      <rect x="58" y="10" width="80" height="9" rx="3" fill="#0f172a" />
      {[0, 1, 2, 3].map((k) => <g key={k}><rect x={58 + (k % 2) * 70} y={30 + Math.floor(k / 2) * 48} width="64" height="42" rx="6" fill="#fff" stroke="#cbd5e1" />
        <rect x={64 + (k % 2) * 70} y={36 + Math.floor(k / 2) * 48} width="14" height="14" rx="4" fill={COULEURS_MENUS[k]} /></g>)}
    </svg>
  );
  return (
    <svg viewBox="0 0 200 130" aria-hidden="true"><rect width="200" height="130" fill="#fff" />{haut}
      <rect x="10" y="26" width="90" height="9" rx="3" fill="#0f172a" />
      {[0, 1, 2, 3, 4, 5].map((k) => <g key={k}><circle cx="16" cy={48 + k * 13} r="3.5" fill={COULEURS_MENUS[k % 4]} /><rect x="26" y={45 + k * 13} width={120 - (k % 3) * 20} height="6" rx="3" fill="#cbd5e1" /></g>)}
    </svg>
  );
}

function FenetreStyles({ fermer }) {
  useEffect(() => {
    const touche = (e) => { if (e.key === "Escape") fermer(); };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [fermer]);
  return (
    <div className="g-voile" onClick={fermer}>
      <div className="g-fenetre-aide" role="dialog" aria-modal="true" aria-labelledby="g-styles-titre" onClick={(e) => e.stopPropagation()}>
        <div className="g-aide-tete">
          <h2 id="g-styles-titre"><span aria-hidden="true">🎨</span> Les 3 styles de ton site</h2>
          <button type="button" className="g-fermer" onClick={fermer} aria-label="Fermer">×</button>
        </div>
        <p className="g-aide-astuce">Les pages et les menus restent les mêmes : seul l'habillage change. Tu pourras en changer à tout moment, en le demandant à l'IA Gemini.</p>
        <div className="g-styles">
          {STYLES_SITE.map((st) => (
            <figure key={st.id} className="g-style"><MiniSite id={st.id} /><figcaption><b>{st.nom}</b><span>{st.texte}</span></figcaption></figure>
          ))}
        </div>
        <p className="g-aide-astuce" style={{ marginTop: 14 }}>✍️ Dans Antigravity, écris le <b>numéro</b> du style qui te plaît, puis Entrée.</p>
      </div>
    </div>
  );
}

export function Guide() {
  const suivi = useProgression();
  const { faites, sousFaites, adresse, connexion } = suivi;
  const [styles, setStyles] = useState(false);
  // Carte « Les autorisations à accepter » : fermée par défaut, son état est retenu (un rafraîchissement le garde).
  const [fenetresOuvertes, setFenetresOuvertes] = useState(() => { try { return localStorage.getItem("atelier.autorisationsOuvertes") === "1"; } catch { return false; } });
  const basculerFenetres = (ouvert) => { setFenetresOuvertes(ouvert); try { localStorage.setItem("atelier.autorisationsOuvertes", ouvert ? "1" : "0"); } catch { /* rien */ } };
  const encours = ETAPES.findIndex((_, i) => !faites.has(i));
  const nbFaites = ETAPES.filter((_, i) => faites.has(i)).length;
  // La barre avance aussi pendant une étape à sous-étapes (2.1, 2.2…) : chaque sous-étape faite compte pour une part de l'étape.
  const partEnCours = encours >= 0 && ETAPES[encours].sous
    ? ETAPES[encours].sous.filter((_, j) => sousFaites.has(`${encours}.${j + 1}`)).length / ETAPES[encours].sous.length : 0;
  const avancement = Math.min(ETAPES.length, nbFaites + partEnCours);
  const toutFini = encours === -1;

  const [aide, setAide] = useState(false);
  // « Aller sur mon site » n'apparaît qu'au début de l'étape 3 (« Voir ton site »), une fois « Faire connaissance » cochée.
  // Onglets nommés : le bouton 🗺️ du site revient sur CET onglet, et « Aller sur mon site » sur celui du site, au lieu d'en ouvrir d'autres.
  useEffect(() => { document.title = "Ton site, étape par étape"; window.name = "atelier-guide"; }, []);

  return (
    <div className="g">
      <style>{CSS}</style>
      <div className="g-col">
        <header className="g-hero">
          <span className="g-main" aria-hidden="true">👋</span>
          <h1>Ton site, étape par étape</h1>
          <p className="g-sous">Garde cet onglet ouvert : il te montre où tu en es, et il se met à jour tout seul.</p>
        </header>

        <section className="g-carte g-repondre" aria-label="Comment répondre à l'IA Gemini">
          <p>✍️ <b>Pour répondre à l'IA Gemini</b> : écris le <b>numéro</b> de ta réponse dans la <b>zone de message</b> d'Antigravity, tout en bas, puis appuie sur <b>Entrée</b>.</p>
          <p>😕 <b>Perdu·e ?</b> Écris simplement <b>« je suis perdu »</b> dans cette même zone : l'IA Gemini t'aide pas à pas.</p>
          <div className="g-boutons">
            <button type="button" className="g-bouton bleu" onClick={() => setAide(true)}>🧭 Antigravity en un coup d'œil</button>
            {faites.has(1) && <a className="g-bouton vert" href="./" target="atelier-site">👀 Aller sur mon site (localhost)</a>}
            {adresse && <a className="g-bouton noir" href={adresse} target="atelier-en-ligne">🌍 Aller sur mon site en ligne</a>}
          </div>
        </section>
        {aide && <FenetreAntigravity fermer={() => setAide(false)} />}
        {styles && <FenetreStyles fermer={() => setStyles(false)} />}

        {connexion && !faites.has(3) && (
          <section className="g-carte g-vercel g-connexion" aria-labelledby="g-connexion">
            <h2 id="g-connexion"><span aria-hidden="true">🔑</span> Connecte ton compte Vercel</h2>
            <ol>
              <li>Clique sur le bouton ci-dessous : la page de Vercel s'ouvre dans un nouvel onglet.</li>
              <li>Clique <b>Continue with Google</b> et choisis le compte de ton compte Vercel.</li>
              {connexion.code && <li>Vérifie que le code affiché est bien <b className="g-code">{connexion.code}</b></li>}
              <li>Clique <b>Confirm</b> (ou <b>Allow</b>), puis reviens dans Antigravity et choisis « C'est fait ».</li>
            </ol>
            <a className="g-bouton" href={connexion.lien} target="_blank" rel="noreferrer">🔑 Connecter mon compte Vercel</a>
          </section>
        )}

        <CarteMail suivi={suivi} />

        <details className="g-carte g-pliable" open={fenetresOuvertes} onToggle={(e) => basculerFenetres(e.currentTarget.open)}>
          <summary><h2 id="g-fenetres"><span aria-hidden="true">🔐</span> Les autorisations à accepter (en anglais)</h2><span className="g-chevron" aria-hidden="true">{fenetresOuvertes ? "Réduire ▴" : "Afficher ▾"}</span></summary>
          <p style={{ margin: "0 0 14px", color: "#334155" }}>
            Dans Antigravity, des fenêtres comme celle-ci s'affichent sous la conversation. Elles demandent la permission avant une action de l'IA Gemini. <b>C'est sans danger pour ton ordinateur.</b>
          </p>
          <div className="g-fenetre" aria-label="Exemple de petite fenêtre d'autorisation">
            <p className="g-fenetre-titre"><span aria-hidden="true">🖥️</span> Allow …?</p>
            {CHOIX_FENETRE.map(([en, fr, bon], i) => (
              <div key={i} className={`g-choix${bon ? " bon" : ""}`}>
                <span className="n">{i + 1}</span>
                <span>{en}<small>{fr}</small></span>
                {bon && <span className="g-fleche" aria-hidden="true">👈</span>}
              </div>
            ))}
          </div>
          <p className="g-regle">👉 <b>Clique toujours sur le 3e choix, « Yes, and always allow »</b>, puis sur <b>Submit</b>. La même demande ne reviendra plus.</p>
          <div className="g-lexique">
            {LEXIQUE.map(([en, fr]) => <div key={en} className="g-mot"><b>{en}</b> = {fr}</div>)}
          </div>
        </details>

        <section className="g-carte" aria-labelledby="g-parcours">
          <h2 id="g-parcours"><span aria-hidden="true">🗺️</span> Où tu en es</h2>
          <div className="g-barre" role="progressbar" aria-valuemin={0} aria-valuemax={ETAPES.length} aria-valuenow={Math.round(avancement * 10) / 10}>
            <div style={{ width: `${Math.max(4, (100 * avancement) / ETAPES.length)}%` }} />
          </div>
          <span className="g-compte">{toutFini ? "Toutes les étapes sont faites 🎉" : `${nbFaites} étape${nbFaites > 1 ? "s" : ""} sur ${ETAPES.length} terminée${nbFaites > 1 ? "s" : ""}`}</span>
          <ol className="g-etapes">
            {ETAPES.map((e, i) => {
              const etat = faites.has(i) ? "faite" : i === encours ? "encours" : "avenir";
              return (
                <li key={i} className={`g-etape ${etat}`} aria-current={etat === "encours" ? "step" : undefined}>
                  <span className="g-pastille" aria-hidden="true">{etat === "faite" ? "✅" : e.emoji}</span>
                  <div>
                    <h3>
                      <span className="g-num">{i + 1}.</span> {e.titre}
                      {etat === "encours" && <span className="g-badge">On en est là</span>}
                      {etat === "faite" && <span className="g-badge ok">Fait</span>}
                    </h3>
                    <p>{e.texte}</p>
                    {e.infos && etat !== "avenir" && <ul className="g-infos">{e.infos.map((t, k) => <li key={k}>{t}</li>)}</ul>}
                    {e.boutonSite && etat !== "avenir" && (
                      <a className="g-bouton vert g-bouton-etape" href="./" target="atelier-site">👀 Aller sur mon site (localhost)</a>
                    )}
                    {e.sous && (
                      <ol className="g-sous-etapes">
                        {e.sous.map(([titre, aide], j) => {
                          const fait = etat === "faite" || sousFaites.has(`${i}.${j + 1}`);
                          const enCours = !fait && e.sous.findIndex((_, k) => !sousFaites.has(`${i}.${k + 1}`)) === j;
                          return (
                            <li key={j} className={fait ? "fait" : enCours ? "encours" : ""}>
                              <span aria-hidden="true">{fait ? "✅" : enCours ? "➡️" : "⬜"}</span> {i + 1}.{j + 1} {titre}
                              {titre === "Son style" && <button type="button" className="g-mini" onClick={() => setStyles(true)}>🎨 Voir les 3 styles</button>}
                              {!fait && <small className="g-aide-sous">✍️ {aide}</small>}
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {toutFini && <p className="g-bravo">Bravo, ton site est en ligne ! 🎉</p>}
        </section>

        {faites.has(1) && !faites.has(3) && (
          <section className="g-carte g-vercel" aria-labelledby="g-vercel">
            <h2 id="g-vercel"><span aria-hidden="true">▲</span> Ton compte Vercel</h2>
            <p><b>Vercel, c'est quoi ?</b> Un service <b>gratuit</b> qui mettra ton site sur Internet, à une adresse que tu pourras partager (par exemple <b>mon-site.vercel.app</b>). On s'en sert à l'étape 4 ; crée ton compte maintenant, ça prend 2 minutes.</p>
            <ol>
              <li>Clique sur le bouton ci-dessous : la page de Vercel s'ouvre dans un nouvel onglet.</li>
              <li>Choisis <b>Hobby</b> (gratuit) et écris ton nom.</li>
              <li>Clique <b>Continue with Google</b> et choisis ton compte d'établissement.</li>
              <li>Si Vercel te propose de relier GitHub ou de créer un projet : <b>ne fais rien</b>, ferme l'onglet et reviens dans Antigravity.</li>
            </ol>
            <a className="g-bouton" href="https://vercel.com/signup" target="_blank" rel="noreferrer">▲ Créer mon compte Vercel</a>
            <p className="g-note" style={{ color: "#94a3b8", margin: "12px 0 0" }}>Tu as déjà un compte Vercel ? Alors ne fais rien.</p>
          </section>
        )}

        <section className="g-carte" aria-labelledby="g-liens">
          <h2 id="g-liens"><span aria-hidden="true">🔗</span> Tes raccourcis</h2>
          <div className="g-boutons">
            {faites.has(1) && <a className="g-bouton bleu" href="./" target="atelier-site">👀 Voir mon site (brouillon, localhost)</a>}
            {adresse && <a className="g-bouton vert" href={adresse} target="atelier-en-ligne">🌍 Mon site en ligne</a>}
          </div>
        </section>
      </div>
    </div>
  );
}
