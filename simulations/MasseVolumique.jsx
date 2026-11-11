import { useState, useEffect } from "react";
import { CalculatriceScientifique } from "../src/outils/CalculatriceScientifique";
import { MathTex } from "../src/outils/MathTex";

// ============================================================
// MODÈLE & DONNÉES SCIENTIFIQUES (Pycnomètre Hubbard en inox)
// ============================================================
const TABLE_EAU = [
  { temp: 19, rho: 0.9984 },
  { temp: 20, rho: 0.9982 },
  { temp: 21, rho: 0.9980 },
  { temp: 22, rho: 0.9978 },
  { temp: 23, rho: 0.9975 },
  { temp: 24, rho: 0.9973 },
];

const ADH_TYPES = {
  pc: "Huile végétale",
  pu: "Solution aqueuse",
  sbs: "Solvant organique",
  acr: "Résine en solution",
};

function round3(n) { return Math.round(n * 1000) / 1000; }

function genererEchantillon(typeKey = "pc") {
  const tObj = TABLE_EAU[Math.floor(Math.random() * TABLE_EAU.length)];
  const T = tObj.temp;
  const V_theorique = 99.85 + Math.random() * 0.30;
  const m0_vrai = 140 + Math.random() * 50;
  const rho_vrai = 0.85 + Math.random() * 0.25;

  const m0_1 = round3(m0_vrai);
  const m1_1 = round3(m0_1 + V_theorique * tObj.rho);
  const V_1 = (m1_1 - m0_1) / tObj.rho;
  const m2_1 = round3(m0_1 + V_1 * rho_vrai);
  const rho_1 = (m2_1 - m0_1) / V_1;
  const rho_approx_1 = (m2_1 - m0_1) / (m1_1 - m0_1);

  const m0_2 = round3(m0_vrai + (Math.random() - 0.5) * 0.002);
  const m1_2 = round3(m0_2 + V_theorique * tObj.rho);
  const V_2 = (m1_2 - m0_2) / tObj.rho;
  const m2_2 = round3(m0_2 + V_2 * (rho_vrai + (Math.random() - 0.5) * 0.001));
  const rho_2 = (m2_2 - m0_2) / V_2;
  const rho_approx_2 = (m2_2 - m0_2) / (m1_2 - m0_2);

  const rho_moy = (rho_1 + rho_2) / 2;
  const s = Math.abs(rho_1 - rho_2) / Math.SQRT2;

  const rho_approx_moy = (rho_approx_1 + rho_approx_2) / 2;
  const s_approx = Math.abs(rho_approx_1 - rho_approx_2) / Math.SQRT2;

  return {
    typeKey,
    T,
    rhoEau: tObj.rho,
    m0_1, m1_1, V_1, m2_1, rho_1, rho_approx_1,
    m0_2, m1_2, V_2, m2_2, rho_2, rho_approx_2,
    rho_moy, s,
    rho_approx_moy, s_approx,
  };
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function MasseVolumiqueHubbard() {
  const mode = "guide"; // Dans le modèle, la page s'ouvre toujours en parcours guidé (le mode « défi » n'est plus proposé).
  const [avecTemperature, setAvecTemperature] = useState(() => {
    const saved = localStorage.getItem("hubbard_pv_avec_temp");
    return saved !== null ? saved === "true" : true;
  });

  const [echantillon, setEchantillon] = useState(() => {
    const saved = localStorage.getItem("hubbard_pv_echantillon");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return genererEchantillon("pc");
  });

  const [guideState, setGuideState] = useState(() => {
    const saved = localStorage.getItem("hubbard_pv_guide");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { etape: 0, reponses: {}, valides: {}, showIndice: false };
  });

  const [exploreState, setExploreState] = useState({ contenu: "vide", taree: false });
  const [animationEnCours, setAnimationEnCours] = useState(null); // 'nettoyer' | 'eau' | 'adhesif' | 'peser'

  // Défi
  const [defiState, setDefiState] = useState(() => genererDefi());
  const [reponsesDefi, setReponsesDefi] = useState({ V: "", rho: "" });
  const [verifDefi, setVerifDefi] = useState(null);
  const [showIndiceDefi, setShowIndiceDefi] = useState(false);

  useEffect(() => {
    localStorage.setItem("hubbard_pv_mode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("hubbard_pv_avec_temp", String(avecTemperature));
  }, [avecTemperature]);

  useEffect(() => {
    localStorage.setItem("hubbard_pv_echantillon", JSON.stringify(echantillon));
  }, [echantillon]);

  useEffect(() => {
    localStorage.setItem("hubbard_pv_guide", JSON.stringify(guideState));
  }, [guideState]);

  function genererDefi() {
    return genererEchantillon(Object.keys(ADH_TYPES)[Math.floor(Math.random() * 4)]);
  }

  function resetGuide() {
    setGuideState({ etape: 0, reponses: {}, valides: {}, showIndice: false });
    setEchantillon(genererEchantillon(echantillon.typeKey));
    setAnimationEnCours(null);
  }

  function declencherAnimation(type, duree = 1600) {
    setAnimationEnCours(type);
    setTimeout(() => {
      setAnimationEnCours(null);
    }, duree);
  }

  // --- CALCUL STRICT DE L'ÉTAT VISUEL (PESÉE & LIQUIDE) ---
  let peseeAffichee = null;
  let liquideAffiche = "vide";

  if (mode === "guide") {
    const etp = guideState.etape;
    const estValidee = guideState.valides[etp];

    if (avecTemperature) {
      // AVEC TEMPÉRATURE (10 étapes)
      if (etp <= 1) liquideAffiche = "vide";
      else if (etp === 2) liquideAffiche = estValidee ? "eau" : "vide";
      else if (etp >= 3 && etp <= 4) liquideAffiche = "eau";
      else if (etp === 5) liquideAffiche = estValidee ? "adhesif" : "vide";
      else liquideAffiche = "adhesif";

      if (etp === 0) peseeAffichee = null;
      else if (etp === 1) peseeAffichee = estValidee ? echantillon.m0_1 : null;
      else if (etp === 2) peseeAffichee = echantillon.m0_1;
      else if (etp === 3) peseeAffichee = estValidee ? echantillon.m1_1 : echantillon.m0_1;
      else if (etp === 4) peseeAffichee = echantillon.m1_1;
      else if (etp === 5) peseeAffichee = null;
      else if (etp === 6) peseeAffichee = estValidee ? echantillon.m2_1 : null;
      else peseeAffichee = echantillon.m2_1;
    } else {
      // SANS TEMPÉRATURE (9 étapes)
      // Étape 0 (nettoyer) -> vide
      // Étape 1 (peser vide m0) -> m0
      // Étape 2 (remplir eau) -> plein eau
      // Étape 3 (peser plein eau m1) -> m1
      // Étape 4 (remplir adhesif) -> plein adhesif
      // Étape 5 (peser plein adhesif m2) -> m2
      // Étape 6 (calcul rho) -> m2
      if (etp <= 1) liquideAffiche = "vide";
      else if (etp === 2) liquideAffiche = estValidee ? "eau" : "vide";
      else if (etp === 3) liquideAffiche = "eau";
      else if (etp === 4) liquideAffiche = estValidee ? "adhesif" : "vide";
      else liquideAffiche = "adhesif";

      if (etp === 0) peseeAffichee = null;
      else if (etp === 1) peseeAffichee = estValidee ? echantillon.m0_1 : null;
      else if (etp === 2) peseeAffichee = echantillon.m0_1;
      else if (etp === 3) peseeAffichee = estValidee ? echantillon.m1_1 : echantillon.m0_1;
      else if (etp === 4) peseeAffichee = null;
      else if (etp === 5) peseeAffichee = estValidee ? echantillon.m2_1 : null;
      else peseeAffichee = echantillon.m2_1;
    }
  } else if (mode === "explore") {
    liquideAffiche = exploreState.contenu;
    if (exploreState.contenu === "vide") peseeAffichee = echantillon.m0_1;
    else if (exploreState.contenu === "eau") peseeAffichee = echantillon.m1_1;
    else if (exploreState.contenu === "adhesif") peseeAffichee = echantillon.m2_1;
  } else if (mode === "defi") {
    liquideAffiche = "adhesif";
    peseeAffichee = defiState.m2_1;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px", fontFamily: "inherit", color: "#1e293b" }}>
      {/* Styles d'animations CSS */}
      <style>{`
        @keyframes coulerFilet {
          0% { height: 0; opacity: 0; }
          30% { height: 75px; opacity: 1; }
          85% { height: 75px; opacity: 1; }
          100% { height: 0; opacity: 0; }
        }
        @keyframes remplirPycnometre {
          0% { height: 0px; y: 80px; opacity: 0.3; }
          20% { height: 8px; y: 72px; opacity: 0.6; }
          100% { height: 48px; y: 32px; opacity: 0.85; }
        }
        @keyframes oscillationBalance {
          0% { transform: translateY(0); }
          25% { transform: translateY(3px); }
          50% { transform: translateY(-1px); }
          100% { transform: translateY(0); }
        }
        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
          100% { opacity: 0; transform: scale(0.5) rotate(90deg); }
        }
        .anim-pesee {
          animation: oscillationBalance 0.6s ease;
        }
        .anim-remplissage {
          animation: remplirPycnometre 1.4s ease-out forwards;
        }
      `}</style>

      {/* CARTE D'INTRODUCTION */}
      <header style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 16, padding: "18px 20px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: "#b45309", display: "flex", alignItems: "center", gap: 8 }}>
              <span>⚖️</span> Masse volumique d'un liquide au pycnomètre
            </h1>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
              BTS Métiers de la chimie — détermination de la masse volumique d'un liquide par pesées au pycnomètre.
            </p>
          </div>

        </div>

        {/* TUILES HORIZONTALES DES MESURES ACQUISES */}
        {(() => {
          const etp = guideState.etape;
          const val = guideState.valides;

          const tuiles = avecTemperature
            ? [
                {
                  symb: "m₀",
                  label: "Pycnomètre vide",
                  unite: "g",
                  acquis: etp > 1 || (etp === 1 && val[1]),
                  valeur: `${echantillon.m0_1.toLocaleString("fr-FR")} g`,
                },
                {
                  symb: "m₁",
                  label: "Plein d'eau",
                  unite: "g",
                  acquis: etp > 3 || (etp === 3 && val[3]),
                  valeur: `${echantillon.m1_1.toLocaleString("fr-FR")} g`,
                },
                {
                  symb: "ρeau",
                  label: `Eau à ${echantillon.T} °C`,
                  unite: "g/mL",
                  acquis: etp >= 4,
                  valeur: `${echantillon.rhoEau.toString().replace(".", ",")} g/mL`,
                },
                {
                  symb: "V",
                  label: "Volume étalonné",
                  unite: "mL",
                  acquis: etp >= 5,
                  valeur: `${echantillon.V_1.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mL`,
                },
                {
                  symb: "m₂",
                  label: "Plein de liquide",
                  unite: "g",
                  acquis: etp > 6 || (etp === 6 && val[6]),
                  valeur: `${echantillon.m2_1.toLocaleString("fr-FR")} g`,
                },
                {
                  symb: "ρ₁",
                  label: "Masse vol. finale",
                  unite: "g/mL",
                  acquis: etp > 7 || (etp === 7 && val[7]),
                  valeur: `${echantillon.rho_1.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} g/mL`,
                  accent: true,
                },
              ]
            : [
                {
                  symb: "m₀",
                  label: "Pycnomètre vide",
                  unite: "g",
                  acquis: etp > 1 || (etp === 1 && val[1]),
                  valeur: `${echantillon.m0_1.toLocaleString("fr-FR")} g`,
                },
                {
                  symb: "m₁",
                  label: "Plein d'eau",
                  unite: "g",
                  acquis: etp > 3 || (etp === 3 && val[3]),
                  valeur: `${echantillon.m1_1.toLocaleString("fr-FR")} g`,
                },
                {
                  symb: "m₂",
                  label: "Plein de liquide",
                  unite: "g",
                  acquis: etp > 5 || (etp === 5 && val[5]),
                  valeur: `${echantillon.m2_1.toLocaleString("fr-FR")} g`,
                },
                {
                  symb: "ρ₁",
                  label: "Masse vol. directe",
                  unite: "g/mL",
                  acquis: etp > 6 || (etp === 6 && val[6]),
                  valeur: `${echantillon.rho_approx_1.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} g/mL`,
                  accent: true,
                },
              ];

          return (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed #fed7aa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  📊 Mesures & Données acquises :
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: 10,
                }}
              >
                {tuiles.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: t.acquis ? (t.accent ? "#fffbeb" : "#ffffff") : "#f8fafc",
                      border: t.acquis
                        ? (t.accent ? "2px solid #b45309" : "2px solid #0f172a")
                        : "2px dashed #94a3b8",
                      borderRadius: 10,
                      padding: "10px 12px",
                      opacity: t.acquis ? 1 : 0.6,
                      boxShadow: t.acquis ? "0 2px 5px rgba(0,0,0,0.08)" : "none",
                      transition: "all .25s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 56,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: t.acquis ? "1px solid #e2e8f0" : "none", paddingBottom: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: t.accent ? "#b45309" : "#0f172a" }}>
                        {t.symb}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: t.acquis ? "#475569" : "#94a3b8" }}>{t.label}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: t.acquis ? (t.accent ? "#b45309" : "#0f172a") : "#94a3b8", textAlign: "right" }}>
                      {t.acquis ? t.valeur : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </header>

      {/* DISPOSITION SELON LE MODE */}
      {mode === "guide" && (
        <VueParcoursGuide
          echantillon={echantillon}
          guideState={guideState}
          setGuideState={setGuideState}
          resetGuide={resetGuide}
          peseeAffichee={peseeAffichee}
          liquideAffiche={liquideAffiche}
          animationEnCours={animationEnCours}
          declencherAnimation={declencherAnimation}
          avecTemperature={avecTemperature}
          setAvecTemperature={setAvecTemperature}
        />
      )}

      {mode === "defi" && (
        <VueDefi
          defiState={defiState}
          setDefiState={setDefiState}
          reponsesDefi={reponsesDefi}
          setReponsesDefi={setReponsesDefi}
          verifDefi={verifDefi}
          setVerifDefi={setVerifDefi}
          showIndiceDefi={showIndiceDefi}
          setShowIndiceDefi={setShowIndiceDefi}
        />
      )}
    </div>
  );
}

// ============================================================
// BANC DE MESURE SVG : PYCNOMÈTRE INOX AVEC NIVEAU QUI MONTE
// ============================================================
function ScenePycnometre({ T, liquide, pesee, animationEnCours, titre = "Banc de pesée" }) {
  const isWater = liquide === "eau";
  const isAdh = liquide === "adhesif";
  const liquidColor = isWater ? "#60a5fa" : isAdh ? "#f59e0b" : "transparent";

  const isRemplissageActif = animationEnCours === "eau" || animationEnCours === "adhesif";

  return (
    <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
        <span>{titre}</span>
        <span>Température de la salle : {T} °C</span>
      </div>

      <svg viewBox="0 0 400 200" style={{ width: "100%", height: "auto", display: "block" }} aria-label="Banc de mesure au pycnomètre">
        <defs>
          <linearGradient id="metalInox" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="25%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          <radialGradient id="concaveLid" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="90%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>

          {/* Dégradé liquide avec effet de surface */}
          <linearGradient id="eauGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="adhesifGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Thermomètre à gauche */}
        <g transform="translate(24, 20)">
          <rect x="14" y="10" width="8" height="105" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          <rect
            x="15"
            y={115 - ((T - 18) / 7) * 85}
            width="6"
            height={((T - 18) / 7) * 85}
            fill="#ef4444"
            rx="3"
          />
          <circle cx="18" cy="120" r="10" fill="#ef4444" />
          <text x="18" y="146" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f172a">{T} °C</text>
          <text x="18" y="160" textAnchor="middle" fontSize="10" fill="#64748b">salle</text>
        </g>

        {/* Ensemble Balance & Pycnomètre */}
        <g transform="translate(145, 30)">
          <g className={animationEnCours === "peser" ? "anim-pesee" : ""}>
            {/* Pycnomètre cylindrique en inox */}
            <g transform="translate(30, 18)">
              {/* Corps métallique */}
              <rect x="0" y="24" width="70" height="56" rx="3" fill="url(#metalInox)" stroke="#475569" strokeWidth="2" />

              {/* Gravure du volume nominal / théorique sur le corps inox */}
              <g opacity="0.85">
                <text x="35" y="44" textAnchor="middle" fontSize="8" fontWeight="800" fill="#334155" letterSpacing="0.5">
                  100 mL
                </text>
                <text x="35" y="52" textAnchor="middle" fontSize="6" fontWeight="600" fill="#64748b">
                  nominal
                </text>
              </g>

              {/* FENÊTRE TRANSPARENTE / VUE EN COUPE DU LIQUIDE QUI MONTE */}
              {(liquide !== "vide" || isRemplissageActif) && (
                <g>
                  <rect
                    x="3"
                    y={isRemplissageActif ? 32 : (liquide === "vide" ? 80 : 32)}
                    width="64"
                    height={isRemplissageActif ? 48 : (liquide === "vide" ? 0 : 48)}
                    fill={isWater || animationEnCours === "eau" ? "url(#eauGradient)" : "url(#adhesifGradient)"}
                    opacity={isWater ? 0.8 : 0.95}
                    rx="2"
                    className={isRemplissageActif ? "anim-remplissage" : ""}
                    style={{ transition: "all 0.4s ease" }}
                  />
                  {/* Ménisque / ligne de surface */}
                  <line
                    x1="3"
                    y1={32}
                    x2="67"
                    y2={32}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity={0.9}
                  />
                  {/* Pastille indiquant clairement le liquide présent */}
                  <rect x="14" y="46" width="42" height="18" rx="4" fill="rgba(15, 23, 42, 0.45)" />
                  <text x="35" y="59" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                    {isWater || animationEnCours === "eau" ? "EAU" : "LIQUIDE"}
                  </text>
                </g>
              )}

              {/* Couvercle inox qui s'incline lors du remplissage */}
              <g
                style={{
                  transform: isRemplissageActif ? "translate(38px, -24px) rotate(22deg)" : "translate(0px, 0px)",
                  transition: "transform 0.45s ease-out"
                }}
              >
                <rect x="-2" y="18" width="74" height="7" rx="2" fill="url(#metalInox)" stroke="#475569" strokeWidth="1.5" />
                <polygon points="1,18 35,21 69,18" fill="url(#concaveLid)" stroke="#64748b" strokeWidth="0.5" />
                <circle cx="35" cy="20" r="2.2" fill="#0f172a" />
              </g>

              {/* Étincelles de nettoyage */}
              {animationEnCours === "nettoyer" && (
                <g style={{ animation: "sparkle 1.2s ease-in-out" }}>
                  <text x="10" y="15" fontSize="18">✨</text>
                  <text x="50" y="20" fontSize="16">✨</text>
                  <text x="30" y="60" fontSize="18">✨</text>
                </g>
              )}
            </g>

            {/* Filet de liquide versé pendant l'animation */}
            {isRemplissageActif && (
              <g transform="translate(65, 0)">
                <path d="M -5 -6 L 15 -6 L 10 24 L 0 24 Z" fill="#94a3b8" stroke="#475569" />
                <line
                  x1="5"
                  y1="24"
                  x2="5"
                  y2="76"
                  stroke={animationEnCours === "eau" ? "#60a5fa" : "#f59e0b"}
                  strokeWidth="3.5"
                  strokeDasharray="4 2"
                  style={{ animation: "coulerFilet 1.3s linear infinite" }}
                />
              </g>
            )}

            {/* Plateau de balance */}
            <rect x="10" y="99" width="110" height="8" rx="2" fill="#94a3b8" />
            <rect x="47" y="107" width="36" height="9" fill="#64748b" />
          </g>

          {/* Corps de balance */}
          <rect x="0" y="116" width="130" height="42" rx="6" fill="#1e293b" />
          <text x="65" y="128" textAnchor="middle" fontSize="8" fill="#94a3b8">BALANCE — 1 mg</text>

          {/* Afficheur numérique */}
          <rect x="20" y="132" width="90" height="19" rx="3" fill="#0f172a" stroke="#334155" />
          <text x="102" y="146" textAnchor="end" fontSize="12" fontFamily="monospace" fontWeight="bold" fill="#22c55e">
            {pesee !== null ? `${pesee.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} g` : "----.--- g"}
          </text>
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// 1. VUE PARCOURS GUIDÉ
// ============================================================
function VueParcoursGuide({
  echantillon,
  guideState,
  setGuideState,
  resetGuide,
  peseeAffichee,
  liquideAffiche,
  animationEnCours,
  declencherAnimation,
  avecTemperature,
  setAvecTemperature,
}) {
  const etp = guideState.etape;
  // Le choix « température ou non » se fait AVANT l'étape 1, sur un écran à part.
  // (Un parcours déjà commencé avant cette règle compte comme choix fait.)
  const choixFait = !!guideState.choixFait || etp > 0 || Object.keys(guideState.valides || {}).length > 0;
  function choisir(avecT) {
    setAvecTemperature(avecT);
    setGuideState(prev => ({ ...prev, etape: 0, valides: {}, reponses: {}, showIndice: false, choixFait: true }));
  }
  const etapes = genererEtapesParcours(avecTemperature);
  const etapeConfig = etapes[etp] || etapes[etapes.length - 1];

  const [repSaisie, setRepSaisie] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [showTableEau, setShowTableEau] = useState(false);

  useEffect(() => {
    setRepSaisie(guideState.reponses[etp] || "");
    setFeedback(guideState.valides[etp] ? { valide: true, message: "Étape validée !" } : null);
  }, [etp, avecTemperature]);

  function executerAction(typeAnim) {
    if (typeAnim) declencherAnimation(typeAnim, 1400);

    let messageAction = "Action effectuée !";
    if (etp === 0) messageAction = "Pycnomètre nettoyé et parfaitement séché ✨";
    else if (etp === 1) messageAction = `Pesée enregistrée : m₀ = ${echantillon.m0_1.toLocaleString("fr-FR")} g`;
    else if (etp === 2) messageAction = avecTemperature ? `Remplissage terminé : pycnomètre plein d'eau distillée à ${echantillon.T} °C` : "Pycnomètre rempli d'eau distillée";
    else if (etp === 3) messageAction = `Pesée enregistrée : m₁ = ${echantillon.m1_1.toLocaleString("fr-FR")} g`;
    else if (avecTemperature && etp === 5) messageAction = "Pycnomètre séché et rempli du liquide à tester";
    else if (avecTemperature && etp === 6) messageAction = `Pesée enregistrée : m₂ = ${echantillon.m2_1.toLocaleString("fr-FR")} g`;
    else if (!avecTemperature && etp === 4) messageAction = "Pycnomètre séché et rempli du liquide à tester";
    else if (!avecTemperature && etp === 5) messageAction = `Pesée enregistrée : m₂ = ${echantillon.m2_1.toLocaleString("fr-FR")} g`;

    setFeedback({ valide: true, message: messageAction });
    setGuideState(prev => ({
      ...prev,
      valides: { ...prev.valides, [etp]: true },
    }));
    // Une action (verser, peser, sécher…) passe d'elle-même à l'étape suivante, une fois l'animation finie :
    // pas besoin de cliquer « Étape suivante ».
    const etapeFaite = etp, derniere = etapes.length - 1;
    setTimeout(() => setGuideState(prev => (prev.etape === etapeFaite && etapeFaite < derniere
      ? { ...prev, etape: etapeFaite + 1, showIndice: false } : prev)), typeAnim ? 1500 : 500);
  }

  function verifierEtape() {
    const res = etapeConfig.valider(repSaisie, echantillon);
    setFeedback(res);
    if (res.valide) {
      setGuideState(prev => ({
        ...prev,
        reponses: { ...prev.reponses, [etp]: repSaisie },
        valides: { ...prev.valides, [etp]: true },
      }));
    }
  }

  function etapePrecedente() {
    if (etp > 0) {
      setGuideState(prev => ({ ...prev, etape: prev.etape - 1, showIndice: false }));
    }
  }

  function etapeSuivante() {
    if (etp < etapes.length - 1) {
      setGuideState(prev => ({ ...prev, etape: prev.etape + 1, showIndice: false }));
    }
  }

  function fairePourMoi() {
    const autoVal = etapeConfig.reponseAttendue(echantillon);
    setRepSaisie(autoVal);
    const res = etapeConfig.valider(autoVal, echantillon);
    setFeedback(res);
    setGuideState(prev => ({
      ...prev,
      reponses: { ...prev.reponses, [etp]: autoVal },
      valides: { ...prev.valides, [etp]: true },
    }));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
      {/* Colonne gauche : Scène animée + Mesures acquises */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <ScenePycnometre
          T={echantillon.T}
          liquide={liquideAffiche}
          pesee={peseeAffichee}
          animationEnCours={animationEnCours}
        />

        {/* Sommaire interactif des étapes avec statuts colorés */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5 }}>
              🧭 Progression du protocole
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
              {Object.keys(guideState.valides).filter(k => guideState.valides[k]).length} / {etapes.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {etapes.map((etape, index) => {
              const estActive = index === etp;
              const estValidee = !!guideState.valides[index];
              const estPasse = index < etp;

              // Couleurs selon état
              let bg = "#f8fafc";
              let border = "1px solid #e2e8f0";
              let textColor = "#64748b";
              let badgeBg = "#e2e8f0";
              let badgeColor = "#475569";
              let icone = "○";

              if (estValidee) {
                bg = "#f0fdf4";
                border = "1.5px solid #86efac";
                textColor = "#15803d";
                badgeBg = "#16a34a";
                badgeColor = "#ffffff";
                icone = "✓";
              } else if (estActive) {
                bg = "#fffbeb";
                border = "2px solid #b45309";
                textColor = "#b45309";
                badgeBg = "#b45309";
                badgeColor = "#ffffff";
                icone = "▶";
              }

              return (
                <div
                  key={index}
                  onClick={() => {
                    // Possibilité de naviguer vers une étape passée ou validée
                    if (estValidee || estPasse || estActive) {
                      setGuideState(prev => ({ ...prev, etape: index, showIndice: false }));
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: bg,
                    border: border,
                    fontSize: 12,
                    fontWeight: estActive ? 800 : estValidee ? 700 : 500,
                    color: textColor,
                    cursor: (estValidee || estPasse) ? "pointer" : "default",
                    transition: "all .15s ease",
                  }}
                  title={estValidee || estPasse ? "Cliquer pour revoir cette étape" : ""}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: badgeBg,
                      color: badgeColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {icone}
                  </span>
                  <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {etape.titre}
                  </span>
                  {estValidee && valeurTrouvee(etape.titre, echantillon, avecTemperature) && (
                    <span style={{ fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {valeurTrouvee(etape.titre, echantillon, avecTemperature)}
                    </span>
                  )}
                  {estActive && !estValidee && (
                    <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 800, padding: "2px 6px", background: "#fef3c7", borderRadius: 4, color: "#92400e" }}>
                      En cours
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Colonne droite : Carte d'étape */}
      <div style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 16, padding: 20 }}>
        {!choixFait && (
          <div>
            <span style={{ fontWeight: 800, fontSize: 13, color: "#b45309" }}>Avant de commencer</span>
            <h2 style={{ margin: "6px 0 14px", fontSize: 18, color: "#0f172a" }}>Mesurer la densité</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { avecT: true, icone: "🌡️", titre: "En tenant compte de la température" },
                { avecT: false, icone: "⚡", titre: "En ne tenant pas compte de la température" },
              ].map((c) => (
                <button
                  key={String(c.avecT)}
                  type="button"
                  onClick={() => choisir(c.avecT)}
                  style={{ textAlign: "left", display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #fcd34d", background: "#fffbeb", cursor: "pointer", color: "#92400e", fontWeight: 800, fontSize: 15 }}
                >
                  <span style={{ fontSize: 22 }}>{c.icone}</span>
                  <span>{c.titre}</span>
                  <span style={{ marginLeft: "auto", color: "#b45309" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {choixFait && (<>
        {/* Progression */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: "#b45309" }}>
              Étape {etp + 1} / {etapes.length}
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#92400e", background: "#fef3c7", borderRadius: 6, padding: "2px 6px" }}>
                {avecTemperature ? "🌡️ avec ρeau(T)" : "⚡ ρeau ≈ 1 g/mL"}
              </span>
            </span>
            <button
              onClick={resetGuide}
              style={{ background: "none", border: "none", color: "#64748b", textDecoration: "underline", fontSize: 11, cursor: "pointer" }}
            >
              Revenir au début
            </button>
          </div>
          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${((etp + 1) / etapes.length) * 100}%`,
                height: "100%",
                background: "#b45309",
                transition: "width .2s ease",
              }}
            />
          </div>
        </div>

        {/* Titre et explication */}
        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>{etapeConfig.titre}</h2>

        <div style={{ margin: "0 0 14px", fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          {typeof etapeConfig.texte === "function" ? etapeConfig.texte(echantillon) : etapeConfig.texte}
        </div>

        {etapeConfig.encadre && (
          <BoutonFormule key={etp}>
            {typeof etapeConfig.encadre === "function" ? etapeConfig.encadre(echantillon) : etapeConfig.encadre}
          </BoutonFormule>
        )}

        {/* Tâche */}
        <div style={{ margin: "16px 0" }}>
          {etapeConfig.type === "action" && !feedback?.valide && (
            <button
              disabled={animationEnCours !== null}
              onClick={() => executerAction(etapeConfig.anim)}
              style={{ background: "#b45309", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              {etapeConfig.boutonAction}
            </button>
          )}

          {etapeConfig.type === "num" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>
                  {etapeConfig.consigneSaisie}
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  {avecTemperature && (
                    <button
                      type="button"
                      onClick={() => setShowTableEau(true)}
                      style={{
                        background: "#eff6ff",
                        border: "1.5px solid #2563eb",
                        color: "#1d4ed8",
                        borderRadius: 8,
                        padding: "4px 9px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                      }}
                    >
                      <span>📊</span>
                      <span>Table ρeau(T)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCalc(true)}
                    style={{
                      background: "#fef3c7",
                      border: "1.5px solid #b45309",
                      color: "#b45309",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}
                  >
                    <span>🧮</span>
                    <span>Calculatrice (fractions)</span>
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  value={repSaisie}
                  onClick={() => setShowCalc(true)}
                  onChange={(e) => setRepSaisie(e.target.value)}
                  placeholder="Ex. 100,12"
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 14, width: 140, cursor: "pointer", background: "#fafafa" }}
                  title="Clique pour ouvrir la calculatrice scientifique"
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{etapeConfig.unite}</span>
              </div>
            </div>
          )}

          {etapeConfig.type === "qcm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {etapeConfig.choix(echantillon).map((c, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: repSaisie === c ? "#fffbeb" : "#fff" }}>
                  <input
                    type="radio"
                    name="qcm_guide"
                    checked={repSaisie === c}
                    onChange={() => setRepSaisie(c)}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Indice & Faire pour moi */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "12px 0", flexWrap: "wrap" }}>
          {etapeConfig.indice && (
            <button
              onClick={() => setGuideState(prev => ({ ...prev, showIndice: !prev.showIndice }))}
              style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600, color: "#475569" }}
            >
              💡 {guideState.showIndice ? "Masquer l'indice" : "Indice"}
            </button>
          )}

          {etapeConfig.type !== "action" && !feedback?.valide && (
            <button
              onClick={fairePourMoi}
              style={{ background: "none", border: "none", color: "#64748b", textDecoration: "underline", fontSize: 12, cursor: "pointer" }}
            >
              Le faire pour moi
            </button>
          )}
        </div>

        {guideState.showIndice && etapeConfig.indice && (
          <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px dashed #cbd5e1", fontSize: 12, color: "#475569", marginBottom: 12 }}>
            {etapeConfig.indice(echantillon)}
          </div>
        )}

        {/* Retour visuel */}
        {feedback && (
          <div
            style={{
              padding: 10,
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 14,
              background: feedback.valide ? "#dcfce7" : "#fee2e2",
              color: feedback.valide ? "#166534" : "#dc2626",
              fontWeight: 600,
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Boutons de navigation et d'action */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 16 }}>
          <div>
            {etp > 0 && (
              <button
                onClick={etapePrecedente}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1.5px solid #cbd5e1",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ← Étape précédente
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {etapeConfig.type !== "action" && !feedback?.valide && (
              <button
                onClick={verifierEtape}
                style={{ background: "#b45309", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              >
                Vérifier
              </button>
            )}

            {feedback?.valide && etp < etapes.length - 1 && (
              <button
                onClick={etapeSuivante}
                style={{ background: "#16a34a", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
              >
                Étape suivante →
              </button>
            )}
          </div>
        </div>
        </>)}

        {/* Popup Table Masse Volumique de l'eau */}
        {showTableEau && (
          <div
            style={{
              position: "fixed",
              top: 100,
              right: 40,
              width: 290,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 16px 36px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)",
              zIndex: 10000,
              overflow: "hidden",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
                color: "#fff",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <span>📊</span>
                <span>Masse volumique de l'eau distillée</span>
              </div>
              <button
                onClick={() => setShowTableEau(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 14 }}>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>
                Température actuelle de la salle : <strong>{echantillon.T} °C</strong>
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "center" }}>
                <thead>
                  <tr style={{ background: "#eff6ff", borderBottom: "2px solid #bfdbfe" }}>
                    <th style={{ padding: "6px 8px" }}>T (°C)</th>
                    <th style={{ padding: "6px 8px" }}>ρeau (g·mL⁻¹)</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE_EAU.map((r) => {
                    const isCurrent = r.temp === echantillon.T;
                    return (
                      <tr
                        key={r.temp}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          background: isCurrent ? "#dbeafe" : "transparent",
                          fontWeight: isCurrent ? 800 : 400,
                          color: isCurrent ? "#1d4ed8" : "#1e293b",
                        }}
                      >
                        <td style={{ padding: "6px 8px" }}>{r.temp}</td>
                        <td style={{ padding: "6px 8px" }}>{r.rho.toString().replace(".", ",")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <button
                onClick={() => setShowTableEau(false)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "7px 10px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Popup de Calculatrice Scientifique déplaçable */}
        {showCalc && (
          <CalculatriceScientifique
            initialNum=""
            initialDen=""
            onClose={() => setShowCalc(false)}
            onInserer={(val) => {
              setRepSaisie(val);
              setShowCalc(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function genererEtapesParcours(avecTemperature) {
  if (avecTemperature) {
    return [
      {
        titre: "1. Nettoyer et sécher",
        texte: () => "Nettoyer soigneusement le pycnomètre et son couvercle perforé, puis sécher parfaitement.",
        type: "action",
        anim: "nettoyer",
        boutonAction: "🧽 Nettoyer et sécher le pycnomètre",
        reponseAttendue: () => "ok",
        valider: () => ({ valide: true, message: "Pycnomètre propre et sec." }),
      },
      {
        titre: "2. Première pesée : pycnomètre vide (m₀)",
        texte: () => "Placer le pycnomètre vide avec son couvercle sur la balance au milligramme près, puis cliquer sur Peser pour relever m₀.",
        type: "action",
        anim: "peser",
        boutonAction: "⚖️ Peser le pycnomètre vide",
        reponseAttendue: () => "ok",
        valider: () => ({ valide: true, message: "Masse m₀ enregistrée sur la balance." }),
      },
      {
        titre: "3. Remplissage d'eau distillée",
        texte: (e) => `Remplir le pycnomètre d'eau distillée à la température de la salle (${e.T} °C). Observer le niveau d'eau monter jusqu'au rebord et l'évacuation du surplus par l'orifice du couvercle.`,
        type: "action",
        anim: "eau",
        boutonAction: "💧 Verser l'eau distillée",
        reponseAttendue: () => "ok",
        valider: () => ({ valide: true, message: "Pycnomètre rempli et ajusté." }),
      },
      {
        titre: "4. Deuxième pesée : plein d'eau (m₁)",
        texte: () => "Peser le pycnomètre rempli d'eau distillée pour étalonner son volume réel.",
        type: "action",
        anim: "peser",
        boutonAction: "⚖️ Peser plein d'eau",
        reponseAttendue: () => "ok",
        valider: () => ({ valide: true, message: "Masse m₁ enregistrée." }),
      },
      {
        titre: "5. Volume exact du pycnomètre (V)",
        texte: (e) => (
          <div>
            <p style={{ margin: "0 0 8px" }}>
              La température de la salle est de <strong>{e.T} °C</strong>. D'après les tables de référence, la masse volumique de l'eau distillée est :
            </p>
            <div style={{ margin: "6px 0", textAlign: "center" }}>
              <MathTex tex={`\\rho_{\\text{eau}}(${e.T}\\,^\\circ\\text{C}) = ${e.rhoEau.toString().replace(".", ",")}\\,\\text{g}\\cdot\\text{mL}^{-1}`} display={true} />
            </div>
            <p style={{ margin: "8px 0 4px" }}>
              Données relevées : <MathTex tex={`m_0 = ${e.m0_1.toLocaleString("fr-FR")}\\,\\text{g}`} /> et <MathTex tex={`m_1 = ${e.m1_1.toLocaleString("fr-FR")}\\,\\text{g}`} />.
            </p>
            <p style={{ margin: "4px 0 4px" }}>
              Calcule le volume intérieur exact <MathTex tex="V" /> du pycnomètre (bouton 📐 Formule) :
            </p>
          </div>
        ),
        encadre: () => (
          <div style={{ fontSize: 15, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            <MathTex tex={String.raw`V = \frac{m_1 - m_0}{\rho_{\text{eau}}(T)}`} size="large" display={true} />
            <span style={{ marginLeft: 8 }}>(conserver 2 décimales pour <MathTex tex="V" /> en mL).</span>
          </div>
        ),
        type: "num",
        consigneSaisie: "Volume exact V :",
        unite: "mL",
        indice: () => "Fais la différence (m₁ − m₀) au numérateur, puis divise par la masse volumique de l'eau à la température ambiante.",
        reponseAttendue: (e) => e.V_1.toFixed(2).replace(".", ","),
        valider: (val, e) => {
          const v = parseFloat(val.replace(",", "."));
          if (Math.abs(v - e.V_1) <= 0.02) {
            return {
              valide: true,
              message: (
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700 }}>✅ Exact ! Détail complet du calcul :</p>
                  <MathTex
                    tex={`V = \\frac{m_1 - m_0}{\\rho_{\\text{eau}}(T)} = \\frac{${e.m1_1.toLocaleString("fr-FR")} - ${e.m0_1.toLocaleString("fr-FR")}}{${e.rhoEau.toString().replace(".", ",")}} = \\frac{${(e.m1_1 - e.m0_1).toLocaleString("fr-FR", { minimumFractionDigits: 3 })}}{${e.rhoEau.toString().replace(".", ",")}} = ${e.V_1.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\\,\\text{mL}`}
                    display={true}
                  />
                </div>
              ),
            };
          }
          return { valide: false, message: "Valeur incorrecte. Pose la fraction (m₁ − m₀) / ρeau." };
        },
      },
      {
        titre: "6. Remplissage avec le liquide à tester",
        texte: () => "Sécher à nouveau le pycnomètre et verser le liquide à tester. Replacer le couvercle perforé pour chasser l'air.",
        type: "action",
        anim: "adhesif",
        boutonAction: "🫗 Verser le liquide à tester",
        reponseAttendue: () => "ok",
        valider: () => ({ valide: true, message: "Pycnomètre rempli du liquide." }),
      },
      {
        titre: "7. Troisième pesée : plein de liquide (m₂)",
        texte: () => "Peser le pycnomètre rempli de liquide pour obtenir la masse totale m₂.",
        type: "action",
        anim: "peser",
        boutonAction: "⚖️ Peser plein de liquide",
        reponseAttendue: () => "ok",
        valider: () => ({ valide: true, message: "Masse m₂ enregistrée." }),
      },
      {
        titre: "8. Masse volumique du liquide (ρ₁)",
        texte: (e) => (
          <div>
            <p style={{ margin: "8px 0 4px" }}>
              Données disponibles : <MathTex tex={`m_0 = ${e.m0_1.toLocaleString("fr-FR")}\\,\\text{g}`} /> et <MathTex tex={`m_2 = ${e.m2_1.toLocaleString("fr-FR")}\\,\\text{g}`} /> et <MathTex tex={`V = ${e.V_1.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\\,\\text{mL}`} />.
            </p>
            <p style={{ margin: "4px 0 6px" }}>
              Calcule la masse volumique <MathTex tex={String.raw`\rho_1`} /> du liquide (bouton 📐 Formule) :
            </p>
          </div>
        ),
        encadre: () => (
          <div style={{ fontSize: 15, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            <div style={{ width: "100%" }}>Rappel — volume étalonné :</div>
            <MathTex tex={String.raw`V = \frac{m_1 - m_0}{\rho_{\text{eau}}(T)}`} size="large" display={true} />
            <div style={{ width: "100%", marginTop: 8 }}>Masse volumique :</div>
            <MathTex tex={String.raw`\rho = \frac{m_2 - m_0}{V} = \frac{m_2 - m_0}{\dfrac{m_1 - m_0}{\rho_{\text{eau}}(T)}}`} size="large" display={true} />
          </div>
        ),
        type: "num",
        consigneSaisie: "Masse volumique ρ₁ :",
        unite: "g/mL",
        indice: () => "(m₂ − m₀) divisé par le volume V trouvé à l'étape 5.",
        reponseAttendue: (e) => e.rho_1.toFixed(4).replace(".", ","),
        valider: (val, e) => {
          const v = parseFloat(val.replace(",", "."));
          if (Math.abs(v - e.rho_1) <= 0.0006) {
            return {
              valide: true,
              message: (
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700 }}>✅ Bravo ! Détail complet du calcul :</p>
                  <MathTex
                    tex={`\\rho_1 = \\frac{m_2 - m_0}{V} = \\frac{${e.m2_1.toLocaleString("fr-FR")} - ${e.m0_1.toLocaleString("fr-FR")}}{${e.V_1.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}} = \\frac{${(e.m2_1 - e.m0_1).toLocaleString("fr-FR", { minimumFractionDigits: 3 })}}{${e.V_1.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}} = ${e.rho_1.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}\\,\\text{g}\\cdot\\text{mL}^{-1}`}
                    display={true}
                  />
                </div>
              ),
            };
          }
          return { valide: false, message: "Vérifie ton calcul." };
        },
      },
      etapeRendu(true, 9),
      {
        titre: "10. Bilan — À retenir",
        texte: (e) => (
          <div>
            <p style={{ margin: "0 0 8px" }}>Parcours guidé terminé avec succès ! Pour ton échantillon, on obtient :</p>
            <div style={{ textAlign: "center", margin: "10px 0" }}>
              <MathTex
                tex={`\\rho = ${e.rho_moy.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} \\pm ${e.s.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}\\,\\text{g}\\cdot\\text{mL}^{-1}`}
                display={true}
              />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b", textAlign: "center" }}>(soit la même valeur numérique en <MathTex tex={String.raw`\text{kg}\cdot\text{L}^{-1}`} />)</p>
            <ComparaisonTemperature e={e} />
          </div>
        ),
        type: "action",
        boutonAction: "🏁 Terminer le parcours",
        reponseAttendue: () => "ok",
        valider: () => ({ valide: true, message: "Félicitations !" }),
      },
    ];
  }

  // SANS PRISE EN COMPTE DE LA TEMPÉRATURE (rho_eau = 1 g/mL)
  return [
    {
      titre: "1. Nettoyer et sécher",
      texte: () => "Nettoyer soigneusement le pycnomètre et son couvercle perforé, puis sécher parfaitement.",
      type: "action",
      anim: "nettoyer",
      boutonAction: "🧽 Nettoyer et sécher le pycnomètre",
      reponseAttendue: () => "ok",
      valider: () => ({ valide: true, message: "Pycnomètre propre et sec." }),
    },
    {
      titre: "2. Première pesée : pycnomètre vide (m₀)",
      texte: () => "Placer le pycnomètre vide avec son couvercle sur la balance au milligramme près, puis cliquer sur Peser pour relever m₀.",
      type: "action",
      anim: "peser",
      boutonAction: "⚖️ Peser le pycnomètre vide",
      reponseAttendue: () => "ok",
      valider: () => ({ valide: true, message: "Masse m₀ enregistrée sur la balance." }),
    },
    {
      titre: "3. Remplissage d'eau distillée",
      texte: () => "Remplir le pycnomètre d'eau distillée. En considérant que la température n'a pas d'impact significatif (ρeau ≈ 1 g/mL), le volume d'eau en mL correspond directement à sa masse en grammes.",
      type: "action",
      anim: "eau",
      boutonAction: "💧 Verser l'eau distillée",
      reponseAttendue: () => "ok",
      valider: () => ({ valide: true, message: "Pycnomètre rempli et ajusté." }),
    },
    {
      titre: "4. Deuxième pesée : plein d'eau (m₁)",
      texte: () => "Peser le pycnomètre rempli d'eau distillée pour obtenir m₁. La masse d'eau contenue est alors (m₁ − m₀).",
      type: "action",
      anim: "peser",
      boutonAction: "⚖️ Peser plein d'eau",
      reponseAttendue: () => "ok",
      valider: () => ({ valide: true, message: "Masse m₁ enregistrée." }),
    },
    {
      titre: "5. Remplissage avec le liquide à tester",
      texte: () => "Sécher à nouveau le pycnomètre et verser le liquide à tester. Replacer le couvercle perforé pour chasser l'air.",
      type: "action",
      anim: "adhesif",
      boutonAction: "🫗 Verser le liquide à tester",
      reponseAttendue: () => "ok",
      valider: () => ({ valide: true, message: "Pycnomètre rempli du liquide." }),
    },
    {
      titre: "6. Troisième pesée : plein de liquide (m₂)",
      texte: () => "Peser le pycnomètre rempli de liquide pour obtenir la masse totale m₂.",
      type: "action",
      anim: "peser",
      boutonAction: "⚖️ Peser plein de liquide",
      reponseAttendue: () => "ok",
      valider: () => ({ valide: true, message: "Masse m₂ enregistrée." }),
    },
    {
      titre: "7. Calcul direct de la masse volumique (ρ₁)",
      texte: (e) => (
        <div>
          <p style={{ margin: "0 0 6px" }}>
            Comme la température n'est pas prise en compte, la masse volumique de l'eau est prise égale à <MathTex tex="1\,\text{g}\cdot\text{mL}^{-1}" />.
          </p>
          <p style={{ margin: "4px 0 6px" }}>
            Données relevées : <MathTex tex={`m_0 = ${e.m0_1.toLocaleString("fr-FR")}\\,\\text{g}`} />, <MathTex tex={`m_1 = ${e.m1_1.toLocaleString("fr-FR")}\\,\\text{g}`} /> et <MathTex tex={`m_2 = ${e.m2_1.toLocaleString("fr-FR")}\\,\\text{g}`} />.
          </p>
          <p style={{ margin: "4px 0 6px" }}>
            Calcule la masse volumique <MathTex tex={String.raw`\rho_1`} /> du liquide directement (bouton 📐 Formule) :
          </p>
        </div>
      ),
      encadre: () => (
        <div style={{ fontSize: 15, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <MathTex tex={String.raw`\rho = \frac{m_2 - m_0}{m_1 - m_0}`} size="large" display={true} />
        </div>
      ),
      type: "num",
      consigneSaisie: "Masse volumique ρ₁ :",
      unite: "g/mL",
      indice: () => "Pose au numérateur (m₂ − m₀) et au dénominateur (m₁ − m₀).",
      reponseAttendue: (e) => e.rho_approx_1.toFixed(4).replace(".", ","),
      valider: (val, e) => {
        const v = parseFloat(val.replace(",", "."));
        if (Math.abs(v - e.rho_approx_1) <= 0.0006) {
          return {
            valide: true,
            message: (
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 700 }}>✅ Bravo ! Détail complet du calcul direct :</p>
                <MathTex
                  tex={`\\rho_1 = \\frac{m_2 - m_0}{m_1 - m_0} = \\frac{${e.m2_1.toLocaleString("fr-FR")} - ${e.m0_1.toLocaleString("fr-FR")}}{${e.m1_1.toLocaleString("fr-FR")} - ${e.m0_1.toLocaleString("fr-FR")}} = \\frac{${(e.m2_1 - e.m0_1).toLocaleString("fr-FR", { minimumFractionDigits: 3 })}}{${(e.m1_1 - e.m0_1).toLocaleString("fr-FR", { minimumFractionDigits: 3 })}} = ${e.rho_approx_1.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}\\,\\text{g}\\cdot\\text{mL}^{-1}`}
                  display={true}
                />
              </div>
            ),
          };
        }
        return { valide: false, message: "Vérifie ton calcul : (m₂ − m₀) / (m₁ − m₀)." };
      },
    },
    etapeRendu(false, 8),
    {
      titre: "9. Bilan — À retenir",
      texte: (e) => (
        <div>
          <p style={{ margin: "0 0 8px" }}>Parcours terminé avec succès ! Pour ton échantillon, on obtient :</p>
          <div style={{ textAlign: "center", margin: "10px 0" }}>
            <MathTex
              tex={`\\rho = ${e.rho_approx_moy.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} \\pm ${e.s_approx.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}\\,\\text{g}\\cdot\\text{mL}^{-1}`}
              display={true}
            />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b", textAlign: "center" }}>(soit la même valeur numérique en <MathTex tex={String.raw`\text{kg}\cdot\text{L}^{-1}`} />)</p>
            <ComparaisonTemperature e={e} />
        </div>
      ),
      type: "action",
      boutonAction: "🏁 Terminer le parcours",
      reponseAttendue: () => "ok",
      valider: () => ({ valide: true, message: "Félicitations !" }),
    },
  ];
}

// ============================================================
// 3. VUE DÉFI
// ============================================================
function VueDefi({ defiState, setDefiState, reponsesDefi, setReponsesDefi, verifDefi, setVerifDefi, showIndiceDefi, setShowIndiceDefi }) {
  function nouveauTirage() {
    const nouv = genererEchantillon(Object.keys(ADH_TYPES)[Math.floor(Math.random() * 4)]);
    setDefiState(nouv);
    setReponsesDefi({ V: "", rho: "" });
    setVerifDefi(null);
    setShowIndiceDefi(false);
  }

  function validerDefi() {
    const parse = (s) => parseFloat(s.replace(",", "."));
    const vV = Math.abs(parse(reponsesDefi.V) - defiState.V_1) <= 0.02;
    const vRho = Math.abs(parse(reponsesDefi.rho) - defiState.rho_1) <= 0.0006;
    setVerifDefi({ V: vV, rho: vRho });
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "#b45309" }}>🎯 Défi métrologie</h2>
          <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>
            Un liquide a été mesuré au pycnomètre. Retrouve le volume exact et la masse volumique.
          </p>
        </div>
        <button onClick={nouveauTirage} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
          🔄 Nouvel énoncé
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 16 }}>
        <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Données expérimentales :</div>
          <div>Température de la salle : <strong>{defiState.T} °C</strong></div>
          <div>Pycnomètre vide m₀ : <strong>{defiState.m0_1.toLocaleString("fr-FR")} g</strong></div>
          <div>Plein d'eau distillée m₁ : <strong>{defiState.m1_1.toLocaleString("fr-FR")} g</strong></div>
          <div>Plein de liquide m₂ : <strong>{defiState.m2_1.toLocaleString("fr-FR")} g</strong></div>
        </div>

        <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Table de référence (eau distillée) :</div>
          <table style={{ width: "100%", fontSize: 11, textAlign: "center", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}><th>T (°C)</th><th>ρeau (g/mL)</th></tr>
            </thead>
            <tbody>
              {TABLE_EAU.map(r => (
                <tr key={r.temp} style={{ background: r.temp === defiState.T ? "#fef3c7" : "transparent" }}>
                  <td>{r.temp}</td>
                  <td>{r.rho.toLocaleString("fr-FR", { minimumFractionDigits: 4 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 10, borderRadius: 8, border: `1px solid ${verifDefi ? (verifDefi.V ? "#22c55e" : "#ef4444") : "#e2e8f0"}` }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Volume V (mL) [centième] :</label>
          <input
            type="text"
            value={reponsesDefi.V}
            onChange={(e) => setReponsesDefi({ ...reponsesDefi, V: e.target.value })}
            style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ padding: 10, borderRadius: 8, border: `1px solid ${verifDefi ? (verifDefi.rho ? "#22c55e" : "#ef4444") : "#e2e8f0"}` }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Masse volumique ρ (g/mL) [4 décimales] :</label>
          <input
            type="text"
            value={reponsesDefi.rho}
            onChange={(e) => setReponsesDefi({ ...reponsesDefi, rho: e.target.value })}
            style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={validerDefi}
          style={{ background: "#b45309", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
        >
          Vérifier mon défi
        </button>

        <button
          onClick={() => setShowIndiceDefi(!showIndiceDefi)}
          style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          💡 {showIndiceDefi ? "Masquer l'indice" : "Indice"}
        </button>

        {verifDefi && (
          <span style={{ fontWeight: 700, color: verifDefi.V && verifDefi.rho ? "#16a34a" : "#dc2626", fontSize: 13 }}>
            {verifDefi.V && verifDefi.rho ? "🎉 Défi réussi avec brio !" : "Certaines réponses sont inexactes, réessaie ou utilise l'indice."}
          </span>
        )}
      </div>

      {showIndiceDefi && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "#f8fafc", border: "1px dashed #cbd5e1", fontSize: 12, color: "#475569" }}>
          💡 <strong>Indice :</strong> Repère la masse volumique de l'eau à {defiState.T} °C dans la table. Calcule d'abord V = (m₁ − m₀) / ρeau. Puis calcule ρ = (m₂ − m₀) / V.
        </div>
      )}
    </div>
  );
}

// ============================================================
// BILAN : la même mesure calculée avec et sans la température, pour comparer
// ============================================================
function ComparaisonTemperature({ e }) {
  const f4 = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const ecart = e.rho_approx_moy - e.rho_moy;
  const ecartPct = (Math.abs(ecart) / e.rho_moy) * 100;
  const lignes = [
    { titre: "🌡️ En tenant compte de la température", detail: `ρeau(${e.T} °C) = ${e.rhoEau.toString().replace(".", ",")} g/mL`, rho: e.rho_moy, s: e.s },
    { titre: "⚡ En ne tenant pas compte de la température", detail: "ρeau ≈ 1 g/mL", rho: e.rho_approx_moy, s: e.s_approx },
  ];
  return (
    <div style={{ marginTop: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 8 }}>⚖️ Comparer les deux calculs</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {lignes.map((l) => (
            <tr key={l.titre} style={{ borderTop: "1px solid #e2e8f0" }}>
              <td style={{ padding: "6px 4px" }}>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{l.titre}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{l.detail}</div>
              </td>
              <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 800, whiteSpace: "nowrap", color: "#0f172a" }}>
                {f4(l.rho)} ± {f4(l.s)} g/mL
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#475569" }}>
        Écart : <strong>{ecart >= 0 ? "+" : "−"}{f4(Math.abs(ecart))} g/mL</strong>, soit <strong>{ecartPct.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %</strong>.
        {" "}Prendre ρeau = 1 g/mL revient à négliger la dilatation de l'eau : l'erreur grandit avec la température de la salle.
      </p>
    </div>
  );
}

// Valeur obtenue à une étape (affichée dans la liste de progression une fois l'étape validée).
function valeurTrouvee(titre, e, avecTemperature) {
  const g = (n, d) => n.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
  if (titre.includes("(m₀)")) return `${e.m0_1.toLocaleString("fr-FR")} g`;
  if (titre.includes("(m₁)")) return `${e.m1_1.toLocaleString("fr-FR")} g`;
  if (titre.includes("(m₂)")) return `${e.m2_1.toLocaleString("fr-FR")} g`;
  if (titre.includes("(V)")) return `${g(e.V_1, 2)} mL`;
  if (titre.includes("(ρ₁)")) return `${g(avecTemperature ? e.rho_1 : e.rho_approx_1, 4)} g/mL`;
  return null;
}

// Étape « Règle de rendu du résultat » : deux mesures, trois écritures possibles du résultat.
function etapeRendu(avecTemperature, numero) {
  const g4 = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const valeurs = (e) => (avecTemperature
    ? { r1: e.rho_1, r2: e.rho_2, moy: e.rho_moy, s: e.s }
    : { r1: e.rho_approx_1, r2: e.rho_approx_2, moy: e.rho_approx_moy, s: e.s_approx });
  const choix = (e) => {
    const v = valeurs(e);
    return [
      `ρ = ${g4(v.moy)} ± ${g4(v.s)} g/mL  (moyenne des 2 mesures ± écart type)`,
      `ρ = ${g4(v.r1)} g/mL  (la 1re mesure seulement)`,
      `ρ = ${g4(v.moy)} g/mL  (la moyenne seule)`,
    ];
  };
  return {
    titre: `${numero}. Écrire le résultat final`,
    texte: (e) => {
      const v = valeurs(e);
      return (
        <div>
          <p style={{ margin: "0 0 8px" }}>
            Au laboratoire, on ne fait jamais une seule mesure. On a refait toute la manipulation une 2ᵉ fois (nouveau remplissage) :
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "0 0 8px" }}>
            {[["1re mesure", v.r1], ["2e mesure", v.r2]].map(([nom, r]) => (
              <span key={nom} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px" }}>
                {nom} : <strong>{g4(r)} g/mL</strong>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <p style={{ margin: 0 }}>Comment écrire le résultat final ?</p>
            <BoutonFormulesStat />
          </div>
        </div>
      );
    },
    type: "qcm",
    choix,
    indice: () => "Un résultat de mesure donne une valeur ET dit à quel point les mesures sont proches l'une de l'autre.",
    reponseAttendue: (e) => choix(e)[0],
    valider: (val, e) => {
      const v = valeurs(e);
      if (val === choix(e)[0]) {
        return {
          valide: true,
          message: (
            <div>
              <p style={{ margin: "0 0 4px" }}>✅ Oui : on donne la moyenne, et l'écart type dit à quel point les deux mesures sont proches.</p>
              <MathTex tex={String.raw`\bar{\rho} = \frac{\rho_1 + \rho_2}{2} = ${g4(v.moy)} \qquad s = \frac{|\rho_1 - \rho_2|}{\sqrt{2}} = ${g4(v.s)}`} display={true} />
            </div>
          ),
        };
      }
      return { valide: false, message: "Il manque quelque chose : avec deux mesures, on donne la moyenne et leur dispersion." };
    },
  };
}

// Bouton + fenêtre « Formules » : moyenne et écart type (forme générale puis pour 2 mesures).
function BoutonFormulesStat() {
  const [ouvert, setOuvert] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        style={{ background: "#eff6ff", border: "1.5px solid #2563eb", color: "#1d4ed8", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
      >
        📐 Formules (moyenne, écart type)
      </button>
      {ouvert && (
        <div
          role="dialog"
          aria-label="Formules : moyenne et écart type"
          style={{ position: "fixed", top: 90, right: 30, width: "min(340px, calc(100vw - 24px))", maxHeight: "calc(100vh - 110px)", overflow: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 16px 36px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)", zIndex: 10000 }}
        >
          <div style={{ background: "#2563eb", color: "#fff", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 13 }}>📐 Moyenne et écart type</strong>
            <button type="button" aria-label="Fermer" onClick={() => setOuvert(false)}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontWeight: 700 }}>✕</button>
          </div>
          <div style={{ padding: 14, fontSize: 14, color: "#1e293b" }}>
            <div><strong>Moyenne</strong> de n mesures, puis avec 2 mesures :</div>
            <MathTex tex={String.raw`\bar{\rho} = \frac{1}{n}\sum_{i=1}^{n} \rho_i`} display={true} />
            <MathTex tex={String.raw`\bar{\rho} = \frac{\rho_1 + \rho_2}{2}`} display={true} />
            <div style={{ marginTop: 8 }}><strong>Écart type</strong> expérimental (convention n − 1), puis avec 2 mesures :</div>
            <MathTex tex={String.raw`s = \sqrt{\frac{\sum_{i=1}^{n} (\rho_i - \bar{\rho})^2}{n - 1}}`} display={true} />
            <MathTex tex={String.raw`s = \frac{|\rho_1 - \rho_2|}{\sqrt{2}}`} display={true} />
            <div style={{ marginTop: 6 }}>Le résultat s'écrit : <MathTex tex={String.raw`\rho = \bar{\rho} \pm s`} /></div>
            <button type="button" onClick={() => setOuvert(false)}
              style={{ marginTop: 12, width: "100%", background: "#2563eb", color: "#fff", border: "none", padding: "7px 10px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}

// Bouton « 📐 Formule » : la formule de l'étape s'ouvre dans une fenêtre, au lieu d'être affichée en permanence.
function BoutonFormule({ titre = "Formule", children }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        style={{ background: "#eff6ff", border: "1.5px solid #2563eb", color: "#1d4ed8", borderRadius: 8, padding: "5px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
      >
        📐 {titre}
      </button>
      {ouvert && (
        <div
          role="dialog"
          aria-label={titre}
          style={{ position: "fixed", top: 90, right: 30, width: "min(420px, calc(100vw - 24px))", maxHeight: "calc(100vh - 110px)", overflow: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 16px 36px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)", zIndex: 10000 }}
        >
          <div style={{ background: "#2563eb", color: "#fff", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 13 }}>📐 {titre}</strong>
            <button type="button" aria-label="Fermer" onClick={() => setOuvert(false)}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontWeight: 700 }}>✕</button>
          </div>
          <div style={{ padding: 14, color: "#1e293b" }}>
            <div style={{ fontSize: 19, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "6px 0" }}>{children}</div>
            <button type="button" onClick={() => setOuvert(false)}
              style={{ marginTop: 12, width: "100%", background: "#2563eb", color: "#fff", border: "none", padding: "7px 10px", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
