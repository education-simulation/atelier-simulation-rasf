// ============================================================
//  BOUTON « 🎨 STYLE » (moteur, ne pas modifier) — seulement dans l'aperçu, sur l'ordinateur.
//  Il fait essayer les trois styles du site (blocs, latéral, liste) d'un clic, SANS rien enregistrer :
//  le site en ligne garde le style écrit dans site.config.js. Pour garder un style, on le dit à l'agent.
// ============================================================
import { useState } from "react";
import { STYLE_BOUTONS_RONDS } from "./InspecteurLocal";

export const STYLES = [
  ["blocs", "Blocs de couleur", "Menus en haut, accueil en grands blocs colorés (d'après la Paillasse virtuelle)."],
  ["lateral", "Barre latérale", "Menus dans une barre sombre à gauche, accueil sobre en cartes (d'après reula.fr)."],
  ["liste", "Liste", "Menus en haut, accueil en simple liste, le plus rapide à lire."],
];
export const CLE_STYLE_APERCU = "atelier.styleApercu";

export function ChoixStyle({ actuel, enregistre, choisir }) {
  const [ouvert, setOuvert] = useState(false);
  const nom = (id) => (STYLES.find((s) => s[0] === id) || STYLES[0])[1];
  const essai = actuel !== enregistre;

  return (
    <div style={{ position: "fixed", bottom: 148, right: 20, zIndex: 9999 }}>
      <style>{STYLE_BOUTONS_RONDS}</style>
      <button type="button" className="bouton-rond" style={{ background: "#7c3aed" }} aria-expanded={ouvert}
        aria-label="Essayer un autre style" onClick={() => setOuvert((o) => !o)}>
        <span aria-hidden="true">{ouvert ? "✕" : "🎨"}</span>
        <span className="pastille">style</span>
        <span className="bulle">Essayer un autre style (aperçu seulement)</span>
      </button>
      {ouvert && (
        <div role="dialog" aria-label="Essayer un autre style"
          style={{ position: "absolute", right: 66, bottom: 0, width: "min(340px, calc(100vw - 110px))", background: "#fff", border: "1px solid #cbd5e1",
            borderRadius: 14, boxShadow: "0 10px 25px rgba(0,0,0,.2)", padding: "12px 14px", fontSize: 14, color: "#0f172a" }}>
          <strong>🎨 Essayer un style</strong>
          <div style={{ display: "grid", gap: 6, margin: "10px 0" }}>
            {STYLES.map(([id, titre, detail]) => (
              <button key={id} type="button" onClick={() => choisir(id)}
                style={{ textAlign: "left", padding: "8px 10px", borderRadius: 10, cursor: "pointer", font: "inherit",
                  border: `2px solid ${actuel === id ? "#7c3aed" : "#e2e8f0"}`, background: actuel === id ? "#f5f3ff" : "#fff" }}>
                <strong>{actuel === id ? "● " : ""}{titre}</strong>
                <span style={{ display: "block", fontSize: 12.5, color: "#64748b" }}>{detail}</span>
              </button>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
            {essai
              ? <>Tu essaies le style <strong>{nom(actuel)}</strong>. Pour le garder, dis à l'agent : <strong>« garde le style {nom(actuel).toLowerCase()} »</strong>. Sinon, le site en ligne reste en {nom(enregistre).toLowerCase()}.</>
              : <>C'est le style de ton site. Clique sur un autre pour l'essayer : rien n'est enregistré.</>}
          </p>
        </div>
      )}
    </div>
  );
}
