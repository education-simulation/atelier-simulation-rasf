// ============================================================
//  MOTEUR DU SITE (ne pas modifier) — d'après la « Paillasse virtuelle » de Nils Aronssohn.
//  Lit site.config.js, construit les menus (Exemples, Menu A…) et affiche la page demandée.
//  L'adresse d'une simulation est de la forme  …/?sim=identifiant  : un rafraîchissement
//  (Cmd + R / F5) ramène toujours sur la même page.
// ============================================================
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import SITE from "../site.config.js";
import { EnTete } from "./moteur/EnTete";
import { BarreLaterale } from "./moteur/BarreLaterale";
import { Accueil } from "./moteur/Accueil";
import { PageMenu } from "./moteur/PageMenu";
import { PiedDePage, APropos } from "./moteur/PiedDePage";
import { Apercu, estApercu } from "./moteur/Apercu";
import { ChoixStyle, STYLES } from "./moteur/ChoixStyle";
import { fermerCalculatrice, useCalculatriceOuverte } from "./outils/calculatriceFlottante.js";

// La calculatrice flottante, commune à tout le site : chargée seulement quand on l'ouvre.
// La page « Guide » (…/?guide) : seulement dans l'aperçu, chargée seulement quand on l'ouvre.
const Guide = lazy(() => import("./moteur/Guide.jsx").then((m) => ({ default: m.Guide })));
const CalculatriceFlottante = lazy(() => import("./outils/CalculatriceScientifique.jsx").then((m) => ({ default: m.CalculatriceScientifique })));
import { EnChargement } from "./moteur/chargement";
import { InspecteurLocal } from "./moteur/InspecteurLocal";

// Chaque fichier du dossier simulations/ est chargé seulement quand on ouvre sa simulation.
const FICHIERS = import.meta.glob("../simulations/*.jsx");
const composants = {};
function composant(fichier) {
  const chemin = `../simulations/${String(fichier).replace(/\.jsx$/, "")}.jsx`;
  if (!FICHIERS[chemin]) return null;
  return (composants[chemin] ||= lazy(FICHIERS[chemin]));
}

// Menus : dans l'ordre de site.config.js, chacun avec ses pages (dans l'ordre de la liste « pages »).
function construireMenus(site) {
  return (site.menus || []).map((m) => ({
    id: m.id, label: m.nom || m.id, fond: m.fond, texte: m.texte,
    pages: (site.pages || []).filter((p) => p.menu === m.id),
  }));
}

const lireId = () => new URLSearchParams(window.location.search).get("sim");

export default function App() {
  if (estApercu && new URLSearchParams(window.location.search).has("guide")) return <Suspense fallback={null}><Guide /></Suspense>;
  return <Site />;
}

function Site() {
  const menus = useMemo(() => construireMenus(SITE), []);
  const [activeId, setActiveId] = useState(lireId);
  const calculatriceOuverte = useCalculatriceOuverte();
  // Style du site (site.config.js). Dans l'aperçu seulement, le bouton « 🎨 Style » permet d'en essayer un autre
  // sans rien enregistrer : le site en ligne garde toujours celui de site.config.js.
  // Style du site : celui de site.config.js. Dans l'aperçu, le bouton « 🎨 Style » le change en réécrivant
  // cette ligne de site.config.js (voir vite.config.js) : ce qu'on voit est donc ce qui sera mis en ligne.
  const style = STYLES.some(([id]) => id === SITE.style) ? SITE.style : "blocs";
  const sim = (SITE.pages || []).find((s) => s.id === activeId);
  // Page intermédiaire d'un menu (…/?sim=menu:<id>) : des tuiles vers les pages de ce menu.
  const menuPage = typeof activeId === "string" && activeId.startsWith("menu:") ? menus.find((m) => m.id === activeId.slice(5)) : null;

  useEffect(() => { document.documentElement.style.setProperty("--accent", SITE.couleur || "#0b4f94"); }, []);
  useEffect(() => {
    const retour = () => setActiveId(lireId());
    window.addEventListener("popstate", retour);
    return () => window.removeEventListener("popstate", retour);
  }, []);
  useEffect(() => {
    document.title = sim ? `${sim.titre} — ${SITE.titre}` : menuPage ? `${menuPage.label} — ${SITE.titre}` : activeId === "a-propos" ? `À propos — ${SITE.titre}` : SITE.titre;
    window.scrollTo(0, 0);
  }, [activeId, sim, menuPage]);

  function naviguer(id) {
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("sim", id); else u.searchParams.delete("sim");
    window.history.pushState(null, "", u.toString());
    setActiveId(id || null);
  }
  // Fil d'Ariane : le menu de la page mène à la page de ce menu (ses tuiles).
  const menuDeLaPage = sim && menus.find((m) => m.id === sim.menu);
  function allerAuMenu(id) { naviguer(`menu:${id}`); }

  const Composant = sim && composant(sim.fichier);
  let titre = null, contenu;
  if (!activeId) contenu = <Accueil site={{ ...SITE, style }} menus={menus} naviguer={naviguer} />;
  else if (menuPage) { titre = menuPage.label; contenu = <PageMenu menu={menuPage} naviguer={naviguer} />; }
  else if (activeId === "a-propos") { titre = "À propos"; contenu = <APropos site={SITE} />; }
  else if (!sim) contenu = <p className="erreur">Page « {activeId} » introuvable. Vérifie son <code>id</code> dans site.config.js.</p>;
  else if (!Composant) { titre = sim.titre; contenu = <p className="erreur">Fichier <code>simulations/{sim.fichier}.jsx</code> introuvable. Vérifie la ligne <code>fichier</code> de cette page dans site.config.js.</p>; }
  else { titre = sim.titre; contenu = <EnChargement key={sim.id}><Composant /></EnChargement>; }

  const entete = <EnTete titre={SITE.titre} menus={menus} activeId={activeId} menuActif={sim?.menu || menuPage?.id} naviguer={naviguer} />;

  return (
    <div className={`racine racine-${style}${estApercu ? " avec-apercu" : ""}`}>
      {estApercu && <Apercu />}
      <div className="cadre">
      {style === "lateral" && <BarreLaterale titre={SITE.titre} menus={menus} activeId={activeId} menuActif={sim?.menu || menuPage?.id} naviguer={naviguer} />}
      <main className="principal">
        {entete}
        {titre && (
          <nav aria-label="Fil d'Ariane" className="fil-ariane">
            <a href="?" onClick={(e) => { e.preventDefault(); naviguer(null); }}>Accueil</a>
            {menuDeLaPage && <>
              <span aria-hidden="true">›</span>
              <a href="?" onClick={(e) => { e.preventDefault(); allerAuMenu(menuDeLaPage.id); }}>{menuDeLaPage.label}</a>
            </>}
            <span aria-hidden="true">›</span>
            <span aria-current="page">{titre}</span>
          </nav>
        )}
        {titre && (
          <div className="barre-titre">
            {sim && <span className="icone-sim" aria-hidden="true">{sim.icone}</span>}
            <h1>{titre}</h1>
          </div>
        )}
        <div className="zone-sim">{contenu}</div>
        <PiedDePage site={SITE} naviguer={naviguer} />
      </main>
      </div>
      {calculatriceOuverte && <Suspense fallback={null}><CalculatriceFlottante onClose={fermerCalculatrice} /></Suspense>}
      {estApercu && <ChoixStyle actuel={style} />}
      {estApercu && <InspecteurLocal />}
    </div>
  );
}
