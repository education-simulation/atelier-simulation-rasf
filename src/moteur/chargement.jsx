// Charge une simulation à la demande, avec un message clair si son fichier manque ou contient une erreur.
import { Suspense, Component } from "react";

export function Chargement() {
  return <div role="status" aria-live="polite" style={{ padding: "48px 16px", textAlign: "center", color: "#475569" }}>Chargement de la simulation…</div>;
}

class Garde extends Component {
  constructor(p) { super(p); this.state = { erreur: null }; }
  static getDerivedStateFromError(erreur) { return { erreur }; }
  render() {
    if (!this.state.erreur) return this.props.children;
    return (
      <div role="alert" style={{ padding: "24px", margin: "0 auto", maxWidth: 700, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 16, color: "#7f1d1d" }}>
        <p style={{ marginTop: 0, fontWeight: 700 }}>Cette simulation n'a pas pu s'afficher.</p>
        <p style={{ marginBottom: 0 }}>Message à recopier à ton assistant : <code>{String(this.state.erreur?.message || this.state.erreur)}</code></p>
      </div>
    );
  }
}

export function EnChargement({ children }) {
  return <Garde><Suspense fallback={<Chargement />}>{children}</Suspense></Garde>;
}
