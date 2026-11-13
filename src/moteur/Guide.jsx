// ============================================================
//  GUIDE (moteur, ne pas modifier) — la page « Progression de l'installation de ton interface simulations », à l'adresse  …/?guide
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
  { emoji: "📦", titre: "Installer ton interface", texte: "L'IA Gemini copie ton interface simulations sur ton ordinateur et l'installe." },
  { emoji: "👋", titre: "Faire connaissance", texte: "Cinq questions dans Antigravity : réponds en écrivant le numéro de ton choix.",
    sous: [
      ["Le nom de ton interface", "Écris 1, 2 ou 3 pour un nom proposé, ou tape directement le nom que tu veux."],
      ["Sa couleur", "Écris le numéro de la couleur qui te plaît (ou son nom, par exemple « rouge »)."],
      ["Son style", "Regarde les 3 styles, puis écris 1, 2 ou 3."],
      ["Ton établissement", "Écris son nom tel qu'il doit s'afficher, ou le numéro de « Je le dirai plus tard »."],
      ["Ton nom ou ton pseudo", "Écris ton nom ou un pseudo : il s’affiche en bas de ton interface."],
    ] },
  { emoji: "🛠️", titre: "Personnaliser ton interface", texte: "L'IA Gemini met tes choix (nom, couleur, style, établissement, ton nom) dans ton interface." },
  { emoji: "👀", titre: "Voir ton interface", texte: "Ton interface s'affiche sur ton ordinateur : c'est ton brouillon (localhost), toi seul le vois.",
    infos: [
      "Les menus : « Construire avec l'IA » (s'entraîner à écrire ses demandes), « Exemples » (ce qu'on peut faire), A, B et C (pages vides, à toi de les remplir), « Outils ».",
      "Les boutons ronds en bas à droite : 🗺️ revenir à ta page de progression · 👆 montrer à l'IA ce que tu veux changer · 🎨 changer de style.",
    ], boutonSite: true },
  { emoji: "🚀", titre: "La mettre en ligne", texte: "Vercel la publie gratuitement, à une adresse que tu pourras partager." },
  { emoji: "✨", titre: "La suite", texte: "Des idées : ta première simulation, renommer les menus…" },
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
.g-clic { animation:g-clic 1s ease-out infinite; transform-origin:center; transform-box:fill-box; }
@keyframes g-clic { 0%,55% { opacity:0; transform:scale(.4); } 65% { opacity:1; } 100% { opacity:0; transform:scale(1.8); } }
.g-trou, .g-zone { transition: x .55s cubic-bezier(.2,.8,.2,1), y .55s cubic-bezier(.2,.8,.2,1), width .55s cubic-bezier(.2,.8,.2,1), height .55s cubic-bezier(.2,.8,.2,1); }
.v { max-width:min(1100px, max(340px, calc((100vh - 170px) * 1.77))); margin:0 auto; display:flex; flex-direction:column; gap:14px; }
.v-tete { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.v-tete h1 { font:800 clamp(24px,3.6vw,34px)/1.1 'Outfit',sans-serif; margin:0; flex:1; letter-spacing:-.02em; }
.v-compte { font-weight:800; color:#475569; }
.v-barre { height:8px; border-radius:99px; background:#e2e8f0; overflow:hidden; }
.v-barre > div { height:100%; background:linear-gradient(90deg,#60a5fa,#f59e0b); transition:width .5s; }
.v-scene { position:relative; border-radius:16px; box-shadow:0 18px 50px rgba(15,23,42,.25); overflow:hidden; }
.v-bulle { position:absolute; z-index:2; background:#fff; border-radius:14px; padding:10px 14px; border:3px solid #f59e0b; box-shadow:0 8px 28px rgba(15,23,42,.12); animation:v-entre .45s cubic-bezier(.2,.8,.2,1); }
@keyframes v-entre { from { opacity:0; transform:translateY(14px) scale(.98); } to { opacity:1; transform:none; } }
.v-bulle h2 { margin:0 0 4px; font:800 clamp(14px,1.7vw,19px)/1.2 'Outfit',sans-serif; }
.v-bulle p { margin:0; font-size:clamp(12px,1.45vw,16px); line-height:1.45; color:#1e293b; }
.v-minuteur { height:4px; border-radius:99px; background:#fde68a; margin-top:8px; overflow:hidden; }
.v-minuteur > div { height:100%; background:#f59e0b; animation:v-temps linear forwards; }
@keyframes v-temps { from { width:0; } to { width:100%; } }
.v-commandes { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.v-bouton { all:unset; cursor:pointer; padding:11px 20px; border-radius:12px; font-weight:800; font-size:17px; background:#e2e8f0; color:#0f172a; }
.v-bouton:hover { filter:brightness(.95); } .v-bouton:focus-visible { outline:3px solid #2563eb; outline-offset:2px; }
.v-bouton.bleu { background:#2563eb; color:#fff; } .v-bouton.orange { background:#f59e0b; color:#1f1300; }
.v-points { display:flex; gap:6px; flex-wrap:wrap; flex:1; justify-content:center; }
.v-point { all:unset; cursor:pointer; min-width:28px; height:28px; border-radius:14px; display:grid; place-items:center; font-size:12px; font-weight:800; background:#e2e8f0; color:#475569; transition:all .2s; }
.v-point { position:relative; }
.v-point::after { content:attr(data-titre); position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%) translateY(4px); white-space:nowrap; background:#0f172a; color:#fff; font-size:13px; font-weight:700; padding:6px 10px; border-radius:8px; opacity:0; pointer-events:none; transition:all .15s; z-index:5; }
.v-point:hover::after, .v-point:focus-visible::after { opacity:1; transform:translateX(-50%); }
.v-point.vu { background:#fde68a; color:#92400e; } .v-point.ici { background:#f59e0b; color:#1f1300; transform:scale(1.15); }
.v-fini { margin:0; background:#dcfce7; border:2px solid #16a34a; border-radius:14px; padding:12px 16px; font-size:17px; color:#14532d; animation:v-entre .45s; }
.pe { gap:18px; padding-bottom:30px; }
.pe-points { display:flex; gap:6px; justify-content:center; padding-top:18px; }
.pe-points .v-point { text-decoration:none; }
.pe-num { font-weight:800; color:#b45309 !important; margin:0 0 4px !important; font-size:16px !important; }
.pe-deux { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }
.pe-bloc { background:#fff; border-radius:18px; padding:18px 22px; box-shadow:0 1px 2px rgba(15,23,42,.06),0 8px 24px rgba(15,23,42,.07); }
.pe-bloc.toi { border:3px solid #f59e0b; }
.pe-bloc h2 { margin:0 0 10px; font:800 20px/1.2 'Outfit',sans-serif; }
.pe-bloc ul { margin:0; padding-left:20px; display:flex; flex-direction:column; gap:8px; font-size:17px; line-height:1.5; color:#1e293b; }
.pe-questions { margin:0; padding-left:22px; display:flex; flex-direction:column; gap:10px; font-size:17px; }
.pe-questions span { display:block; color:#475569; font-size:15px; }
.aide-retour { text-align:center; color:#334155; font-size:17px; margin:6px 0 0; }
.ga { --g-bleu:#2563eb; --g-vert:#16a34a; --g-orange:#f59e0b; min-height:100vh; background:#e9ecf2; padding:22px 14px 50px; font-family:'Nunito',system-ui,sans-serif; }
.ga-fenetre { max-width:820px; margin:0 auto; border-radius:16px; overflow:hidden; background:#0b0b0f; box-shadow:0 24px 60px rgba(15,23,42,.35); border:1px solid #27272a; }
.ga-barre-titre { display:flex; align-items:center; gap:7px; padding:10px 14px; background:#1c1c22; color:#d4d4d8; font-size:14px; }
.ga-barre-titre span { width:11px; height:11px; border-radius:50%; background:#52525b; }
.ga-barre-titre b { margin-left:10px; flex:1; font-weight:700; }
.ga-barre-titre em { font-style:normal; font-size:12px; color:#a1a1aa; border:1px solid #3f3f46; border-radius:99px; padding:2px 10px; }
.ga-corps { padding:20px 22px 24px; display:flex; flex-direction:column; gap:16px; color:#e4e4e7; }
.st { list-style:none; margin:4px 0 6px; padding:0; display:grid; grid-template-columns:repeat(6, minmax(0,1fr)); }
.st-etape { position:relative; display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; }
.st-etape::before { content:""; position:absolute; top:21px; left:-50%; width:100%; height:4px; background:#3f3f46; z-index:0; }
.st-etape:first-child::before { display:none; }
.st-etape.fait::before, .st-etape.ici::before { background:#22c55e; }
.st-etape a { text-decoration:none; z-index:1; }
.st-rond { position:relative; z-index:1; width:44px; height:44px; border-radius:50%; display:grid; place-items:center; font:800 18px 'Outfit',sans-serif; background:#27272a; color:#a1a1aa; border:3px solid #3f3f46; transition:all .3s; }
.st-etape.fait .st-rond { background:#16a34a; border-color:#22c55e; color:#fff; }
.st-etape.ici .st-rond { background:#f59e0b; border-color:#fde68a; color:#1f1300; animation:st-pulse 1.8s ease-in-out infinite; }
@keyframes st-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,.55); } 50% { box-shadow:0 0 0 9px rgba(245,158,11,0); } }
.st-etape a:hover .st-rond { transform:scale(1.08); }
.st-nom { font-size:13px; line-height:1.25; color:#71717a; font-weight:700; padding:0 4px; }
.st-etape.fait .st-nom { color:#d4d4d8; }
.st-etape.ici .st-nom { color:#fde68a; }
@media (max-width:600px) { .st-nom { font-size:11px; } .st-rond { width:34px; height:34px; font-size:15px; } .st-etape::before { top:16px; } }
.ga-progres-tete { display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:8px; }
.ga-progres-tete h1 { margin:0; font:800 clamp(20px,3vw,26px)/1.2 'Outfit',sans-serif; color:#fff; }
.ga-progres-tete span { color:#a1a1aa; font-weight:700; }
.ga .g-barre { background:#27272a; }
.ga-etapes { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.ga-etapes > li { border:1px solid #3f3f46; border-radius:14px; padding:12px 14px; background:#16161b; animation:g-fondu .4s; display:flex; flex-direction:column; }
.ga-etapes > li.encours { border:2px solid #f59e0b; background:#1f1a10; }
.ga-ligne { display:flex; align-items:center; gap:12px; }
.ga-icone { font-size:24px; }
.ga-texte { flex:1; min-width:0; }
.ga-texte h2 { margin:0; font:800 18px/1.25 'Outfit',sans-serif; color:#fff; display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.ga-texte p { margin:4px 0 0; color:#d4d4d8; font-size:15px; }
.ga-badge { font:800 12px 'Nunito',sans-serif; background:#f59e0b; color:#1f1300; border-radius:99px; padding:2px 10px; }
.ga-voir { flex-shrink:0; text-decoration:none; color:#fde68a; border:1px solid #a16207; border-radius:10px; padding:8px 12px; font-weight:800; font-size:14px; }
.ga-voir:hover { background:#3a2a08; }
.ga-sous { list-style:none; margin:10px 0 0 36px; padding:0; display:flex; flex-direction:column; gap:5px; font-size:15px; color:#a1a1aa; }
.ga-sous li.fait { color:#d4d4d8; }
.ga-sous li.ici { color:#fde68a; font-weight:800; }
.ga-sous small { display:block; margin-left:24px; font-weight:400; color:#fcd34d; }
.ga-action { align-self:flex-start; display:inline-flex; margin-top:10px; text-decoration:none; background:#2563eb; color:#fff; border-radius:12px; padding:11px 16px; font-weight:800; }
.ga-action.vert { background:#16a34a; }
.ga-carte { border:1px solid #3f3f46; border-radius:14px; padding:14px 16px; background:#16161b; display:flex; flex-direction:column; }
.ga-carte h2 { margin:0 0 8px; font:800 18px 'Outfit',sans-serif; color:#fff; }
.ga-carte ol { margin:0; padding-left:20px; color:#d4d4d8; display:flex; flex-direction:column; gap:4px; }
.ga-outils { border-top:1px solid #27272a; padding-top:14px; color:#a1a1aa; font-size:14.5px; }
.ga-outils p { margin:0 0 10px; }
.ga-outils b { color:#e4e4e7; }
.ga-liens { display:flex; gap:10px; flex-wrap:wrap; }
.ga-liens a { color:#bfdbfe; text-decoration:none; border:1px solid #1e3a8a; border-radius:10px; padding:7px 12px; font-weight:700; }
.ga-liens a, .ga-liens button { font:700 14.5px 'Nunito',sans-serif; cursor:pointer; background:transparent; }
.ga-liens button { color:#bbf7d0; border:1px solid #166534; border-radius:10px; padding:7px 12px; }
.ga-liens a:hover { background:#172554; } .ga-liens button:hover { background:#052e16; }
.ga-popup { position:relative; width:min(640px,100%); }
.ga-popup .g-carte { margin:0; }
.ga-popup .g-fermer { position:absolute; top:10px; right:12px; z-index:2; }
.ga-clair { display:flex; flex-direction:column; gap:12px; }
.ga-clair .g-carte { padding:14px 18px; background:#16161b; border:1px solid #3f3f46; box-shadow:none; color:#e4e4e7; }
.ga-clair .g-carte p, .ga-clair .g-carte li, .ga-clair .g-note { color:#d4d4d8 !important; }
.ga-clair .g-carte h2 { color:#fff; }
.ga-clair .g-phrase { background:#26262e; color:#fde68a; }
.ga-clair .g-carte h2 { font-size:17px; }
@media (max-width:600px) { .ga-ligne { flex-wrap:wrap; } .ga-voir { width:100%; text-align:center; } }
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
  { id: "5", titre: "Ton usage", texte: "Dans le menu des modèles, passe la souris sur « View Usage » : Antigravity montre ce qu'il te reste pour la semaine, en pourcentage, pour chaque famille : « Gemini Models » (avec la date de remise à zéro, par exemple « resets in 6d 22h ») et « Claude and GPT models ». À 0 %, il affiche « Model quota reached » : attends la remise à zéro, ou choisis un modèle de l'autre famille. Si tes crédits sont à 0 %, contacte marc-olivier.reula@rasf.fr." },
  { id: "6a", titre: "Le navigateur d'Antigravity", texte: "Le volet de droite est un navigateur intégré à Antigravity, avec des onglets, comme Chrome : ta page de progression, ton interface (localhost)… Clique sur un onglet pour passer de l'un à l'autre ; le × d'un onglet le ferme ; ↗ ouvre l'onglet dans ton navigateur habituel." },
  { id: "6b", titre: "Ouvrir un nouvel onglet", texte: "Le bouton + à droite des onglets ouvre un onglet vide. Tapes-y l'adresse de ton site (par exemple http://localhost:5799/) pour le voir à côté de ta page de progression." },
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

function SchemaAntigravity({ actif, setActif, spot = false, zones = null, pastilles = true, conv = 0, replie = false, ferme = false, curseur = null, etiquettes = false, niveau = "Medium", fenetre = 0 }) {
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
      <text x="176" y="401" fontSize="10.5" fill="#d4d4d8" style={t}>+   Gemini 3.8 Flash <tspan fill="#a1a1aa">{niveau}</tspan> ⌃</text>
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
      <text x="610" y="104" fontSize="15" fontWeight="800" fill="#0f172a" textAnchor="middle" style={t}>Progression</text>
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
          <text x="178" y="236" fontSize="10.5" fontWeight="800" fill={actif === "4" ? "#1f1300" : "#fff"} style={t}>Gemini 3.8 Flash  {niveau}</text>
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
          {[["Low", "faible", 222], ["Medium", "moyen", 246], ["High", "élevé", 270]].map(([n, fr, y]) => (
            <g key={n}>
              {n === niveau && <rect x="404" y={y} width="126" height="22" rx="6" fill="#3f3f46" style={{ transition: "all .3s" }} />}
              <text x="410" y={y + 15} fontSize="10.5" fontWeight={n === niveau ? 800 : 400} fill={n === niveau ? "#fff" : "#e4e4e7"} style={t}>{n} <tspan fill="#a1a1aa" fontWeight="400">· {fr}</tspan></text>
              {n === niveau && <text x="522" y={y + 15} fontSize="10.5" fill="#fff" textAnchor="end" style={t}>✓</text>}
            </g>
          ))}
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
      {/* démo : la petite fenêtre d'autorisation, au-dessus de la zone de prompt (1 : affichée, 2 : 3e choix sélectionné) */}
      {fenetre > 0 && (
        <g className="g-apparait" pointerEvents="none">
          <rect x="160" y="208" width="300" height="128" rx="12" fill="#1c1c22" stroke="#52525b" />
          <text x="172" y="226" fontSize="10.5" fontWeight="800" fill="#fff" style={t}>📄 Allow write access to this path?</text>
          <rect x="170" y="233" width="280" height="15" rx="4" fill="#26262e" /><text x="176" y="244" fontSize="8" fill="#d4d4d8" fontFamily="Menlo, monospace">/Users/…/Desktop/mon-site/PROGRESSION.md</text>
          {["Yes, allow this time", "Yes, and always allow in this conversation", "Yes, and always allow", "No (tell the agent what to do instead)"].map((txt, n) => (
            <g key={n}>
              {(fenetre === 2 ? n === 2 : n === 0) && <rect x="168" y={252 + n * 18} width="284" height="17" rx="5" fill={n === 2 ? "#f59e0b" : "#2e2e36"} />}
              <text x="176" y={264 + n * 18} fontSize="9.5" fill={fenetre === 2 && n === 2 ? "#1f1300" : "#d4d4d8"} fontWeight={fenetre === 2 && n === 2 ? 800 : 400} style={t}>{n + 1}   {txt}</text>
            </g>
          ))}
          <rect x="404" y="318" width="48" height="15" rx="7" fill="#2563eb" /><text x="428" y="329" fontSize="9" fontWeight="800" fill="#fff" textAnchor="middle" style={t}>Submit ↵</text>
          <text x="384" y="329" fontSize="9" fill="#a1a1aa" textAnchor="middle" style={t}>Skip</text>
        </g>
      )}
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
  reglages: { x: 164, y: 386, w: 268, h: 24 }, modele: { x: 164, y: 386, w: 158, h: 24 }, auto: { x: 352, y: 386, w: 56, h: 24 },
  menuModeles: { x: 164, y: 196, w: 230, h: 186 }, niveaux: { x: 398, y: 214, w: 138, h: 86 }, usage: { x: 398, y: 262, w: 210, h: 112 }, conversations: { x: 6, y: 96, w: 138, h: 52 },
  onglets: { x: 478, y: 34, w: 236, h: 22 }, adresse: { x: 480, y: 60, w: 276, h: 20 }, fermer: { x: 702, y: 3, w: 26, h: 26 },
  barre: { x: 468, y: 60, w: 16, h: 330 }, fenetre: { x: 160, y: 208, w: 300, h: 128 }, settings: { x: 6, y: 400, w: 84, h: 22 }, fenetreSettings: { x: 12, y: 232, w: 250, h: 160 },
};
const DEMO = [
  { titre: "Les 3 parties d'Antigravity", texte: "L'écran d'Antigravity a 3 parties : à gauche le menu, au milieu Antigravity (là où tu parles avec l'IA Gemini), à droite un navigateur.", zones: [Z.gauche, Z.milieu, Z.droite], etiquettes: true },
  { titre: "① Le menu, à gauche", texte: "Tout en haut, « New Conversation » ouvre une nouvelle conversation. Dessous, la liste de tes conversations. Tout en bas, « Settings » : les réglages, et la déconnexion.", zones: [Z.gauche] },
  { titre: "Réduire le menu", texte: "Le petit rectangle tout en haut à gauche replie le menu pour gagner de la place. Un 2e clic le rouvre.", zones: [Z.reduire, Z.gauche], bulle: { x: 170, y: 60 }, images: [{ curseur: { x: 72, y: 18 } }, { curseur: { x: 72, y: 18 }, replie: true }] },
  { titre: "② Au milieu : Antigravity", texte: "C'est ici que tu parles avec l'IA Gemini : elle t'écrit, tu lui réponds.", zones: [Z.milieu] },
  { titre: "L'historique", texte: "Les messages de la conversation, du plus ancien au plus récent. Ceux qui sont pour toi commencent par 💬 Pour toi. Le reste (« Ran commands »…) est technique : tu peux l'ignorer.", zones: [Z.historique] },
  { titre: "La zone de prompt", texte: "Tout en bas, « Ask anything… » : écris ici ta réponse ou ta demande (ton « prompt »), puis appuie sur Entrée. Le micro 🎤 permet de dicter.", zones: [Z.prompt] },
  { titre: "Le modèle d'IA", texte: "Sous la zone de prompt, à gauche : le modèle d'IA. Un clic ouvre la liste ; sur Gemini, choisis un niveau : Low (rapide), Medium ou High (plus réfléchi). Low ou Medium suffisent.", zones: [Z.modele], bulle: { x: 452, y: 308 }, images: [{ curseur: { x: 230, y: 398 } }, { actif: "4", zones: [Z.modele, Z.menuModeles, Z.niveaux], curseur: { x: 300, y: 232 } }, { actif: "4", zones: [Z.modele, Z.menuModeles, Z.niveaux], curseur: { x: 440, y: 232 } }, { actif: "4", niveau: "Low", zones: [Z.modele, Z.menuModeles, Z.niveaux], curseur: { x: 440, y: 232 } }, { niveau: "Low", curseur: { x: 230, y: 398 } }], boucle: false },
  { titre: "Ton usage", texte: "Dans ce même menu, « View Usage » montre ce qu'il te reste pour la semaine, pour chaque famille de modèles. À 0 %, écris à marc-olivier.reula@rasf.fr.", zones: [Z.modele, Z.menuModeles, Z.usage], images: [{ actif: "5", curseur: { x: 260, y: 352 } }] },
  { titre: "« Auto »", texte: "« Auto » laisse l'IA travailler seule ; elle te demande la permission quand il le faut (les petites fenêtres en anglais). Laisse-le tel quel.", zones: [Z.auto] },
  { titre: "Les petites fenêtres en anglais", texte: "Avant certaines actions, l'IA demande la permission dans une petite fenêtre, au-dessus de la zone de prompt. Clique sur « Yes, and always allow » (le 3e choix), puis sur Submit. ⛔ Si elle parle de supprimer (delete) : choisis No.", zones: [Z.fenetre], bulle: { x: 470, y: 200 }, boucle: false, images: [{ fenetre: 1 }, { fenetre: 1, curseur: { x: 300, y: 300 } }, { fenetre: 2, curseur: { x: 300, y: 300 } }, { fenetre: 2, curseur: { x: 428, y: 326 } }, { zones: [Z.prompt], curseur: { x: 428, y: 326 } }] },
  { titre: "Une conversation = un écran", texte: "Le milieu montre la conversation choisie à gauche. Tu peux en avoir plusieurs : clique sur une autre, et le milieu change.", zones: [Z.conversations, Z.milieu], bulle: { x: 20, y: 250 }, images: [{ conv: 0, curseur: { x: 60, y: 110 } }, { conv: 1, curseur: { x: 60, y: 134 } }] },
  { titre: "③ À droite : le navigateur", texte: "Un navigateur intégré à Antigravity, comme Chrome : tu y vois ta page de progression et ton interface simulations.", zones: [Z.droite] },
  { titre: "Les onglets", texte: "Comme dans Chrome : un clic sur un onglet pour passer de l'un à l'autre, le × pour le fermer, le + pour en ouvrir un nouveau, ↗ pour l'ouvrir dans ton navigateur habituel.", zones: [Z.onglets] },
  { titre: "L'adresse : localhost", texte: "« localhost » veut dire « ton ordinateur » : ton site y tourne en brouillon et toi seul le vois. Il sera visible par tous une fois mis en ligne.", zones: [Z.adresse] },
  { titre: "Refermer le navigateur", texte: "Le rectangle tout en haut à droite ferme le navigateur ; un 2e clic le rouvre.", zones: [Z.fermer], images: [{ curseur: { x: 716, y: 18 } }, { curseur: { x: 716, y: 18 }, ferme: true }] },
  { titre: "Régler la largeur", texte: "La fine barre verticale entre le milieu et le navigateur se déplace : garde le bouton de la souris appuyé dessus et glisse à gauche ou à droite.", zones: [Z.barre], images: [{ actif: "6c", curseur: { x: 476, y: 244 } }, { actif: "6c", curseur: { x: 420, y: 244 } }, { actif: "6c", curseur: { x: 530, y: 244 } }] },
  { titre: "Quitter Antigravity", texte: "En bas à gauche : Settings, puis ton nom, puis « Sign Out » pour te déconnecter. Pour fermer Antigravity : Cmd + Q (Mac) ou la croix de la fenêtre (Windows).", zones: [Z.settings, Z.fenetreSettings], bulle: { x: 300, y: 250 }, images: [{ curseur: { x: 40, y: 412 } }, { actif: "8", curseur: { x: 200, y: 296 } }, { actif: "8", curseur: { x: 190, y: 356 } }] },
];
const dureeEtape = (e) => Math.max(dureeLecture(e.texte), e.boucle === false ? e.images.length * 1000 + 1500 : 0);
const dureeLecture = (texte) => Math.max(3, Math.round(texte.split(/\s+/).length / 6)) * 1000;

// Place la bulle d'explication SUR l'image, tout près de la partie éclairée (en % du schéma 760 × 430).
const LARGEUR_BULLE = 300;
function placerBulle(zones, etiquettes, bulle) {
  const g = Math.min(...zones.map((r) => r.x)), h = Math.min(...zones.map((r) => r.y));
  const d = Math.max(...zones.map((r) => r.x + r.w)), b = Math.max(...zones.map((r) => r.y + r.h));
  const pc = (v, tot) => `${(v / tot) * 100}%`;
  const largeur = pc(LARGEUR_BULLE, 760);
  if (bulle) return { left: pc(bulle.x, 760), top: pc(bulle.y, 430), width: largeur };
  if (etiquettes) return { left: pc(380 - LARGEUR_BULLE / 2, 760), bottom: pc(16, 430), width: largeur };
  if (b - h > 260) { // zone haute (une colonne entière) : à côté, à droite si possible
    const x = d + 12 + LARGEUR_BULLE <= 752 ? d + 12 : Math.max(8, g - 12 - LARGEUR_BULLE);
    return { left: pc(x, 760), top: pc(140, 430), width: largeur };
  }
  const x = Math.min(752 - LARGEUR_BULLE, Math.max(8, (g + d) / 2 - LARGEUR_BULLE / 2));
  if (b < 250) return { left: pc(x, 760), top: pc(b + 14, 430), width: largeur };  // en dessous
  return { left: pc(x, 760), bottom: pc(430 - h + 14, 430), width: largeur };      // au-dessus
}

function DemoAntigravity({ explorer }) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [img, setImg] = useState(0);
  const fin = i >= DEMO.length;
  const etape = fin ? null : DEMO[i];
  const aller = (n) => { setImg(0); setI(Math.max(0, Math.min(DEMO.length, n))); };
  useEffect(() => { // passage automatique à l'étape suivante
    if (!etape || !auto) return;
    const t = setTimeout(() => { setImg(0); setI((n) => n + 1); }, dureeEtape(etape));
    return () => clearTimeout(t);
  }, [i, auto, etape]);
  useEffect(() => { // la petite animation de l'étape (images qui s'enchaînent en boucle)
    if (!etape?.images) return;
    const t = setInterval(() => setImg((k) => (etape.boucle === false ? Math.min(k + 1, etape.images.length - 1) : (k + 1) % etape.images.length)), 1000);
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
  useEffect(() => { if (fin) explorer(true); }, [fin, explorer]);
  if (fin) return null;
  const vue = etape.images ? etape.images[img % etape.images.length] : {};
  const zonesVues = vue.zones || etape.zones;
  return (
    <>
      <div className="v-tete">
        <h1><span aria-hidden="true">🧭</span> Découvre Antigravity</h1>
        <span className="v-compte">Étape {i + 1} sur {DEMO.length}</span>
        <button type="button" className="v-bouton orange" onClick={explorer}>🔢 Explorer</button>
      </div>
      <div className="v-barre" aria-hidden="true"><div style={{ width: `${((i + 1) / DEMO.length) * 100}%` }} /></div>
      <div className="v-scene">
        <SchemaAntigravity spot pastilles={false} zones={zonesVues} etiquettes={etape.etiquettes} setActif={() => {}} {...vue} />
        <div className="v-bulle" key={i} aria-live="polite" style={placerBulle(etape.zones, etape.etiquettes, etape.bulle)}>
          <h2>{etape.titre}</h2>
          <p>{etape.texte}</p>
          {auto && <div className="v-minuteur" aria-hidden="true"><div style={{ animationDuration: `${dureeEtape(etape)}ms` }} /></div>}
        </div>
      </div>
      <div className="v-commandes">
        <button type="button" className="v-bouton" onClick={() => { setAuto(false); aller(i - 1); }} disabled={i === 0} style={i === 0 ? { opacity: .4, cursor: "default" } : null}>‹ Précédent</button>
        <div className="v-points">
          {DEMO.map((e, n) => (
            <button key={n} type="button" className={`v-point${n === i ? " ici" : n < i ? " vu" : ""}`} onClick={() => { setAuto(false); aller(n); }} aria-label={`Étape ${n + 1} : ${e.titre}`} data-titre={e.titre}>{n + 1}</button>
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
  const [fini, setFini] = useState(false);   // on arrive sur « Explorer » à la fin de la démo
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
      {mode === "demo" && <DemoAntigravity explorer={(fini) => { setFini(fini === true); setMode("explorer"); }} />}
      {mode === "explorer" && fini && (
        <p className="v-fini">🎉 <b>Tu connais Antigravity !</b> Reviens dans la conversation d'Antigravity et réponds <b>1</b> (« J'ai regardé, on continue »). Ou explore encore l'écran ici, numéro par numéro.</p>
      )}
      {mode === "explorer" && (
        <div className="g-fenetre-aide g-paysage v-explorer">
          <ExplorerAntigravity bouton={<button type="button" className="v-bouton bleu" onClick={() => { setFini(false); setMode("demo"); }}>▶ Démo</button>} />
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

// Les pages d'aide en ligne (GitHub Pages) : la démo d'Antigravity, les fenêtres, et une page par étape (etape.html?n=1…6).
export const AIDE_EN_LIGNE = "https://education-simulation.github.io/atelier-simulation-rasf/";

// Ce que chaque page d'étape explique en plus du texte court (ETAPES).
const DETAILS = [
  { quoi: ["L'IA Gemini copie ton interface simulations dans un dossier de ton ordinateur (le Bureau ou Documents).", "Elle installe ce qu'il faut pour la faire marcher, puis lance son aperçu (localhost).", "Elle t'ouvre ta page de progression de l'installation : garde-la ouverte, elle se met à jour toute seule."],
    toi: ["Réponds aux questions de l'IA dans la zone de message d'Antigravity.", "Accepte les petites fenêtres en anglais : « Yes, and always allow », puis Submit."],
    liens: [["🧭 Découvrir Antigravity", "antigravity.html"], ["🔐 Les petites fenêtres en anglais", "fenetres.html"]] },
  { quoi: ["L'IA Gemini te pose 5 questions, une par une, pour personnaliser ton interface."], toi: ["Écris le numéro de ta réponse, ou ta réponse avec tes mots, puis Entrée."], styles: true },
  { quoi: ["L'IA Gemini range tes réponses dans ton interface : son nom, sa couleur, son style, ton établissement et ton nom."], toi: ["Rien : attends quelques secondes."] },
  { quoi: ["Ton interface s'ouvre dans le navigateur d'Antigravity, à droite. C'est ton brouillon : elle n'est que sur ton ordinateur."], toi: ["Promène-toi dans les menus.", "Dis à l'IA si tu veux le mettre en ligne maintenant ou plus tard."] },
  { quoi: ["Vercel est un service gratuit qui met ton interface sur Internet, à une adresse que tu pourras partager (par exemple mon-site.vercel.app)."],
    toi: ["Crée ton compte Vercel : choisis Hobby (gratuit), écris ton nom, puis « Continue with Google » avec ton compte d'établissement.", "Si Vercel te propose de relier GitHub ou de créer un projet : ne fais rien, reviens dans Antigravity.", "Pour la connexion, ta page de progression t'affiche un bouton et un code à vérifier."],
    liens: [["▲ Créer mon compte Vercel", "https://vercel.com/signup"]] },
  { quoi: ["Ton interface est prête. Tu peux maintenant la remplir : ta première simulation, renommer les menus, changer les textes…"], toi: ["Demande à l'IA ce que tu veux, avec tes mots. Le bouton 👆 de ton interface lui montre exactement ce que tu veux changer."] },
];

// Une page d'étape (en ligne) : présentation de l'étape, dans le style de la page Antigravity.
export function PageEtape({ n }) {
  const i = Math.min(ETAPES.length, Math.max(1, n || 1)) - 1;
  const e = ETAPES[i], d = DETAILS[i];
  const lien = (url) => (url.startsWith("http") ? url : AIDE_EN_LIGNE + url);
  useEffect(() => { document.title = `Étape ${i + 1} · ${e.titre}`; }, [i, e.titre]);
  return (
    <div className="v pe">
      <div className="pe-points">
        {ETAPES.map((x, k) => (
          <a key={k} href={`?n=${k + 1}`} className={`v-point${k === i ? " ici" : k < i ? " vu" : ""}`} data-titre={x.titre} aria-label={`Étape ${k + 1} : ${x.titre}`}>{k + 1}</a>
        ))}
      </div>
      <div className="v-accueil pe-carte">
        <span className="g-main" aria-hidden="true">{e.emoji}</span>
        <p className="pe-num">Étape {i + 1} sur {ETAPES.length}</p>
        <h1>{e.titre}</h1>
        <p>{e.texte}</p>
      </div>
      <div className="pe-deux">
        <section className="pe-bloc"><h2>⚙️ Ce qui se passe</h2><ul>{d.quoi.map((t, k) => <li key={k}>{t}</li>)}</ul></section>
        <section className="pe-bloc toi"><h2>✍️ Ce que tu fais</h2><ul>{d.toi.map((t, k) => <li key={k}>{t}</li>)}</ul></section>
      </div>
      {e.sous && (
        <section className="pe-bloc"><h2>Les 5 questions</h2>
          <ol className="pe-questions">{e.sous.map(([t, a], k) => <li key={k}><b>{t}</b><span>{a}</span></li>)}</ol>
        </section>
      )}
      {e.infos && <section className="pe-bloc"><h2>À savoir</h2><ul>{e.infos.map((t, k) => <li key={k}>{t}</li>)}</ul></section>}
      {d.styles && (
        <section className="pe-bloc"><h2>🎨 Les 3 styles de ton site</h2>
          <div className="g-styles">{STYLES_SITE.map((st) => <figure key={st.id} className="g-style"><MiniSite id={st.id} /><figcaption><b>{st.nom}</b><span>{st.texte}</span></figcaption></figure>)}</div>
        </section>
      )}
      {d.liens && <div className="v-commandes" style={{ justifyContent: "center" }}>{d.liens.map(([t, u]) => <a key={u} className="v-bouton bleu" href={lien(u)} target="_blank" rel="noreferrer">{t}</a>)}</div>}
      <p className="aide-retour">✅ Quand tu as fini de lire, reviens dans Antigravity.</p>
    </div>
  );
}

// La page « Progression de l'installation de ton interface simulations » (sur l'ordinateur) : une fenêtre d'application,
// pour ne pas la confondre avec l'interface elle-même. En haut, une barre d'étapes visuelle (stepper) ; dessous, seulement
// les étapes faites et l'étape en cours, chacune avec un bouton vers sa page d'explication en ligne.
export function Guide() {
  const suivi = useProgression();
  const { faites, sousFaites, adresse, connexion } = suivi;
  const encours = ETAPES.findIndex((_, i) => !faites.has(i));
  const nbFaites = ETAPES.filter((_, i) => faites.has(i)).length;
  const toutFini = encours === -1;
  const visibles = ETAPES.map((e, i) => ({ e, i })).filter(({ i }) => faites.has(i) || i === encours);
  const [mail, setMail] = useState(false);   // la fenêtre « Recevoir les instructions sur ton mail RASF »
  useEffect(() => {
    if (!mail) return;
    const touche = (e) => { if (e.key === "Escape") setMail(false); };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [mail]);
  const pageEtape = (i) => `${AIDE_EN_LIGNE}etape.html?n=${i + 1}`;
  useEffect(() => { document.title = "Progression de l'installation"; window.name = "atelier-guide"; }, []);

  return (
    <div className="ga">
      <style>{CSS}</style>
      <div className="ga-fenetre">
        <div className="ga-barre-titre"><span /><span /><span /><b>Atelier · Progression de l'installation</b><em>ce n'est pas ton interface</em></div>
        <div className="ga-corps">
          <div className="ga-progres-tete">
            <h1>Progression de l'installation de ton interface simulations</h1>
            <span>{toutFini ? "Tout est fait 🎉" : `${nbFaites} sur ${ETAPES.length}`}</span>
          </div>

          <ol className="st" aria-label="Les étapes de l'installation">
            {ETAPES.map((e, i) => {
              const etat = faites.has(i) ? "fait" : i === encours ? "ici" : "avenir";
              const rond = <span className="st-rond" aria-hidden="true">{etat === "fait" ? "✓" : i + 1}</span>;
              return (
                <li key={i} className={`st-etape ${etat}`} aria-current={etat === "ici" ? "step" : undefined}>
                  {etat === "avenir" ? rond : <a href={pageEtape(i)} target="atelier-etape" rel="noreferrer" title="Voir l'étape">{rond}</a>}
                  <span className="st-nom">{e.titre}</span>
                </li>
              );
            })}
          </ol>

          <ol className="ga-etapes">
            {visibles.map(({ e, i }) => {
              const fait = faites.has(i);
              return (
                <li key={i} className={fait ? "fait" : "encours"} aria-current={fait ? undefined : "step"}>
                  <div className="ga-ligne">
                    <span className="ga-icone" aria-hidden="true">{fait ? "✅" : e.emoji}</span>
                    <div className="ga-texte">
                      <h2>{i + 1}. {e.titre} {!fait && <span className="ga-badge">en cours</span>}</h2>
                      {!fait && <p>{e.texte}</p>}
                    </div>
                    <a className="ga-voir" href={pageEtape(i)} target="atelier-etape" rel="noreferrer">📖 Voir l'étape</a>
                  </div>
                  {e.sous && !fait && (
                    <ol className="ga-sous">
                      {e.sous.map(([titre, aide], j) => {
                        const ok = sousFaites.has(`${i}.${j + 1}`);
                        const ici = !ok && e.sous.findIndex((_, k) => !sousFaites.has(`${i}.${k + 1}`)) === j;
                        return <li key={j} className={ok ? "fait" : ici ? "ici" : ""}><span aria-hidden="true">{ok ? "✅" : ici ? "➡️" : "⬜"}</span> {titre}{ici && <small>✍️ {aide}</small>}</li>;
                      })}
                    </ol>
                  )}
                  {e.boutonSite && <a className="ga-action vert" href="./" target="atelier-site">👀 Aller sur mon interface (localhost)</a>}
                </li>
              );
            })}
          </ol>

          {connexion && !faites.has(4) && (
            <section className="ga-carte" aria-labelledby="g-connexion">
              <h2 id="g-connexion">🔑 Connecte ton compte Vercel</h2>
              <ol>
                <li>Clique sur le bouton : la page de Vercel s'ouvre dans un nouvel onglet.</li>
                <li>Clique <b>Continue with Google</b> et choisis le compte de ton compte Vercel.</li>
                {connexion.code && <li>Vérifie que le code affiché est bien <b className="g-code">{connexion.code}</b></li>}
                <li>Clique <b>Confirm</b> (ou <b>Allow</b>), puis reviens dans Antigravity et choisis « C'est fait ».</li>
              </ol>
              <a className="ga-action" href={connexion.lien} target="_blank" rel="noreferrer">🔑 Connecter mon compte Vercel</a>
            </section>
          )}
          {adresse && <a className="ga-action vert" href={adresse} target="atelier-en-ligne">🌍 Aller sur mon interface en ligne</a>}

          <div className="ga-outils">
            <p>✍️ Pour répondre à l'IA : écris le <b>numéro</b> (ou ta réponse avec tes mots) dans la zone de message d'Antigravity, puis Entrée. Perdu·e ? Écris <b>« je suis perdu »</b>.</p>
            <div className="ga-liens">
              <a href={`${AIDE_EN_LIGNE}antigravity.html`} target="atelier-antigravity" rel="noreferrer">🧭 Découvrir Antigravity</a>
              <a href={`${AIDE_EN_LIGNE}fenetres.html`} target="atelier-autorisation" rel="noreferrer">🔐 Donner ton autorisation (anglais)</a>
              <button type="button" onClick={() => setMail(true)}>📧 Recevoir les instructions sur mon mail RASF</button>
            </div>
          </div>

          {mail && (
            <div className="g-voile" onClick={() => setMail(false)}>
              <div className="ga-popup" role="dialog" aria-modal="true" aria-label="Recevoir les instructions sur ton mail RASF" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="g-fermer" onClick={() => setMail(false)} aria-label="Fermer">×</button>
                <CarteMail suivi={suivi} />
              </div>
            </div>
          )}

          <div className="ga-clair">
            <CarteSupprimer dossier={suivi.dossier || "mon-site"} lieu={suivi.lieu || "Bureau"} />
          </div>
        </div>
      </div>
    </div>
  );
}
