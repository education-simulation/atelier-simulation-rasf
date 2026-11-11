// ============================================================
//  BARRE LATÉRALE (moteur, ne pas modifier) — style « lateral » (site.config.js : style: "lateral").
//  Sombre, à gauche, toujours visible sur grand écran : titre, Accueil, puis chaque menu,
//  qui se déplie pour montrer ses pages. Sur écran étroit, elle laisse la place à l'en-tête et son bouton « Menu ».
//  Les menus dépliés sont retenus au rechargement.
//  Un bouton « « » réduit la barre à une colonne d'icônes (« » » la rouvre) ; ce choix est aussi retenu.
// ============================================================
import { useState } from "react";
import { Logo, BoutonCalculatrice } from "./EnTete";

const CLE = "atelier.barreLaterale.ouverts";
const CLE_REPLIE = "atelier.barreLaterale.replie";

export function BarreLaterale({ titre, menus, activeId, menuActif, naviguer }) {
  const [ouverts, setOuverts] = useState(() => {
    let liste = [];
    try { liste = JSON.parse(localStorage.getItem(CLE) || "null") || menus.map((m) => m.id); } catch { liste = menus.map((m) => m.id); }
    return new Set(menuActif ? [...liste, menuActif] : liste);
  });
  const [replie, setReplie] = useState(() => { try { return localStorage.getItem(CLE_REPLIE) === "1"; } catch { return false; } });
  const basculerReplie = () => setReplie((r) => { try { localStorage.setItem(CLE_REPLIE, r ? "0" : "1"); } catch { /* sans importance */ } return !r; });
  const basculer = (id) => setOuverts((o) => {
    const n = new Set(o);
    if (n.has(id)) n.delete(id); else n.add(id);
    try { localStorage.setItem(CLE, JSON.stringify([...n])); } catch { /* sans importance */ }
    return n;
  });

  return (
    <aside className={`barre-laterale${replie ? " replie" : ""}`} aria-label="Menus">
      <div className="bl-haut">
        <a href="?" className="bl-titre" onClick={(e) => { e.preventDefault(); naviguer(null); }} title="Retour à l'accueil">
          <Logo taille={26} /><span className="bl-texte">{titre}</span>
        </a>
        <button type="button" className="bl-reduire" onClick={basculerReplie} aria-expanded={!replie}
          title={replie ? "Ouvrir le menu" : "Réduire le menu"} aria-label={replie ? "Ouvrir le menu" : "Réduire le menu"}>{replie ? "»" : "«"}</button>
      </div>
      <BoutonCalculatrice className="bl-lien bl-calc" />
      <nav className="bl-nav">
        <button className="bl-lien" aria-current={!activeId ? "page" : undefined} onClick={() => naviguer(null)} title={replie ? "Accueil" : undefined}>
          <span aria-hidden="true" className="bl-icone">🏠</span><span className="bl-texte">Accueil</span>
        </button>
        {menus.map((m) => (
          <div key={m.id} className="bl-groupe">
            <button className={`bl-lien bl-menu${menuActif === m.id ? " actif" : ""}`} aria-expanded={ouverts.has(m.id)} onClick={() => basculer(m.id)}>
              <span style={{ flex: 1 }}>{m.label}</span>
              <span aria-hidden="true" className="bl-fleche">{ouverts.has(m.id) ? "▾" : "▸"}</span>
            </button>
            {(replie || ouverts.has(m.id)) && (
              <div className="bl-pages">
                {m.pages.length ? m.pages.map((p) => (
                  <button key={p.id} className="bl-lien bl-page" aria-current={p.id === activeId ? "page" : undefined} onClick={() => naviguer(p.id)} title={replie ? p.titre : undefined}>
                    <span aria-hidden="true" className="bl-icone">{p.icone}</span><span className="bl-texte">{p.titre}</span>
                  </button>
                )) : <span className="bl-vide">Pas encore de page ici.</span>}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
