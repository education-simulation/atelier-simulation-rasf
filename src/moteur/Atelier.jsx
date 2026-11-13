// ============================================================
//  ATELIER (moteur, ne pas modifier) — la page « Comment créer une simulation avec l'IA sur mon ordinateur »,
//  à l'adresse …/?atelier. Seulement sur l'ordinateur (aperçu) : le site en ligne ne l'a pas.
//  Des tuiles : les ateliers (le 1er : Métamérisme), et la page habituelle du site.
//  Même habillage que la page de progression (fenêtre sombre) : on ne la confond pas avec son site.
// ============================================================
import { lazy, Suspense, useEffect } from "react";
import SITE from "../../site.config.js";
import { EnChargement } from "./chargement";
import { CSS, BandeIA, useProgression } from "./Guide.jsx";

const TUILES = [
  { icone: "🎨", titre: "Atelier 1 : Métamérisme", texte: "Construis une simulation avec l'IA, une étape à la fois, à partir d'une cabine de lumière et de deux cartes.", lien: "./?atelier=metamerisme" },
  { icone: "🧪", titre: "Atelier 2", texte: "Bientôt.", bientot: true },
  { icone: "⚗️", titre: "Atelier 3", texte: "Bientôt.", bientot: true },
  { icone: "🏠", titre: "Voir la page de mon site de simulations", texte: "La page d'accueil de ton site, avec ses menus.", lien: "./", site: true },
];

const PLUS = `
.at-grille { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
.at-tuile { display:flex; flex-direction:column; gap:8px; text-decoration:none; background:#16161b; border:1px solid #3f3f46; border-radius:16px; padding:18px; color:#e4e4e7; transition:transform .15s, border-color .15s; min-height:150px; }
a.at-tuile:hover { transform:translateY(-3px); border-color:#f59e0b; }
.at-tuile.premier { border:2px solid #f59e0b; background:#1f1a10; }
.at-tuile.bientot { opacity:.5; cursor:default; }
.at-tuile.fermee { opacity:.55; cursor:not-allowed; filter:grayscale(.4); }
.ga { padding-bottom:110px !important; }
.at-tuile.site { border-color:#166534; }
.at-icone { font-size:36px; line-height:1; }
.at-titre { font:800 19px/1.25 'Outfit',sans-serif; color:#fff; }
.at-texte { font-size:15px; color:#a1a1aa; line-height:1.4; }
.at-page .ga-fenetre.at-fenetre { max-width:1280px; }
.at-retour { margin-left:auto; color:#fde68a; text-decoration:none; font-weight:800; font-size:13px; border:1px solid #a16207; border-radius:8px; padding:3px 10px; }
.at-retour:hover { background:#3a2a08; }
.at-contenu { padding:18px 20px 24px; background:#0b0b0f; }
/* Le texte d'introduction de l'exercice (écrit pour un fond clair) : lisible sur le fond sombre. */
.at-contenu .ex-principal > div:first-child > p { color:#e4e4e7; font-size:16px; }
.at-contenu .ex-principal > div:first-child > p strong { color:#fde68a; }
.at-badge { align-self:flex-start; font:800 12px 'Nunito',sans-serif; background:#f59e0b; color:#1f1300; border-radius:99px; padding:2px 10px; }
`;

// Une page d'atelier (…/?atelier=<id de la page>) : la simulation seule, sans les menus du site, dans la même fenêtre sombre.
const FICHIERS = import.meta.glob("../../simulations/*.jsx");
const charges = {};
function PageAtelier({ id }) {
  const page = (SITE.pages || []).find((p) => p.id === id);
  const chemin = page && `../../simulations/${page.fichier}.jsx`;
  const Composant = chemin && FICHIERS[chemin] ? (charges[chemin] ||= lazy(FICHIERS[chemin])) : null;
  useEffect(() => { document.title = page ? `Atelier · ${page.titre}` : "Atelier"; }, [page]);
  return (
    <div className="ga at-page">
      <style>{CSS + PLUS}</style>
      <div className="ga-fenetre at-fenetre">
        <div className="ga-barre-titre"><span /><span /><span /><b>Atelier · {page ? page.titre : id}</b><a className="at-retour" href="./?atelier">← Les ateliers</a></div>
        <div className="at-contenu">
          {Composant ? <EnChargement key={id}><Composant /></EnChargement> : <p className="erreur">Atelier « {id} » introuvable.</p>}
        </div>
      </div>
      <BandeIA quoi="Écris ta demande pour l'étape en cours (ton prompt), puis Entrée." />
    </div>
  );
}

export function Atelier() {
  const id = new URLSearchParams(window.location.search).get("atelier");
  if (id) return <Suspense fallback={null}><PageAtelier id={id} /></Suspense>;
  return <Tuiles />;
}

// La page des tuiles : les tuiles ne s'ouvrent qu'une fois que la prof a écrit « continue » à l'IA (l'étape 3 est
// alors cochée dans PROGRESSION.md). Avant, la bande verte lui dit d'écrire « continue ».
function Tuiles() {
  const { faites, pret } = useProgression();
  const ouvert = faites.has(3);
  useEffect(() => { document.title = "Atelier : créer une simulation avec l'IA"; }, []);
  return (
    <div className="ga">
      <style>{CSS + PLUS}</style>
      <div className="ga-fenetre">
        <div className="ga-barre-titre"><span /><span /><span /><b>Atelier · Créer une simulation avec l'IA</b><em>sur ton ordinateur</em></div>
        <div className="ga-corps">
          <div className="pe2-titre"><span aria-hidden="true">🧑‍🔬</span><h1>Comment créer une simulation avec l'IA sur mon ordinateur</h1></div>
          <div className="at-grille">
            {TUILES.map((t, k) => {
              const contenu = <>
                <span className="at-icone" aria-hidden="true">{t.icone}</span>
                {k === 0 && <span className="at-badge">commence ici</span>}
                <span className="at-titre">{t.titre}</span>
                <span className="at-texte">{t.texte}</span>
              </>;
              const cls = `at-tuile${k === 0 ? " premier" : ""}${t.bientot ? " bientot" : ""}${t.site ? " site" : ""}`;
              return t.bientot || !ouvert
                ? <div key={k} className={`${cls}${!t.bientot ? " fermee" : ""}`} aria-disabled="true" title={!t.bientot ? "Écris d'abord « continue » à l'IA, dans Antigravity" : undefined}>{contenu}</div>
                : <a key={k} className={cls} href={t.lien} target="atelier-site">{contenu}</a>;
            })}
          </div>
        </div>
      </div>
      {pret && (ouvert
        ? <BandeIA quoi="Écris le numéro de l'atelier que tu veux faire (1 : Métamérisme), puis Entrée — ou clique sur sa tuile." />
        : <BandeIA vert titre="✅ L'atelier est ouvert" ou="reviens dans la zone de message, en bas à gauche" quoi="Écris « continue » (ou « aide »), puis Entrée : les tuiles s'ouvriront." />)}
    </div>
  );
}
