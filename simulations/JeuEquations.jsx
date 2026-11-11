// ============================================================
//  JEU : DÉFI CHRONO, ÉQUILIBRE LES ÉQUATIONS
//  Exemple de jeu de l'Atelier simulation RASF.
//  60 secondes pour équilibrer un maximum d'équations avec les boutons + et −.
//  Le compteur d'atomes de chaque élément sert d'aide. Le meilleur score reste en mémoire.
//  Idées à demander à ton agent : « ajoute un niveau difficile », « ajoute mes équations de TP ».
// ============================================================
import { useEffect, useMemo, useState } from "react";

const DUREE = 60;
// Chaque équation : réactifs ⟶ produits (formules simples, parenthèses autorisées).
const EQUATIONS = [
  [["H2", "O2"], ["H2O"]],
  [["CH4", "O2"], ["CO2", "H2O"]],
  [["N2", "H2"], ["NH3"]],
  [["Fe", "O2"], ["Fe2O3"]],
  [["Na", "Cl2"], ["NaCl"]],
  [["Al", "O2"], ["Al2O3"]],
  [["C3H8", "O2"], ["CO2", "H2O"]],
  [["Mg", "HCl"], ["MgCl2", "H2"]],
  [["Ca(OH)2", "HCl"], ["CaCl2", "H2O"]],
  [["H2O2"], ["H2O", "O2"]],
  [["C2H6O", "O2"], ["CO2", "H2O"]],
  [["Zn", "H3O+"], ["Zn2+", "H2", "H2O"]],
  [["NaOH", "H2SO4"], ["Na2SO4", "H2O"]],
  [["C6H12O6", "O2"], ["CO2", "H2O"]],
];

// Compte les atomes d'une formule : « Ca(OH)2 » → { Ca: 1, O: 2, H: 2 }. Les charges (+, 2+) sont ignorées.
function atomes(formule) {
  const f = formule.replace(/\d*[+-]$/, "");
  const pile = [{}];
  const re = /([A-Z][a-z]?)(\d*)|(\()|\)(\d*)/g;
  let m;
  while ((m = re.exec(f))) {
    if (m[1]) { const t = pile[pile.length - 1]; t[m[1]] = (t[m[1]] || 0) + (+m[2] || 1); }
    else if (m[3]) pile.push({});
    else if (m[0].startsWith(")")) {
      const dedans = pile.pop(), k = +m[4] || 1, t = pile[pile.length - 1];
      Object.entries(dedans).forEach(([e, n]) => { t[e] = (t[e] || 0) + n * k; });
    }
  }
  return pile[0];
}
function charge(formule) {
  const m = formule.match(/(\d*)([+-])$/);
  return m ? (m[2] === "+" ? 1 : -1) * (+m[1] || 1) : 0;
}
function bilan(especes, coefs) {
  const t = {}; let q = 0;
  especes.forEach((s, i) => { Object.entries(atomes(s)).forEach(([e, n]) => { t[e] = (t[e] || 0) + n * coefs[i]; }); q += charge(s) * coefs[i]; });
  return { t, q };
}
// Affichage : chiffres en indice, charge en exposant.
function Formule({ f }) {
  const m = f.match(/^(.*?)(\d*[+-])?$/);
  return <span>{m[1].split(/(\d+)/).map((p, i) => (/^\d+$/.test(p) ? <sub key={i}>{p}</sub> : p))}{m[2] && <sup>{m[2]}</sup>}</span>;
}
const melange = (n) => Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);

export default function JeuEquations() {
  const [etat, setEtat] = useState("accueil"); // accueil | jeu | fin
  const [ordre, setOrdre] = useState(() => melange(EQUATIONS.length));
  const [n, setN] = useState(0);
  const [coefs, setCoefs] = useState([]);
  const [score, setScore] = useState(0);
  const [reste, setReste] = useState(DUREE);
  const [bravo, setBravo] = useState(false);
  const [record, setRecord] = useState(() => { try { return +localStorage.getItem("jeuEquations.record") || 0; } catch { return 0; } });

  const [reac, prod] = EQUATIONS[ordre[n % ordre.length]];
  const especes = useMemo(() => [...reac, ...prod], [reac, prod]);

  const demarrer = () => { const o = melange(EQUATIONS.length); setOrdre(o); setN(0); setCoefs(EQUATIONS[o[0]].flat().map(() => 1)); setScore(0); setReste(DUREE); setEtat("jeu"); };

  useEffect(() => {
    if (etat !== "jeu") return undefined;
    const t = setInterval(() => setReste((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [etat]);
  useEffect(() => {
    if (etat === "jeu" && reste <= 0) {
      setEtat("fin");
      if (score > record) { setRecord(score); try { localStorage.setItem("jeuEquations.record", String(score)); } catch { /* sans importance */ } }
    }
  }, [reste, etat, score, record]);

  const gauche = bilan(reac, coefs.slice(0, reac.length));
  const droite = bilan(prod, coefs.slice(reac.length));
  const elements = [...new Set([...Object.keys(gauche.t), ...Object.keys(droite.t)])];
  const equilibree = coefs.length === especes.length && elements.every((e) => gauche.t[e] === droite.t[e]) && gauche.q === droite.q;

  useEffect(() => {
    if (etat !== "jeu" || !equilibree) return undefined;
    setBravo(true);
    const t = setTimeout(() => {
      setBravo(false); setScore((s) => s + 1);
      const suivant = n + 1; setN(suivant); setCoefs(EQUATIONS[ordre[suivant % ordre.length]].flat().map(() => 1));
    }, 700);
    return () => clearTimeout(t);
  }, [equilibree, etat]); // eslint-disable-line react-hooks/exhaustive-deps

  const changer = (i, d) => setCoefs((c) => c.map((x, j) => (j === i ? Math.min(12, Math.max(1, x + d)) : x)));

  const bouton = { width: 34, height: 34, borderRadius: 10, border: "1.5px solid #cbd5e1", background: "#fff", fontSize: 18, fontWeight: 800, cursor: "pointer" };
  const terme = (s, i) => (
    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <button style={bouton} onClick={() => changer(i, 1)} aria-label={`Augmenter le coefficient de ${s}`}>+</button>
      <div style={{ fontSize: 26, fontWeight: 800, whiteSpace: "nowrap" }}>
        <span style={{ color: "var(--accent)" }}>{coefs[i] > 1 ? coefs[i] : ""}</span> <Formule f={s} />
      </div>
      <button style={bouton} onClick={() => changer(i, -1)} aria-label={`Diminuer le coefficient de ${s}`}>−</button>
    </div>
  );
  const plus = (k) => <span key={k} style={{ fontSize: 24, fontWeight: 800, color: "#64748b" }}>+</span>;
  const cote = (liste, decal) => liste.flatMap((s, i) => (i ? [plus(`p${decal + i}`), terme(s, decal + i)] : [terme(s, decal + i)]));

  if (etat !== "jeu") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", background: "#fff", border: "1px solid #d5dfeb", borderRadius: 24, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 52 }} aria-hidden="true">{etat === "fin" ? "🏁" : "⚗️"}</div>
        <h2 style={{ margin: "6px 0" }}>{etat === "fin" ? `Score : ${score} équation${score > 1 ? "s" : ""}` : "Défi chrono : équilibre les équations"}</h2>
        <p style={{ color: "#475569" }}>{etat === "fin" ? (score >= record && score > 0 ? "🎉 Nouveau record !" : `Ton record : ${record}`) : `${DUREE} secondes pour équilibrer un maximum d'équations avec les boutons + et −. Le tableau des atomes t'aide.`}</p>
        <button onClick={demarrer} style={{ padding: "12px 24px", borderRadius: 999, border: "none", background: "var(--accent)", color: "#fff", fontSize: 17, fontWeight: 800, cursor: "pointer" }}>
          {etat === "fin" ? "Rejouer" : "C'est parti !"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 940, margin: "0 auto", display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18 }}>
        <span>⏱ {reste} s</span><span>Score : {score}</span><span style={{ color: "#64748b" }}>Record : {record}</span>
      </div>
      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${(reste / DUREE) * 100}%`, height: "100%", background: reste <= 10 ? "#dc2626" : "var(--accent)", transition: "width 1s linear" }} />
      </div>
      <div style={{ background: bravo ? "#dcfce7" : "#fff", border: "1px solid #d5dfeb", borderRadius: 22, padding: "18px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", transition: "background .2s" }}>
        {cote(reac, 0)}
        <span style={{ fontSize: 28, fontWeight: 800, margin: "0 6px" }}>⟶</span>
        {cote(prod, reac.length)}
      </div>
      <table style={{ margin: "0 auto", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", fontSize: 15 }}>
        <thead><tr><th style={{ padding: "6px 14px" }}>Élément</th><th style={{ padding: "6px 14px" }}>Réactifs</th><th style={{ padding: "6px 14px" }}>Produits</th></tr></thead>
        <tbody>
          {elements.map((e) => (
            <tr key={e} style={{ background: gauche.t[e] === droite.t[e] ? "#f0fdf4" : "#fef2f2" }}>
              <td style={{ padding: "4px 14px", fontWeight: 800 }}>{e}</td>
              <td style={{ padding: "4px 14px", textAlign: "center" }}>{gauche.t[e] || 0}</td>
              <td style={{ padding: "4px 14px", textAlign: "center" }}>{droite.t[e] || 0}</td>
            </tr>
          ))}
          {(gauche.q !== 0 || droite.q !== 0) && (
            <tr style={{ background: gauche.q === droite.q ? "#f0fdf4" : "#fef2f2" }}>
              <td style={{ padding: "4px 14px", fontWeight: 800 }}>charge</td>
              <td style={{ padding: "4px 14px", textAlign: "center" }}>{gauche.q}</td>
              <td style={{ padding: "4px 14px", textAlign: "center" }}>{droite.q}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ textAlign: "center" }}>
        <button className="bouton-pilule" onClick={() => { setN(n + 1); setCoefs(EQUATIONS[ordre[(n + 1) % ordre.length]].flat().map(() => 1)); }}>Passer cette équation ⏭</button>
      </div>
    </div>
  );
}
