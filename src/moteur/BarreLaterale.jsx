// ============================================================
//  BARRE LATÉRALE (moteur, ne pas modifier) — style « lateral » (site.config.js : style: "lateral").
//  Sombre, à gauche, toujours visible sur grand écran : titre, Accueil, puis chaque menu,
//  qui se déplie pour montrer ses pages. Sur écran étroit, elle laisse la place à l'en-tête et son bouton « Menu ».
//  Les menus dépliés sont retenus au rechargement.
// ============================================================
import { useState } from "react";
import { Logo } from "./EnTete";

const CLE = "atelier.barreLaterale.ouverts";

export function BarreLaterale({ titre, menus, activeId, menuActif, naviguer }) {
  const [ouverts, setOuverts] = useState(() => {
    let liste = [];
    try { liste = JSON.parse(localStorage.getItem(CLE) || "null") || menus.map((m) => m.id); } catch { liste = menus.map((m) => m.id); }
    return new Set(menuActif ? [...liste, menuActif] : liste);
  });
  const basculer = (id) => setOuverts((o) => {
    const n = new Set(o);
    if (n.has(id)) n.delete(id); else n.add(id);
    try { localStorage.setItem(CLE, JSON.stringify([...n])); } catch { /* sans importance */ }
    return n;
  });

  return (
    <aside className="barre-laterale" aria-label="Menus">
      <a href="?" className="bl-titre" onClick={(e) => { e.preventDefault(); naviguer(null); }} title="Retour à l'accueil">
        <Logo taille={26} /><span>{titre}</span>
      </a>
      <nav className="bl-nav">
        <button className="bl-lien" aria-current={!activeId ? "page" : undefined} onClick={() => naviguer(null)}>
          <span aria-hidden="true" className="bl-icone">🏠</span>Accueil
        </button>
        {menus.map((m) => (
          <div key={m.id} className="bl-groupe">
            <button className={`bl-lien bl-menu${menuActif === m.id ? " actif" : ""}`} aria-expanded={ouverts.has(m.id)} onClick={() => basculer(m.id)}>
              <span style={{ flex: 1 }}>{m.label}</span>
              <span aria-hidden="true" className="bl-fleche">{ouverts.has(m.id) ? "▾" : "▸"}</span>
            </button>
            {ouverts.has(m.id) && (
              <div className="bl-pages">
                {m.pages.length ? m.pages.map((p) => (
                  <button key={p.id} className="bl-lien bl-page" aria-current={p.id === activeId ? "page" : undefined} onClick={() => naviguer(p.id)}>
                    <span aria-hidden="true" className="bl-icone">{p.icone}</span><span>{p.titre}</span>
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
