// ============================================================
//  GUIDE (moteur, ne pas modifier) — la page « J'en suis où de l'installation », à l'adresse  …/?guide
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
  { emoji: "🗺️", titre: "Installer ta page guide", texte: "L'IA Gemini copie le modèle sur ton ordinateur et t'ouvre ce guide." },
  { emoji: "👋", titre: "Faire connaissance", texte: "Cinq questions dans Antigravity : réponds en écrivant le numéro de ton choix.",
    sous: [
      ["Le nom de ton site", "Écris 1, 2 ou 3 pour un nom proposé, ou tape directement le nom que tu veux."],
      ["Sa couleur", "Écris le numéro de la couleur qui te plaît (ou son nom, par exemple « rouge »)."],
      ["Son style", "Regarde les 3 styles, puis écris 1, 2 ou 3."],
      ["Ton établissement", "Écris son nom tel qu'il doit s'afficher, ou le numéro de « Je le dirai plus tard »."],
      ["Ton nom ou ton pseudo", "Écris ton nom ou un pseudo : il s'affiche en bas de ton site."],
    ] },
  { emoji: "🛠️", titre: "Installer ton site", texte: "L'IA Gemini met tes choix (nom, couleur, style, établissement, ton nom) dans ton site." },
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

export const CSS = `
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
.g-danger { background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:10px 14px; color:#7f1d1d; }
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
.g-phrase { background:#f1f5f9; border:1px solid #cbd5e1; border-radius:10px; padding:12px 14px; font-family:Menlo,Consolas,monospace; font-size:14.5px; color:#0f172a; }
.g-paysage { width:min(1280px, 96vw); max-height:94vh; padding:16px 18px 18px; }
.g-paysage .g-aide-tete { margin-bottom:10px; }
.g-aide-corps { display:grid; grid-template-columns:minmax(0, 1fr) 290px; gap:16px; align-items:start; }
.g-aide-schema { min-width:0; }
.g-aide-cote { display:flex; flex-direction:column; gap:10px; }
.g-liste-parties { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:3px; }
.g-liste-parties button { all:unset; box-sizing:border-box; width:100%; display:flex; align-items:center; gap:8px; padding:5px 8px; border-radius:9px; font-size:14px; font-weight:700; color:#334155; cursor:pointer; border:2px solid transparent; }
.g-liste-parties button:hover, .g-liste-parties button.actif { background:#fffbeb; border-color:#f59e0b; color:#0f172a; }
.g-liste-parties .g-num-partie { min-width:24px; height:22px; font-size:12px; }
.g-apparait { animation:g-fondu .45s; }
.g-clic { animation:g-clic 1.2s ease-out infinite; transform-origin:center; transform-box:fill-box; }
@keyframes g-clic { 0%,55% { opacity:0; transform:scale(.4); } 65% { opacity:1; } 100% { opacity:0; transform:scale(1.8); } }
.g-trou, .g-zone { transition: x .55s cubic-bezier(.2,.8,.2,1), y .55s cubic-bezier(.2,.8,.2,1), width .55s cubic-bezier(.2,.8,.2,1), height .55s cubic-bezier(.2,.8,.2,1); }
.v { max-width:min(1000px, max(340px, calc((100vh - 300px) * 1.77))); margin:0 auto; display:flex; flex-direction:column; gap:14px; }
.v-tete { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.v-tete h1 { font:800 clamp(24px,3.6vw,34px)/1.1 'Outfit',sans-serif; margin:0; flex:1; letter-spacing:-.02em; }
.v-compte { font-weight:800; color:#475569; }
.v-barre { height:8px; border-radius:99px; background:#e2e8f0; overflow:hidden; }
.v-barre > div { height:100%; background:linear-gradient(90deg,#60a5fa,#f59e0b); transition:width .5s; }
.v-scene { position:relative; border-radius:16px; box-shadow:0 18px 50px rgba(15,23,42,.25); overflow:hidden; }
.v-bulle { background:#fff; border-radius:18px; padding:18px 22px; border:3px solid #f59e0b; box-shadow:0 8px 28px rgba(15,23,42,.12); animation:v-entre .45s cubic-bezier(.2,.8,.2,1); }
@keyframes v-entre { from { opacity:0; transform:translateY(14px) scale(.98); } to { opacity:1; transform:none; } }
.v-bulle h2 { margin:0 0 6px; display:flex; align-items:center; gap:10px; font:800 22px/1.2 'Outfit',sans-serif; }
.v-bulle p { margin:0; font-size:18px; line-height:1.55; color:#1e293b; }
.v-minuteur { height:4px; border-radius:99px; background:#fde68a; margin-top:14px; overflow:hidden; }
.v-minuteur > div { height:100%; background:#f59e0b; animation:v-temps linear forwards; }
@keyframes v-temps { from { width:0; } to { width:100%; } }
.v-commandes { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.v-bouton { all:unset; cursor:pointer; padding:11px 20px; border-radius:12px; font-weight:800; font-size:17px; background:#e2e8f0; color:#0f172a; }
.v-bouton:hover { filter:brightness(.95); } .v-bouton:focus-visible { outline:3px solid #2563eb; outline-offset:2px; }
.v-bouton.bleu { background:#2563eb; color:#fff; } .v-bouton.orange { background:#f59e0b; color:#1f1300; }
.v-points { display:flex; gap:6px; flex-wrap:wrap; flex:1; justify-content:center; }
.v-point { all:unset; cursor:pointer; min-width:28px; height:28px; border-radius:14px; display:grid; place-items:center; font-size:12px; font-weight:800; background:#e2e8f0; color:#475569; transition:all .2s; }
.v-point.vu { background:#fde68a; color:#92400e; } .v-point.ici { background:#f59e0b; color:#1f1300; transform:scale(1.15); }
.v-explorer { width:100%; max-height:none; overflow:visible; }
.v-accueil { text-align:center; background:#fff; border-radius:22px; padding:34px 24px; box-shadow:0 8px 28px rgba(15,23,42,.1); animation:v-entre .5s; }
.v-accueil .g-main { font-size:60px; }
.v-accueil h1 { font:800 clamp(28px,4.5vw,42px)/1.1 'Outfit',sans-serif; margin:10px 0; }
.v-accueil p { font-size:19px; color:#334155; margin:0 auto 22px; max-width:560px; }
.g-fiche { margin-top:12px; background:#fffbeb; border:2px solid #f59e0b; border-radius:14px; padding:12px 16px; min-height:84px; }
.g-fiche b { display:flex; align-items:center; gap:8px; font-size:17px; }
.g-fiche p { margin:6px 0 0; font-size:16px; line-height:1.5; color:#1e293b; }
@media (max-width:760px) { .g-aide-corps { grid-template-columns:1fr; } }
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
  { id: "4", titre: "Le choix du modèle", texte: "Sous la zone de message, à gauche (par exemple « Gemini 3.8 Flash »). Un clic ouvre la liste des modèles. Passe la souris sur un modèle Gemini : 3 niveaux s'affichent, Low (faible : le plus rapide, consomme le moins), Medium (moyen) et High (élevé : plus réfléchi, consomme plus). Low ou Medium suffisent pour ton site." },
  { id: "5", titre: "Ton usage", texte: "Dans le menu des modèles, passe la souris sur « View Usage » : Antigravity montre ce qu'il te reste pour la semaine, en pourcentage, pour chaque famille : « Gemini Models » (avec la date de remise à zéro, par exemple « resets in 6d 22h ») et « Claude and GPT models ». À 0 %, il affiche « Model quota reached » : attends la remise à zéro, ou choisis un modèle de l'autre famille." },
  { id: "6a", titre: "Le navigateur d'Antigravity", texte: "Le volet de droite est un navigateur intégré à Antigravity, avec des onglets, comme Chrome : ta page « J'en suis où », ton site (localhost)… Clique sur un onglet pour passer de l'un à l'autre ; le × d'un onglet le ferme ; ↗ ouvre l'onglet dans ton navigateur habituel." },
  { id: "6b", titre: "Ouvrir un nouvel onglet", texte: "Le bouton + à droite des onglets ouvre un onglet vide. Tapes-y l'adresse de ton site (par exemple http://localhost:5799/) pour le voir à côté de ta page « J'en suis où »." },
  { id: "6c", titre: "Régler la largeur", texte: "La fine barre verticale entre la conversation (2) et le volet de droite (6) se déplace : pose la souris dessus (le curseur devient ↔), garde le bouton appuyé et glisse à gauche ou à droite pour donner plus de place à l'un ou à l'autre." },
  { id: "7a", titre: "Fermer le volet de droite", texte: "Le bouton en forme de rectangle, tout en haut à droite : un clic ferme le volet de droite, un 2e clic le rouvre." },
  { id: "7b", titre: "Agrandir le volet de droite", texte: "Le bouton ⤢, tout en haut à droite : le volet prend toute la fenêtre. Un 2e clic le remet à côté de la conversation." },
  { id: "8", titre: "Settings : se déconnecter", texte: "En bas à gauche, clique sur « Settings », puis sur ton nom dans la fenêtre qui s'ouvre, puis sur « Sign Out ». Pour simplement fermer Antigravity : Cmd + Q (Mac) ou la croix de la fenêtre (Windows)." },
];

// Zone encadrée pour chaque numéro (coordonnées du schéma) et position de sa pastille.
const ZONES = {
  "1a": { x: 59, y: 3, w: 28, h: 26, px: 102, py: 16 },
  "1b": { x: 2, y: 34, w: 146, h: 394, px: 128, py: 82 },
  "2": { x: 158, y: 40, w: 312, h: 290, px: 400, py: 140 },
  "3": { x: 158, y: 338, w: 304, h: 78, px: 474, py: 352 },
  "4": { x: 168, y: 386, w: 116, h: 22, px: 206, py: 417 },
  "5": { x: 168, y: 386, w: 116, h: 22, px: 300, py: 398 },
  "6a": { x: 476, y: 32, w: 284, h: 398, px: 722, py: 110 },
  "6b": { x: 644, y: 35, w: 20, h: 20, px: 654, py: 76 },
  "6c": { x: 470, y: 60, w: 12, h: 330, px: 476, py: 300 },
  "7a": { x: 702, y: 3, w: 26, h: 26, px: 680, py: 16 },
  "7b": { x: 731, y: 3, w: 24, h: 26, px: 744, py: 44 },
  "8": { x: 8, y: 401, w: 80, h: 20, px: 104, py: 411 },
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

function SchemaAntigravity({ actif, setActif, spot = false, zones = null, pastilles = true, conv = 0, replie = false, ferme = false, curseur = null, etiquettes = false }) {
  const t = { fontFamily: "Nunito, system-ui, sans-serif" };
  // zones : la démo passe ses propres rectangles (plusieurs possibles) ; sinon, la zone du numéro actif.
  const liste = zones || (actif && ZONES[actif] ? [ZONES[actif]] : []);
  const z = liste[0];
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
      <rect x="10" y="100" width="130" height="20" rx="5" fill={conv === 0 ? "#3a3a44" : "transparent"} style={{ transition: "fill .3s" }} /><text x="18" y="114" fontSize="10" fill="#d4d4d8" style={t}>Création de mon site</text>
      <rect x="10" y="124" width="130" height="20" rx="5" fill={conv === 1 ? "#3a3a44" : "transparent"} style={{ transition: "fill .3s" }} /><text x="18" y="138" fontSize="10" fill="#d4d4d8" style={t}>Ma 1re simulation</text>
      <text x="16" y="414" fontSize="10" fill="#a1a1aa" style={t}>⚙ Settings</text>
      {/* conversation (le milieu change avec la conversation choisie à gauche) */}
      {conv === 0 ? (
        <g key="c0" className="g-apparait">
        <rect x="166" y="48" width="200" height="34" rx="10" fill="#1e1e25" /><text x="176" y="69" fontSize="10" fill="#d4d4d8" style={t}>Crée mon site avec le modèle…</text>
        <text x="166" y="106" fontSize="10" fill="#71717a" style={t}>Ran commands ›</text>
        <text x="166" y="132" fontSize="11" fill="#fff" fontWeight="700" style={t}>💬 Pour toi :</text>
        <text x="166" y="152" fontSize="10.5" fill="#e4e4e7" style={t}>Quel nom pour ton site ?</text>
        <text x="166" y="174" fontSize="10.5" fill="#d4d4d8" style={t}>1. Mon labo virtuel</text>
        <text x="166" y="190" fontSize="10.5" fill="#d4d4d8" style={t}>2. La paillasse virtuelle</text>
        <text x="166" y="206" fontSize="10.5" fill="#d4d4d8" style={t}>3. 😕 Je suis perdu·e</text>
        <text x="166" y="228" fontSize="10" fill="#a1a1aa" fontStyle="italic" style={t}>✍️ Écris le numéro dans la zone de message</text>
        </g>
      ) : (
        <g key="c1" className="g-apparait">
          <rect x="226" y="48" width="200" height="34" rx="10" fill="#1e1e25" /><text x="236" y="69" fontSize="10" fill="#d4d4d8" style={t}>Ajoute une simulation de titrage</text>
          <text x="166" y="106" fontSize="10" fill="#71717a" style={t}>Edited 2 files ›</text>
          <text x="166" y="132" fontSize="11" fill="#fff" fontWeight="700" style={t}>💬 Pour toi :</text>
          <text x="166" y="152" fontSize="10.5" fill="#e4e4e7" style={t}>✅ Ta simulation de titrage est prête.</text>
          <text x="166" y="172" fontSize="10.5" fill="#d4d4d8" style={t}>👉 Regarde-la à droite, dans ton site.</text>
        </g>
      )}
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
      <text x="610" y="104" fontSize="15" fontWeight="800" fill="#0f172a" textAnchor="middle" style={t}>J'en suis où</text>
      <rect x="496" y="118" width="244" height="40" rx="8" fill="#fff" /><rect x="496" y="168" width="244" height="80" rx="8" fill="#fff" />
      <rect x="506" y="182" width="224" height="18" rx="5" fill="#dcfce7" /><rect x="506" y="206" width="224" height="18" rx="5" fill="#fef3c7" stroke="#f59e0b" />
      {/* menu des modèles, montré pour 4 et 5 */}
      {/* les pastilles numérotées, sous les fenêtres qui s'ouvrent (menus, Settings…) */}
      {/* démo : le menu de gauche replié, le volet de droite fermé */}
      <rect x="0" y="32" width={replie ? 150 : 0} height="398" fill="#0b0b0f" style={{ transition: "width .6s cubic-bezier(.2,.8,.2,1)" }} />
      <rect x={ferme ? 476 : 760} y="32" width={ferme ? 284 : 0} height="398" fill="#0b0b0f" style={{ transition: "all .6s cubic-bezier(.2,.8,.2,1)" }} />
      {pastilles && PARTIES.map((p) => <Pastille key={p.id} id={p.id} actif={actif} setActif={setActif} />)}
      {/* le menu des modèles (comme dans Antigravity), montré pour 4 et 5 */}
      {(actif === "4" || actif === "5") && (
        <g>
          <rect x="164" y="196" width="230" height="186" rx="10" fill="#1c1c22" stroke="#52525b" />
          <text x="176" y="214" fontSize="9.5" fill="#a1a1aa" style={t}>Model</text>
          <rect x="170" y="221" width="218" height="22" rx="6" fill={actif === "4" ? "#f59e0b" : "#2e2e36"} />
          <text x="178" y="236" fontSize="10.5" fontWeight="800" fill={actif === "4" ? "#1f1300" : "#fff"} style={t}>Gemini 3.8 Flash  Medium</text>
          <text x="380" y="236" fontSize="11" fill={actif === "4" ? "#1f1300" : "#a1a1aa"} textAnchor="end" style={t}>›</text>
          <text x="178" y="260" fontSize="10" fill="#d4d4d8" style={t}>Claude Sonnet 4.6 (Thinking)</text>
          <text x="178" y="280" fontSize="10" fill="#d4d4d8" style={t}>Claude Opus 4.6 (Thinking)</text>
          <text x="178" y="300" fontSize="10" fill="#d4d4d8" style={t}>GPT-OSS 120B (Medium)</text>
          <text x="178" y="320" fontSize="10" fill="#71717a" style={t}>Gemini 4 …  Unavailable</text>
          <line x1="170" y1="332" x2="388" y2="332" stroke="#3f3f46" />
          <rect x="170" y="340" width="218" height="24" rx="6" fill={actif === "5" ? "#f59e0b" : "transparent"} />
          <text x="178" y="356" fontSize="10.5" fontWeight="700" fill={actif === "5" ? "#1f1300" : "#e4e4e7"} style={t}>⏱ View Usage</text>
          <text x="380" y="356" fontSize="11" fill={actif === "5" ? "#1f1300" : "#a1a1aa"} textAnchor="end" style={t}>›</text>
        </g>
      )}
      {/* View Usage : ce qu'il reste pour chaque famille de modèles (montré pour 5), comme dans Antigravity */}
      {actif === "5" && (
        <g>
          <rect x="398" y="262" width="210" height="112" rx="10" fill="#1c1c22" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="410" y="280" fontSize="9.5" fill="#a1a1aa" style={t}>Usage</text>
          {[["Gemini Models", "Weekly limit, resets in 6d 22h", 41, 300], ["Claude and GPT models", "Weekly limit", 100, 340]].map(([nom, sous, reste, y]) => {
            const c = 2 * Math.PI * 6;
            return (
              <g key={nom}>
                <text x="410" y={y} fontSize="10.5" fontWeight="700" fill="#fff" style={t}>{nom}</text>
                <text x="410" y={y + 14} fontSize="9" fill="#a1a1aa" style={t}>{sous}</text>
                <text x="584" y={y} fontSize="9.5" fill="#d4d4d8" textAnchor="end" style={t}>{reste}% left</text>
                <circle cx="596" cy={y - 3.5} r="6" fill="none" stroke="#3f3f46" strokeWidth="2" />
                <circle cx="596" cy={y - 3.5} r="6" fill="none" stroke="#4ade80" strokeWidth="2" strokeDasharray={`${(c * reste) / 100} ${c}`} transform={`rotate(-90 596 ${y - 3.5})`} />
              </g>
            );
          })}
        </g>
      )}
      {/* les 3 niveaux de Gemini : ils s'ouvrent quand la souris passe sur le modèle */}
      {actif === "4" && (
        <g>
          <rect x="398" y="214" width="138" height="86" rx="10" fill="#1c1c22" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="410" y="236" fontSize="10.5" fill="#e4e4e7" style={t}>Low <tspan fill="#a1a1aa">· faible</tspan></text>
          <rect x="404" y="244" width="126" height="22" rx="6" fill="#3f3f46" />
          <text x="410" y="259" fontSize="10.5" fontWeight="800" fill="#fff" style={t}>Medium <tspan fill="#d4d4d8" fontWeight="400">· moyen</tspan></text>
          <text x="522" y="259" fontSize="10.5" fill="#fff" textAnchor="end" style={t}>✓</text>
          <text x="410" y="288" fontSize="10.5" fill="#e4e4e7" style={t}>High <tspan fill="#a1a1aa">· élevé</tspan></text>
        </g>
      )}
      {/* Settings : la fenêtre qui s'ouvre, ton nom, puis « Sign Out » (montré pour 8) */}
      {actif === "8" && (
        <g>
          <rect x="12" y="232" width="250" height="160" rx="10" fill="#1c1c22" stroke="#52525b" />
          <text x="24" y="252" fontSize="10.5" fontWeight="800" fill="#fff" style={t}>Settings</text>
          <text x="24" y="270" fontSize="9" fill="#a1a1aa" style={t}>General · Models · Account…</text>
          <rect x="18" y="280" width="238" height="30" rx="7" fill="#f59e0b" />
          <circle cx="34" cy="295" r="9" fill="#2563eb" /><text x="34" y="299" fontSize="10" fill="#fff" textAnchor="middle" style={t}>P</text>
          <text x="50" y="292" fontSize="10.5" fontWeight="800" fill="#1f1300" style={t}>Ton nom</text>
          <text x="50" y="304" fontSize="8.5" fill="#3a2500" style={t}>prenom.nom@rasf.fr</text>
          <text x="214" y="298" fontSize="9.5" fontWeight="800" fill="#1f1300" style={t}>② clic</text>
          <rect x="120" y="318" width="136" height="54" rx="8" fill="#26262e" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="130" y="336" fontSize="9.5" fill="#a1a1aa" style={t}>Manage account</text>
          <rect x="125" y="344" width="126" height="22" rx="6" fill="#f59e0b" />
          <text x="133" y="359" fontSize="10.5" fontWeight="800" fill="#1f1300" style={t}>Sign Out   ③ clic</text>
          <text x="24" y="384" fontSize="9.5" fontWeight="800" fill="#f59e0b" style={t}>① clic sur Settings ↓</text>
        </g>
      )}
      {/* la barre qui règle la largeur entre la conversation et le volet de droite (montrée pour 6c) */}
      {actif === "6c" && (
        <g>
          <rect x="473" y="60" width="6" height="330" rx="3" fill="#f59e0b" />
          <rect x="450" y="232" width="52" height="24" rx="12" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <path d="M456 244 l7 -6 v4 h26 v-4 l7 6 l-7 6 v-4 h-26 v4 z" fill="#1f1300" />
        </g>
      )}
      {/* visite guidée : tout s'assombrit sauf la partie présentée (le trou glisse d'une partie à l'autre) */}
      {spot && z && (
        <g pointerEvents="none">
          <defs>
            <mask id="g-trou">
              <rect x="0" y="0" width="760" height="430" fill="#fff" />
              {liste.map((r, n) => <rect key={n} className="g-trou" x={r.x - 4} y={r.y - 4} width={r.w + 8} height={r.h + 8} rx="10" fill="#000" />)}
            </mask>
          </defs>
          <rect x="0" y="0" width="760" height="430" rx="14" fill="rgba(2,6,23,.62)" mask="url(#g-trou)" />
        </g>
      )}
      {/* zone(s) encadrée(s) */}
      {liste.map((r, n) => (
        <rect key={n} className="g-zone" x={r.x} y={r.y} width={r.w} height={r.h} rx="8" fill="rgba(245,158,11,.10)" stroke="#f59e0b" strokeWidth="3" pointerEvents="none" />
      ))}
      {/* démo : le nom des 3 parties */}
      {etiquettes && [["① Le menu", 75], ["② Antigravity", 312], ["③ Le navigateur", 618]].map(([nom, x]) => (
        <g key={nom} className="g-apparait" pointerEvents="none">
          <rect x={x - 62} y="196" width="124" height="34" rx="17" fill="#f59e0b" stroke="#fff" strokeWidth="2.5" />
          <text x={x} y="218" fontSize="14" fontWeight="800" fill="#1f1300" textAnchor="middle" style={t}>{nom}</text>
        </g>
      ))}
      {/* démo : la souris qui clique */}
      {curseur && (
        <g pointerEvents="none" style={{ transform: `translate(${curseur.x}px, ${curseur.y}px)`, transition: "transform .5s cubic-bezier(.2,.8,.2,1)" }}>
          <circle r="11" fill="rgba(251,191,36,.45)" className="g-clic" />
          <path d="M0 0 L0 17 L4.5 13 L8 20 L11 18.5 L7.5 12 L13 12 Z" fill="#fff" stroke="#0b0b0f" strokeWidth="1.3" />
        </g>
      )}
    </svg>
  );
}

// Les parties numérotées, à explorer (survol / clic) : dans la fenêtre du guide et sur la page en ligne (mode « Explorer »).
function ExplorerAntigravity({ fermer, bouton }) {
  const [actif, setActif] = useState(null);     // partie survolée
  const [choisi, setChoisi] = useState("3");    // partie cliquée (reste affichée)
  const montre = actif || choisi;
  const fiche = PARTIES.find((p) => p.id === montre);
  const survol = (id) => { setActif(id); if (id) setChoisi(id); };
  return (
    <>
      <div className="g-aide-tete">
        <h2 id="g-aide-titre"><span aria-hidden="true">🧭</span> Antigravity en un coup d'œil</h2>
        <span className="g-aide-astuce" style={{ margin: 0, flex: 1 }}>Survole ou clique un numéro : la partie s'entoure en orange et son explication s'affiche sous l'image.</span>
        {bouton}
        {fermer && <button type="button" className="g-fermer" onClick={fermer} aria-label="Fermer">×</button>}
      </div>
      <div className="g-aide-corps">
        <div className="g-aide-schema">
          <SchemaAntigravity actif={montre} setActif={survol} />
          {fiche && (
            <div className="g-fiche" aria-live="polite">
              <b><span className="g-num-partie" aria-hidden="true">{fiche.id}</span> {fiche.titre}</b>
              <p>{fiche.texte}</p>
            </div>
          )}
        </div>
        <aside className="g-aide-cote">
          <ol className="g-liste-parties">
            {PARTIES.map((p) => (
              <li key={p.id}>
                <button type="button" className={montre === p.id ? "actif" : ""} onMouseEnter={() => survol(p.id)} onMouseLeave={() => setActif(null)} onFocus={() => survol(p.id)} onClick={() => setChoisi(p.id)}>
                  <span className="g-num-partie" aria-hidden="true">{p.id}</span>{p.titre}
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}

export function FenetreAntigravity({ fermer }) {
  useEffect(() => {
    const touche = (e) => { if (e.key === "Escape") fermer(); };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [fermer]);
  return (
    <div className="g-voile" onClick={fermer}>
      <div className="g-fenetre-aide g-paysage" role="dialog" aria-modal="true" aria-labelledby="g-aide-titre" onClick={(e) => e.stopPropagation()}>
        <ExplorerAntigravity fermer={fermer} />
      </div>
    </div>
  );
}

// --- Démo d'Antigravity : la présentation animée, partie par partie (page en ligne aide/antigravity.html) ---
// Chaque étape : les zones éclairées (coordonnées du schéma) et, si besoin, une petite animation (images qui s'enchaînent).
const Z = {
  gauche: { x: 0, y: 32, w: 150, h: 398 }, milieu: { x: 152, y: 32, w: 322, h: 398 }, droite: { x: 476, y: 32, w: 284, h: 398 },
  reduire: { x: 59, y: 3, w: 28, h: 26 }, historique: { x: 158, y: 40, w: 312, h: 200 }, prompt: { x: 160, y: 340, w: 300, h: 40 },
  reglages: { x: 164, y: 386, w: 268, h: 24 }, conversations: { x: 6, y: 96, w: 138, h: 52 },
  onglets: { x: 478, y: 34, w: 236, h: 22 }, adresse: { x: 480, y: 60, w: 276, h: 20 }, fermer: { x: 702, y: 3, w: 26, h: 26 },
  barre: { x: 468, y: 60, w: 16, h: 330 },
};
const DEMO = [
  { titre: "Les 3 parties d'Antigravity", texte: "L'écran d'Antigravity a 3 parties : à gauche le menu, au milieu Antigravity (là où tu parles avec l'IA Gemini), à droite un navigateur.", zones: [Z.gauche, Z.milieu, Z.droite], etiquettes: true },
  { titre: "① Le menu, à gauche", texte: "Tout en haut, « New Conversation » ouvre une nouvelle conversation. Dessous, la liste de tes conversations. Tout en bas, « Settings » : les réglages, et la déconnexion.", zones: [Z.gauche] },
  { titre: "Réduire le menu", texte: "Le petit rectangle tout en haut à gauche replie le menu pour gagner de la place. Un 2e clic le rouvre.", zones: [Z.reduire], images: [{ curseur: { x: 72, y: 18 } }, { curseur: { x: 72, y: 18 }, replie: true }] },
  { titre: "② Au milieu : Antigravity", texte: "C'est ici que tu parles avec l'IA Gemini : elle t'écrit, tu lui réponds.", zones: [Z.milieu] },
  { titre: "L'historique", texte: "Les messages de la conversation, du plus ancien au plus récent. Ceux qui sont pour toi commencent par 💬 Pour toi. Le reste (« Ran commands »…) est technique : tu peux l'ignorer.", zones: [Z.historique] },
  { titre: "La zone de prompt", texte: "Tout en bas, « Ask anything… » : écris ici ta réponse ou ta demande (ton « prompt »), puis appuie sur Entrée. Le micro 🎤 permet de dicter.", zones: [Z.prompt] },
  { titre: "Le modèle, l'usage et « Auto »", texte: "Sous la zone de prompt : le modèle d'IA (Gemini 3.8 Flash, Low ou Medium suffisent), dans son menu « View Usage » montre ce qu'il te reste pour la semaine, et « Auto » laisse l'IA travailler seule en te demandant la permission quand il le faut.", zones: [Z.reglages], images: [{}, { actif: "4" }, { actif: "5" }] },
  { titre: "Une conversation = un écran", texte: "Le milieu montre la conversation choisie à gauche. Tu peux en avoir plusieurs : clique sur une autre, et le milieu change.", zones: [Z.conversations, Z.milieu], images: [{ conv: 0, curseur: { x: 60, y: 110 } }, { conv: 1, curseur: { x: 60, y: 134 } }] },
  { titre: "③ À droite : le navigateur", texte: "Un navigateur intégré à Antigravity, comme Chrome : tu y vois ta page « J'en suis où » et ton site.", zones: [Z.droite] },
  { titre: "Les onglets", texte: "Comme dans Chrome : un clic sur un onglet pour passer de l'un à l'autre, le × pour le fermer, le + pour en ouvrir un nouveau, ↗ pour l'ouvrir dans ton navigateur habituel.", zones: [Z.onglets] },
  { titre: "L'adresse : localhost", texte: "« localhost » veut dire « ton ordinateur » : ton site y tourne en brouillon et toi seul le vois. Il sera visible par tous une fois mis en ligne.", zones: [Z.adresse] },
  { titre: "Refermer le navigateur", texte: "Le rectangle tout en haut à droite ferme le navigateur ; un 2e clic le rouvre.", zones: [Z.fermer], images: [{ curseur: { x: 716, y: 18 } }, { curseur: { x: 716, y: 18 }, ferme: true }] },
  { titre: "Régler la largeur", texte: "La fine barre verticale entre le milieu et le navigateur se déplace : garde le bouton de la souris appuyé dessus et glisse à gauche ou à droite.", zones: [Z.barre], images: [{ actif: "6c", curseur: { x: 476, y: 244 } }, { actif: "6c", curseur: { x: 420, y: 244 } }, { actif: "6c", curseur: { x: 530, y: 244 } }] },
];
const dureeLecture = (texte) => Math.max(4, Math.round(texte.split(/\s+/).length / 4.5)) * 1000;

function DemoAntigravity({ explorer }) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [img, setImg] = useState(0);
  const fin = i >= DEMO.length;
  const etape = fin ? null : DEMO[i];
  const aller = (n) => { setImg(0); setI(Math.max(0, Math.min(DEMO.length, n))); };
  useEffect(() => { // passage automatique à l'étape suivante
    if (!etape || !auto) return;
    const t = setTimeout(() => { setImg(0); setI((n) => n + 1); }, dureeLecture(etape.texte));
    return () => clearTimeout(t);
  }, [i, auto, etape]);
  useEffect(() => { // la petite animation de l'étape (images qui s'enchaînent en boucle)
    if (!etape?.images) return;
    const t = setInterval(() => setImg((k) => (k + 1) % etape.images.length), 1200);
    return () => clearInterval(t);
  }, [i, etape]);
  useEffect(() => {
    const touche = (e) => {
      if (e.key === "ArrowRight") { setAuto(false); setImg(0); setI((n) => Math.min(DEMO.length, n + 1)); }
      if (e.key === "ArrowLeft") { setAuto(false); setImg(0); setI((n) => Math.max(0, n - 1)); }
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, []);
  if (fin) return (
    <div className="v-accueil">
      <span className="g-main" aria-hidden="true">🎉</span>
      <h1>Tu connais Antigravity !</h1>
      <p>Reviens dans la conversation d'Antigravity et réponds <b>1</b> (« J'ai regardé, on continue »).</p>
      <div className="v-commandes" style={{ justifyContent: "center" }}>
        <button type="button" className="v-bouton bleu" onClick={() => { setAuto(true); aller(0); }}>▶ Revoir la démo</button>
        <button type="button" className="v-bouton orange" onClick={explorer}>🔢 Explorer</button>
      </div>
    </div>
  );
  const vue = etape.images ? etape.images[img % etape.images.length] : {};
  return (
    <>
      <div className="v-tete">
        <h1><span aria-hidden="true">🧭</span> Découvre Antigravity</h1>
        <span className="v-compte">Étape {i + 1} sur {DEMO.length}</span>
        <button type="button" className="v-bouton orange" onClick={explorer}>🔢 Explorer</button>
      </div>
      <div className="v-barre" aria-hidden="true"><div style={{ width: `${((i + 1) / DEMO.length) * 100}%` }} /></div>
      <div className="v-scene"><SchemaAntigravity spot pastilles={false} zones={etape.zones} etiquettes={etape.etiquettes} setActif={() => {}} {...vue} /></div>
      <div className="v-bulle" key={i} aria-live="polite">
        <h2>{etape.titre}</h2>
        <p>{etape.texte}</p>
        {auto && <div className="v-minuteur" aria-hidden="true"><div style={{ animationDuration: `${dureeLecture(etape.texte)}ms` }} /></div>}
      </div>
      <div className="v-commandes">
        <button type="button" className="v-bouton" onClick={() => { setAuto(false); aller(i - 1); }} disabled={i === 0} style={i === 0 ? { opacity: .4, cursor: "default" } : null}>‹ Précédent</button>
        <div className="v-points">
          {DEMO.map((e, n) => (
            <button key={n} type="button" className={`v-point${n === i ? " ici" : n < i ? " vu" : ""}`} onClick={() => { setAuto(false); aller(n); }} aria-label={`Étape ${n + 1} : ${e.titre}`}>{n + 1}</button>
          ))}
        </div>
        <button type="button" className="v-bouton" onClick={() => setAuto((a) => !a)}>{auto ? "⏸ Pause" : "▶ Lecture"}</button>
        <button type="button" className="v-bouton bleu" onClick={() => { setAuto(false); aller(i + 1); }}>{i === DEMO.length - 1 ? "Terminer ✓" : "Suivant ›"}</button>
      </div>
    </>
  );
}

// La page en ligne : un accueil avec deux boutons (Démo / Explorer), et depuis chaque mode un bouton vers l'autre.
export function VisiteAntigravity() {
  const [mode, setMode] = useState("accueil");
  return (
    <div className="v">
      {mode === "accueil" && (
        <div className="v-accueil">
          <span className="g-main" aria-hidden="true">🧭</span>
          <h1>Découvre Antigravity</h1>
          <p>Deux façons de le découvrir : la <b>démo</b>, une présentation animée d'environ 1 minute, ou <b>explorer</b> l'écran toi-même, partie par partie, avec les numéros.</p>
          <div className="v-commandes" style={{ justifyContent: "center" }}>
            <button type="button" className="v-bouton bleu" onClick={() => setMode("demo")}>▶ Démo</button>
            <button type="button" className="v-bouton orange" onClick={() => setMode("explorer")}>🔢 Explorer</button>
          </div>
        </div>
      )}
      {mode === "demo" && <DemoAntigravity explorer={() => setMode("explorer")} />}
      {mode === "explorer" && (
        <div className="g-fenetre-aide g-paysage v-explorer">
          <ExplorerAntigravity bouton={<button type="button" className="v-bouton bleu" onClick={() => setMode("demo")}>▶ Démo</button>} />
        </div>
      )}
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

// --- Tout supprimer : la phrase à écrire à l'IA pour mettre ce site à la Corbeille ---
function CarteSupprimer({ dossier, lieu }) {
  const [ouvert, setOuvert] = useState(false);
  const [copie, setCopie] = useState(false);
  const ou = lieu === "Documents" ? "dans Documents" : "sur le Bureau";
  // La phrase renvoie à CONSIGNES.md : dans une conversation neuve, l'IA ne connaît pas la règle (confirmation, Corbeille).
  const phrase = `Supprime mon site, dossier ${dossier} ${ou} : lis d'abord la section « Supprimer le site » de son fichier CONSIGNES.md et suis-la.`;
  const copier = () => { navigator.clipboard?.writeText(phrase).then(() => { setCopie(true); setTimeout(() => setCopie(false), 2500); }).catch(() => {}); };
  return (
    <details className="g-carte g-pliable" open={ouvert} onToggle={(e) => setOuvert(e.currentTarget.open)}>
      <summary><h2><span aria-hidden="true">🗑️</span> Tout supprimer et recommencer</h2><span className="g-chevron" aria-hidden="true">{ouvert ? "Réduire ▴" : "Afficher ▾"}</span></summary>
      <p style={{ margin: "0 0 10px", color: "#334155" }}>Pour mettre ce site à la Corbeille (le dossier <b>{dossier}</b> {ou}), copie cette phrase et colle-la dans la zone de message d'Antigravity. L'IA Gemini te demandera de confirmer avant de supprimer quoi que ce soit.</p>
      <div className="g-phrase">{phrase}</div>
      <button type="button" className="g-mini" style={{ marginTop: 10 }} onClick={copier}>{copie ? "✅ Copiée : colle-la avec Cmd + V ou Ctrl + V" : "📋 Copier la phrase"}</button>
      <p className="g-note">Tes autres sites (mon-site-2…) ne sont pas touchés. Ton site en ligne, s'il existe, reste sur Vercel.</p>
    </details>
  );
}

// --- Les petites fenêtres d'autorisation (en anglais) : contenu de la carte, aussi publié en ligne (aide/fenetres.html) ---
export function ContenuFenetres() {
  return (
    <>
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
    <p className="g-regle g-danger">⛔ <b>Sauf si la fenêtre parle de supprimer</b> (« delete », « rm », « Permanently deletes ») : choisis <b>4 · No</b>, écris « Non, mets-le à la Corbeille », puis <b>Submit</b>. Rien ne doit être supprimé pour de bon.</p>
    <div className="g-lexique">
      {LEXIQUE.map(([en, fr]) => <div key={en} className="g-mot"><b>{en}</b> = {fr}</div>)}
    </div>
    </>
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
  useEffect(() => { document.title = "J'en suis où de l'installation"; window.name = "atelier-guide"; }, []);

  return (
    <div className="g">
      <style>{CSS}</style>
      <div className="g-col">
        <header className="g-hero">
          <span className="g-main" aria-hidden="true">👋</span>
          <h1>J'en suis où de l'installation</h1>
          <p className="g-sous">Garde cet onglet ouvert : il te montre où tu en es, et il se met à jour tout seul.</p>
        </header>

        <section className="g-carte g-repondre" aria-label="Comment répondre à l'IA Gemini">
          <p>✍️ <b>Pour répondre à l'IA Gemini</b> : écris le <b>numéro</b> de ta réponse, <b>ou ta réponse avec tes mots</b>, dans la <b>zone de message</b> d'Antigravity, tout en bas, puis appuie sur <b>Entrée</b>.</p>
          <p>😕 <b>Perdu·e ?</b> Écris simplement <b>« je suis perdu »</b> dans cette même zone : l'IA Gemini t'aide pas à pas.</p>
          <div className="g-boutons">
            <button type="button" className="g-bouton bleu" onClick={() => setAide(true)}>🧭 Antigravity en un coup d'œil</button>
            {faites.has(2) && <a className="g-bouton vert" href="./" target="atelier-site">👀 Aller sur mon site (localhost)</a>}
            {adresse && <a className="g-bouton noir" href={adresse} target="atelier-en-ligne">🌍 Aller sur mon site en ligne</a>}
          </div>
        </section>
        {aide && <FenetreAntigravity fermer={() => setAide(false)} />}
        {styles && <FenetreStyles fermer={() => setStyles(false)} />}

        {connexion && !faites.has(4) && (
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
          <ContenuFenetres />
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

        {faites.has(1) && !faites.has(4) && (
          <section className="g-carte g-vercel" aria-labelledby="g-vercel">
            <h2 id="g-vercel"><span aria-hidden="true">▲</span> Ton compte Vercel</h2>
            <p><b>Vercel, c'est quoi ?</b> Un service <b>gratuit</b> qui mettra ton site sur Internet, à une adresse que tu pourras partager (par exemple <b>mon-site.vercel.app</b>). On s'en sert à l'étape 5 ; crée ton compte maintenant, ça prend 2 minutes.</p>
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

        <CarteSupprimer dossier={suivi.dossier || "mon-site"} lieu={suivi.lieu || "Bureau"} />

        <section className="g-carte" aria-labelledby="g-liens">
          <h2 id="g-liens"><span aria-hidden="true">🔗</span> Tes raccourcis</h2>
          <div className="g-boutons">
            {faites.has(2) && <a className="g-bouton bleu" href="./" target="atelier-site">👀 Voir mon site (brouillon, localhost)</a>}
            {adresse && <a className="g-bouton vert" href={adresse} target="atelier-en-ligne">🌍 Mon site en ligne</a>}
          </div>
        </section>
      </div>
    </div>
  );
}
