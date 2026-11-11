// Fenêtre flottante qui ouvre la calculatrice scientifique (Calculatrice.jsx, même dossier)
// par-dessus une simulation. N'est pas un module : elle n'est pas déclarée dans site.config.js.
// Usage : {ouverte && <CalculatriceScientifique onClose={…} onInserer={(texte) => …} />}
//   onClose   : fermer la fenêtre
//   onInserer : reçoit le résultat sous forme de texte, avec une virgule (« 0,998 »)
// La fenêtre se déplace par sa barre de titre et se redimensionne par ses 4 coins,
// en gardant ses proportions (tout le contenu est mis à l'échelle). Double-clic sur
// un coin : retour à la taille standard. Taille, position repliée : retenues au rechargement.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Calculatrice, { activerCalculatriceDans, calculatriceActiveDans } from "./Calculatrice";

const LARGEUR = 380;     // largeur standard (échelle 1)
const ECHELLE_MIN = 0.7; // en dessous, les touches deviennent difficiles à lire et à viser
const ECHELLE_MAX = 2.5; // plafond absolu ; l'écran plafonne souvent avant

// Nombre → texte pour un champ de réponse : 10 chiffres significatifs, virgule décimale.
function versReponse(v) {
  return String(Number(v.toPrecision(10))).replace(".", ",");
}

const borner = (v, a, b) => Math.min(b, Math.max(a, v));

// Les 4 coins : sx = +1 si le coin est à droite, sy = +1 s'il est en bas.
const COINS = [
  { id: "hg", sx: -1, sy: -1, curseur: "nwse-resize", style: { left: -4, top: -4 } },
  { id: "hd", sx: 1, sy: -1, curseur: "nesw-resize", style: { right: -4, top: -4 } },
  { id: "bg", sx: -1, sy: 1, curseur: "nesw-resize", style: { left: -4, bottom: -4 } },
  { id: "bd", sx: 1, sy: 1, curseur: "nwse-resize", style: { right: -4, bottom: -4 } },
];

export function CalculatriceScientifique({ onClose, onInserer }) {
  const [echelle, setEchelle] = useState(() => {
    try {
      const v = parseFloat(localStorage.getItem("calc.echelle"));
      return Number.isFinite(v) ? borner(v, ECHELLE_MIN, ECHELLE_MAX) : 1;
    } catch { return 1; }
  });
  useEffect(() => { try { localStorage.setItem("calc.echelle", String(echelle)); } catch { /* sans importance */ } }, [echelle]);

  const [pos, setPos] = useState(() => ({
    x: Math.max(8, window.innerWidth - LARGEUR * echelle - 20),
    y: Math.min(100, Math.max(8, window.innerHeight - 640 * echelle)),
  }));
  const fenetre = useRef(null);
  const glisse = useRef(null);
  const redim = useRef(null);
  // Repliée : seule la barre de titre reste (le calcul en cours est gardé). Retenu au rechargement.
  const [repliee, setRepliee] = useState(() => { try { return localStorage.getItem("calc.repliee") === "1"; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem("calc.repliee", repliee ? "1" : "0"); } catch { /* sans importance */ } }, [repliee]);

  // Échelle maximale permise par l'écran, pour une fenêtre de hauteur h à l'échelle e.
  function echelleMaxEcran(h, e) {
    const hauteurStandard = h / e;
    return Math.max(ECHELLE_MIN, Math.min(ECHELLE_MAX, (window.innerWidth - 16) / LARGEUR, (window.innerHeight - 16) / hauteurStandard));
  }

  // À l'ouverture et au dépliage : la fenêtre entière doit tenir à l'écran (coins du bas compris).
  useLayoutEffect(() => {
    const r = fenetre.current?.getBoundingClientRect();
    if (!r) return;
    const e = Math.min(echelle, echelleMaxEcran(r.height, echelle));
    const h = r.height * e / echelle;
    if (e !== echelle) setEchelle(e);
    setPos((p) => ({ x: p.x, y: borner(p.y, 8, Math.max(8, window.innerHeight - h - 8)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repliee]);

  // Si la fenêtre du navigateur rétrécit, la calculatrice rétrécit et reste visible.
  useEffect(() => {
    const surRedim = () => {
      const r = fenetre.current?.getBoundingClientRect();
      if (!r) return;
      setEchelle((e) => Math.min(e, Math.max(ECHELLE_MIN, (window.innerWidth - 16) / LARGEUR)));
      setPos((p) => ({
        x: borner(p.x, 8, Math.max(8, window.innerWidth - r.width - 8)),
        y: borner(p.y, 8, Math.max(8, window.innerHeight - 60)),
      }));
    };
    window.addEventListener("resize", surRedim);
    return () => window.removeEventListener("resize", surRedim);
  }, []);

  // Déplacement à la souris ET au doigt (Pointer Events), borné à l'écran.
  function debutGlisser(e) {
    if (e.target.closest("button")) return;
    glisse.current = { x: e.clientX, y: e.clientY, depart: pos };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function glisser(e) {
    const g = glisse.current;
    if (!g) return;
    const largeur = Math.min(LARGEUR * echelle, window.innerWidth - 16);
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - largeur - 8, g.depart.x + e.clientX - g.x)),
      y: Math.max(8, Math.min(window.innerHeight - 60, g.depart.y + e.clientY - g.y)),
    });
  }
  function finGlisser() { glisse.current = null; }

  // Redimensionnement par un coin : le coin opposé reste fixe, le ratio est conservé.
  function debutRedim(e, coin) {
    e.preventDefault();
    e.stopPropagation();
    const r = fenetre.current.getBoundingClientRect();
    redim.current = { coin, x: e.clientX, y: e.clientY, echelle, l: r.width, h: r.height, gauche: r.left, haut: r.top, max: echelleMaxEcran(r.height, echelle) };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function redimensionner(e) {
    const d = redim.current;
    if (!d) return;
    const { sx, sy } = d.coin;
    // Facteur moyen tiré des deux directions du coin (une diagonale suit le doigt naturellement).
    const fx = (d.l + sx * (e.clientX - d.x)) / d.l;
    const fy = repliee ? fx : (d.h + sy * (e.clientY - d.y)) / d.h;
    const nouvelle = borner(d.echelle * (fx + fy) / 2, ECHELLE_MIN, d.max);
    const f = nouvelle / d.echelle;
    const l = d.l * f, h = d.h * f;
    setEchelle(nouvelle);
    setPos({
      x: borner(sx < 0 ? d.gauche + d.l - l : d.gauche, 8, Math.max(8, window.innerWidth - l - 8)),
      y: borner(sy < 0 ? d.haut + d.h - h : d.haut, 8, Math.max(8, window.innerHeight - Math.min(h, 60) - 8)),
    });
  }
  function finRedim() { redim.current = null; }
  function tailleStandard() {
    const r = fenetre.current.getBoundingClientRect();
    const f = Math.min(1 / echelle, echelleMaxEcran(r.height, echelle) / echelle);
    setEchelle(echelle * f);
    setPos((p) => ({ x: borner(p.x, 8, Math.max(8, window.innerWidth - r.width * f - 8)), y: p.y }));
  }

  // Échap ferme la fenêtre quand le calcul est déjà vide (et qu'elle est dépliée).
  useEffect(() => {
    const surTouche = (e) => {
      if (repliee) return;
      // Seulement si c'est cette fenêtre qui a le clavier (une autre calculatrice peut être affichée).
      if (e.key !== "Escape" || !calculatriceActiveDans(fenetre.current)) return;
      if (!fenetre.current.querySelector(".calc-saisie")?.textContent.trim()) onClose();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [onClose, repliee]);

  return (
    <div
      ref={fenetre}
      role="dialog"
      aria-label="Calculatrice scientifique"
      onPointerDownCapture={() => activerCalculatriceDans(fenetre.current)}
      style={{
        position: "fixed", left: pos.x, top: pos.y, zIndex: 10000,
        width: `min(${Math.round(LARGEUR * echelle)}px, calc(100vw - 16px))`,
        background: "#fff", borderRadius: 20 * echelle, boxShadow: "0 18px 50px rgba(15,23,42,.28)", border: "1px solid #d6dde5",
      }}
    >
      <div style={{ maxHeight: "calc(100vh - 16px)", overflow: "auto", borderRadius: 20 * echelle }}>
        {/* zoom : tout le contenu (barre de titre comprise) grandit ou rétrécit d'un bloc */}
        <div style={{ zoom: echelle }}>
          <div
            onPointerDown={debutGlisser}
            onPointerMove={glisser}
            onPointerUp={finGlisser}
            onPointerCancel={finGlisser}
            onDoubleClick={(e) => { if (!e.target.closest("button")) setRepliee((r) => !r); }}
            title="Double-clic pour replier ou déplier"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              padding: "8px 10px 8px 14px", cursor: "grab", touchAction: "none", userSelect: "none",
              borderBottom: repliee ? "none" : "1px solid #e2e8f0", fontWeight: 700, fontSize: 14, color: "#334155",
            }}
          >
            <span>🧮 Calculatrice <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12 }}>· glisser pour déplacer</span></span>
            <span style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button
              type="button"
              onClick={() => setRepliee((r) => !r)}
              aria-label={repliee ? "Déplier la calculatrice" : "Replier la calculatrice"}
              aria-expanded={!repliee}
              title={repliee ? "Déplier" : "Replier"}
              style={{ border: 0, background: "#f1f5f9", borderRadius: 8, width: 30, height: 30, fontSize: 14, cursor: "pointer", color: "#475569" }}
            >
              {repliee ? "▢" : "—"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la calculatrice"
              style={{ border: 0, background: "#f1f5f9", borderRadius: 8, width: 30, height: 30, fontSize: 16, cursor: "pointer", color: "#475569" }}
            >
              ✕
            </button>
            </span>
          </div>
          {!repliee && (
            <div style={{ padding: 6 }}>
              <Calculatrice compacte onInserer={onInserer ? (v) => { onInserer(versReponse(v)); onClose?.(); } : undefined} />
            </div>
          )}
        </div>
      </div>
      {COINS.map((c) => (
        <div
          key={c.id}
          className="calc-coin"
          aria-hidden="true"
          title="Glisser pour agrandir ou réduire · double-clic : taille standard"
          onPointerDown={(e) => debutRedim(e, c)}
          onPointerMove={redimensionner}
          onPointerUp={finRedim}
          onPointerCancel={finRedim}
          onDoubleClick={tailleStandard}
          style={{ position: "absolute", width: 22, height: 22, cursor: c.curseur, touchAction: "none", zIndex: 1, ...c.style }}
        >
          {/* petite équerre visible dans le coin */}
          <span style={{
            position: "absolute", width: 10, height: 10, opacity: 0.45,
            [c.sy < 0 ? "top" : "bottom"]: 6, [c.sx < 0 ? "left" : "right"]: 6,
            [c.sy < 0 ? "borderTop" : "borderBottom"]: "2px solid #64748b",
            [c.sx < 0 ? "borderLeft" : "borderRight"]: "2px solid #64748b",
            [`border${c.sy < 0 ? "Top" : "Bottom"}${c.sx < 0 ? "Left" : "Right"}Radius`]: 6,
          }} />
        </div>
      ))}
    </div>
  );
}

export default CalculatriceScientifique;
