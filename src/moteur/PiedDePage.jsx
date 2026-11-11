// Pied de page et page « À propos » (moteur, ne pas modifier).
// La mention de Nils Aronssohn, auteur de la « Paillasse virtuelle » dont vient cette présentation, doit rester.
const lien = { color: "var(--texte2)", textDecoration: "none", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13.5, fontWeight: 700 };

export function PiedDePage({ site, naviguer }) {
  const aller = (id) => (e) => { e.preventDefault(); naviguer(id); };
  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #d5dfeb", color: "#475569", padding: "12px 16px 10px", marginTop: 24, textAlign: "center" }}>
      <nav aria-label="Liens du pied de page" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 20px" }}>
        <a href="?" onClick={aller(null)} style={lien}>Accueil</a>
        <a href="?sim=a-propos" onClick={aller("a-propos")} style={lien}>À propos</a>
      </nav>
      <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5 }}>
        © {new Date().getFullYear()} {site.auteur} · {site.titre} · présentation d'après la{" "}
        <a href="https://paillasse-virtuelle.fr/" target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Paillasse virtuelle</a> de Nils Aronssohn
      </div>
    </footer>
  );
}

export function APropos({ site }) {
  const para = { maxWidth: 760, margin: "0 auto 14px", lineHeight: 1.7 };
  return (
    <div style={{ background: "#fff", border: "1px solid #d5dfeb", borderRadius: 22, padding: "22px 24px", maxWidth: 820, margin: "0 auto" }}>
      <p style={para}>Ce site a été créé par <strong>{site.auteur}</strong>{site.etablissement ? <> ({site.etablissement})</> : null}.</p>
      <p style={para}>
        Sa présentation (en-tête, menus, page d'accueil) reprend celle de la{" "}
        <a href="https://paillasse-virtuelle.fr/" target="_blank" rel="noopener noreferrer">Paillasse virtuelle</a>,
        le site de simulations de <strong>Nils Aronssohn</strong> (lycée Argouges, Grenoble), avec son autorisation.
        Les pages de ce site-ci ne viennent pas de la Paillasse virtuelle.
      </p>
      <p style={para}>Site fait avec l'Atelier simulation RASF, modèle proposé par le RASF aux enseignant·es.</p>
      <p style={para}><strong>Données personnelles :</strong> ce site ne demande aucun compte, ne dépose aucun cookie et ne mesure pas les visites.</p>
    </div>
  );
}
