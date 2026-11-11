// ============================================================
//  BOUTON « 🎨 STYLE » (moteur, ne pas modifier) — seulement dans l'aperçu, sur l'ordinateur.
//  Un clic sur un des trois styles (blocs, latéral, liste) l'ENREGISTRE dans site.config.js
//  (par le serveur d'aperçu, voir vite.config.js) : ce que l'on voit est ce qui sera mis en ligne.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { STYLE_BOUTONS_RONDS } from "./InspecteurLocal";

export const STYLES = [
  ["blocs", "Blocs de couleur", "Menus en haut, accueil en grands blocs colorés (d'après la Paillasse virtuelle)."],
  ["lateral", "Barre latérale", "Menus dans une barre sombre à gauche, accueil sobre en cartes (d'après reula.fr)."],
  ["liste", "Liste", "Menus en haut, accueil en simple liste, le plus rapide à lire."],
];

// Ferme une fenêtre quand on clique en dehors de `ref`, ou qu'on appuie sur Échap.
export function useFermerDehors(ref, ouvert, fermer) {
  useEffect(() => {
    if (!ouvert) return undefined;
    const dehors = (e) => { if (ref.current && !ref.current.contains(e.target)) fermer(); };
    const echap = (e) => { if (e.key === "Escape") fermer(); };
    document.addEventListener("pointerdown", dehors);
    document.addEventListener("keydown", echap);
    return () => { document.removeEventListener("pointerdown", dehors); document.removeEventListener("keydown", echap); };
  }, [ref, ouvert, fermer]);
}

export function ChoixStyle({ actuel }) {
  const [ouvert, setOuvert] = useState(false);
  const [etat, setEtat] = useState(null); // null | "envoi" | "ok" | message d'erreur
  const ref = useRef(null);
  useFermerDehors(ref, ouvert, () => setOuvert(false));
  const nom = (id) => (STYLES.find((s) => s[0] === id) || STYLES[0])[1];

  async function choisir(id) {
    if (id === actuel) return;
    setEtat("envoi");
    try {
      const r = await fetch("__atelier/style", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ style: id }) });
      if (!r.ok) throw new Error(await r.text());
      setEtat("ok"); // l'aperçu se recharge tout seul avec le nouveau style
    } catch (e) {
      setEtat(`Le style n'a pas pu être enregistré (${e.message}). Demande à l'agent : « passe au style ${nom(id).toLowerCase()} ».`);
    }
  }

  return (
    <div ref={ref} style={{ position: "fixed", bottom: 148, right: 20, zIndex: 9999 }}>
      <style>{STYLE_BOUTONS_RONDS}</style>
      <button type="button" className="bouton-rond" style={{ background: "#7c3aed" }} aria-expanded={ouvert}
        aria-label="Changer le style du site" onClick={() => setOuvert((o) => !o)}>
        <span aria-hidden="true">{ouvert ? "✕" : "🎨"}</span>
        <span className="pastille">style</span>
        <span className="bulle">Changer le style du site · visible seulement sur ton ordinateur</span>
      </button>
      {ouvert && (
        <div role="dialog" aria-label="Changer le style du site"
          style={{ position: "absolute", right: 66, bottom: 0, width: "min(340px, calc(100vw - 110px))", background: "#fff", border: "1px solid #cbd5e1",
            borderRadius: 14, boxShadow: "0 10px 25px rgba(0,0,0,.2)", padding: "12px 14px", fontSize: 14, color: "#0f172a" }}>
          <strong>🎨 Style du site</strong>
          <span style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 2 }}>🔒 Ce bouton n'est visible que sur ton ordinateur.</span>
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
          <p style={{ margin: 0, fontSize: 12.5, color: etat && etat !== "ok" && etat !== "envoi" ? "#b91c1c" : "#475569", lineHeight: 1.5 }}>
            {etat === "envoi" ? "Enregistrement…"
              : etat === "ok" ? "✅ Style enregistré. Il sera en ligne à la prochaine mise en ligne."
                : etat || <>Clique sur un style : il est enregistré dans ton site (style actuel : <strong>{nom(actuel)}</strong>). Il sera en ligne à la prochaine mise en ligne.</>}
          </p>
        </div>
      )}
    </div>
  );
}
