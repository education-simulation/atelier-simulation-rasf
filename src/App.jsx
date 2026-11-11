// ============================================================
//  MOTEUR DU SITE (ne pas modifier) — d'après la « Paillasse virtuelle » de Nils Aronssohn.
//  Lit site.config.js, construit les menus (Exemples, Menu A…) et affiche la page demandée.
//  L'adresse d'une simulation est de la forme  …/?sim=identifiant  : un rafraîchissement
//  (Cmd + R / F5) ramène toujours sur la même page.
// ============================================================
import { lazy, useEffect, useMemo, useState } from "react";
import SITE from "../site.config.js";
import { EnTete } from "./moteur/EnTete";
import { BarreLaterale } from "./moteur/BarreLaterale";
import { Accueil } from "./moteur/Accueil";
import { PiedDePage, APropos } from "./moteur/PiedDePage";
import { Apercu, estApercu } from "./moteur/Apercu";
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
  const menus = useMemo(() => construireMenus(SITE), []);
  const [activeId, setActiveId] = useState(lireId);
  const [copie, setCopie] = useState(false);
  const sim = (SITE.pages || []).find((s) => s.id === activeId);

  useEffect(() => { document.documentElement.style.setProperty("--accent", SITE.couleur || "#0b4f94"); }, []);
  useEffect(() => {
    const retour = () => setActiveId(lireId());
    window.addEventListener("popstate", retour);
    return () => window.removeEventListener("popstate", retour);
  }, []);
  useEffect(() => {
    document.title = sim ? `${sim.titre} — ${SITE.titre}` : activeId === "a-propos" ? `À propos — ${SITE.titre}` : SITE.titre;
    window.scrollTo(0, 0);
  }, [activeId, sim]);

  function naviguer(id) {
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("sim", id); else u.searchParams.delete("sim");
    window.history.pushState(null, "", u.toString());
    setActiveId(id || null);
  }
  // Fil d'Ariane : le menu de la page ramène à l'accueil, sur le bloc de ce menu.
  const menuDeLaPage = sim && menus.find((m) => m.id === sim.menu);
  function allerAuMenu(id) {
    naviguer(null);
    setTimeout(() => document.getElementById(`menu-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }
  function partager() {
    navigator.clipboard?.writeText(window.location.href).then(() => { setCopie(true); setTimeout(() => setCopie(false), 2000); });
  }

  const Composant = sim && composant(sim.fichier);
  let titre = null, contenu;
  if (!activeId) contenu = <Accueil site={SITE} menus={menus} naviguer={naviguer} />;
  else if (activeId === "a-propos") { titre = "À propos"; contenu = <APropos site={SITE} />; }
  else if (!sim) contenu = <p className="erreur">Page « {activeId} » introuvable. Vérifie son <code>id</code> dans site.config.js.</p>;
  else if (!Composant) { titre = sim.titre; contenu = <p className="erreur">Fichier <code>simulations/{sim.fichier}.jsx</code> introuvable. Vérifie la ligne <code>fichier</code> de cette page dans site.config.js.</p>; }
  else { titre = sim.titre; contenu = <EnChargement key={sim.id}><Composant /></EnChargement>; }

  const style = ["blocs", "lateral", "liste"].includes(SITE.style) ? SITE.style : "blocs";
  const entete = <EnTete titre={SITE.titre} menus={menus} activeId={activeId} menuActif={sim?.menu} naviguer={naviguer} />;

  return (
    <div className={`racine racine-${style}`}>
      {estApercu && <Apercu />}
      <div className="cadre">
      {style === "lateral" && <BarreLaterale titre={SITE.titre} menus={menus} activeId={activeId} menuActif={sim?.menu} naviguer={naviguer} />}
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
            {sim && <button className="bouton-pilule" onClick={partager} style={copie ? { background: "#2a9d8f", color: "#fff" } : null}>{copie ? "✓ Lien copié !" : "🔗 Partager"}</button>}
          </div>
        )}
        <div className="zone-sim">{contenu}</div>
        <PiedDePage site={SITE} naviguer={naviguer} />
      </main>
      </div>
      {estApercu && <InspecteurLocal />}
    </div>
  );
}
