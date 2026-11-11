import { useState, useEffect, useRef } from "react";
import { CalculatriceScientifique } from "../src/outils/CalculatriceScientifique";
import { MathTex } from "../src/outils/MathTex";

// ============================================================
// EXTRAIT SEC (teneur en matière sèche) D'UN PRODUIT PÂTEUX OU EN POUDRE
// Méthode à l'étuve, jusqu'à masse constante.
// Même architecture que MasseVolumiqueHubbard : parcours guidé + défi.
// ============================================================

// « Masse constante » : deux pesées successives qui ne diffèrent pas de plus de 1 mg.
// C'est le critère retenu dans cette simulation (choix pédagogique, dit à l'écran).
const TOLERANCE_CONSTANTE = 0.001; // g
const TEMPERATURE_ETUVE = 105; // °C
const PESEES_MIN = [60, 90, 120]; // durées cumulées d'étuvage au moment de chaque pesée (min)

const PRODUITS = {
  enduit: { nom: "Enduit de rebouchage en pâte", es: [0.65, 0.80], couleur: "#e7e5e4", volatil: "l'eau", forme: "pateux" },
  creme: { nom: "Crème cosmétique", es: [0.15, 0.30], couleur: "#f9a8d4", volatil: "l'eau", forme: "pateux" },
  pigment: { nom: "Pâte pigmentaire", es: [0.50, 0.70], couleur: "#60a5fa", volatil: "l'eau", forme: "pateux" },
  poudre: { nom: "Poudre humide (gâteau de filtration)", es: [0.70, 0.90], couleur: "#a8a29e", volatil: "l'eau", forme: "poudre" },
};
const TYPE_DEFAUT = "enduit";
const produitDe = (e) => PRODUITS[e?.typeKey] || PRODUITS[TYPE_DEFAUT];

const r4 = (n) => Math.round(n * 10000) / 10000;
const f4 = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const f1 = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const lire = (s) => parseFloat(String(s).replace(/\s/g, "").replace(",", "."));
const hm = (min) => (min % 60 === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}`);

// Masse (capsule + produit) après t minutes d'étuve : les volatils partent en exponentielle.
function masseA(e, t) {
  const prise = e.m1 - e.m0;
  const sec = prise * e.esVrai;
  return e.m0 + sec + (prise - sec) * Math.exp(-t / e.tau);
}

function genererEchantillon(typeKey = TYPE_DEFAUT) {
  if (!PRODUITS[typeKey]) typeKey = TYPE_DEFAUT;
  const p = PRODUITS[typeKey];
  // On retire jusqu'à ce que la 2e pesée diffère de plus de 1 mg et la 3e de moins de 1 mg :
  // l'élève voit ainsi la masse « se stabiliser » à la 3e pesée.
  let dernier = null;
  for (let essai = 0; essai < 1000; essai++) {
    const m0 = r4(1.8 + Math.random() * 0.6);
    const m1 = r4(m0 + 1.5 + Math.random() * 1.0);
    const esVrai = p.es[0] + Math.random() * (p.es[1] - p.es[0]);
    // Constante de temps du séchage (min) : plus longue quand il reste peu de volatils à chasser.
    const tau = 8 + Math.random() * 14;
    const e = { typeKey, m0, m1, esVrai, tau };
    const pesees = PESEES_MIN.map((t) => r4(masseA(e, t)));
    const d1 = Math.abs(pesees[0] - pesees[1]);
    const d2 = Math.abs(pesees[1] - pesees[2]);
    const prise0 = m1 - m0;
    const es0 = ((pesees[2] - m0) / prise0) * 100;
    dernier = { typeKey, m0, m1, pesees, m2: pesees[2], prise: r4(prise0), extrait: r4(pesees[2] - m0), es: es0, mv: 100 - es0, tau, esVrai };
    if (d1 > TOLERANCE_CONSTANTE + 0.0002 && d2 <= TOLERANCE_CONSTANTE) {
      const m2 = pesees[2];
      const prise = m1 - m0;
      const es = ((m2 - m0) / prise) * 100;
      return { typeKey, m0, m1, pesees, m2, prise: r4(prise), extrait: r4(m2 - m0), es, mv: 100 - es, tau, esVrai };
    }
  }
  return dernier; // (n'arrive pas en pratique : le critère est presque toujours atteint)
}

// ------------------------------------------------------------
// PARCOURS GUIDÉ : deux méthodes, choisies avant l'étape 1
//   « conv »  : séchage à une température et une durée fixées (méthode conventionnelle)
//   « suivi » : séchage à une température fixée, avec suivi de la masse jusqu'à masse constante
// ------------------------------------------------------------
const TEMPERATURES = [105, 110, 120];
const DUREES = [1, 2, 3]; // h
const FACTEUR_T = { 105: 1, 110: 0.85, 120: 0.65 }; // plus chaud = séchage plus rapide
const PAS_COURBE = 10; // min entre deux pesées du suivi
const DUREE_COURBE = 180; // min de suivi

function masseEssai(e, t) {
  const prise = e.m1 - e.m0;
  return e.m0 + prise * (e.esVrai + (1 - e.esVrai) * Math.exp(-t / e.tau));
}

function genererEssai(typeKey, choix) {
  if (!PRODUITS[typeKey]) typeKey = TYPE_DEFAUT;
  const p = PRODUITS[typeKey];
  const m0 = r4(1.8 + Math.random() * 0.6);
  const m1 = r4(m0 + 1.5 + Math.random() * 1.0);
  const esVrai = p.es[0] + Math.random() * (p.es[1] - p.es[0]);
  const tau = (10 + Math.random() * 8) * FACTEUR_T[choix.T]; // min
  const e = { typeKey, choix, m0, m1, esVrai, tau, prise: r4(m1 - m0) };
  let m2;
  if (choix.methode === "conv") {
    m2 = r4(masseEssai(e, choix.h * 60));
  } else {
    // Pesées toutes les 10 min (bruit de balance ±0,1 mg), et première pesée « à masse constante » :
    // à partir d'elle, deux pesées successives ne diffèrent plus de plus de 1 mg.
    const courbe = [];
    for (let t = 0; t <= DUREE_COURBE; t += PAS_COURBE) courbe.push({ t, m: r4(masseEssai(e, t) + (t ? (Math.random() - 0.5) * 0.0002 : 0)) });
    let premier = courbe.length - 1;
    for (let i = courbe.length - 2; i >= 0; i--) {
      if (Math.abs(courbe[i].m - courbe[i + 1].m) <= TOLERANCE_CONSTANTE) premier = i;
      else break;
    }
    // Une fois la masse constante atteinte, elle ne bouge plus qu'au bruit de la balance près (±0,1 mg) :
    // tout point du palier donne la même réponse.
    for (let i = premier + 1; i < courbe.length; i++) courbe[i] = { t: courbe[i].t, m: r4(courbe[premier].m + (Math.random() - 0.5) * 0.0002) };
    e.courbe = courbe;
    e.palier = premier;
    m2 = courbe[premier].m;
  }
  const es = ((m2 - m0) / (m1 - m0)) * 100;
  return { ...e, m2, extrait: r4(m2 - m0), es, mv: 100 - es };
}
const libelleMethode = (c) => (c.methode === "conv" ? `${c.T} °C · ${c.h} h` : `${c.T} °C · suivi de masse`);

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
function lireLocal(cle, defaut) {
  try {
    const v = localStorage.getItem(cle);
    return v === null ? defaut : JSON.parse(v);
  } catch (e) {
    return defaut;
  }
}
function ecrireLocal(cle, v) {
  try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* navigation privée */ }
}

export default function ExtraitSec() {
  const mode = "guide"; // Dans le modèle, la page s'ouvre toujours en parcours guidé (le mode « défi » n'est plus proposé).
  const [echantillon, setEchantillon] = useState(() => { const e = lireLocal("es_echantillon", null); return e && produitDe(e) ? e : genererEchantillon(TYPE_DEFAUT); });
  const [guideState, setGuideState] = useState(() => {
    const g = lireLocal("es_guide", null);
    // Un parcours enregistré avant l'écran de choix repart sur cet écran.
    return g && g.choix ? g : { etape: 0, reponses: {}, valides: {}, showIndice: false, choix: null };
  });
  const [animationEnCours, setAnimationEnCours] = useState(null); // 'secher' | 'peser' | 'verser' | 'etuve'

  const [defiState, setDefiState] = useState(() => { const e = lireLocal("es_defi", null); return e && produitDe(e) ? e : genererEchantillon(tirerType()); });
  const [reponsesDefi, setReponsesDefi] = useState(() => lireLocal("es_defi_reponses", { m2: "", es: "", mv: "" }));
  const [verifDefi, setVerifDefi] = useState(null);
  const [showIndiceDefi, setShowIndiceDefi] = useState(false);

  const [typeDefi, setTypeDefi] = useState(() => lireLocal("es_type_defi", "constante")); // "constante" | "adhesif"
  useEffect(() => { ecrireLocal("es_mode", mode); }, [mode]);
  useEffect(() => { ecrireLocal("es_type_defi", typeDefi); }, [typeDefi]);
  useEffect(() => { ecrireLocal("es_echantillon", echantillon); }, [echantillon]);
  useEffect(() => { ecrireLocal("es_guide", guideState); }, [guideState]);
  useEffect(() => { ecrireLocal("es_defi", defiState); }, [defiState]);
  useEffect(() => { ecrireLocal("es_defi_reponses", reponsesDefi); }, [reponsesDefi]);

  function resetGuide(typeKey = echantillon.typeKey) {
    setGuideState({ etape: 0, reponses: {}, valides: {}, showIndice: false, choix: null });
    setEchantillon(genererEchantillon(typeKey));
    setAnimationEnCours(null);
  }

  function choisirMethode(choix) {
    setEchantillon(genererEssai(echantillon.typeKey, choix));
    setGuideState({ etape: 0, reponses: {}, valides: {}, showIndice: false, choix });
    setAnimationEnCours(null);
  }

  function declencherAnimation(type, duree = 1400) {
    setAnimationEnCours(type);
    setTimeout(() => setAnimationEnCours(null), duree);
  }

  const etapes = genererEtapesParcours(guideState.choix);
  const visuel = etatVisuel(guideState, echantillon);

  const etp = guideState.etape;
  const val = guideState.valides;
  const fait = (i) => etp > i || (etp === i && val[i]);
  const tuiles = [
    { symb: "m₀", label: "Capsule vide", acquis: !!guideState.choix && fait(1), valeur: `${f4(echantillon.m0)} g` },
    { symb: "m₁", label: "Capsule + produit", acquis: !!guideState.choix && fait(2), valeur: `${f4(echantillon.m1)} g` },
    { symb: "mₚ", label: "Prise d'essai", acquis: !!guideState.choix && fait(3), valeur: `${f4(echantillon.prise)} g` },
    { symb: "m₂", label: guideState.choix?.methode === "suivi" ? "Masse finale (constante)" : "Après étuvage", acquis: !!guideState.choix && fait(5), valeur: `${f4(echantillon.m2)} g` },
    { symb: "ES", label: "Extrait sec", acquis: !!guideState.choix && fait(6), valeur: `${f1(echantillon.es)} %`, accent: true },
    { symb: "MV", label: "Matières volatiles", acquis: !!guideState.choix && fait(7), valeur: `${f1(echantillon.mv)} %` },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px", fontFamily: "inherit", color: "#1e293b" }}>
      <style>{`
        @keyframes es-oscillation { 0% { transform: translateY(0); } 25% { transform: translateY(3px); } 50% { transform: translateY(-1px); } 100% { transform: translateY(0); } }
        @keyframes es-filet { 0% { opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes es-vapeur { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: .9; } 100% { opacity: 0; transform: translateY(-16px); } }
        @keyframes es-spatule { 0% { transform: translate(14px, -18px); } 55% { transform: translate(0, 0); } 75% { transform: translate(-2px, 2px); } 100% { transform: translate(14px, -18px); } }
        @keyframes es-chaleur { 0%, 100% { opacity: .25; } 50% { opacity: .55; } }
        .es-pesee { animation: es-oscillation .6s ease; }
      `}</style>

      {/* CARTE D'INTRODUCTION */}
      <header style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 16, padding: "18px 20px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: "#b45309", display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔥</span> Extrait sec d'un produit pâteux ou en poudre
            </h1>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
              BTS Métiers de la chimie — teneur en matière sèche et en matières volatiles, séchage à l'étuve (durée fixée ou suivi jusqu'à masse constante).
            </p>
          </div>

        </div>

        {mode === "guide" && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed #fed7aa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: 0.5 }}>
                📊 Mesures & données acquises :
              </span>
              <label style={{ fontSize: 12, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                Produit :
                <select
                  value={echantillon.typeKey}
                  onChange={(ev) => resetGuide(ev.target.value)}
                  style={{ fontSize: 12, padding: "3px 6px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff" }}
                >
                  {Object.entries(PRODUITS).map(([k, p]) => <option key={k} value={k}>{p.nom}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
              {tuiles.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: t.acquis ? (t.accent ? "#fffbeb" : "#ffffff") : "#f8fafc",
                    border: t.acquis ? (t.accent ? "2px solid #b45309" : "2px solid #0f172a") : "2px dashed #94a3b8",
                    borderRadius: 10, padding: "10px 12px", opacity: t.acquis ? 1 : 0.6,
                    boxShadow: t.acquis ? "0 2px 5px rgba(0,0,0,0.08)" : "none", transition: "all .25s ease",
                    display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 56,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, borderBottom: t.acquis ? "1px solid #e2e8f0" : "none", paddingBottom: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: t.accent ? "#b45309" : "#0f172a" }}>{t.symb}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: t.acquis ? "#475569" : "#94a3b8", textAlign: "right" }}>{t.label}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: t.acquis ? (t.accent ? "#b45309" : "#0f172a") : "#94a3b8", textAlign: "right" }}>
                    {t.acquis ? t.valeur : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {mode === "guide" && (
        <VueParcoursGuide
          etapes={etapes}
          echantillon={echantillon}
          guideState={guideState}
          setGuideState={setGuideState}
          resetGuide={() => resetGuide()}
          choisirMethode={choisirMethode}
          visuel={visuel}
          animationEnCours={animationEnCours}
          declencherAnimation={declencherAnimation}
        />
      )}

      {mode === "defi" && <ChoixTypeDefi type={typeDefi} setType={setTypeDefi} />}
      {mode === "defi" && typeDefi === "adhesif" && <VueDefiAdhesif />}
      {mode === "defi" && typeDefi !== "adhesif" && (
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

function tirerType() {
  const cles = Object.keys(PRODUITS);
  return cles[Math.floor(Math.random() * cles.length)];
}

// ============================================================
// ÉTAT VISUEL DU BANC SELON L'ÉTAPE DU PARCOURS
// lieu : où est la capsule ; frac : part de volatils restante (null = capsule vide)
// ============================================================
function etatVisuel(guideState, e) {
  const choix = guideState.choix;
  if (!choix || e.esVrai === undefined || !e.choix) return { lieu: "balance", frac: null, affichage: null, temps: 0, T: choix?.T ?? 105 };
  const etp = guideState.etape;
  const ok = !!guideState.valides[etp];
  const T = choix.T;
  const tFin = choix.methode === "conv" ? choix.h * 60 : DUREE_COURBE;
  const frac = (t) => {
    const prise = e.m1 - e.m0;
    const sec = prise * e.esVrai;
    return (masseEssai(e, t) - e.m0 - sec) / (prise - sec);
  };
  // Étapes : 0 sécher capsule · 1 peser m0 · 2 prise d'essai m1 · 3 calcul mp · 4 étuvage
  //          5 pesée finale (durée fixée) ou lecture sur la courbe (suivi) · 6 ES · 7 MV · 8 bilan
  if (etp === 0) return { T, lieu: ok ? "balance" : "etuve", frac: null, affichage: null, temps: 0, chauffe: !ok };
  if (etp === 1) return { T, lieu: "balance", frac: null, affichage: ok ? e.m0 : null, temps: 0 };
  if (etp === 2) return { T, lieu: "balance", frac: ok ? 1 : null, affichage: ok ? e.m1 : e.m0, temps: 0 };
  if (etp === 3) return { T, lieu: "balance", frac: 1, affichage: e.m1, temps: 0 };
  if (etp === 4) return ok ? { T, lieu: "etuve", frac: frac(tFin), affichage: null, temps: tFin, chauffe: true } : { T, lieu: "balance", frac: 1, affichage: e.m1, temps: 0 };
  if (etp === 5 && choix.methode === "conv" && !ok) return { T, lieu: "etuve", frac: frac(tFin), affichage: null, temps: tFin, chauffe: true };
  // Suivi : la masse finale se lit sur la courbe, la balance ne la donne pas avant.
  if (etp === 5 && choix.methode === "suivi" && !ok) return { T, lieu: "balance", frac: frac(tFin), affichage: null, temps: tFin };
  return { T, lieu: "balance", frac: frac(tFin), affichage: e.m2, temps: tFin };
}

// ============================================================
// BANC : ÉTUVE (gauche) + BALANCE AU 0,1 mg (droite)
// ============================================================
function SceneEtuve({ visuel, typeKey, animationEnCours }) {
  const T = visuel.T ?? TEMPERATURE_ETUVE;
  const produit = PRODUITS[typeKey] || PRODUITS[TYPE_DEFAUT];
  const couleur = produit.couleur;
  const poudre = produit.forme === "poudre";
  const { lieu, frac, affichage, temps, chauffe } = visuel;
  const dansEtuve = lieu === "etuve";
  const capsule = (cx, cy) => {
    const h = frac === null ? 0 : 1.5 + 5 * frac;
    return (
      <g>
        {h > 0 && <rect x={cx - 16} y={cy - 8 - h + 1} width="32" height={h} rx={poudre ? 0.5 : 2.5} fill={couleur} stroke="#94a3b8" strokeWidth="0.5" style={{ transition: "all .9s" }} />}
        {h > 0 && poudre && [-12, -6, 0, 6, 12].map((dx, i) => <circle key={dx} cx={cx + dx} cy={cy - 9 - h + 1 + (i % 2)} r="1.3" fill={couleur} stroke="#78716c" strokeWidth="0.4" />)}
        <path d={`M${cx - 24} ${cy} L${cx - 19} ${cy - 9} L${cx + 19} ${cy - 9} L${cx + 24} ${cy} Z`} fill="#cbd5e1" stroke="#475569" fillOpacity="0.85" />
      </g>
    );
  };
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
        <span>Banc de séchage et de pesée</span>
        <span>Étuve : {T} °C</span>
      </div>
      <svg viewBox="0 0 400 190" style={{ width: "100%", height: "auto" }} role="img" aria-label="Étuve et balance">
        {/* étuve */}
        <rect x="8" y="12" width="220" height="160" rx="10" fill="#e2e8f0" stroke="#475569" />
        <rect x="20" y="24" width="150" height="136" rx="5" fill="#f8fafc" stroke="#64748b" />
        {(chauffe || animationEnCours === "etuve" || animationEnCours === "secher") && (
          <rect x="20" y="24" width="150" height="136" rx="5" fill="#fdba74" style={{ animation: "es-chaleur 2.2s ease-in-out infinite" }} />
        )}
        {[70, 118].map((y) => <line key={y} x1="24" x2="166" y1={y} y2={y} stroke="#94a3b8" strokeWidth="2" />)}
        {dansEtuve && capsule(95, 118)}
        {dansEtuve && frac !== null && frac > 0.01 && [82, 95, 108].map((x, i) => (
          <path key={x} d={`M${x} 100 q 3 -6 0 -12 q -3 -6 0 -12`} stroke="#94a3b8" fill="none" strokeWidth="1.5"
            style={{ animation: `es-vapeur 1.6s ease-out ${i * 0.4}s infinite` }} />
        ))}
        <rect x="178" y="30" width="42" height="22" rx="3" fill="#0f172a" />
        <text x="199" y="46" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="#fca5a5">{T}°C</text>
        <rect x="178" y="58" width="42" height="22" rx="3" fill="#0f172a" />
        <text x="199" y="74" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#86efac">{hm(temps || 0)}</text>
        {chauffe && <circle cx="199" cy="100" r="4" fill="#ef4444" style={{ animation: "es-chaleur 1s ease-in-out infinite" }} />}
        <text x="199" y="130" textAnchor="middle" fontSize="10" fill="#334155">Étuve</text>

        {/* balance */}
        <g className={animationEnCours === "peser" ? "es-pesee" : undefined}>
          <rect x="262" y="128" width="116" height="6" rx="2" fill="#9ca3af" />
          {!dansEtuve && lieu === "balance" && capsule(320, 128)}
        </g>
        <rect x="246" y="134" width="148" height="38" rx="6" fill="#cbd5e1" stroke="#64748b" />
        <rect x="262" y="142" width="116" height="22" rx="3" fill="#0f172a" />
        <text x="320" y="158" textAnchor="middle" fontSize="13" fontFamily="monospace" fill="#86efac">
          {affichage === null || affichage === undefined ? "0,0000 g" : `${f4(affichage)} g`}
        </text>

        {/* spatule qui dépose le produit dans la capsule */}
        {animationEnCours === "verser" && (
          <g style={{ animation: "es-filet 1.4s ease-out both" }}>
            <g style={{ animation: "es-spatule 1.4s ease-in-out both" }}>
              <line x1="372" y1="40" x2="334" y2="100" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
              <rect x="368" y="28" width="10" height="20" rx="3" transform="rotate(32 373 38)" fill="#475569" />
              <ellipse cx="331" cy="104" rx="9" ry="4" transform="rotate(-58 331 104)" fill="#94a3b8" />
              <ellipse cx="329" cy="106" rx="6" ry="3" fill={couleur} stroke="#78716c" strokeWidth="0.4" />
            </g>
            {poudre
              ? [0, 1, 2, 3].map((i) => <circle key={i} cx={322 + i * 3} cy={112 + (i % 2) * 3} r="1.4" fill={couleur} stroke="#78716c" strokeWidth="0.4" />)
              : <ellipse cx="322" cy="114" rx="6" ry="3" fill={couleur} stroke="#78716c" strokeWidth="0.4" />}
          </g>
        )}
      </svg>
      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>
        Balance au 0,1 mg. Avant chaque pesée, la capsule refroidit au dessiccateur : on ne pèse jamais un objet chaud.
      </p>
    </div>
  );
}

// ============================================================
// 1. VUE PARCOURS GUIDÉ
// ============================================================
function VueParcoursGuide({ etapes, echantillon, guideState, setGuideState, resetGuide, choisirMethode, visuel, animationEnCours, declencherAnimation }) {
  const etp = guideState.etape;
  const etapeConfig = etapes[etp] || etapes[etapes.length - 1];

  const [repSaisie, setRepSaisie] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    setRepSaisie(guideState.reponses[etp] || "");
    setFeedback(guideState.valides[etp] ? { valide: true, message: etapeConfig.messageAction ? etapeConfig.messageAction(echantillon) : "Étape validée !" } : null);
  }, [etp]); // eslint-disable-line react-hooks/exhaustive-deps

  function executerAction() {
    if (etapeConfig.anim) declencherAnimation(etapeConfig.anim, 1400);
    setFeedback({ valide: true, message: etapeConfig.messageAction ? etapeConfig.messageAction(echantillon) : "Action effectuée !" });
    setGuideState((prev) => ({ ...prev, valides: { ...prev.valides, [etp]: true } }));
  }

  function verifierEtape() {
    const res = etapeConfig.valider(repSaisie, echantillon);
    setFeedback(res);
    if (res.valide) {
      setGuideState((prev) => ({ ...prev, reponses: { ...prev.reponses, [etp]: repSaisie }, valides: { ...prev.valides, [etp]: true } }));
    }
  }

  function fairePourMoi() {
    const autoVal = etapeConfig.reponseAttendue(echantillon);
    setRepSaisie(autoVal);
    setFeedback(etapeConfig.valider(autoVal, echantillon));
    setGuideState((prev) => ({ ...prev, reponses: { ...prev.reponses, [etp]: autoVal }, valides: { ...prev.valides, [etp]: true } }));
  }

  const aller = (i) => setGuideState((prev) => ({ ...prev, etape: i, showIndice: false }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
      {/* Colonne gauche : banc animé + progression */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SceneEtuve visuel={visuel} typeKey={echantillon.typeKey} animationEnCours={animationEnCours} />

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5 }}>🧭 Progression du protocole</h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
              {Object.keys(guideState.valides).filter((k) => guideState.valides[k]).length} / {etapes.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {etapes.map((etape, index) => {
              const estActive = index === etp;
              const estValidee = !!guideState.valides[index];
              const estPasse = index < etp;
              let style = { bg: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", badgeBg: "#e2e8f0", badgeColor: "#475569", icone: "○" };
              if (estValidee) style = { bg: "#f0fdf4", border: "1.5px solid #86efac", color: "#15803d", badgeBg: "#16a34a", badgeColor: "#fff", icone: "✓" };
              else if (estActive) style = { bg: "#fffbeb", border: "2px solid #b45309", color: "#b45309", badgeBg: "#b45309", badgeColor: "#fff", icone: "▶" };
              return (
                <div
                  key={index}
                  onClick={() => { if (estValidee || estPasse || estActive) aller(index); }}
                  title={estValidee || estPasse ? "Cliquer pour revoir cette étape" : ""}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: style.bg, border: style.border,
                    fontSize: 12, fontWeight: estActive ? 800 : estValidee ? 700 : 500, color: style.color, cursor: estValidee || estPasse ? "pointer" : "default",
                  }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: style.badgeBg, color: style.badgeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                    {style.icone}
                  </span>
                  <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{etape.titre}</span>
                  {estActive && <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 800, padding: "2px 6px", background: "#fef3c7", borderRadius: 4, color: "#92400e" }}>En cours</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Colonne droite : carte d'étape */}
      <div style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 16, padding: 20 }}>
        {!guideState.choix && <EcranChoixMethode onChoisir={choisirMethode} />}
        {guideState.choix && (<>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: "#b45309" }}>
              Étape {etp + 1} / {etapes.length}
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: "#92400e", background: "#fef3c7", borderRadius: 6, padding: "2px 6px" }}>
                {guideState.choix.methode === "conv" ? "🕒" : "📈"} {libelleMethode(guideState.choix)}
              </span>
            </span>
            <button onClick={resetGuide} style={{ background: "none", border: "none", color: "#64748b", textDecoration: "underline", fontSize: 11, cursor: "pointer" }}>
              Revenir au début (nouvel échantillon)
            </button>
          </div>
          <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${((etp + 1) / etapes.length) * 100}%`, height: "100%", background: "#b45309", transition: "width .2s ease" }} />
          </div>
        </div>

        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "#0f172a" }}>{etapeConfig.titre}</h2>
        <div style={{ margin: "0 0 14px", fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
          {typeof etapeConfig.texte === "function" ? etapeConfig.texte(echantillon) : etapeConfig.texte}
        </div>

        {etapeConfig.encadre && (
          <BoutonFormule key={etp}>{etapeConfig.encadre(echantillon)}</BoutonFormule>
        )}

        <div style={{ margin: "16px 0" }}>
          {etapeConfig.type === "action" && !feedback?.valide && (
            <button
              disabled={animationEnCours !== null}
              onClick={executerAction}
              style={{ background: "#b45309", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              {etapeConfig.boutonAction}
            </button>
          )}

          {etapeConfig.type === "num" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>{etapeConfig.consigneSaisie}</label>
                <button
                  type="button"
                  onClick={() => setShowCalc(true)}
                  style={{ background: "#fef3c7", border: "1.5px solid #b45309", color: "#b45309", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span>🧮</span><span>Calculatrice</span>
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={repSaisie}
                  onChange={(ev) => setRepSaisie(ev.target.value)}
                  onKeyDown={(ev) => { if (ev.key === "Enter" && !feedback?.valide) verifierEtape(); }}
                  placeholder={etapeConfig.exemple || "Ex. 1,2345"}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 14, width: 140, background: "#fafafa" }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>{etapeConfig.unite}</span>
              </div>
            </div>
          )}

          {etapeConfig.type === "courbe" && (
            <div>
              <CourbeSechage e={echantillon} choisi={repSaisie === "" ? null : lire(repSaisie)} desactive={!!feedback?.valide}
                onChoisir={(pt) => setRepSaisie(f4(pt.m).replace(/\s/g, ""))} />
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>{etapeConfig.consigneSaisie}</label>
                <input type="text" inputMode="decimal" value={repSaisie} onChange={(ev) => setRepSaisie(ev.target.value)}
                  placeholder="Clique sur la courbe"
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 14, width: 150, background: "#fafafa" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>g</span>
              </div>
            </div>
          )}

          {etapeConfig.type === "qcm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {etapeConfig.choix(echantillon).map((c, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: repSaisie === c ? "#fffbeb" : "#fff" }}>
                  <input type="radio" name="qcm_es" checked={repSaisie === c} onChange={() => setRepSaisie(c)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "12px 0", flexWrap: "wrap" }}>
          {etapeConfig.indice && (
            <button
              onClick={() => setGuideState((prev) => ({ ...prev, showIndice: !prev.showIndice }))}
              style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600, color: "#475569" }}
            >
              💡 {guideState.showIndice ? "Masquer l'indice" : "Indice"}
            </button>
          )}
          {etapeConfig.type !== "action" && !feedback?.valide && (
            <button onClick={fairePourMoi} style={{ background: "none", border: "none", color: "#64748b", textDecoration: "underline", fontSize: 12, cursor: "pointer" }}>
              Le faire pour moi
            </button>
          )}
        </div>

        {guideState.showIndice && etapeConfig.indice && (
          <div style={{ background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px dashed #cbd5e1", fontSize: 12, color: "#475569", marginBottom: 12 }}>
            {etapeConfig.indice(echantillon)}
          </div>
        )}

        {feedback && (
          <div style={{ padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 14, background: feedback.valide ? "#dcfce7" : "#fee2e2", color: feedback.valide ? "#166534" : "#dc2626", fontWeight: 600 }}>
            {feedback.message}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 16 }}>
          <div>
            {etp > 0 && (
              <button onClick={() => aller(etp - 1)} style={{ background: "#f1f5f9", color: "#475569", border: "1.5px solid #cbd5e1", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                ← Étape précédente
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {etapeConfig.type !== "action" && !feedback?.valide && (
              <button onClick={verifierEtape} style={{ background: "#b45309", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                Vérifier
              </button>
            )}
            {feedback?.valide && etp < etapes.length - 1 && (
              <button onClick={() => aller(etp + 1)} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                Étape suivante →
              </button>
            )}
          </div>
        </div>

        </>)}

        {showCalc && (
          <CalculatriceScientifique
            onClose={() => setShowCalc(false)}
            onInserer={(v) => { setRepSaisie(v); setShowCalc(false); }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// LES ÉTAPES DU PARCOURS
// ============================================================
function genererEtapesParcours(choix) {
  const c = choix || { methode: "conv", T: 105, h: 2 };
  const action = (titre, texte, boutonAction, anim, messageAction) => ({
    titre, texte, type: "action", boutonAction, anim, messageAction,
    reponseAttendue: () => "ok", valider: () => ({ valide: true, message: "Étape validée." }),
  });
  const ecart = (e) => (e.courbe ? Math.abs(e.courbe[e.palier].m - e.courbe[Math.min(e.palier + 1, e.courbe.length - 1)].m) * 1000 : 0);

  const communes = [
    action(
      "1. Sécher la capsule vide",
      "Placer la capsule en aluminium vide à l'étuve, puis la laisser refroidir au dessiccateur. Elle ne doit contenir ni humidité ni poussière avant la tare.",
      "🔥 Sécher la capsule puis la refroidir",
      "secher",
      () => "Capsule sèche et à température ambiante ✨",
    ),
    action(
      "2. Peser la capsule vide (m₀)",
      "Poser la capsule sur la balance au 0,1 mg, attendre que l'affichage soit stable, puis relever m₀.",
      "⚖️ Peser la capsule vide",
      "peser",
      (e) => `Pesée enregistrée : m₀ = ${f4(e.m0)} g`,
    ),
    action(
      "3. Prise d'essai (m₁)",
      (e) => (produitDe(e).forme === "poudre"
        ? `Homogénéiser l'échantillon (${produitDe(e).nom.toLowerCase()}), puis en prélever environ 2 g à la spatule et le répartir en couche régulière au fond de la capsule. Peser l'ensemble.`
        : `Homogénéiser le produit (${produitDe(e).nom.toLowerCase()}), puis en prélever environ 2 g à la spatule et l'étaler en couche mince au fond de la capsule. Peser l'ensemble.`),
      "🥄 Déposer le produit à la spatule et peser",
      "verser",
      (e) => `Pesée enregistrée : m₁ = ${f4(e.m1)} g`,
    ),
    {
      titre: "4. Masse de la prise d'essai (mₚ)",
      texte: (e) => (
        <div>
          <p style={{ margin: "0 0 6px" }}>
            Données relevées : <MathTex tex={String.raw`m_0 = ${f4(e.m0)}\,\text{g}`} /> et <MathTex tex={String.raw`m_1 = ${f4(e.m1)}\,\text{g}`} />.
          </p>
          <p style={{ margin: 0 }}>Calcule la masse de produit réellement déposée dans la capsule.</p>
        </div>
      ),
      encadre: () => <MathTex tex={String.raw`m_p = m_1 - m_0`} size="large" display={true} />,
      type: "num",
      consigneSaisie: "Masse de la prise d'essai mₚ :",
      unite: "g",
      exemple: "Ex. 2,0123",
      indice: () => "On retire la masse de la capsule vide (la tare) à la masse capsule + produit.",
      reponseAttendue: (e) => f4(e.prise).replace(/\s/g, ""),
      valider: (v, e) => (Math.abs(lire(v) - e.prise) <= 0.00015
        ? { valide: true, message: <div><p style={{ margin: "0 0 4px", fontWeight: 700 }}>✅ Exact !</p><MathTex tex={String.raw`m_p = ${f4(e.m1)} - ${f4(e.m0)} = ${f4(e.prise)}\,\text{g}`} display /></div> }
        : { valide: false, message: "Valeur incorrecte. Fais la différence m₁ − m₀." }),
    },
  ];

  const etuvage = c.methode === "conv"
    ? [
        action(
          `5. Étuvage à ${c.T} °C pendant ${c.h} h`,
          (e) => `Placer la capsule dans l'étuve réglée à ${c.T} °C et la laisser ${c.h} h, ni plus ni moins : c'est la méthode à température et durée fixées. ${produitDe(e).volatil[0].toUpperCase() + produitDe(e).volatil.slice(1)} s'évapore.`,
          `🔥 Mettre à l'étuve (${c.h} h à ${c.T} °C)`,
          "etuve",
          () => `Étuvage terminé : ${c.h} h à ${c.T} °C.`,
        ),
        action(
          "6. Pesée après étuvage (m₂)",
          "Sortir la capsule, la laisser refroidir au dessiccateur, puis la peser.",
          "⚖️ Refroidir puis peser",
          "peser",
          (e) => `Pesée enregistrée : m₂ = ${f4(e.m2)} g`,
        ),
      ]
    : [
        action(
          `5. Étuvage à ${c.T} °C avec suivi de la masse`,
          () => `Placer la capsule dans l'étuve réglée à ${c.T} °C. Toutes les ${PAS_COURBE} min, on la sort, on la refroidit au dessiccateur et on la pèse, pendant ${DUREE_COURBE / 60} h.`,
          `🔥 Lancer l'étuvage et le suivi (${c.T} °C)`,
          "etuve",
          () => `Suivi terminé : ${DUREE_COURBE / 60} h à ${c.T} °C, une pesée toutes les ${PAS_COURBE} min.`,
        ),
        {
          titre: "6. Lire la masse finale sur la courbe (m₂)",
          texte: () => (
            <div>
              <p style={{ margin: "0 0 6px" }}>Voici la masse (capsule + produit) au cours du séchage.</p>
              <p style={{ margin: 0 }}><strong>Clique sur la courbe</strong> au point où la masse devient constante : deux pesées successives ne diffèrent plus de plus de 1 mg.</p>
            </div>
          ),
          type: "courbe",
          consigneSaisie: "Masse finale m₂ :",
          indice: () => "Survole les points de la fin de la courbe : quand la masse ne bouge plus (moins de 1 mg entre deux pesées), on a atteint la masse constante.",
          reponseAttendue: (e) => f4(e.m2).replace(/\s/g, ""),
          valider: (v, e) => {
            const x = lire(v);
            const surPalier = e.courbe.slice(e.palier).some((p) => Math.abs(p.m - x) < 0.00005) || Math.abs(x - e.m2) <= 0.0002;
            if (surPalier) {
              return { valide: true, message: `✅ Oui : à partir de ${hm(e.courbe[e.palier].t)}, la masse ne varie plus que de ${ecart(e).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} mg entre deux pesées. On retient m₂ = ${f4(e.m2)} g.` };
            }
            if (x > e.m2) return { valide: false, message: "La masse diminue encore à ce moment : le séchage n'est pas fini. Regarde plus loin sur la courbe." };
            return { valide: false, message: "Cette valeur n'est pas sur le palier de la courbe. Clique sur un point de la fin de la courbe." };
          },
        },
      ];

  const calculs = [
    {
      titre: "7. Extrait sec (ES)",
      texte: (e) => (
        <div>
          <p style={{ margin: "0 0 6px" }}>
            Données : <MathTex tex={String.raw`m_0 = ${f4(e.m0)}\,\text{g}`} />, <MathTex tex={String.raw`m_1 = ${f4(e.m1)}\,\text{g}`} /> et <MathTex tex={String.raw`m_2 = ${f4(e.m2)}\,\text{g}`} />.
          </p>
          <p style={{ margin: 0 }}>L'extrait sec est la part (en masse) de produit qui reste après évaporation des volatils.</p>
        </div>
      ),
      encadre: () => <MathTex tex={String.raw`\mathrm{ES} = \frac{m_2 - m_0}{m_1 - m_0} \times 100`} size="large" display={true} />,
      type: "num",
      consigneSaisie: "Extrait sec ES :",
      unite: "%",
      exemple: "Ex. 52,3",
      indice: () => "Au numérateur, la masse de matière sèche (m₂ − m₀) ; au dénominateur, la prise d'essai (m₁ − m₀).",
      reponseAttendue: (e) => f1(e.es),
      valider: (v, e) => (Math.abs(lire(v) - e.es) <= 0.1
        ? { valide: true, message: <div><p style={{ margin: "0 0 4px", fontWeight: 700 }}>✅ Bravo ! Détail du calcul :</p><MathTex tex={String.raw`\mathrm{ES} = \frac{${f4(e.m2)} - ${f4(e.m0)}}{${f4(e.m1)} - ${f4(e.m0)}} \times 100 = ${f1(e.es)}\,\%`} display /></div> }
        : { valide: false, message: "Vérifie : (m₂ − m₀) divisé par (m₁ − m₀), le tout × 100." }),
    },
    {
      titre: "8. Teneur en matières volatiles (MV)",
      texte: (e) => (
        <p style={{ margin: 0 }}>
          Tout ce qui n'est pas resté dans la capsule s'est évaporé ({produitDe(e).volatil}). Avec <MathTex tex={String.raw`\mathrm{ES} = ${f1(e.es)}\,\%`} />, calcule la teneur en matières volatiles.
        </p>
      ),
      encadre: () => <MathTex tex={String.raw`\mathrm{MV} = 100 - \mathrm{ES}`} size="large" display={true} />,
      type: "num",
      consigneSaisie: "Matières volatiles MV :",
      unite: "%",
      exemple: "Ex. 47,7",
      indice: () => "Extrait sec et matières volatiles se partagent les 100 % de la prise d'essai.",
      reponseAttendue: (e) => f1(e.mv),
      valider: (v, e) => (Math.abs(lire(v) - e.mv) <= 0.1
        ? { valide: true, message: `✅ Exact : MV = 100 − ${f1(e.es)} = ${f1(e.mv)} %` }
        : { valide: false, message: "MV et ES additionnés doivent faire 100 %." }),
    },
    {
      titre: "9. Bilan — À retenir",
      texte: (e) => {
        const esVrai = e.esVrai * 100;
        const incomplet = c.methode === "conv" && e.es - esVrai > 0.3;
        return (
          <div>
            <p style={{ margin: "0 0 8px" }}>Parcours terminé ! Pour ce produit ({produitDe(e).nom.toLowerCase()}), {libelleMethode(c)} :</p>
            <div style={{ textAlign: "center", margin: "10px 0" }}>
              <MathTex tex={String.raw`\mathrm{ES} = ${f1(e.es)}\,\% \qquad \mathrm{MV} = ${f1(e.mv)}\,\%`} display />
            </div>
            {incomplet && (
              <p style={{ margin: "0 0 8px", padding: 8, background: "#fef3c7", borderRadius: 8, fontSize: 13 }}>
                ⚠️ Avec {c.h} h à {c.T} °C, le séchage n'était pas fini : il restait des volatils, l'extrait sec est surestimé (séché à fond, on trouverait {f1(esVrai)} %). C'est pour cela qu'une méthode à durée fixée impose des conditions précises, pour que tous les laboratoires trouvent la même valeur.
              </p>
            )}
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13 }}>
              <li>On pèse toujours une capsule <strong>froide</strong> (dessiccateur) : un objet chaud fausse la pesée.</li>
              <li><strong>Durée fixée</strong> : on respecte exactement la température et la durée imposées, même si le séchage n'est pas tout à fait fini.</li>
              <li><strong>Suivi de masse</strong> : on arrête quand deux pesées successives sont presque identiques (masse constante).</li>
            </ul>
          </div>
        );
      },
      type: "action",
      boutonAction: "🏁 Terminer le parcours",
      messageAction: () => "Félicitations !",
      reponseAttendue: () => "ok",
      valider: () => ({ valide: true, message: "Félicitations !" }),
    },
  ];
  return [...communes, ...etuvage, ...calculs];
}

// Écran affiché avant l'étape 1 : choisir la méthode de séchage.
function EcranChoixMethode({ onChoisir }) {
  const [Tc, setTc] = useState(105);
  const [h, setH] = useState(2);
  const [Ts, setTs] = useState(105);
  const choixBouton = (actif) => ({ padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
    border: actif ? "2px solid #b45309" : "1px solid #cbd5e1", background: actif ? "#fef3c7" : "#fff", color: actif ? "#92400e" : "#334155" });
  const bloc = { border: "1.5px solid #fcd34d", background: "#fffbeb", borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 };
  const ligne = (label, valeurs, valeur, setValeur, unite) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 13 }}>
      <span style={{ width: 90, color: "#78350f" }}>{label}</span>
      {valeurs.map((v) => <button key={v} type="button" style={choixBouton(valeur === v)} onClick={() => setValeur(v)}>{v} {unite}</button>)}
    </div>
  );
  const commencer = (onClick) => (
    <button type="button" onClick={onClick}
      style={{ alignSelf: "flex-end", background: "#b45309", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
      Commencer →
    </button>
  );
  return (
    <div>
      <span style={{ fontWeight: 800, fontSize: 13, color: "#b45309" }}>Avant de commencer</span>
      <h2 style={{ margin: "6px 0 14px", fontSize: 18, color: "#0f172a" }}>Mesurer l'extrait sec</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={bloc}>
          <strong style={{ color: "#92400e", fontSize: 15 }}>🕒 Séchage à une température et une durée données</strong>
          {ligne("Température", TEMPERATURES, Tc, setTc, "°C")}
          {ligne("Durée", DUREES, h, setH, "h")}
          {commencer(() => onChoisir({ methode: "conv", T: Tc, h }))}
        </div>
        <div style={bloc}>
          <strong style={{ color: "#92400e", fontSize: 15 }}>📈 Séchage à une température donnée, avec suivi de la masse</strong>
          {ligne("Température", TEMPERATURES, Ts, setTs, "°C")}
          {commencer(() => onChoisir({ methode: "suivi", T: Ts }))}
        </div>
      </div>
    </div>
  );
}

// Courbe masse = f(temps) du suivi ; un clic sur un point donne sa masse.
function CourbeSechage({ e, choisi, onChoisir, desactive }) {
  const [survol, setSurvol] = useState(null);
  const pts = e.courbe || [];
  // Échelle de masse : l'axe part de m₀ (coupelle vide) ; la molette ne change que le HAUT de l'axe.
  // null = haut à la masse de départ (t = 0).
  const [vue, setVue] = useState(null);
  const [reticule, setReticule] = useState(null); // { x, y } en coordonnées du dessin
  const svgRef = useRef(null);
  const vueRef = useRef(null);
  // Tracé au fur et à mesure : une pesée toutes les 250 ms (= toutes les 10 min d'étuvage).
  const [n, setN] = useState(1);
  useEffect(() => {
    if (n >= pts.length) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), 250);
    return () => clearTimeout(id);
  }, [n, pts.length]);
  const fini = n >= pts.length;
  const vus = pts.slice(0, n);
  const dernier = vus[vus.length - 1];
  const L = 380, H = 260, g = 66, d = 12, h = 14, b = 40;
  const mMin = Math.min(...pts.map((p) => p.m)), mMax = Math.max(...pts.map((p) => p.m));
  const yMin = e.m0; // l'axe des masses part de la masse de la coupelle vide
  const hautMax = mMax + (mMax - mMin) * 0.04; // masse de départ (t = 0) + une petite marge
  const hautMin = mMin + (mMin - e.m0) * 0.06; // le haut de l'axe reste un peu au-dessus du palier
  const yMax = vue ?? hautMax;
  vueRef.current = { yMin, yMax, hautMin, hautMax };
  const X = (t) => g + (t / DUREE_COURBE) * (L - g - d);
  const Y = (m) => h + (1 - (m - yMin) / (yMax - yMin)) * (H - h - b);
  const graduationsY = [0, 1, 2, 3, 4].map((i) => yMin + (i / 4) * (yMax - yMin));
  const versDessin = (ev) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    const r = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: r.x, y: r.y };
  };
  const masseEn = (y) => yMin + (1 - (y - h) / (H - h - b)) * (yMax - yMin);
  const tempsEn = (x) => ((x - g) / (L - g - d)) * DUREE_COURBE;
  // Zoom sur l'axe des masses : facteur < 1 = le haut de l'axe descend, l'échelle s'agrandit.
  const zoomer = (facteur) => {
    const { yMin: bas, yMax: haut, hautMin: hmin, hautMax: hmax } = vueRef.current;
    const nouveau = bas + (haut - bas) * facteur;
    // Mise à jour immédiate de la référence : plusieurs crans rapides s'additionnent.
    if (nouveau >= hmax) { vueRef.current.yMax = hmax; setVue(null); return; }
    vueRef.current.yMax = Math.max(hmin, nouveau);
    setVue(vueRef.current.yMax);
  };
  // La molette doit empêcher la page de défiler : écouteur non passif.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const surMolette = (ev) => {
      ev.preventDefault();
      // Molette vers le haut : le haut de l'axe descend (zoom). Proportionnel au défilement (molette franche ou trackpad doux).
      const pas = Math.max(-600, Math.min(600, ev.deltaMode === 1 ? ev.deltaY * 40 : ev.deltaY));
      zoomer(Math.exp(pas * 0.0025));
    };
    svg.addEventListener("wheel", surMolette, { passive: false });
    return () => svg.removeEventListener("wheel", surMolette);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pts.length) return null;
  const actif = fini ? (survol ?? pts.findIndex((p) => choisi !== null && Math.abs(p.m - choisi) < 0.00005)) : -1;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 4, flexWrap: "wrap" }}>
        {fini
          ? <span style={{ color: "#15803d", fontWeight: 700 }}>✔ Suivi terminé : clique sur un point de la courbe.</span>
          : <span style={{ color: "#b45309", fontWeight: 700 }}>⏱ t = {dernier.t} min · balance : {f4(dernier.m)} g</span>}
        <span style={{ display: "flex", gap: 4 }}>
          {[["＋", "Agrandir l'échelle de masse", () => zoomer(0.6)], ["−", "Réduire l'échelle de masse", () => zoomer(1 / 0.6)]].map(([l, t, f]) => (
            <button key={l} type="button" title={t} aria-label={t} onClick={f}
              style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, width: 26, height: 24, fontSize: 13, cursor: "pointer", color: "#475569", padding: 0 }}>{l}</button>
          ))}
          {vue && (
            <button type="button" onClick={() => setVue(null)}
              style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, padding: "2px 8px", fontSize: 12, cursor: "pointer", color: "#475569" }}>
              ⟲ Échelle d'origine
            </button>
          )}
        </span>
        {fini && !desactive && (
          <button type="button" onClick={() => setN(1)}
            style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, padding: "2px 8px", fontSize: 12, cursor: "pointer", color: "#475569" }}>
            ↻ Revoir le tracé
          </button>
        )}
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${L} ${H}`} style={{ width: "100%", height: "auto", display: "block", cursor: "crosshair", touchAction: "pan-y" }}
        role="img" aria-label="Masse au cours du séchage"
        onMouseMove={(ev) => { const p = versDessin(ev); setReticule(p && p.x >= g && p.x <= L - d && p.y >= h && p.y <= H - b ? p : null); }}
        onMouseLeave={() => setReticule(null)}>
        <defs><clipPath id="es-zone"><rect x={g} y={h - 6} width={L - g - d + 6} height={H - h - b + 12} /></clipPath></defs>
        {graduationsY.map((m, i) => (
          <g key={i}>
            <line x1={g} x2={L - d} y1={Y(m)} y2={Y(m)} stroke="#e2e8f0" />
            <text x={g - 5} y={Y(m) + 4} textAnchor="end" fontSize="11" fill="#475569">{f4(m)}</text>
          </g>
        ))}
        {[0, 30, 60, 90, 120, 150, 180].map((t) => (
          <g key={t}>
            <line x1={X(t)} x2={X(t)} y1={H - b} y2={H - b + 4} stroke="#94a3b8" />
            <text x={X(t)} y={H - b + 16} textAnchor="middle" fontSize="11" fill="#475569">{t}</text>
          </g>
        ))}
        <line x1={g} x2={L - d} y1={H - b} y2={H - b} stroke="#94a3b8" />
        <line x1={g} x2={g} y1={h} y2={H - b} stroke="#94a3b8" />
        <text x={(g + L - d) / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#334155">Temps d'étuvage (min)</text>
        <text x={13} y={(h + H - b) / 2} textAnchor="middle" fontSize="12" fill="#334155" transform={`rotate(-90 13 ${(h + H - b) / 2})`}>Masse (g)</text>
        <g clipPath="url(#es-zone)">
        <polyline points={vus.map((p) => `${X(p.t)},${Y(p.m)}`).join(" ")} fill="none" stroke="#b45309" strokeWidth="1.5" />
        {!fini && <circle cx={X(dernier.t)} cy={Y(dernier.m)} r="7" fill="#b45309" opacity="0.25" />}
        {vus.map((p, i) => (
          <g key={i} style={{ cursor: desactive || !fini ? "default" : "pointer" }}
            onMouseEnter={() => fini && setSurvol(i)} onMouseLeave={() => setSurvol(null)}
            onClick={() => { if (!desactive && fini) onChoisir(p); }}>
            <circle cx={X(p.t)} cy={Y(p.m)} r="9" fill="transparent" />
            <circle cx={X(p.t)} cy={Y(p.m)} r={i === actif ? 5 : 3} fill={i === actif ? "#b45309" : "#fff"} stroke="#b45309" strokeWidth="1.5" />
          </g>
        ))}
        </g>
        {reticule && (
          <g pointerEvents="none">
            <line x1={g} x2={L - d} y1={reticule.y} y2={reticule.y} stroke="#2563eb" strokeDasharray="4 3" strokeWidth="0.8" />
            <line x1={reticule.x} x2={reticule.x} y1={h} y2={H - b} stroke="#2563eb" strokeDasharray="4 3" strokeWidth="0.8" />
            <rect x={g + 2} y={reticule.y - 9} width="62" height="16" rx="3" fill="#2563eb" />
            <text x={g + 33} y={reticule.y + 3} textAnchor="middle" fontSize="10.5" fill="#fff">{f4(masseEn(reticule.y))}</text>
            <rect x={reticule.x - 22} y={H - b - 16} width="44" height="14" rx="3" fill="#2563eb" />
            <text x={reticule.x} y={H - b - 5.5} textAnchor="middle" fontSize="10" fill="#fff">{Math.round(tempsEn(reticule.x))} min</text>
          </g>
        )}
        {actif >= 0 && pts[actif] && (() => {
          const p = pts[actif];
          const x = Math.min(Math.max(X(p.t), g + 72), L - d - 72);
          const y = Y(p.m) < h + 40 ? Y(p.m) + 26 : Y(p.m) - 14;
          return (
            <g pointerEvents="none">
              <rect x={x - 70} y={y - 14} width="140" height="21" rx="4" fill="#0f172a" />
              <text x={x} y={y + 1} textAnchor="middle" fontSize="12" fill="#fff">{`t = ${p.t} min · ${f4(p.m)} g`}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ============================================================
// 2. VUE DÉFI
// ============================================================
function VueDefi({ defiState, setDefiState, reponsesDefi, setReponsesDefi, verifDefi, setVerifDefi, showIndiceDefi, setShowIndiceDefi }) {
  const [showCalc, setShowCalc] = useState(null); // champ qui recevra le résultat

  function nouveauTirage() {
    setDefiState(genererEchantillon(tirerType()));
    setReponsesDefi({ m2: "", es: "", mv: "" });
    setVerifDefi(null);
    setShowIndiceDefi(false);
  }

  function validerDefi() {
    setVerifDefi({
      m2: Math.abs(lire(reponsesDefi.m2) - defiState.m2) <= 0.00005,
      es: Math.abs(lire(reponsesDefi.es) - defiState.es) <= 0.1,
      mv: Math.abs(lire(reponsesDefi.mv) - defiState.mv) <= 0.1,
    });
  }

  const champs = [
    { cle: "m2", label: "Masse retenue m₂ (g) [4 décimales] :" },
    { cle: "es", label: "Extrait sec ES (%) [1 décimale] :" },
    { cle: "mv", label: "Matières volatiles MV (%) [1 décimale] :" },
  ];
  const reussi = verifDefi && verifDefi.m2 && verifDefi.es && verifDefi.mv;

  return (
    <div style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "#b45309" }}>🎯 Défi extrait sec</h2>
          <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>
            Un échantillon de <strong>{produitDe(defiState).nom.toLowerCase()}</strong> a été séché à l'étuve à {TEMPERATURE_ETUVE} °C. Choisis la masse à retenir, puis calcule l'extrait sec et les matières volatiles.
          </p>
        </div>
        <button onClick={nouveauTirage} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
          🔄 Nouvel énoncé
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 16 }}>
        <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Données expérimentales :</div>
          <div>Capsule vide m₀ : <strong>{f4(defiState.m0)} g</strong></div>
          <div>Capsule + produit m₁ : <strong>{f4(defiState.m1)} g</strong></div>
        </div>
        <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Pesées après étuvage (capsule refroidie) :</div>
          <table style={{ width: "100%", fontSize: 12, textAlign: "center", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f1f5f9" }}><th>Durée</th><th>Masse (g)</th></tr></thead>
            <tbody>
              {PESEES_MIN.map((t, i) => <tr key={t}><td>{hm(t)}</td><td style={{ fontFamily: "monospace" }}>{f4(defiState.pesees[i])}</td></tr>)}
            </tbody>
          </table>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Masse constante : deux pesées successives à 1 mg près.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        {champs.map(({ cle, label }) => (
          <div key={cle} style={{ padding: 10, borderRadius: 8, border: `1px solid ${verifDefi ? (verifDefi[cle] ? "#22c55e" : "#ef4444") : "#e2e8f0"}` }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{label}</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                inputMode="decimal"
                value={reponsesDefi[cle]}
                onChange={(ev) => setReponsesDefi({ ...reponsesDefi, [cle]: ev.target.value })}
                style={{ flex: 1, minWidth: 0, padding: 6, borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
              <button type="button" title="Calculatrice" onClick={() => setShowCalc(cle)}
                style={{ background: "#fef3c7", border: "1.5px solid #b45309", borderRadius: 6, cursor: "pointer", padding: "0 8px" }}>🧮</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={validerDefi} style={{ background: "#b45309", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
          Vérifier mon défi
        </button>
        <button onClick={() => setShowIndiceDefi(!showIndiceDefi)} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          💡 {showIndiceDefi ? "Masquer l'indice" : "Indice"}
        </button>
        {verifDefi && (
          <span style={{ fontWeight: 700, color: reussi ? "#16a34a" : "#dc2626", fontSize: 13 }}>
            {reussi ? "🎉 Défi réussi !" : "Certaines réponses sont inexactes, réessaie ou utilise l'indice."}
          </span>
        )}
      </div>

      {showIndiceDefi && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "#f8fafc", border: "1px dashed #cbd5e1", fontSize: 12, color: "#475569" }}>
          💡 <strong>Indice :</strong> m₂ est la dernière pesée, une fois que deux pesées successives diffèrent de 1 mg au plus. Puis ES = (m₂ − m₀) / (m₁ − m₀) × 100, et MV = 100 − ES.
        </div>
      )}

      {showCalc && (
        <CalculatriceScientifique
          onClose={() => setShowCalc(null)}
          onInserer={(v) => { setReponsesDefi((r) => ({ ...r, [showCalc]: v })); setShowCalc(null); }}
        />
      )}
    </div>
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

// ============================================================
// 3. DÉFI « ADHÉSIF » : méthode conventionnelle imposée par une norme
// Conditions reprises d'un cours de BTS (Adhésifs › Extrait sec), seules conditions vérifiées :
//   NF EN 827 : 120 °C 2 h (adhésif à l'eau), 105 °C 3 h (adhésif à solvants organiques)
//   ASTM D2369 : 110 °C ± 5 °C pendant 60 min, quel que soit le produit
// ============================================================
const ADHESIFS = {
  pva: { nom: "colle vinylique en dispersion aqueuse", type: "eau" },
  acr: { nom: "colle acrylique en émulsion aqueuse", type: "eau" },
  latex: { nom: "latex de caoutchouc naturel en dispersion aqueuse", type: "eau" },
  pc: { nom: "colle polychloroprène en solution dans des solvants organiques", type: "solvant" },
  pu: { nom: "colle polyuréthane en solution dans un solvant organique", type: "solvant" },
  sbs: { nom: "colle caoutchouc SBS en solution dans des solvants organiques", type: "solvant" },
};
const NORMES_ADH = {
  en827: {
    label: "NF EN 827",
    cond: (type) => (type === "eau" ? { T: 120, h: 2 } : { T: 105, h: 3 }),
    regle: "120 °C pendant 2 h pour un adhésif à l'eau, 105 °C pendant 3 h pour un adhésif à solvants organiques.",
  },
  d2369: {
    label: "ASTM D2369",
    cond: () => ({ T: 110, h: 1 }),
    regle: "110 °C ± 5 °C pendant 60 min, quel que soit le produit.",
  },
};
// Constante de temps du séchage (min), ordres de grandeur repris du même cours.
const TAU_ADH = { eau: { 105: 18, 110: 15, 120: 12 }, solvant: { 105: 10, 110: 8.5, 120: 7 } };
const CONDITIONS = [{ T: 105, h: 2 }, { T: 105, h: 3 }, { T: 110, h: 1 }, { T: 120, h: 2 }, { T: 120, h: 3 }];
const cleCond = (c) => `${c.T}-${c.h}`;
const libelleCond = (c) => `${c.T} °C pendant ${c.h} h`;

function melanger(liste) {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function genererDefiAdhesif() {
  const cle = Object.keys(ADHESIFS)[Math.floor(Math.random() * 6)];
  const { type } = ADHESIFS[cle];
  const norme = Math.random() < 0.6 ? "en827" : "d2369";
  const bonne = NORMES_ADH[norme].cond(type);
  const m0 = r4(1.8 + Math.random() * 0.6);
  const m1 = r4(m0 + 1.5 + Math.random() * 1.0);
  const es = type === "eau" ? 0.40 + Math.random() * 0.25 : 0.15 + Math.random() * 0.20;
  // Quatre essais du cahier de labo, dont celui conforme à la norme.
  const autres = melanger(CONDITIONS.filter((c) => cleCond(c) !== cleCond(bonne))).slice(0, 3);
  const essais = melanger([bonne, ...autres]).map((c) => {
    const prise = m1 - m0;
    // Perte lente en plus du séchage (volatils lents, début de dégradation du polymère) :
    // quelques mg, plus forte à haute température et sur longue durée. Elle rend chaque essai distinct,
    // d'où l'intérêt d'une méthode conventionnelle : mêmes conditions = résultats comparables.
    const esCond = es - 0.0008 * c.h * ((c.T - 100) / 10);
    const m = m0 + prise * (esCond + (1 - esCond) * Math.exp(-(c.h * 60) / TAU_ADH[type][c.T]));
    return { ...c, m: r4(m) };
  });
  const retenu = essais.find((e) => cleCond(e) === cleCond(bonne));
  const esCalc = ((retenu.m - m0) / (m1 - m0)) * 100;
  return { cle, norme, m0, m1, essais, bonne: cleCond(bonne), m2: retenu.m, es: esCalc };
}

function ChoixTypeDefi({ type, setType }) {
  const choisir = (t) => setType(t);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Type de défi :</span>
      {[["constante", "⚖️ Masse constante"], ["adhesif", "🧴 Adhésif (norme)"]].map(([id, label]) => (
        <button key={id} type="button" onClick={() => choisir(id)}
          style={{ padding: "6px 12px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
            border: type === id ? "2px solid #b45309" : "1.5px solid #cbd5e1", background: type === id ? "#b45309" : "#fff", color: type === id ? "#fff" : "#334155" }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function VueDefiAdhesif() {
  const [d, setD] = useState(() => { const v = lireLocal("es_defi_adh", null); return v && ADHESIFS[v.cle] ? v : genererDefiAdhesif(); });
  const [rep, setRep] = useState(() => lireLocal("es_defi_adh_rep", { cond: "", m2: "", es: "" }));
  const [verif, setVerif] = useState(null);
  const [indice, setIndice] = useState(false);
  const [calc, setCalc] = useState(null);
  useEffect(() => { ecrireLocal("es_defi_adh", d); }, [d]);
  useEffect(() => { ecrireLocal("es_defi_adh_rep", rep); }, [rep]);

  const adh = ADHESIFS[d.cle];
  const norme = NORMES_ADH[d.norme];
  const nouveau = () => { setD(genererDefiAdhesif()); setRep({ cond: "", m2: "", es: "" }); setVerif(null); setIndice(false); };
  const valider = () => setVerif({
    cond: rep.cond === d.bonne,
    m2: Math.abs(lire(rep.m2) - d.m2) <= 0.00005,
    es: Math.abs(lire(rep.es) - d.es) <= 0.1,
  });
  const reussi = verif && verif.cond && verif.m2 && verif.es;
  const bord = (k) => `1px solid ${verif ? (verif[k] ? "#22c55e" : "#ef4444") : "#e2e8f0"}`;

  return (
    <div style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "#b45309" }}>🧴 Défi : extrait sec d'un adhésif</h2>
          <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>
            Le client demande l'extrait sec d'une <strong>{adh.nom}</strong> selon la norme <strong>{norme.label}</strong> (méthode conventionnelle : température et durée imposées).
            Plusieurs essais ont été faits au laboratoire : retrouve celui qui respecte la norme, puis calcule l'extrait sec.
          </p>
        </div>
        <button onClick={nouveau} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
          🔄 Nouvel énoncé
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 16 }}>
        <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Données (même prise d'essai pour chaque essai) :</div>
          <div>Capsule vide m₀ : <strong>{f4(d.m0)} g</strong></div>
          <div>Capsule + adhésif m₁ : <strong>{f4(d.m1)} g</strong></div>
          <div>Norme imposée : <strong>{norme.label}</strong></div>
        </div>
        <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Cahier de laboratoire — masse capsule + extrait après étuvage :</div>
          <table style={{ width: "100%", fontSize: 12, textAlign: "center", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#f1f5f9" }}><th>Essai</th><th>Conditions</th><th>Masse (g)</th></tr></thead>
            <tbody>
              {d.essais.map((e, i) => (
                <tr key={i} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td>{i + 1}</td><td>{libelleCond(e)}</td><td style={{ fontFamily: "monospace" }}>{f4(e.m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 10, borderRadius: 8, border: bord("cond") }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Essai conforme à la norme :</label>
          <select value={rep.cond} onChange={(ev) => setRep({ ...rep, cond: ev.target.value })}
            style={{ width: "100%", padding: 6, borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff" }}>
            <option value="">— choisir —</option>
            {d.essais.map((e, i) => <option key={i} value={cleCond(e)}>Essai {i + 1} : {libelleCond(e)}</option>)}
          </select>
        </div>
        {[["m2", "Masse retenue m₂ (g) [4 décimales] :"], ["es", "Extrait sec ES (%) [1 décimale] :"]].map(([cle, label]) => (
          <div key={cle} style={{ padding: 10, borderRadius: 8, border: bord(cle) }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{label}</label>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="text" inputMode="decimal" value={rep[cle]} onChange={(ev) => setRep({ ...rep, [cle]: ev.target.value })}
                style={{ flex: 1, minWidth: 0, padding: 6, borderRadius: 6, border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              <button type="button" title="Calculatrice" onClick={() => setCalc(cle)}
                style={{ background: "#fef3c7", border: "1.5px solid #b45309", borderRadius: 6, cursor: "pointer", padding: "0 8px" }}>🧮</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={valider} style={{ background: "#b45309", color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
          Vérifier mon défi
        </button>
        <button onClick={() => setIndice(!indice)} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          💡 {indice ? "Masquer l'indice" : "Indice"}
        </button>
        <BoutonFormule titre="Les normes">
          <div style={{ fontSize: 14, textAlign: "left", lineHeight: 1.6 }}>
            {Object.values(NORMES_ADH).map((n) => <p key={n.label} style={{ margin: "0 0 8px" }}><strong>{n.label}</strong> : {n.regle}</p>)}
            <p style={{ margin: 0 }}>Extrait sec : <MathTex tex={String.raw`\mathrm{ES} = \frac{m_2 - m_0}{m_1 - m_0} \times 100`} /></p>
          </div>
        </BoutonFormule>
        {verif && (
          <span style={{ fontWeight: 700, color: reussi ? "#16a34a" : "#dc2626", fontSize: 13 }}>
            {reussi ? "🎉 Défi réussi !" : "Certaines réponses sont inexactes, réessaie ou utilise l'indice."}
          </span>
        )}
      </div>

      {indice && (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "#f8fafc", border: "1px dashed #cbd5e1", fontSize: 12, color: "#475569" }}>
          💡 <strong>Indice :</strong> la {adh.nom} est un adhésif {adh.type === "eau" ? "à l'eau" : "à solvants organiques"}.
          {" "}La norme {norme.label} impose : {norme.regle} Une méthode conventionnelle ne cherche pas la masse constante : on prend la pesée faite dans les conditions de la norme, même si un autre essai a séché plus longtemps.
        </div>
      )}

      {calc && (
        <CalculatriceScientifique
          onClose={() => setCalc(null)}
          onInserer={(v) => { setRep((r) => ({ ...r, [calc]: v })); setCalc(null); }}
        />
      )}
    </div>
  );
}
