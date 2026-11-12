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

function CarteMail() {
  const [envoyeA, setEnvoyeA] = useState(lireMail);
  const [adresse, setAdresse] = useState("");
  const [etat, setEtat] = useState("");
  const valable = /^[^@\s]+@rasf\.fr$/i.test(adresse.trim());

  async function envoyer(e) {
    e.preventDefault();
    if (!valable) { setEtat("erreur"); return; }
    setEtat("envoi");
    try {
      await fetch(`${ADRESSE_ENVOI}?a=${encodeURIComponent(adresse.trim())}`, { mode: "no-cors" });
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
          <p>Un mail qui récapitule les étapes et explique comment reprendre ton site un autre jour. Facultatif.</p>
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
  { emoji: "📦", titre: "Ton site arrive sur ton ordinateur", texte: "L'agent copie le modèle et l'installe. Puis tu crées ton compte Vercel, avec la carte plus bas." },
  { emoji: "👋", titre: "Faire connaissance", texte: "Cinq questions à cliquer dans Antigravity : le nom du site, sa couleur, son style, ton établissement, ton nom." },
  { emoji: "👀", titre: "Voir ton site", texte: "Ton site s'affiche ici, sur ton ordinateur : c'est ton brouillon, toi seul le vois." },
  { emoji: "🚀", titre: "Le mettre en ligne", texte: "Vercel le publie gratuitement, à une adresse que tu pourras partager." },
  { emoji: "📱", titre: "Sur ton téléphone", texte: "Tu ouvres l'adresse sur ton téléphone, comme le verront tes classes." },
  { emoji: "✨", titre: "La suite", texte: "Des idées à cliquer : ta première simulation, renommer les menus…" },
];

const CHOIX_FENETRE = [
  ["Yes, allow this time", "Oui, cette fois seulement"],
  ["Yes, and always allow in this conversation", "Oui, toujours dans cette conversation"],
  ["Yes, and always allow", "Oui, toujours : c'est celui-là", true],
  ["No (tell the agent what to do instead)", "Non (dire à l'agent quoi faire)"],
];

const LEXIQUE = [
  ["Allow", "autoriser"], ["Submit", "valider ma réponse"], ["Skip", "passer"],
  ["Other (write your answer)", "autre : écris ta réponse"], ["Continue with Google", "continuer avec Google"],
];

// Lit PROGRESSION.md : les étapes cochées « - [x] Étape N » et l'adresse du site en ligne.
function lire(texte) {
  const faites = new Set([...texte.matchAll(/^\s*-\s*\[x\]\s*Étape\s*(\d+)/gim)].map((m) => Number(m[1])));
  const adresse = texte.match(/Adresse du site\s*:\s*(https?:\/\/\S+)/i)?.[1];
  // Connexion Vercel en attente (écrite par l'agent) : « Connexion Vercel : https://vercel.com/… (code : ABCD-EFGH) »
  const m = texte.match(/Connexion Vercel\s*:\s*(https:\/\/vercel\.com\/[^\s)]+)(?:[^\n]*?code\s*:\s*([A-Z0-9-]+))?/i);
  const connexion = m ? { lien: m[1], code: m[2] || "" } : null;
  return { faites, adresse, connexion };
}

function useProgression() {
  const [etat, setEtat] = useState({ faites: new Set(), adresse: null, connexion: null, pret: false });
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
.g-note { font-size:14.5px; color:#64748b; margin:10px 0 0; }
.g-bravo { text-align:center; font:800 22px 'Outfit',sans-serif; color:#166534; }
@media (max-width:560px) { .g-carte { padding:18px 16px; } .g-etape { padding:12px; } }
@media (prefers-reduced-motion:reduce) { .g * { animation:none !important; transition:none !important; } }
`;

export function Guide() {
  const { faites, adresse, connexion } = useProgression();
  const encours = ETAPES.findIndex((_, i) => !faites.has(i));
  const nbFaites = ETAPES.filter((_, i) => faites.has(i)).length;
  const toutFini = encours === -1;

  useEffect(() => { document.title = "Ton site, étape par étape"; }, []);

  return (
    <div className="g">
      <style>{CSS}</style>
      <div className="g-col">
        <header className="g-hero">
          <span className="g-main" aria-hidden="true">👋</span>
          <h1>Ton site, étape par étape</h1>
          <p className="g-sous">Garde cet onglet ouvert : il te montre où tu en es, et il se met à jour tout seul.</p>
        </header>

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

        <CarteMail />

        <section className="g-carte" aria-labelledby="g-parcours">
          <h2 id="g-parcours"><span aria-hidden="true">🗺️</span> Où tu en es</h2>
          <div className="g-barre" role="progressbar" aria-valuemin={0} aria-valuemax={ETAPES.length} aria-valuenow={nbFaites}>
            <div style={{ width: `${Math.max(4, (100 * nbFaites) / ETAPES.length)}%` }} />
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
                  </div>
                </li>
              );
            })}
          </ol>
          {toutFini && <p className="g-bravo">Bravo, ton site est en ligne ! 🎉</p>}
        </section>

        {!faites.has(3) && (
          <section className="g-carte g-vercel" aria-labelledby="g-vercel">
            <h2 id="g-vercel"><span aria-hidden="true">▲</span> Ton compte Vercel</h2>
            <p><b>Vercel, c'est quoi ?</b> Un service <b>gratuit</b> qui mettra ton site sur Internet, à une adresse que tu pourras donner à tes classes (par exemple <b>mon-site.vercel.app</b>). On s'en sert à l'étape 4 ; crée ton compte maintenant, ça prend 2 minutes.</p>
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

        <section className="g-carte" aria-labelledby="g-fenetres">
          <h2 id="g-fenetres"><span aria-hidden="true">🪟</span> Les petites fenêtres en anglais</h2>
          <p style={{ margin: "0 0 14px", color: "#334155" }}>
            Dans Antigravity, des fenêtres comme celle-ci s'affichent sous la conversation. Elles demandent la permission avant une action de l'agent. <b>C'est sans danger pour ton ordinateur.</b>
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
          <p className="g-regle">👉 <b>Clique toujours sur le 3e choix, « Yes, and always allow »</b>, puis sur <b>Submit</b>. La même question ne reviendra plus.</p>
          <div className="g-lexique">
            {LEXIQUE.map(([en, fr]) => <div key={en} className="g-mot"><b>{en}</b> = {fr}</div>)}
          </div>
        </section>

        <section className="g-carte" aria-labelledby="g-liens">
          <h2 id="g-liens"><span aria-hidden="true">🔗</span> Tes raccourcis</h2>
          <div className="g-boutons">
            <a className="g-bouton bleu" href="./" target="_blank" rel="noreferrer">👀 Voir mon site (brouillon)</a>
            {adresse && <a className="g-bouton vert" href={adresse} target="_blank" rel="noreferrer">🌍 Mon site en ligne</a>}
          </div>
        </section>
      </div>
    </div>
  );
}
