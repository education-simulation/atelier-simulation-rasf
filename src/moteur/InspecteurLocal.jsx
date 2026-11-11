// Bouton « Sélectionner un élément à modifier » (moteur, ne pas modifier), visible seulement sur l'ordinateur.
// Une fois activé : chaque grande zone de la page est entourée de pointillés avec un numéro ;
// on clique sur un endroit, on écrit ce qu'on veut changer, et on copie le tout pour l'agent.
import { useState, useEffect } from "react";

// Les grandes zones de la page, dans l'ordre : en-tête, fil d'Ariane, titre, blocs de la page, pied de page.
function trouverSections() {
  const liste = [];
  const ajouter = (el, nom) => { if (el && el.offsetHeight > 20 && !liste.some((x) => x.el === el)) liste.push({ el, nom }); };
  ajouter(document.querySelector("aside.barre-laterale"), "Barre latérale et menus");
  ajouter(document.querySelector("header.entete"), "En-tête et menus");
  ajouter(document.querySelector(".fil-ariane"), "Fil d'Ariane");
  ajouter(document.querySelector(".barre-titre"), "Titre de la page");
  const accueil = document.querySelector(".zone-sim .ab");
  if (accueil) {
    ajouter(accueil.querySelector(".ab-hero"), "Grande phrase et présentation");
    ajouter(accueil.querySelector(".ab-titre-section"), "Titre « Les pages, par menu »");
    accueil.querySelectorAll(".ab-niv").forEach((b) => ajouter(b, `Bloc du menu « ${b.getAttribute("aria-label")} »`));
    ajouter(accueil.querySelector(".ab-carte"), "Carte auteur");
  } else {
    // Une page : ses blocs principaux (on descend d'un niveau si la page n'a qu'un seul bloc).
    let racine = document.querySelector(".zone-sim > *");
    while (racine && racine.children.length === 1) racine = racine.children[0];
    [...(racine?.children || [])].forEach((b) => {
      const titre = ["h2", "h3", "label", "strong", "[role=tablist]"].map((q) => b.querySelector(q)).find(Boolean);
      const texte = (titre?.innerText || b.innerText || "").trim().split("\n")[0].slice(0, 40);
      ajouter(b, texte || `Bloc <${b.tagName.toLowerCase()}>`);
    });
  }
  ajouter(document.querySelector("footer"), "Pied de page");
  return liste;
}

export function InspecteurLocal() {
  const [sections, setSections] = useState([]); // [{ nom, haut, gauche, largeur, hauteur }] quand la sélection est active
  const [actif, setActif] = useState(false);
  const [elementSelectionne, setElementSelectionne] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [copie, setCopie] = useState(false);

  // Dessine les sections numérotées pendant la sélection, et les suit quand on fait défiler la page.
  useEffect(() => {
    if (!actif) { setSections([]); return undefined; }
    let image = 0;
    const mesurer = () => {
      cancelAnimationFrame(image);
      image = requestAnimationFrame(() => setSections(trouverSections().map(({ el, nom }) => {
        const r = el.getBoundingClientRect();
        return { nom, haut: r.top, gauche: r.left, largeur: r.width, hauteur: r.height };
      })));
    };
    mesurer();
    window.addEventListener("scroll", mesurer, { passive: true });
    window.addEventListener("resize", mesurer);
    return () => { cancelAnimationFrame(image); window.removeEventListener("scroll", mesurer); window.removeEventListener("resize", mesurer); };
  }, [actif]);

  useEffect(() => {
    if (!actif) return;

    let survolElement = null;

    function handleMouseOver(e) {
      if (e.target.closest("#inspecteur-local-ui")) return;
      survolElement = e.target;
      survolElement.style.outline = "3px dashed #ea580c";
      survolElement.style.cursor = "crosshair";
    }

    function handleMouseOut(e) {
      if (survolElement) {
        survolElement.style.outline = "";
        survolElement.style.cursor = "";
      }
    }

    function handleClick(e) {
      if (e.target.closest("#inspecteur-local-ui")) return;
      e.preventDefault();
      e.stopPropagation();

      const el = e.target;
      el.style.outline = "";
      el.style.cursor = "";

      const tag = el.tagName.toLowerCase();
      const texte = el.innerText ? el.innerText.trim().slice(0, 80) : "";
      const classes = el.className || "";
      const liste = trouverSections();
      const i = liste.findIndex((x) => x.el.contains(el));

      setElementSelectionne({
        section: i >= 0 ? `n°${i + 1} · ${liste[i].nom}` : null,
        tag,
        texte,
        classes,
        html: el.outerHTML.slice(0, 150)
      });
      setActif(false);
    }

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("click", handleClick, true);
      if (survolElement) {
        survolElement.style.outline = "";
        survolElement.style.cursor = "";
      }
    };
  }, [actif]);

  function copierRapport() {
    const page = new URLSearchParams(window.location.search).get("sim") || "accueil";
    const ou = elementSelectionne.section ? `page « ${page} », section ${elementSelectionne.section}, ` : `page « ${page} », `;
    const rapport = `[Retour sur ${ou}élément <${elementSelectionne.tag}> : "${elementSelectionne.texte}"]\nCommentaire : ${commentaire || "(aucun commentaire saisi)"}`;
    navigator.clipboard.writeText(rapport);
    setCopie(true);
    setTimeout(() => {
      setCopie(false);
      setElementSelectionne(null);
      setCommentaire("");
    }, 600);
  }

  // N'afficher que sur localhost
  if (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return null;
  }

  return (
    <div id="inspecteur-local-ui">
      <style>{STYLE_BOUTONS_RONDS}</style>
      {/* Sections numérotées en pointillé, pendant la sélection (elles laissent passer les clics) */}
      {sections.map((x, i) => (
        <div key={i} aria-hidden="true" style={{ position: "fixed", top: x.haut, left: x.gauche, width: x.largeur, height: x.hauteur,
          border: "2px dashed #b45309", borderRadius: 10, pointerEvents: "none", zIndex: 9990, boxSizing: "border-box" }}>
          <span style={{ position: "absolute", top: -2, left: -2, background: "#b45309", color: "#fff", font: "800 12px/1 'Nunito', sans-serif",
            padding: "4px 7px", borderRadius: "8px 0 8px 0", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
            {i + 1} · {x.nom}
          </span>
        </div>
      ))}
      {/* Bouton rond flottant en bas à droite ; son nom apparaît au survol */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
        <button
          type="button"
          className="bouton-rond"
          aria-label={actif ? "Annuler la sélection" : "Sélectionner un élément à modifier"}
          onClick={() => { setActif(!actif); setElementSelectionne(null); }}
          style={{ background: actif ? "#dc2626" : "#b45309" }}
        >
          <span aria-hidden="true">{actif ? "✕" : "👆"}</span>
          <span className={`bulle${actif ? " visible" : ""}`}>
            {actif ? "Clique sur l'endroit à modifier… (✕ pour annuler)" : "Sélectionner un élément à modifier"}
          </span>
        </button>
      </div>

      {/* Fenêtre de commentaire quand un élément est sélectionné */}
      {elementSelectionne && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 86,
          width: 340,
          background: "#fff",
          borderRadius: 14,
          padding: 16,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          border: "2px solid #b45309",
          zIndex: 9999,
          fontFamily: "sans-serif",
          fontSize: 13
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ color: "#b45309" }}>Élément sélectionné :</strong>
            <button
              onClick={() => setElementSelectionne(null)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#64748b" }}
            >
              ✕
            </button>
          </div>

          <div style={{ background: "#f8fafc", padding: 8, borderRadius: 6, marginBottom: 10, fontSize: 12, color: "#334155", maxHeight: 80, overflow: "hidden", textOverflow: "ellipsis" }}>
            {elementSelectionne.section && <div style={{ fontWeight: 800, color: "#b45309", marginBottom: 2 }}>Section {elementSelectionne.section}</div>}
            <code>&lt;{elementSelectionne.tag}&gt;</code> {elementSelectionne.texte || "(élément sans texte)"}
          </div>

          <label style={{ display: "block", fontWeight: 700, marginBottom: 4, color: "#475569" }}>
            Ton commentaire ou consigne :
          </label>
          <textarea
            rows="3"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ex : Changer cette couleur, déplacer ce texte..."
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, boxSizing: "border-box", marginBottom: 10, resize: "none" }}
          />

          <button
            onClick={copierRapport}
            style={{
              width: "100%",
              background: copie ? "#16a34a" : "#b45309",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 13
            }}
          >
            {copie ? "✓ Copié dans le presse-papier !" : "📋 Copier pour l'assistant"}
          </button>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#64748b", textAlign: "center" }}>
            Colle-le ensuite dans notre conversation ci-contre.
          </p>
        </div>
      )}
    </div>
  );
}

// Boutons ronds flottants (partagés avec le bouton des étapes, src/moteur/Apercu.jsx) :
// une icône, et leur nom dans une bulle au survol.
export const STYLE_BOUTONS_RONDS = `
.bouton-rond{position:relative;width:52px;height:52px;border-radius:50%;border:2px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.25);
  font-size:22px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;padding:0;transition:transform .15s ease}
.bouton-rond:hover{transform:scale(1.08)}
.bouton-rond .bulle{position:absolute;right:62px;top:50%;transform:translateY(-50%);background:#0f172a;color:#fff;font-size:13px;font-weight:700;
  white-space:nowrap;padding:6px 10px;border-radius:8px;opacity:0;pointer-events:none;transition:opacity .15s ease;font-family:inherit}
.bouton-rond:hover .bulle,.bouton-rond:focus-visible .bulle,.bouton-rond .bulle.visible{opacity:1}
.bouton-rond .pastille{position:absolute;top:-5px;right:-5px;background:#fff;color:#0f172a;font-size:10px;font-weight:800;border-radius:10px;
  padding:2px 5px;border:1px solid #cbd5e1;line-height:1}
`;
