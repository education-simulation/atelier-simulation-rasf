// ============================================================
//  COHÉSION DE LA MATIÈRE : LES FORCES INTERMOLÉCULAIRES
//  Exemple de l'Atelier simulation RASF, d'après un cours de BTS Métiers de la chimie
//  (milieux dispersés). Quatre onglets :
//   1. Liaison chimique ou force intermoléculaire (ordres de grandeur)
//   2. Force de polarisation (VdW 1) : dipôle permanent – permanent ou – induit
//   3. Force de dispersion de London (VdW 2) : dipôle instantané – induit
//   4. Liaison hydrogène : donneur et accepteur
//  Les dessins sont schématiques : un nuage électronique (ellipse) se colore du côté δ−.
// ============================================================
import { useEffect, useState } from "react";

const BLEU = "#2563eb", ORANGE = "#ea580c", GRIS = "#475569";
const carte = { background: "#fff", border: "1px solid #d5dfeb", borderRadius: 20, padding: "18px 20px" };
const f1 = (x) => x.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

// Un nuage électronique avec deux atomes. p ∈ [-1, 1] : polarisation (p > 0 → δ− à droite).
function Molecule({ x, y, a, b, p = 0, rx = 78, id }) {
  const fort = Math.min(1, Math.abs(p));
  const droite = p >= 0;
  const ry = rx * 0.52;
  return (
    <g>
      <defs>
        <linearGradient id={`g-${id}`} x1={droite ? "0" : "1"} x2={droite ? "1" : "0"} y1="0" y2="0">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset={`${100 - 45 * fort}%`} stopColor="#bfdbfe" />
          <stop offset="100%" stopColor={fort > 0.15 ? BLEU : "#bfdbfe"} />
        </linearGradient>
      </defs>
      <ellipse cx={x + (droite ? 1 : -1) * 8 * fort} cy={y} rx={rx} ry={ry} fill={`url(#g-${id})`} stroke="#1e3a8a" strokeWidth="1.5" />
      <line x1={x - rx * 0.6} y1={y + 8} x2={x + rx * 0.6} y2={y + 8} stroke={ORANGE} strokeWidth="2" strokeDasharray="5 4" />
      <circle cx={x - rx * 0.6} cy={y + 8} r="7" fill={ORANGE} />
      <circle cx={x + rx * 0.6} cy={y + 8} r="7" fill={ORANGE} />
      <text x={x - rx * 0.6} y={y - 10} textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f172a">{a}</text>
      <text x={x + rx * 0.6} y={y - 10} textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f172a">{b}</text>
      {fort > 0.15 && (
        <>
          <text x={x - rx - 4} y={y - ry + 6} textAnchor="end" fontSize="16" fill="#0f172a">{droite ? "δ+" : "δ−"}</text>
          <text x={x + rx + 4} y={y - ry + 6} textAnchor="start" fontSize="16" fill="#0f172a">{droite ? "δ−" : "δ+"}</text>
        </>
      )}
    </g>
  );
}

// Flèche d'attraction dont l'épaisseur suit l'intensité (0 → 1).
function Attraction({ x1, x2, y, force }) {
  if (force < 0.03) return <text x={(x1 + x2) / 2} y={y + 62} textAnchor="middle" fontSize="13" fill={GRIS}>attraction négligeable</text>;
  const e = 2 + 8 * force;
  return (
    <g opacity={0.35 + 0.65 * force}>
      <line x1={x1 + 10} y1={y} x2={x2 - 10} y2={y} stroke={ORANGE} strokeWidth={e} />
      <polygon points={`${x1},${y} ${x1 + 14 + e},${y - 6 - e} ${x1 + 14 + e},${y + 6 + e}`} fill={ORANGE} />
      <polygon points={`${x2},${y} ${x2 - 14 - e},${y - 6 - e} ${x2 - 14 - e},${y + 6 + e}`} fill={ORANGE} />
      <text x={(x1 + x2) / 2} y={y + 30} textAnchor="middle" fontSize="13" fontWeight="700" fill={ORANGE}>Attraction</text>
    </g>
  );
}

function Curseur({ label, valeur, min, max, pas, onChange, unite }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontWeight: 700 }}>
      {label}
      <input type="range" min={min} max={max} step={pas} value={valeur} onChange={(e) => onChange(+e.target.value)} style={{ flex: 1, minWidth: 160 }} />
      <span style={{ minWidth: 70 }}>{f1(valeur)} {unite}</span>
    </label>
  );
}

function Choix({ options, valeur, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{ padding: "7px 13px", borderRadius: 999, border: "1.5px solid " + (v === valeur ? "var(--accent)" : "#cbd5e1"),
          background: v === valeur ? "var(--accent)" : "#fff", color: v === valeur ? "#fff" : "#334155", fontWeight: 700, cursor: "pointer" }}>{l}</button>
      ))}
    </div>
  );
}

// ---------- 1. Ordres de grandeur ----------
function OrdresDeGrandeur() {
  const [chauffe, setChauffe] = useState(0); // énergie apportée, kJ/mol
  const barres = [
    ["Liaison chimique O–H (dans la molécule)", 463, "#7c3aed"],
    ["Liaison hydrogène entre deux molécules d'eau", 20, ORANGE],
    ["Force de London entre deux molécules de dichlore", 3, BLEU],
  ];
  const vaporise = chauffe >= 20, casse = chauffe >= 463;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <p style={{ margin: 0 }}>Les forces qui lient les <strong>atomes dans une molécule</strong> (liaisons chimiques) sont bien plus fortes que les forces qui s'exercent <strong>entre les molécules</strong> (forces intermoléculaires).</p>
      <div style={carte}>
        {barres.map(([nom, e, c]) => (
          <div key={nom} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}><span>{nom}</span><strong>{e} kJ/mol</strong></div>
            <div style={{ background: "#f1f5f9", borderRadius: 6, height: 16, overflow: "hidden" }}>
              <div style={{ width: `${Math.max(1, (e / 463) * 100)}%`, height: "100%", background: c }} />
            </div>
          </div>
        ))}
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: GRIS }}>Valeurs indicatives, par mole d'interactions.</p>
      </div>
      <div style={carte}>
        <Curseur label="Énergie apportée à l'eau" valeur={chauffe} min={0} max={500} pas={1} onChange={setChauffe} unite="kJ/mol" />
        <p style={{ margin: "10px 0 0" }}>
          {casse ? "💥 Assez d'énergie pour casser les liaisons O–H : les molécules d'eau elles-mêmes sont détruites."
            : vaporise ? "♨️ Les liaisons hydrogène entre molécules cèdent : l'eau change d'état, mais chaque molécule H₂O reste intacte."
              : "🧊 Les molécules restent liées entre elles : les forces intermoléculaires tiennent."}
        </p>
      </div>
    </div>
  );
}

// ---------- 2. Force de polarisation (VdW 1) ----------
function Polarisation() {
  const [paire, setPaire] = useState("HCl-HCl");
  const [d, setD] = useState(0.5); // distance entre molécules, nm
  const induit = paire === "HCl-Cl2";
  const proximite = Math.min(1, Math.pow(0.4 / d, 3));
  const p2 = induit ? 0.9 * proximite : 0.8;
  const force = Math.min(1, Math.pow(0.4 / d, induit ? 6 : 4) * (induit ? 0.8 : 1));
  const ecart = 80 + (d - 0.3) * 240;
  const x1 = 340 - 80 - ecart / 2, x2 = 340 + 80 + ecart / 2;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Choix valeur={paire} onChange={setPaire} options={[["HCl-HCl", "HCl et HCl (deux dipôles permanents)"], ["HCl-Cl2", "HCl et Cl₂ (dipôle induit)"]]} />
      <div style={carte}>
        <svg viewBox="0 0 680 190" style={{ width: "100%", height: "auto" }} role="img" aria-label="Deux molécules et leur attraction">
          <Molecule id="p1" x={x1} y={80} a="H" b="Cl" p={0.8} />
          <Molecule id="p2" x={x2} y={80} a={induit ? "Cl" : "H"} b="Cl" p={p2} />
          <Attraction x1={x1 + 90} x2={x2 - 90} y={88} force={force} />
        </svg>
        <Curseur label="Distance entre les molécules" valeur={d} min={0.3} max={1.2} pas={0.05} onChange={setD} unite="nm" />
      </div>
      <p style={{ margin: 0 }}>
        {induit
          ? <>Cl₂ est <strong>apolaire</strong>. Quand le dipôle HCl s'approche, il <strong>déforme le nuage électronique</strong> de Cl₂, qui devient un <strong>dipôle induit</strong>. Rapproche les molécules : la déformation et l'attraction augmentent très vite.</>
          : <>Dans HCl, le chlore est plus électronégatif que l'hydrogène : le nuage est attiré vers Cl (δ−). Le δ+ de l'une attire le δ− de l'autre : c'est la <strong>force de polarisation</strong> (VdW 1).</>}
      </p>
    </div>
  );
}

// ---------- 3. Force de dispersion de London (VdW 2) ----------
const HALOGENES = { Cl: { nom: "dichlore Cl₂", rx: 66, teb: -34, k: 0.55 }, Br: { nom: "dibrome Br₂", rx: 78, teb: 59, k: 0.8 }, I: { nom: "diiode I₂", rx: 90, teb: 184, k: 1 } };

function London() {
  const [x, setX] = useState("Cl");
  const [d, setD] = useState(0.45);
  const [p, setP] = useState(0);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause) return undefined;
    const t = setInterval(() => setP((Math.random() * 2 - 1) * 0.9), 700);
    return () => clearInterval(t);
  }, [pause]);
  const h = HALOGENES[x];
  const induction = Math.min(1, Math.pow(0.35 / d, 3));
  const force = Math.min(1, h.k * Math.pow(0.42 / d, 6)) * Math.min(1, Math.abs(p) / 0.5);
  const ecart = 80 + (d - 0.3) * 230;
  const x1 = 340 - h.rx - ecart / 2, x2 = 340 + h.rx + ecart / 2;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <p style={{ margin: 0 }}>Deux molécules <strong>apolaires</strong> s'attirent aussi : leur nuage électronique n'est pas immobile. À chaque instant, il <strong>fluctue</strong> et crée un <strong>dipôle instantané</strong>, qui polarise la molécule voisine (<strong>dipôle induit</strong>).</p>
      <Choix valeur={x} onChange={setX} options={Object.entries(HALOGENES).map(([k, v]) => [k, v.nom])} />
      <div style={carte}>
        <svg viewBox="0 0 680 190" style={{ width: "100%", height: "auto" }} role="img" aria-label="Dipôle instantané et dipôle induit">
          <Molecule id="l1" x={x1} y={80} a={x} b={x} p={p} rx={h.rx} />
          <Molecule id="l2" x={x2} y={80} a={x} b={x} p={p * induction} rx={h.rx} />
          {p >= 0 ? <Attraction x1={x1 + h.rx + 12} x2={x2 - h.rx - 12} y={88} force={force} />
            : <Attraction x1={x1 + h.rx + 12} x2={x2 - h.rx - 12} y={88} force={force} />}
          <text x={x1} y={165} textAnchor="middle" fontSize="13" fill={GRIS}>dipôle instantané</text>
          <text x={x2} y={165} textAnchor="middle" fontSize="13" fill={GRIS}>dipôle induit</text>
        </svg>
        <div style={{ display: "grid", gap: 10 }}>
          <Curseur label="Distance entre les molécules" valeur={d} min={0.3} max={1.2} pas={0.05} onChange={setD} unite="nm" />
          <button onClick={() => setPause(!pause)} className="bouton-pilule" style={{ justifySelf: "start" }}>{pause ? "▶ Relancer les fluctuations" : "⏸ Figer un instant"}</button>
        </div>
      </div>
      <div style={carte}>
        <strong>Trois facteurs renforcent la force de London</strong>
        <ul style={{ margin: "6px 0 10px", lineHeight: 1.7 }}>
          <li>la <strong>taille</strong> des molécules (nuage plus gros, plus déformable) ;</li>
          <li>la <strong>surface de contact</strong> entre les molécules ;</li>
          <li>une <strong>distance</strong> courte entre les molécules.</li>
        </ul>
        <table style={{ borderCollapse: "collapse", fontSize: 14.5 }}>
          <tbody>
            {Object.entries(HALOGENES).map(([k, v]) => (
              <tr key={k} style={{ background: k === x ? "var(--accent-clair)" : "transparent" }}>
                <td style={{ padding: "4px 12px 4px 4px" }}>{v.nom}</td>
                <td style={{ padding: "4px 4px", textAlign: "right" }}>ébullition à <strong>{v.teb} °C</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: "6px 0 0", fontSize: 13.5, color: GRIS }}>Plus la molécule est grosse, plus il faut chauffer pour séparer les molécules.</p>
      </div>
    </div>
  );
}

// ---------- 4. Liaison hydrogène ----------
const COMPOSES = [
  { id: "H2O", nom: "eau H₂O", donneur: true, accepteur: true, teb: 100, voisin: "H₂S", tebV: -60 },
  { id: "NH3", nom: "ammoniac NH₃", donneur: true, accepteur: true, teb: -33, voisin: "PH₃", tebV: -88 },
  { id: "HF", nom: "fluorure d'hydrogène HF", donneur: true, accepteur: true, teb: 20, voisin: "HCl", tebV: -85 },
  { id: "CH4", nom: "méthane CH₄", donneur: false, accepteur: false, teb: -162 },
  { id: "acetone", nom: "acétone (CH₃)₂CO", donneur: false, accepteur: true, teb: 56 },
];

function LiaisonHydrogene() {
  const [id, setId] = useState("H2O");
  const c = COMPOSES.find((x) => x.id === id);
  const oui = c.donneur && c.accepteur;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <p style={{ margin: 0 }}>Pour qu'une <strong>liaison hydrogène</strong> s'établisse, il faut un <strong>donneur</strong> (un H lié à un atome très électronégatif : O, N ou F) et un <strong>accepteur</strong> (un atome O, N, F ou S porteur de doublets non liants).</p>
      <div style={carte}>
        <svg viewBox="0 0 680 170" style={{ width: "100%", height: "auto" }} role="img" aria-label="Liaison hydrogène entre deux molécules d'eau">
          <g fontSize="30" fontWeight="700" textAnchor="middle">
            <text x="130" y="55" fill="#0f172a">H</text><line x1="145" y1="62" x2="175" y2="95" stroke="#0f172a" strokeWidth="3" />
            <text x="200" y="118" fill={ORANGE}>O</text><line x1="222" y1="108" x2="268" y2="108" stroke={ORANGE} strokeWidth="4" />
            <text x="290" y="118" fill={ORANGE}>H</text>
            <line x1="312" y1="108" x2="430" y2="108" stroke={ORANGE} strokeWidth="3" strokeDasharray="3 6" />
            <text x="455" y="118" fill={ORANGE}>O</text>
            <line x1="468" y1="88" x2="495" y2="45" stroke="#0f172a" strokeWidth="3" /><text x="510" y="40" fill="#0f172a">H</text>
            <line x1="470" y1="125" x2="500" y2="150" stroke="#0f172a" strokeWidth="3" /><text x="515" y="165" fill="#0f172a">H</text>
          </g>
          <text x="370" y="92" textAnchor="middle" fontSize="13" fill={GRIS}>liaison hydrogène</text>
          <text x="210" y="160" textAnchor="middle" fontSize="13" fill={GRIS}>donneur</text>
          <text x="420" y="160" textAnchor="middle" fontSize="13" fill={GRIS}>accepteur</text>
        </svg>
        <p style={{ margin: 0, fontSize: 14 }}>La molécule d'eau est à la fois <strong>donneur</strong> et <strong>accepteur</strong> de liaison hydrogène.</p>
      </div>
      <div style={carte}>
        <strong>À toi : ce composé forme-t-il des liaisons hydrogène entre ses molécules ?</strong>
        <div style={{ margin: "10px 0" }}><Choix valeur={id} onChange={setId} options={COMPOSES.map((x) => [x.id, x.nom])} /></div>
        <ul style={{ margin: 0, lineHeight: 1.8 }}>
          <li>Donneur : {c.donneur ? "✅ oui" : "❌ non"}</li>
          <li>Accepteur : {c.accepteur ? "✅ oui" : "❌ non"}</li>
          <li><strong>{oui ? "Liaisons hydrogène entre ses molécules : oui." : c.accepteur ? "Pas de liaison hydrogène entre ses propres molécules (pas de donneur), mais il peut en recevoir de l'eau." : "Pas de liaison hydrogène : seulement des forces de Van der Waals."}</strong></li>
          <li>Température d'ébullition : {c.teb} °C{c.voisin ? <> (son voisin {c.voisin}, sans liaison hydrogène : {c.tebV} °C)</> : null}</li>
        </ul>
      </div>
    </div>
  );
}

const ONGLETS = [
  ["ordres", "Liaison chimique ou intermoléculaire ?", OrdresDeGrandeur],
  ["polarisation", "Polarisation (VdW 1)", Polarisation],
  ["london", "Dispersion de London (VdW 2)", London],
  ["hydrogene", "Liaison hydrogène", LiaisonHydrogene],
];

export default function ForcesIntermoleculaires() {
  const [onglet, setOnglet] = useState(() => { try { return localStorage.getItem("forces.onglet") || "ordres"; } catch { return "ordres"; } });
  const choisir = (o) => { setOnglet(o); try { localStorage.setItem("forces.onglet", o); } catch { /* sans importance */ } };
  const Contenu = (ONGLETS.find((o) => o[0] === onglet) || ONGLETS[0])[2];
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 16 }}>
      <div role="tablist" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {ONGLETS.map(([id, nom]) => (
          <button key={id} role="tab" aria-selected={onglet === id} onClick={() => choisir(id)}
            style={{ padding: "9px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14.5,
              background: onglet === id ? "var(--accent)" : "#fff", color: onglet === id ? "#fff" : "#334155", boxShadow: "inset 0 0 0 1px #d5dfeb" }}>{nom}</button>
        ))}
      </div>
      <Contenu />
    </div>
  );
}
