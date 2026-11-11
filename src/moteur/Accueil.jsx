// PAGE D'ACCUEIL (moteur, ne pas modifier). Trois styles, choisis par « style » dans site.config.js :
//   blocs   : grande phrase, puis un bloc de couleur par menu (d'après la « Paillasse virtuelle » de Nils Aronssohn)
//   lateral : titre sobre, puis une carte par page, rangées par menu
//   liste   : titre, puis chaque menu en liste dépliable
// Les textes et les couleurs se changent dans site.config.js.

// « Essayer, [comprendre.] » → le morceau entre crochets est surligné.
function Accroche({ texte }) {
  return texte.split(/(\[[^\]]*\])/).map((m, i) => (m.startsWith("[") ? <mark key={i}>{m.slice(1, -1)}</mark> : m));
}

const texteSeul = (t) => String(t || "").replace(/[[\]]/g, "");

export function Accueil(props) {
  const style = props.site.style;
  if (style === "lateral") return <AccueilLateral {...props} />;
  if (style === "liste") return <AccueilListe {...props} />;
  return <AccueilBlocs {...props} />;
}

function AccueilLateral({ site, menus, naviguer }) {
  return (
    <div className="al">
      <header className="al-tete">
        <span className="al-trait" aria-hidden="true" />
        <h1>{site.titre}</h1>
        <p>{texteSeul(site.accroche)}</p>
        {site.presentation && <p className="al-pres">{site.presentation}</p>}
      </header>
      {menus.map((m) => (
        <section key={m.id} id={`menu-${m.id}`} className="al-section" aria-label={m.label}>
          <h2>{m.label}</h2>
          <div className="al-grille">
            {m.pages.map((p) => (
              <button key={p.id} type="button" className="al-carte" onClick={() => naviguer(p.id)}>
                <span className="al-trait" aria-hidden="true" />
                <strong><span aria-hidden="true">{p.icone}</span> {p.titre}</strong>
                {p.description && <span>{p.description}</span>}
              </button>
            ))}
            {!m.pages.length && <p className="al-vide">Bientôt des pages ici.</p>}
          </div>
        </section>
      ))}
      <p className="al-auteur">{site.auteur}{site.etablissement ? ` · ${site.etablissement}` : ""}</p>
    </div>
  );
}

function AccueilListe({ site, menus, naviguer }) {
  return (
    <div className="li">
      <header className="li-tete">
        <h1>{site.titre}</h1>
        <p>{texteSeul(site.accroche)} {site.presentation}</p>
      </header>
      {menus.map((m) => (
        <details key={m.id} id={`menu-${m.id}`} className="li-menu" open>
          <summary><span>{m.label}</span><span className="li-nb">{m.pages.length} page{m.pages.length > 1 ? "s" : ""}</span></summary>
          <ul>
            {m.pages.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => naviguer(p.id)}>
                  <span aria-hidden="true" className="li-icone">{p.icone}</span>
                  <span><strong>{p.titre}</strong>{p.description && <span className="li-desc">{p.description}</span>}</span>
                </button>
              </li>
            ))}
            {!m.pages.length && <li className="li-vide">Bientôt des pages ici.</li>}
          </ul>
        </details>
      ))}
      <p className="li-auteur">{site.auteur}{site.etablissement ? ` · ${site.etablissement}` : ""}</p>
    </div>
  );
}

function AccueilBlocs({ site, menus, naviguer }) {
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
