// ============================================================
//  EN LIGNE (moteur, ne pas modifier) — le bandeau en haut de l'accueil, seulement sur l'ordinateur (aperçu) :
//  un bouton pour mettre son interface en ligne avec Vercel. Le bouton ouvre une fenêtre avec la phrase à
//  copier dans Antigravity : c'est l'IA qui fait la mise en ligne (étape 4 de CONSIGNES.md), jamais la page.
// ============================================================
import { useEffect, useState } from "react";

const CSS = `
.el { position:sticky; top:0; z-index:60; display:flex; align-items:center; gap:12px; flex-wrap:wrap; background:#0b0b0f; color:#e4e4e7; padding:10px 16px; font:15px/1.35 'Nunito',system-ui,sans-serif; border-bottom:2px solid #16a34a; }
.el b { color:#fff; }
.el-texte { flex:1; min-width:220px; }
.el-texte a { color:#86efac; }
.el-bouton { all:unset; cursor:pointer; background:#16a34a; color:#fff; font-weight:800; border-radius:10px; padding:8px 14px; }
.el-bouton:hover { background:#15803d; }
.el-voile { position:fixed; inset:0; z-index:9998; background:rgba(15,23,42,.6); display:grid; place-items:center; padding:16px; }
.el-fen { position:relative; width:min(600px,100%); background:#fff; color:#0f172a; border-radius:18px; padding:22px; font:16px/1.5 'Nunito',system-ui,sans-serif; }
.el-fen h2 { margin:0 0 10px; font:800 21px 'Outfit',sans-serif; }
.el-fen ol { margin:0 0 12px; padding-left:20px; }
.el-phrase { background:#f1f5f9; border:1px solid #cbd5e1; border-radius:10px; padding:12px 14px; font-family:Menlo,Consolas,monospace; font-size:14.5px; }
.el-copier { all:unset; cursor:pointer; margin-top:10px; display:inline-block; background:#2563eb; color:#fff; font-weight:800; border-radius:10px; padding:8px 14px; }
.el-fermer { all:unset; cursor:pointer; position:absolute; top:10px; right:12px; width:34px; height:34px; border-radius:50%; background:#f1f5f9; display:grid; place-items:center; font-size:22px; }
.el-note { margin:12px 0 0; color:#64748b; font-size:14px; }
`;

export function EnLigne() {
  const [adresse, setAdresse] = useState(null);
  const [ouvert, setOuvert] = useState(false);
  const [copie, setCopie] = useState(false);
  useEffect(() => {
    fetch("./__atelier/progression", { cache: "no-store" }).then((r) => (r.ok ? r.json() : { texte: "" }))
      .then(({ texte }) => setAdresse((texte || "").match(/Adresse du site\s*:\s*(https?:\/\/\S+)/i)?.[1] || ""))
      .catch(() => setAdresse(""));
  }, []);
  useEffect(() => {
    if (!ouvert) return;
    const touche = (e) => { if (e.key === "Escape") setOuvert(false); };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [ouvert]);
  if (adresse === null) return null;
  const phrase = adresse
    ? "Remets mon interface en ligne avec Vercel : lis d'abord l'étape 4 de son fichier CONSIGNES.md et suis-la."
    : "Mets mon interface en ligne avec Vercel : lis d'abord l'étape 4 de son fichier CONSIGNES.md et suis-la.";
  const copier = () => { navigator.clipboard?.writeText(phrase).then(() => { setCopie(true); setTimeout(() => setCopie(false), 2500); }).catch(() => {}); };
  return (
    <>
      <style>{CSS}</style>
      <div className="el" role="region" aria-label="Mettre en ligne">
        <span className="el-texte">
          {adresse
            ? <>🌍 <b>Ton interface est en ligne</b> : <a href={adresse} target="_blank" rel="noopener noreferrer">{adresse}</a>. Ici, c'est ton brouillon (localhost).</>
            : <>💻 <b>Ton interface n'est que sur ton ordinateur</b> (localhost) : toi seul la vois.</>}
        </span>
        <button type="button" className="el-bouton" onClick={() => setOuvert(true)}>{adresse ? "▲ Mettre à jour en ligne" : "▲ Mettre mon site en ligne avec Vercel"}</button>
      </div>
      {ouvert && (
        <div className="el-voile" onClick={() => setOuvert(false)}>
          <div className="el-fen" role="dialog" aria-modal="true" aria-label="Mettre en ligne avec Vercel" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="el-fermer" onClick={() => setOuvert(false)} aria-label="Fermer">×</button>
            <h2>▲ {adresse ? "Mettre à jour ton site en ligne" : "Mettre ton site en ligne avec Vercel"}</h2>
            <ol>
              <li>Copie cette phrase.</li>
              <li>Colle-la dans la zone de message d'Antigravity, en bas à gauche, puis Entrée.</li>
              <li>L'IA te guide pas à pas (Vercel est gratuit).</li>
            </ol>
            <div className="el-phrase">{phrase}</div>
            <button type="button" className="el-copier" onClick={copier}>{copie ? "✅ Copiée : colle-la avec Cmd + V ou Ctrl + V" : "📋 Copier la phrase"}</button>
            <p className="el-note">Ta version en ligne aura une adresse comme mon-site.vercel.app, que tu pourras partager.</p>
          </div>
        </div>
      )}
    </>
  );
}
