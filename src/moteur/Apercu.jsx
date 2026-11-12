// Aperçu (moteur, ne pas modifier).
// estApercu : vrai seulement sur l'ordinateur (localhost), jamais sur le site publié.
// Apercu : le bouton rond « 🗺️ guide » (en bas à droite, entre 👆 et 🎨), qui ramène à la page guide (…/?guide).
// Il n'existe que sur l'ordinateur : le site en ligne n'a ni page guide ni bouton.
import { STYLE_BOUTONS_RONDS } from "./InspecteurLocal";

export const estApercu = typeof location !== "undefined" && ["localhost", "127.0.0.1"].includes(location.hostname);

export function Apercu() {
  return (
    <div style={{ position: "fixed", bottom: 84, right: 20, zIndex: 9999 }}>
      <style>{STYLE_BOUTONS_RONDS}</style>
      <a href="./?guide" className="bouton-rond" style={{ background: "#16a34a", textDecoration: "none" }} aria-label="Ouvrir la page guide">
        <span aria-hidden="true">🗺️</span>
        <span className="pastille">guide</span>
        <span className="bulle">Ta page guide : où tu en es · visible seulement sur ton ordinateur</span>
      </a>
    </div>
  );
}
