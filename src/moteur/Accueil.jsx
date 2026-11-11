// PAGE D'ACCUEIL (moteur, ne pas modifier) — d'après la « Paillasse virtuelle » de Nils Aronssohn.
// Grande phrase, présentation, puis un bloc de couleur par menu avec ses pages.
// Les textes et les couleurs se changent dans site.config.js.

// « Essayer, [comprendre.] » → le morceau entre crochets est surligné.
function Accroche({ texte }) {
  return texte.split(/(\[[^\]]*\])/).map((m, i) => (m.startsWith("[") ? <mark key={i}>{m.slice(1, -1)}</mark> : m));
}

export function Accueil({ site, menus, naviguer }) {
  const total = (site.pages || []).length;
  return (
    <div className="ab">
      <section className="ab-hero" aria-label="Présentation">
        <span className="ab-etiquette">{site.titre}</span>
        <h1><Accroche texte={site.accroche || site.titre} /></h1>
        {site.presentation && <p className="ab-lead">{site.presentation}</p>}
      </section>

      <div className="ab-titre-section">
        <h2>Les pages, par menu</h2>
        <span>{total} page{total > 1 ? "s" : ""}</span>
      </div>
      <div className="ab-bento">
        {menus.map((m, i) => {
          const large = (i % 4 === 0 || i % 4 === 3) ? 7 : 5;    // blocs alternés, comme une mosaïque
          return (
            <section key={m.id} id={`menu-${m.id}`} className="ab-niv" aria-label={m.label}
              style={{ "--ab-fond": m.fond || "#2563eb", "--ab-ink": m.texte || "#ffffff", gridColumn: `span ${menus.length === 1 ? 12 : large}` }}>
              <span className="ab-abbr" aria-hidden="true">{m.id}</span>
              <h3>{m.label}</h3>
              <p className="ab-nb">{m.pages.length} page{m.pages.length > 1 ? "s" : ""}</p>
              <ul className="ab-puces">
                {m.pages.map((p) => (
                  <li key={p.id}><button type="button" onClick={() => naviguer(p.id)}>{p.icone} {p.titre}</button></li>
                ))}
                {!m.pages.length && <li><span className="ab-puce-vide">bientôt</span></li>}
              </ul>
            </section>
          );
        })}
        <section className="ab-carte" aria-label="Auteur">
          <h3>{site.auteur}</h3>
          {site.etablissement && <p>{site.etablissement}</p>}
        </section>
      </div>
    </div>
  );
}
