// ============================================================
//  CALCULATRICE SCIENTIFIQUE — page de l'outil.
//  La calculatrice s'affiche dans la page ; le bouton « Ouvrir en fenêtre flottante »
//  l'ouvre aussi en petite fenêtre, déplaçable et redimensionnable par ses coins,
//  qui RESTE OUVERTE quand on change de page (elle appartient à tout le site).
//  Le code de la calculatrice est dans src/outils/ : ne pas le modifier.
// ============================================================
import Calculatrice from "../src/outils/Calculatrice.jsx";
import { basculerCalculatrice, useCalculatriceOuverte } from "../src/outils/calculatriceFlottante.js";

export default function PageCalculatrice() {
  const flottante = useCalculatriceOuverte();
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button type="button" onClick={basculerCalculatrice}
          style={{ padding: "9px 16px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14.5,
            background: flottante ? "#fff" : "var(--accent)", color: flottante ? "var(--accent)" : "#fff", boxShadow: "inset 0 0 0 2px var(--accent)" }}>
          {flottante ? "✕ Fermer la fenêtre flottante" : "🪟 Ouvrir en fenêtre flottante"}
        </button>
      </div>
      <Calculatrice />
    </div>
  );
}
