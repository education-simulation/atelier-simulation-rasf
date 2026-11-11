// ============================================================
//  EN-TÊTE DU SITE (moteur, ne pas modifier) — d'après la « Paillasse virtuelle » de Nils Aronssohn.
//  Toujours visible : il se range quand on descend dans la page et revient quand on remonte.
//  Titre (retour à l'accueil) · un menu déroulant compact par menu de site.config.js.
//  Sur écran étroit, les menus se regroupent derrière un bouton « Menu ».
// ============================================================
import { useState, useEffect, useRef } from "react";

export const HAUTEUR_ENTETE = 52;

// Le petit logo (une fiole) aux couleurs du site.
export function Logo({ taille = 28 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 64 64" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect width="64" height="64" rx="14" fill="var(--accent)" />
      <path d="M26 12h12M28 12v14L16 48a4 4 0 0 0 3.5 6h25a4 4 0 0 0 3.5-6L36 26V12" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M21 42h22" stroke="#f5a31a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// menus : [{ id, label, pages: [{ id, icone, titre }] }]
export function EnTete({ titre, menus, activeId, menuActif, naviguer }) {
  const [ouvert, setOuvert] = useState(null);        // id du menu déroulé (grand écran) ou 'mobile'
  const [accordeon, setAccordeon] = useState(null);  // menu déplié dans le menu mobile
  const [large, setLarge] = useState(() => window.innerWidth >= 760);
  const [cache, setCache] = useState(false);
  const ref = useRef(null);
  const dernierY = useRef(0);

  useEffect(() => {
    const defile = () => {
      const y = window.scrollY, dy = y - dernierY.current;
      if (Math.abs(dy) < 8) return;
      dernierY.current = y;
      setCache(dy > 0 && y > HAUTEUR_ENTETE);
    };
    const taille = () => setLarge(window.innerWidth >= 760);
    window.addEventListener("scroll", defile, { passive: true });
    window.addEventListener("resize", taille);
    return () => { window.removeEventListener("scroll", defile); window.removeEventListener("resize", taille); };
  }, []);
  useEffect(() => {
    if (!ouvert) return undefined;
    const dehors = (e) => { if (ref.current && !ref.current.contains(e.target)) setOuvert(null); };
    const echap = (e) => { if (e.key === "Escape") setOuvert(null); };
    document.addEventListener("mousedown", dehors);
    document.addEventListener("keydown", echap);
    return () => { document.removeEventListener("mousedown", dehors); document.removeEventListener("keydown", echap); };
  }, [ouvert]);

  const masque = cache && !ouvert;
  const aller = (id) => { setOuvert(null); naviguer(id); };

  const lienPage = (p) => (
    <button key={p.id} className="et-lien" onClick={() => aller(p.id)} aria-current={p.id === activeId ? "page" : undefined}>
      <span aria-hidden="true" className="et-icone">{p.icone}</span>
      <span>{p.titre}</span>
    </button>
  );
  const listePages = (m) => (m.pages.length ? m.pages.map(lienPage) : <span className="et-vide">Pas encore de page ici.</span>);

  return (
    <header ref={ref} className="entete" style={{ height: HAUTEUR_ENTETE, transform: masque ? "translateY(-110%)" : "none" }}>
      <div className="entete-ligne">
        <a href="?" onClick={(e) => { e.preventDefault(); aller(null); }} title="Retour à l'accueil" className="entete-titre">
          <Logo />
          <span>{titre}</span>
        </a>

        {large && (
          <nav aria-label="Menus" className="entete-menus">
            {menus.map((m) => (
              <div key={m.id} className="et-menu">
                <button onClick={() => setOuvert((o) => (o === m.id ? null : m.id))} aria-expanded={ouvert === m.id}
                  className={`et-bouton${menuActif === m.id ? " actif" : ""}${ouvert === m.id ? " deroule" : ""}`}>
                  {m.label}<span aria-hidden="true" className="et-fleche">{ouvert === m.id ? "▲" : "▼"}</span>
                </button>
                {ouvert === m.id && <div className="et-panneau" role="region" aria-label={m.label}>{listePages(m)}</div>}
              </div>
            ))}
          </nav>
        )}
        {!large && <span style={{ flex: 1 }} />}
        {!large && (
          <button onClick={() => setOuvert((o) => (o === "mobile" ? null : "mobile"))} aria-expanded={ouvert === "mobile"} className="et-mobile">
            <span aria-hidden="true">☰</span> Menu
          </button>
        )}
      </div>

      {!large && ouvert === "mobile" && (
        <div className="et-panneau-mobile" role="region" aria-label="Menu">
          <button className="et-lien" onClick={() => aller(null)}><span aria-hidden="true" className="et-icone">🏠</span>Accueil</button>
          {menus.map((m) => (
            <div key={m.id} style={{ borderTop: "1px solid var(--bord)" }}>
              <button className="et-lien et-titre-accordeon" onClick={() => setAccordeon((a) => (a === m.id ? null : m.id))} aria-expanded={accordeon === m.id}>
                <span style={{ flex: 1 }}>{m.label}</span><span aria-hidden="true" className="et-fleche">{accordeon === m.id ? "▲" : "▼"}</span>
              </button>
              {accordeon === m.id && <div style={{ paddingLeft: 10, paddingBottom: 4 }}>{listePages(m)}</div>}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
