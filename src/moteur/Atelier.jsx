// ============================================================
//  ATELIER (moteur, ne pas modifier) — la page « Comment créer une simulation avec l'IA sur mon ordinateur »,
//  à l'adresse …/?atelier. Seulement sur l'ordinateur (aperçu) : le site en ligne ne l'a pas.
//  Des tuiles : les ateliers (le 1er : Métamérisme), et la page habituelle du site.
//  Même habillage que la page de progression (fenêtre sombre) : on ne la confond pas avec son site.
// ============================================================
import { useEffect } from "react";
import { CSS } from "./Guide.jsx";

const TUILES = [
  { icone: "🎨", titre: "Atelier 1 : Métamérisme", texte: "Construis une simulation avec l'IA, une étape à la fois, à partir d'une cabine de lumière et de deux cartes.", lien: "./?sim=metamerisme" },
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
.at-tuile.site { border-color:#166534; }
.at-icone { font-size:36px; line-height:1; }
.at-titre { font:800 19px/1.25 'Outfit',sans-serif; color:#fff; }
.at-texte { font-size:15px; color:#a1a1aa; line-height:1.4; }
.at-badge { align-self:flex-start; font:800 12px 'Nunito',sans-serif; background:#f59e0b; color:#1f1300; border-radius:99px; padding:2px 10px; }
`;

export function Atelier() {
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
              return t.bientot
                ? <div key={k} className={cls} aria-disabled="true">{contenu}</div>
                : <a key={k} className={cls} href={t.lien} target="atelier-site">{contenu}</a>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
