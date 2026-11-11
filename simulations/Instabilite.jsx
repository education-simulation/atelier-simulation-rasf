// ============================================================
//  INSTABILITÉ DES MILIEUX DISPERSÉS : CRÉMAGE ET SÉDIMENTATION
//  Exemple VOLONTAIREMENT SIMPLE de l'Atelier simulation RASF : il sert à t'entraîner.
//  Demande par exemple à ton agent :
//    « Dans Instabilité, ajoute la coalescence quand les gouttes se touchent. »
//    « Ajoute une question à l'élève : que faut-il changer pour stabiliser l'émulsion ? »
//    « Ajoute un graphique de la vitesse en fonction du rayon des gouttes. »
//  Modèle : loi de Stokes, v = 2·r²·Δρ·g / (9·η)  (gouttes isolées, sans interactions).
// ============================================================
import { useEffect, useRef, useState } from "react";

const g = 9.81;
const NB = 70;
const HAUTEUR_CM = 10; // hauteur du tube représenté

function vitesseStokes(rMicron, drho, etaMPa) {
  const r = rMicron * 1e-6, eta = etaMPa * 1e-3;
  return (2 * r * r * drho * g) / (9 * eta); // m/s (positive = vers le bas)
}
const fr = (x, n = 2) => x.toLocaleString("fr-FR", { maximumSignificantDigits: n });
function duree(s) {
  if (!isFinite(s)) return "jamais";
  if (s < 60) return `${fr(s)} s`;
  if (s < 3600) return `${fr(s / 60)} min`;
  if (s < 86400) return `${fr(s / 3600)} h`;
  if (s < 86400 * 365) return `${fr(s / 86400)} jours`;
  return `${fr(s / 86400 / 365)} ans`;
}

function Curseur({ label, valeur, min, max, pas, onChange, texte }) {
  return (
    <label style={{ display: "grid", gap: 4, fontWeight: 700 }}>
      <span>{label} : <span style={{ color: "var(--accent)" }}>{texte}</span></span>
      <input type="range" min={min} max={max} step={pas} value={valeur} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}

export default function Instabilite() {
  const [logR, setLogR] = useState(0.5);    // rayon = 10^logR µm
  const [drho, setDrho] = useState(-100);   // ρ(gouttes) − ρ(phase continue), kg/m³
  const [logEta, setLogEta] = useState(0);  // viscosité = 10^logEta mPa·s
  const [accel, setAccel] = useState(3);    // accélération du temps = 10^accel
  const parts = useRef(Array.from({ length: NB }, () => ({ x: 0.08 + Math.random() * 0.84, y: Math.random() })));
  const [, redessiner] = useState(0);

  const r = Math.pow(10, logR), eta = Math.pow(10, logEta);
  const v = vitesseStokes(r, drho, eta);
  const tempsSeparation = Math.abs(v) > 0 ? (HAUTEUR_CM / 100) / Math.abs(v) : Infinity;
  const phenomene = Math.abs(drho) < 1 ? "aucun déplacement" : drho < 0 ? "crémage (les gouttes montent)" : "sédimentation (les particules tombent)";

  useEffect(() => {
    let t0 = performance.now(), id;
    const pas = (t) => {
      const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
      const dy = (v * dt * Math.pow(10, accel)) / (HAUTEUR_CM / 100); // fraction de tube parcourue
      parts.current.forEach((p, i) => {
        p.y = Math.min(1 - (i % 6) * 0.012, Math.max((i % 6) * 0.012, p.y + dy + (Math.random() - 0.5) * 0.002));
      });
      redessiner((n) => n + 1);
      id = requestAnimationFrame(pas);
    };
    id = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(id);
  }, [v, accel]);

  const melanger = () => parts.current.forEach((p) => { p.x = 0.08 + Math.random() * 0.84; p.y = Math.random(); });
  const rayonDessin = Math.min(9, 2 + logR * 3);

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", display: "grid", gap: 16 }}>
      <div role="note" style={{ background: "#fff7e6", border: "2px solid #f5a31a", borderRadius: 16, padding: "12px 16px", color: "#5c3a00" }}>
        <strong>🏋️ Entraîne-toi : améliore cet exemple !</strong> Il est volontairement simple. Demande par exemple à ton agent :
        « Dans Instabilité, ajoute la coalescence des gouttes » ou « ajoute une question pour l'élève ».
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 200px) 1fr", gap: 18, alignItems: "start" }}>
        <svg viewBox="0 0 100 300" style={{ width: "100%", height: "auto", background: "#fff", borderRadius: 16, border: "1px solid #d5dfeb" }}
          role="img" aria-label={`Tube : ${phenomene}`}>
          <rect x="10" y="10" width="80" height="280" rx="10" fill="#e0f2fe" stroke="#334155" strokeWidth="2" />
          {parts.current.map((p, i) => (
            <circle key={i} cx={10 + p.x * 80} cy={14 + p.y * 272} r={rayonDessin} fill={drho < 0 ? "#fde68a" : "#a8a29e"} stroke="#78350f" strokeWidth="0.6" opacity="0.9" />
          ))}
        </svg>

        <div style={{ display: "grid", gap: 14, background: "#fff", border: "1px solid #d5dfeb", borderRadius: 20, padding: "16px 18px" }}>
          <Curseur label="Rayon des gouttes" valeur={logR} min={-1} max={1.5} pas={0.05} onChange={setLogR} texte={`${fr(r)} µm`} />
          <Curseur label="Différence de masse volumique Δρ = ρ(gouttes) − ρ(liquide)" valeur={drho} min={-300} max={300} pas={10} onChange={setDrho} texte={`${drho} kg/m³`} />
          <Curseur label="Viscosité du liquide" valeur={logEta} min={0} max={4} pas={0.1} onChange={setLogEta} texte={`${fr(eta)} mPa·s`} />
          <Curseur label="Accélération du temps" valeur={accel} min={0} max={6} pas={1} onChange={setAccel} texte={`× ${fr(Math.pow(10, accel), 1)}`} />
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px", lineHeight: 1.7 }}>
            <div>Phénomène : <strong>{phenomene}</strong></div>
            <div>Vitesse (loi de Stokes) : <strong>{fr(Math.abs(v) * 1e6, 3)} µm/s</strong></div>
            <div>Temps pour traverser {HAUTEUR_CM} cm : <strong>{duree(tempsSeparation)}</strong></div>
          </div>
          <div style={{ fontSize: 14, color: "#475569" }}>v = 2·r²·Δρ·g / (9·η) : diviser le rayon par 10 rend la séparation 100 fois plus lente.</div>
          <button className="bouton-pilule" onClick={melanger} style={{ justifySelf: "start" }}>🔄 Réagiter le tube</button>
        </div>
      </div>
    </div>
  );
}
