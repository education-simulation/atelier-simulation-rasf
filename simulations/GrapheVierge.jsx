// ============================================================
//  GRAPHE VIERGE — outil repris de reula.fr : un papier millimétré à imprimer ou exporter
//  (repère cartésien, logarithmique ou ternaire, annotations, export PNG / SVG / PDF).
//  Les graphes enregistrés restent dans ce navigateur.
//  Le code de l'outil est dans src/outils/reula/ : ne pas le modifier.
// ============================================================
import GraphApp from "../src/outils/reula/apps/graph/GraphApp.jsx";
import { ConfirmProvider } from "../src/outils/reula/components/ui/Confirm.jsx";
import "../src/outils/reula/reula.css";

export default function GrapheVierge() {
  return (
    <div className="outil-reula" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <ConfirmProvider><GraphApp /></ConfirmProvider>
    </div>
  );
}
