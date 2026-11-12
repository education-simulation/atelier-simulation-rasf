// ============================================================
//  PAGE D'UN MENU (moteur, ne pas modifier) — adresse …/?sim=menu:<id du menu>
//  La page intermédiaire d'un menu : une tuile par page du menu (icône, titre, description).
//  Les menus et les pages viennent de site.config.js.
// ============================================================
const CSS = `
.pm { max-width:1100px; margin:0 auto; width:100%; }
.pm-grille { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:16px; }
.pm-tuile { all:unset; box-sizing:border-box; cursor:pointer; display:flex; flex-direction:column; gap:10px; background:#fff; border-radius:18px;
  padding:20px; border:1px solid var(--bord, #cbd5e1); border-top:6px solid var(--pm-fond); box-shadow:0 2px 6px rgba(15,23,42,.06);
  transition:transform .15s, box-shadow .15s; min-height:150px; }
.pm-tuile:hover, .pm-tuile:focus-visible { transform:translateY(-3px); box-shadow:0 10px 24px rgba(15,23,42,.12); }
.pm-tuile:focus-visible { outline:3px solid var(--accent); outline-offset:2px; }
.pm-icone { width:52px; height:52px; border-radius:14px; display:grid; place-items:center; font-size:28px; background:color-mix(in srgb, var(--pm-fond) 16%, #fff); }
.pm-titre { font:800 19px/1.25 'Outfit', sans-serif; color:#0c1a2e; }
.pm-desc { font-size:15px; color:#475569; line-height:1.45; }
.pm-vide { color:#64748b; font-size:16px; }
`;

export function PageMenu({ menu, naviguer }) {
  return (
    <div className="pm" style={{ "--pm-fond": menu.fond || "var(--accent)" }}>
      <style>{CSS}</style>
      {menu.pages.length ? (
        <div className="pm-grille">
          {menu.pages.map((p) => (
            <button key={p.id} type="button" className="pm-tuile" onClick={() => naviguer(p.id)}>
              <span className="pm-icone" aria-hidden="true">{p.icone}</span>
              <span className="pm-titre">{p.titre}</span>
              {p.description && <span className="pm-desc">{p.description}</span>}
            </button>
          ))}
        </div>
      ) : (
        <p className="pm-vide">Pas encore de page dans ce menu.</p>
      )}
    </div>
  );
}
