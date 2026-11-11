// Calculatrice scientifique — un seul fichier, aucune dépendance en dehors de React.
// Le même fichier vit dans simul-chimie (Outils › Calculatrice) et dans le modèle
// de site des profs RASF (simulations/Calculatrice.jsx) : ne rien importer d'autre.
//
// Le calcul ne passe JAMAIS par eval() : l'expression est découpée puis lue par
// un petit analyseur (priorités : fonctions/puissance > × ÷ > + −).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ───────────────────────────── Moteur de calcul ─────────────────────────────

const MOINS = "−";          // signe moins affiché (binaire ou unaire, selon le contexte)
const EXP = "ᴇ";            // séparateur de la notation scientifique : 6,02ᴇ23
const FONCTIONS = {
  "sin": "sin", "cos": "cos", "tan": "tan",
  "sin⁻¹": "asin", "cos⁻¹": "acos", "tan⁻¹": "atan",
  "ln": "ln", "log": "log", "√": "sqrt",
};
const NOMS_FONCTIONS = Object.keys(FONCTIONS).sort((a, b) => b.length - a.length);

class ErreurCalcul extends Error {}

function decouper(source) {
  const jetons = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (c === " ") { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < source.length && /[0-9.]/.test(source[j])) j++;
      let texte = source.slice(i, j);
      if ((texte.match(/\./g) || []).length > 1 || texte === ".") throw new ErreurCalcul("Nombre mal écrit");
      if (source[j] === EXP) {
        let k = j + 1;
        let signe = "";
        if (source[k] === MOINS || source[k] === "-") { signe = "-"; k++; }
        else if (source[k] === "+") k++;
        let d = k;
        while (d < source.length && /[0-9]/.test(source[d])) d++;
        if (d === k) throw new ErreurCalcul("Exposant manquant après ×10");
        texte += "e" + signe + source.slice(k, d);
        j = d;
      }
      jetons.push({ type: "nombre", valeur: Number(texte) });
      i = j;
      continue;
    }
    if (c === EXP) throw new ErreurCalcul("×10 doit suivre un nombre");
    if (source.startsWith("Ans", i)) { jetons.push({ type: "ans" }); i += 3; continue; }
    const nom = NOMS_FONCTIONS.find((n) => source.startsWith(n, i));
    if (nom) { jetons.push({ type: "fonction", nom: FONCTIONS[nom] }); i += nom.length; continue; }
    if (c === "π") { jetons.push({ type: "nombre", valeur: Math.PI }); i++; continue; }
    if (c === "e") { jetons.push({ type: "nombre", valeur: Math.E }); i++; continue; }
    if ("+-−×*÷/^()!²⁻¹".includes(c)) {
      if (c === "⁻" && source[i + 1] === "¹") { jetons.push({ type: "op", op: "inv" }); i += 2; continue; }
      const op = { "-": "−", "*": "×", "/": "÷" }[c] || c;
      jetons.push({ type: "op", op });
      i++;
      continue;
    }
    throw new ErreurCalcul(`Caractère inconnu : ${c}`);
  }
  return jetons;
}

function factorielle(n) {
  if (!Number.isInteger(n) || n < 0) throw new ErreurCalcul("n! demande un entier positif");
  if (n > 170) throw new ErreurCalcul("Nombre trop grand");
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

// Degrés : valeurs exactes aux multiples de 90° (sin 180° = 0, pas 1,2·10⁻¹⁶).
function trigo(nom, x, degres) {
  if (degres && (nom === "sin" || nom === "cos" || nom === "tan")) {
    const r = ((x % 360) + 360) % 360;
    if (nom === "sin" && r % 180 === 0) return 0;
    if (nom === "cos" && (r + 90) % 180 === 0) return 0;
    if (nom === "tan" && r % 180 === 0) return 0;
    if (nom === "tan" && (r + 90) % 180 === 0) throw new ErreurCalcul("tan non définie ici");
    x = (x * Math.PI) / 180;
  }
  if (nom === "sin") return Math.sin(x);
  if (nom === "cos") return Math.cos(x);
  if (nom === "tan") return Math.tan(x);
  if ((nom === "asin" || nom === "acos") && (x < -1 || x > 1)) throw new ErreurCalcul("Hors du domaine : −1 ≤ x ≤ 1");
  const r = nom === "asin" ? Math.asin(x) : nom === "acos" ? Math.acos(x) : Math.atan(x);
  return degres ? (r * 180) / Math.PI : r;
}

function appliquerFonction(nom, x, degres) {
  switch (nom) {
    case "ln":
      if (x <= 0) throw new ErreurCalcul("ln demande x > 0");
      return Math.log(x);
    case "log":
      if (x <= 0) throw new ErreurCalcul("log demande x > 0");
      return Math.log10(x);
    case "sqrt":
      if (x < 0) throw new ErreurCalcul("√ demande x ≥ 0");
      return Math.sqrt(x);
    default:
      return trigo(nom, x, degres);
  }
}

// Lecture récursive. Parenthèses non fermées : fermées d'office à la fin.
function lire(jetons, { ans, degres }) {
  let p = 0;
  const voir = () => jetons[p];
  const estOp = (op) => voir()?.type === "op" && voir().op === op;
  const debutDeFacteur = () => {
    const j = voir();
    return j && (j.type === "nombre" || j.type === "ans" || j.type === "fonction" || (j.type === "op" && j.op === "("));
  };

  function expression() {
    let v = terme();
    while (estOp("+") || estOp("−")) {
      const op = jetons[p++].op;
      const d = terme();
      v = op === "+" ? v + d : v - d;
    }
    return v;
  }
  function terme() {
    let v = unaire();
    for (;;) {
      if (estOp("×") || estOp("÷")) {
        const op = jetons[p++].op;
        const d = unaire();
        if (op === "÷" && d === 0) throw new ErreurCalcul("Division par zéro");
        v = op === "×" ? v * d : v / d;
      } else if (debutDeFacteur()) {
        v *= unaire(); // multiplication implicite : 2π, 3(4+1), 2sin(30)
      } else return v;
    }
  }
  function unaire() {
    if (estOp("−")) { p++; return -unaire(); }
    if (estOp("+")) { p++; return unaire(); }
    return puissance();
  }
  function puissance() {
    const base = suffixe();
    if (estOp("^")) {
      p++;
      const exposant = unaire(); // 2^3^2 = 2^9 ; 2^−1 = 0,5
      const r = Math.pow(base, exposant);
      if (Number.isNaN(r)) throw new ErreurCalcul("Puissance non définie");
      return r;
    }
    return base;
  }
  function suffixe() {
    let v = primaire();
    for (;;) {
      if (estOp("!")) { p++; v = factorielle(v); }
      else if (estOp("²")) { p++; v = v * v; }
      else if (estOp("inv")) {
        p++;
        if (v === 0) throw new ErreurCalcul("Division par zéro");
        v = 1 / v;
      } else return v;
    }
  }
  function primaire() {
    const j = voir();
    if (!j) throw new ErreurCalcul("Expression incomplète");
    if (j.type === "nombre") { p++; return j.valeur; }
    if (j.type === "ans") { p++; return ans; }
    if (j.type === "fonction") {
      p++;
      let x;
      if (estOp("(")) { p++; x = expression(); if (estOp(")")) p++; }
      else x = unaire();
      return appliquerFonction(j.nom, x, degres);
    }
    if (estOp("(")) {
      p++;
      const v = expression();
      if (estOp(")")) p++;
      return v;
    }
    throw new ErreurCalcul("Erreur de syntaxe");
  }

  if (jetons.length === 0) throw new ErreurCalcul("Rien à calculer");
  const v = expression();
  if (p < jetons.length) throw new ErreurCalcul("Erreur de syntaxe");
  return v;
}

/** Calcule une expression écrite avec les symboles de la calculatrice. */
export function calculer(source, { ans = 0, degres = true } = {}) {
  const v = lire(decouper(source), { ans, degres });
  if (!Number.isFinite(v)) throw new ErreurCalcul(Number.isNaN(v) ? "Résultat non défini" : "Dépassement de capacité");
  // 12 chiffres significatifs : 0,1 + 0,2 = 0,3 et non 0,30000000000000004.
  const arrondi = Number(v.toPrecision(12));
  return Object.is(arrondi, -0) ? 0 : arrondi;
}

// ───────────────────────────── Affichage des nombres ─────────────────────────

const EXPOSANTS = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
const enExposant = (n) => String(n).split("").map((c) => EXPOSANTS[c] ?? c).join("");
const virgule = (s) => s.replace(".", ",").replace(/^-/, "−");

function scientifique(v, chiffres) {
  if (v === 0) return virgule((0).toFixed(Math.max(0, chiffres - 1)));
  const [mantisse, exposant] = v.toExponential(chiffres - 1).split("e");
  const e = Number(exposant);
  return e === 0 ? virgule(mantisse) : `${virgule(mantisse)} × 10${enExposant(e)}`;
}

/** format : "auto" ou "sci" (avec `chiffres` significatifs). */
export function formater(v, format = "auto", chiffres = 3) {
  if (format === "sci") return scientifique(v, chiffres);
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e10 || a < 1e-4)) {
    const s = v.toExponential(9).replace(/\.?0+e/, "e");
    const [m, e] = s.split("e");
    return `${virgule(m)} × 10${enExposant(Number(e))}`;
  }
  return virgule(String(Number(v.toPrecision(10))));
}

// ───────────────────────────── Écriture « papier » ───────────────────────────
// Lecture TOLÉRANTE de l'expression (elle peut être en cours de frappe) en un arbre
// d'affichage : fractions empilées, puissances en exposant, barre de la racine.
// Ce qui manque encore s'affiche comme une case vide. Le curseur est un élément de
// l'arbre : il se dessine là où l'on écrit (au dénominateur après ÷, en exposant après ^).
// Chaque morceau affiché porte `data-j`, le numéro du jeton qu'il représente, pour
// qu'un toucher sur l'écran place le curseur au bon endroit.

const CUR = { t: "cur" };

function decouperAffichage(jetonsSaisie, curseur) {
  const source = jetonsSaisie.join("");
  const jetonDe = []; // caractère → numéro du jeton de saisie
  jetonsSaisie.forEach((t, k) => { for (let n = 0; n < t.length; n++) jetonDe.push(k); });
  let posCurseur = -1;
  if (curseur !== null && curseur !== undefined) posCurseur = jetonsSaisie.slice(0, curseur).join("").length;
  const fin = jetonsSaisie.length;
  const jeton = (i) => (i < jetonDe.length ? jetonDe[i] : fin);

  const jetons = [];
  let i = 0;
  const chiffres = (liste, debut, test) => {
    let k = debut;
    while (k < source.length && test(source[k])) {
      if (k === posCurseur && k !== debut) liste.push({ curseur: true });
      liste.push({ c: source[k], j: jeton(k) });
      k++;
    }
    return k;
  };
  while (i <= source.length) {
    if (i === posCurseur) jetons.push({ type: "curseur" });
    if (i === source.length) break;
    const c = source[i];
    if (/[0-9.]/.test(c) || c === EXP) {
      const nb = { type: "nombre", j: jeton(i), mantisse: [] };
      let k = chiffres(nb.mantisse, i, (x) => /[0-9.]/.test(x));
      if (source[k] === EXP) {
        if (k === posCurseur && k !== i) nb.mantisse.push({ curseur: true });
        nb.jExp = jeton(k);
        nb.exposant = [];
        k++;
        if (k === posCurseur) nb.exposant.push({ curseur: true });
        if (source[k] === MOINS || source[k] === "+") {
          nb.exposant.push({ c: source[k] === MOINS ? MOINS : "+", j: jeton(k) });
          k++;
          if (k === posCurseur) nb.exposant.push({ curseur: true });
        }
        const debut = k;
        k = chiffres(nb.exposant, k, (x) => /[0-9]/.test(x));
        if (k === debut && nb.exposant.length && nb.exposant[nb.exposant.length - 1].curseur) { /* curseur déjà posé */ }
      }
      jetons.push(nb); i = k; continue;
    }
    if (source.startsWith("Ans", i)) { jetons.push({ type: "symbole", texte: "Ans", j: jeton(i) }); i += 3; continue; }
    const nom = NOMS_FONCTIONS.find((n) => source.startsWith(n, i));
    if (nom) { jetons.push({ type: "fonction", nom: FONCTIONS[nom], texte: nom, j: jeton(i) }); i += nom.length; continue; }
    if (c === "π" || c === "e") { jetons.push({ type: "symbole", texte: c, j: jeton(i) }); i++; continue; }
    if (c === "⁻" && source[i + 1] === "¹") { jetons.push({ type: "op", op: "inv", j: jeton(i) }); i += 2; continue; }
    jetons.push({ type: "op", op: c, j: jeton(i) }); i++;
  }
  return { jetons, fin };
}

function arbreAffichage(jetonsSaisie, curseur) {
  const { jetons, fin } = decouperAffichage(jetonsSaisie, curseur);
  let p = 0;
  const voir = (d = 0) => jetons[p + d];
  const estOp = (op, d = 0) => voir(d)?.type === "op" && voir(d).op === op;
  const trou = () => ({ t: "trou", pos: voir()?.j ?? fin });
  const facteur = (d = 0) => {
    const j = voir(d);
    return j && (j.type === "nombre" || j.type === "symbole" || j.type === "fonction" || (j.type === "op" && j.op === "("));
  };
  function expression() {
    let v = terme();
    while (estOp("+") || estOp(MOINS)) { const t = jetons[p++]; v = { t: "bin", op: t.op, j: t.j, a: v, b: terme() }; }
    return v;
  }
  function terme() {
    let v = unaire();
    for (;;) {
      if (estOp("×")) { const t = jetons[p++]; v = { t: "bin", op: "×", j: t.j, a: v, b: unaire() }; }
      else if (estOp("÷")) { const t = jetons[p++]; v = { t: "frac", j: t.j, a: v, b: unaire() }; }
      else if (voir()?.type === "curseur" && !facteur(1)) { p++; v = { t: "seq", a: [v, CUR] }; }
      else if (facteur() || voir()?.type === "curseur") v = { t: "seq", a: [v, unaire()] };
      else return v;
    }
  }
  function unaire() {
    if (estOp(MOINS)) { const t = jetons[p++]; return { t: "neg", j: t.j, a: unaire() }; }
    if (estOp("+")) { p++; return unaire(); }
    const base = suffixe();
    if (estOp("^")) { p++; return { t: "pow", a: base, b: unaire() }; }
    return base;
  }
  function suffixe() {
    let v = primaire();
    while (estOp("!") || estOp("²") || estOp("inv")) { const t = jetons[p++]; v = { t: "post", op: t.op, j: t.j, a: v }; }
    // Curseur juste après ce nombre : il reste avec lui (au dénominateur, en exposant…).
    if (voir()?.type === "curseur" && !facteur(1) && !estOp("^", 1)) { p++; v = { t: "seq", a: [v, CUR] }; }
    return v;
  }
  function primaire() {
    const j = voir();
    if (!j) return trou();
    if (j.type === "curseur") {
      p++;
      if (facteur() || estOp(MOINS) || estOp("+")) return { t: "seq", a: [CUR, unaire()] };
      return { t: "trou", pos: voir()?.j ?? fin, cur: true };
    }
    if (j.type === "nombre") { p++; return { t: "nb", ...j }; }
    if (j.type === "symbole") { p++; return { t: "sym", texte: j.texte, j: j.j }; }
    if (j.type === "fonction") {
      p++;
      if (estOp("(")) {
        p++;
        const e = expression();
        const ferme = estOp(")"); const jf = ferme ? voir().j : null; if (ferme) p++;
        return { t: "fn", nom: j.nom, texte: j.texte, j: j.j, a: e, ferme, jf };
      }
      return { t: "fn", nom: j.nom, texte: j.texte, j: j.j, a: unaire(), ferme: true, sansParentheses: true };
    }
    if (estOp("(")) {
      const jo = voir().j; p++;
      const e = expression();
      const ferme = estOp(")"); const jf = ferme ? voir().j : null; if (ferme) p++;
      return { t: "par", a: e, ferme, jo, jf };
    }
    return trou();
  }
  const morceaux = [];
  while (p < jetons.length) {
    const avant = p;
    morceaux.push(expression());
    if (p === avant) {
      const t = jetons[p];
      morceaux.push(t.type === "curseur" ? CUR : { t: "brut", texte: t.op ?? t.texte ?? "", j: t.j });
      p++;
    }
  }
  return morceaux;
}

// Écriture papier : dans quelle « case » (numérateur, dénominateur, exposant) le curseur
// est-il affiché ? Renvoie { trouve, cas } ; cas = { noeud, genre } pour la case la plus
// intérieure, "bloque" si le curseur est d'abord dans des parenthèses (l'opérateur y reste
// de lui-même), null s'il n'est dans aucune case.
function caseDuCurseur(n) {
  const rien = { trouve: false, cas: null };
  if (!n) return rien;
  const dans = (enfant, cas) => {
    const r = caseDuCurseur(enfant);
    if (!r.trouve) return null;
    return r.cas ? r : { trouve: true, cas };
  };
  switch (n.t) {
    case "cur": return { trouve: true, cas: null };
    case "trou": return n.cur ? { trouve: true, cas: null } : rien;
    case "nb": return [...n.mantisse, ...(n.exposant ?? [])].some((x) => x.curseur) ? { trouve: true, cas: null } : rien;
    case "frac": return dans(n.a, { noeud: n.a, genre: "num" }) ?? dans(n.b, { noeud: n.b, genre: "den" }) ?? rien;
    case "pow": return dans(n.a, null) ?? dans(n.b, { noeud: n.b, genre: "exp" }) ?? rien;
    case "par": return dans(n.a, "bloque") ?? rien;
    case "fn": return dans(n.a, n.sansParentheses ? { noeud: n.a, genre: "fn" } : "bloque") ?? rien;
    case "seq": for (const x of n.a) { const r = dans(x, null); if (r) return r; } return rien;
    default: return dans(n.a, null) ?? dans(n.b, null) ?? rien; // bin, neg, post
  }
}

// Premier et dernier jeton de saisie couverts par un nœud : [début, fin[ (null si vide).
function bornesJetons(n) {
  const js = [];
  const visiter = (x) => {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) { x.forEach(visiter); return; }
    for (const cle of ["j", "jo", "jf", "jExp"]) if (Number.isInteger(x[cle])) js.push(x[cle]);
    for (const cle of ["a", "b", "mantisse", "exposant"]) visiter(x[cle]);
  };
  visiter(n);
  return js.length ? [Math.min(...js), Math.max(...js) + 1] : null;
}

// Un opérateur tapé avec le curseur dans une case de l'écriture papier reste dans cette
// case, comme sur une calculatrice « naturelle » : 7/6▮ puis + donne 7/(6+▮), pas 7/6 + ▮.
// On entoure le contenu de la case de parenthèses (invisibles au dénominateur, au
// numérateur et en exposant). Renvoie { jetons, curseur } ou null s'il n'y a rien à faire.
const OPERATEURS = ["+", MOINS, "×", "÷"];
// Seulement quand le curseur a été ramené dans le calcul : en bout de saisie, on écrit
// en ligne (taper 7 ÷ 6 + 3 au clavier doit donner 7/6 + 3, pas 7/(6+3)).
function operateurDansLaCase(jetons, curseur, op) {
  if (!OPERATEURS.includes(op) || curseur >= jetons.length) return null;
  let r = { trouve: false, cas: null };
  for (const m of arbreAffichage(jetons, curseur)) { r = caseDuCurseur(m); if (r.trouve) break; }
  if (!r.trouve || !r.cas || r.cas === "bloque") return null;
  // Au numérateur, × et ÷ restent déjà dedans (7×▮÷6 se lit (7×▮)/6) : seuls + et − en sortiraient.
  if (r.cas.genre === "num" && (op === "×" || op === "÷")) return null;
  const b = bornesJetons(r.cas.noeud);
  if (!b) return null;
  const [debut, fin] = b;
  if (!(debut < curseur && curseur <= fin)) return null; // case vide avant le curseur : signe, pas opération
  return {
    jetons: [...jetons.slice(0, debut), "(", ...jetons.slice(debut, curseur), op, ...jetons.slice(curseur, fin), ")", ...jetons.slice(fin)],
    curseur: curseur + 2,
  };
}

const sansParentheses = (n) => (n.t === "par" && n.ferme ? n.a : n);
const COMPOSES = ["bin", "frac", "neg", "seq", "pow"];
const Curseur = () => <span className="calc-curseur" aria-hidden="true" />;

function Chiffres({ liste }) {
  return liste.map((x, k) => (x.curseur ? <Curseur key={k} /> : <span key={k} data-j={x.j}>{x.c === "." ? "," : x.c}</span>));
}

function Papier({ n }) {
  if (!n) return null;
  switch (n.t) {
    case "cur": return <Curseur />;
    case "trou": return <span className="pp-trou" data-pos={n.pos}>{n.cur && <Curseur />}</span>;
    case "brut": return <span data-j={n.j}>{n.texte}</span>;
    case "nb":
      return (
        <span>
          {n.mantisse.length ? <Chiffres liste={n.mantisse} /> : <span className="pp-trou" data-pos={n.jExp} />}
          {n.exposant && (
            <>
              <span data-j={n.jExp}>×10</span>
              <sup>
                <Chiffres liste={n.exposant} />
                {!n.exposant.some((x) => x.c && /[0-9]/.test(x.c)) && <span className="pp-trou petit" data-pos={n.jExp + 1} />}
              </sup>
            </>
          )}
        </span>
      );
    case "sym": return <span className={n.texte === "Ans" ? "pp-ans" : "pp-sym"} data-j={n.j}>{n.texte}</span>;
    case "bin": return <><Papier n={n.a} /><span className="pp-op" data-j={n.j}>{n.op}</span><Papier n={n.b} /></>;
    case "seq": return <>{n.a.map((x, k) => <Papier key={k} n={x} />)}</>;
    case "neg": return <><span data-j={n.j}>{MOINS}</span><Papier n={n.a} /></>;
    case "frac":
      return (
        <span className="pp-frac">
          <span className="pp-num"><Papier n={sansParentheses(n.a)} /></span>
          <span className="pp-den"><Papier n={sansParentheses(n.b)} /></span>
        </span>
      );
    case "pow": {
      const base = COMPOSES.includes(n.a.t) ? { t: "par", a: n.a, ferme: true } : n.a;
      return <><Papier n={base} /><sup><Papier n={sansParentheses(n.b)} /></sup></>;
    }
    case "post": {
      const base = COMPOSES.includes(n.a.t) ? { t: "par", a: n.a, ferme: true } : n.a;
      if (n.op === "!") return <><Papier n={base} /><span data-j={n.j}>!</span></>;
      return <><Papier n={base} /><sup data-j={n.j}>{n.op === "²" ? "2" : `${MOINS}1`}</sup></>;
    }
    case "fn":
      if (n.nom === "sqrt") return <span className="pp-rac"><span data-j={n.j}>√</span><span className="pp-rac-in"><Papier n={n.a} /></span>{n.ferme && !n.sansParentheses && <span className="pp-invisible" data-j={n.jf} />}</span>;
      return <><span className="pp-fn" data-j={n.j}>{n.texte}</span>{n.sansParentheses ? <Papier n={n.a} /> : <><span data-j={n.j}>(</span><Papier n={n.a} />{n.ferme ? <span data-j={n.jf}>)</span> : <span className="pp-fantome">)</span>}</>}</>;
    case "par":
      return <><span data-j={n.jo}>(</span><Papier n={n.a} />{n.ferme ? <span data-j={n.jf}>)</span> : <span className="pp-fantome">)</span>}</>;
    default: return null;
  }
}

function ExpressionPapier({ jetons, curseur = null }) {
  // Saisie vide : seulement le curseur, pas de case en pointillé.
  if (jetons.length === 0) return curseur === null ? null : <Curseur />;
  return <span className="pp">{arbreAffichage(jetons, curseur).map((n, i) => <Papier key={i} n={n} />)}</span>;
}

// Écriture « ligne » : un morceau par jeton, et le curseur entre deux jetons.
function ExpressionLigne({ jetons, curseur = null }) {
  const morceaux = [];
  jetons.forEach((t, k) => {
    if (k === curseur) morceaux.push(<Curseur key={`c${k}`} />);
    morceaux.push(<span key={k} data-j={k}>{virguleGlobale(t)}</span>);
  });
  if (curseur === jetons.length) morceaux.push(<Curseur key="cfin" />);
  return <>{morceaux}</>;
}

/** Fraction exacte p/q (q ≤ 10 000) si la valeur en est une, sinon null. */
export function enFraction(v) {
  if (!Number.isFinite(v) || Number.isInteger(v) || Math.abs(v) > 1e9) return null;
  let x = Math.abs(v), h0 = 1, h1 = 0, k0 = 0, k1 = 1;
  for (let i = 0; i < 25; i++) {
    const a = Math.floor(x);
    [h0, h1] = [a * h0 + h1, h0];
    [k0, k1] = [a * k0 + k1, k0];
    if (k0 > 10000) return null;
    if (Math.abs(Math.abs(v) - h0 / k0) <= 1e-11 * Math.max(1, Math.abs(v))) return k0 === 1 ? null : { p: Math.sign(v) * h0, q: k0 };
    const reste = x - a;
    if (reste < 1e-15) return null;
    x = 1 / reste;
  }
  return null;
}

// Valeur → texte réutilisable dans une expression (6.02e+23 → 6.02ᴇ23).
function versExpression(v) {
  return String(v).replace("e+", EXP).replace("e-", EXP + MOINS).replace(/^-/, MOINS);
}

// ───────────────────────────── Mémoire locale (rafraîchissement) ─────────────

const CLE = "calc.";
function lireLocal(nom, defaut) {
  try {
    const brut = window.localStorage.getItem(CLE + nom);
    return brut === null ? defaut : JSON.parse(brut);
  } catch { return defaut; }
}
function ecrireLocal(nom, valeur) {
  try { window.localStorage.setItem(CLE + nom, JSON.stringify(valeur)); } catch { /* navigation privée */ }
}
function useLocal(nom, defaut) {
  const [v, setV] = useState(() => lireLocal(nom, defaut));
  useEffect(() => { ecrireLocal(nom, v); }, [nom, v]);
  return [v, setV];
}

// ───────────────────────────── Touches ───────────────────────────────────────

// genre : f = fonction, n = chiffre, o = opération, a = action, egal
// insere : jeton ajouté à l'expression ; action : nom d'une action spéciale.
const TOUCHES = [
  { l: "sin", insere: "sin(", genre: "f", aide: "s" },
  { l: "cos", insere: "cos(", genre: "f", aide: "c" },
  { l: "tan", insere: "tan(", genre: "f", aide: "t" },
  { l: "ln", insere: "ln(", genre: "f", aide: "l" },
  { l: "log", insere: "log(", genre: "f", aide: "g" },

  { l: "sin⁻¹", insere: "sin⁻¹(", genre: "f" },
  { l: "cos⁻¹", insere: "cos⁻¹(", genre: "f" },
  { l: "tan⁻¹", insere: "tan⁻¹(", genre: "f" },
  { l: "eˣ", insere: "e^(", genre: "f" },
  { l: "10ˣ", insere: "10^(", genre: "f" },

  { l: "x²", insere: "²", genre: "f", aide: "²" },
  { l: "xʸ", insere: "^", genre: "f", aide: "^" },
  { l: "√", insere: "√(", genre: "f", aide: "r" },
  { l: "x⁻¹", insere: "⁻¹", genre: "f" },
  { l: "n!", insere: "!", genre: "f", aide: "!" },

  { l: "(", insere: "(", genre: "o", aide: "(" },
  { l: ")", insere: ")", genre: "o", aide: ")" },
  { l: "π", insere: "π", genre: "o", aide: "p" },
  { l: "e", insere: "e", genre: "o", aide: "e" },
  { l: "×10ⁿ", insere: EXP, genre: "o", aide: "E", titre: "Notation scientifique : 6,02 ×10ⁿ 23" },

  { l: "7", insere: "7", genre: "n" }, { l: "8", insere: "8", genre: "n" }, { l: "9", insere: "9", genre: "n" },
  { l: "⌫", action: "effacer", genre: "a", aide: "⌫", titre: "Effacer le dernier élément" },
  { l: "AC", action: "tout", genre: "a", aide: "Échap", titre: "Tout effacer" },

  { l: "4", insere: "4", genre: "n" }, { l: "5", insere: "5", genre: "n" }, { l: "6", insere: "6", genre: "n" },
  { l: "×", insere: "×", genre: "o", aide: "*" },
  { l: "÷", insere: "÷", genre: "o", aide: "/" },

  { l: "1", insere: "1", genre: "n" }, { l: "2", insere: "2", genre: "n" }, { l: "3", insere: "3", genre: "n" },
  { l: "+", insere: "+", genre: "o", aide: "+" },
  { l: "−", insere: MOINS, genre: "o", aide: "-" },

  { l: "0", insere: "0", genre: "n" },
  { l: ",", insere: ".", genre: "n", aide: ", ou ." },
  { l: "Ans", insere: "Ans", genre: "o", aide: "a", titre: "Réponse précédente" },
  { l: "=", action: "egal", genre: "egal", aide: "Entrée", large: true },
];

// Clavier de l'ordinateur → touche.
const CLAVIER = {
  "Enter": "=", "=": "=", "Backspace": "⌫", "Escape": "AC", "Delete": "AC",
  "*": "×", "x": "×", "/": "÷", ":": "÷", "+": "+", "-": "−",
  "^": "xʸ", "(": "(", ")": ")", "!": "n!", "²": "x²",
  ".": ",", ",": ",", "E": "×10ⁿ",
};
for (const d of "0123456789") CLAVIER[d] = d;
const PAR_LIBELLE = Object.fromEntries(TOUCHES.map((t) => [t.l, t]));

// Lettres tapées au clavier : on accepte le mot entier (sin, log, sqrt, pi, ans…)
// ou une seule lettre suivie d'autre chose (s → sin, l → ln, g → log…).
const MOTS = {
  sin: "sin", cos: "cos", tan: "tan", asin: "sin⁻¹", acos: "cos⁻¹", atan: "tan⁻¹",
  ln: "ln", log: "log", sqrt: "√", racine: "√", pi: "π", ans: "Ans", exp: "eˣ", e: "e",
};
const LETTRE_SEULE = { s: "sin", c: "cos", t: "tan", l: "ln", g: "log", r: "√", p: "π", e: "e", a: "Ans" };
const prefixeDeMot = (b) => Object.keys(MOTS).some((m) => m.startsWith(b));
const motStrictementPlusLong = (b) => Object.keys(MOTS).some((m) => m.length > b.length && m.startsWith(b));
function resoudreLettres(b) {
  if (!b) return null;
  if (MOTS[b]) return MOTS[b];
  if (b.length === 1 && LETTRE_SEULE[b]) return LETTRE_SEULE[b];
  return null;
}

// Après un résultat, ces jetons continuent le calcul à partir de Ans.
const CONTINUE_ANS = new Set(["+", MOINS, "×", "÷", "^", "²", "⁻¹", "!"]);

// ───────────────────────────── Composant ─────────────────────────────────────

const STYLE = `
.calc{--c-fond:#f4f6f8;--c-carte:#fff;--c-bord:#d6dde5;--c-texte:#17212b;--c-doux:#5d6b7a;
  --c-n:#ffffff;--c-f:#e8eef6;--c-o:#eef1f4;--c-a:#fde8e4;--c-a-t:#9a2e1c;--c-egal:#0f766e;--c-egal-t:#fff;--c-accent:#0f766e;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--c-texte);
  display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;justify-content:center;max-width:820px;margin:0 auto}
.calc *{box-sizing:border-box}
.calc-ecran,.calc-cote{text-align:left}
.calc-inserer{margin-top:8px;width:100%;border:0;border-radius:10px;min-height:42px;background:#1e3a8a;color:#fff;font-size:15px;font-weight:700;cursor:pointer;touch-action:manipulation}
.calc-inserer:disabled{opacity:.4;cursor:default}
.calc-corps{background:var(--c-fond);border:1px solid var(--c-bord);border-radius:18px;padding:10px;width:100%;max-width:400px}
.calc-ecran{background:var(--c-carte);border:1px solid var(--c-bord);border-radius:12px;padding:8px 10px;min-height:96px;display:flex;flex-direction:column;gap:2px}
.calc-ligne{display:flex;justify-content:space-between;gap:8px;border:0;border-bottom:1px dashed var(--c-bord);background:none;padding:1px 0 2px;font:inherit;font-size:13px;color:var(--c-doux);cursor:pointer;text-align:left;font-variant-numeric:tabular-nums}
.calc-ligne .q{word-break:break-all}.calc-ligne .r{font-weight:600;white-space:nowrap}
.calc-ligne:hover{color:var(--c-accent)}
.pp{display:inline;line-height:1.9}
.pp-frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 2px;line-height:1.15}
.pp-num{padding:0 3px}
.pp-den{padding:0 3px;border-top:1.5px solid currentColor;align-self:stretch;text-align:center}
.pp sup{font-size:.68em;line-height:0}
.pp-rac-in{border-top:1.5px solid currentColor;padding:0 2px 0 1px;margin-left:1px}
.pp-op{margin:0 .2em}
.pp-fn{font-style:normal}
.pp-sym{font-style:italic}
.pp-fantome{opacity:.3}
.pp-trou{display:inline-flex;align-items:center;justify-content:center;width:.6em;height:.85em;border:1px dashed var(--c-doux);border-radius:2px;vertical-align:-.1em;box-sizing:border-box}
.pp-trou .calc-curseur{height:.65em;margin:0;vertical-align:0}
.pp-trou.petit{width:.5em;height:.6em}
.pp-approx{font-size:.55em;color:var(--c-doux);font-weight:500;margin-left:6px;white-space:nowrap}
.calc-etat{display:flex;gap:6px;font-size:11px;color:var(--c-doux);font-weight:600;letter-spacing:.03em}
.calc-etat b{color:var(--c-accent)}
.calc-fleches{margin-left:auto;display:inline-flex;gap:4px}
.calc-fleches .calc-vider{width:auto;padding:0 8px;font-weight:600}
.calc-fleches button{border:1px solid var(--c-bord);background:var(--c-fond);color:var(--c-doux);border-radius:6px;width:34px;height:24px;font-size:11px;cursor:pointer;touch-action:manipulation;padding:0}
.calc-saisie{cursor:text}
.pp-invisible{display:inline-block;width:3px;height:1em}
.calc-saisie{font-size:17px;min-height:24px;word-break:break-all;font-variant-numeric:tabular-nums}
.calc-curseur{display:inline-block;width:2px;height:1.05em;background:var(--c-accent);vertical-align:-2px;margin-left:1px;animation:calc-cli 1s steps(1) infinite}
@keyframes calc-cli{50%{opacity:0}}
.calc-lettres{color:var(--c-accent);text-decoration:underline dotted}
.calc-resultat{font-size:28px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums;word-break:break-all;line-height:1.2}
.calc-resultat.apercu{color:var(--c-doux);font-weight:500;font-size:20px}
.calc-resultat.erreur{color:#b42318;font-size:15px;font-weight:600}
.calc-reglages{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;align-items:center}
.calc-groupe{display:inline-flex;border:1px solid var(--c-bord);border-radius:8px;overflow:hidden;background:var(--c-carte)}
.calc-groupe button{border:0;background:transparent;padding:5px 8px;font-size:12px;font-weight:600;color:var(--c-doux);cursor:pointer;touch-action:manipulation}
.calc-groupe button[aria-pressed=true]{background:var(--c-accent);color:#fff}
.calc-groupe select{border:0;background:transparent;font-size:12px;font-weight:600;color:var(--c-texte);padding:0 4px;cursor:pointer}
.calc-mem{margin-left:auto}
.calc-touches{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.calc-touche{border:1px solid var(--c-bord);border-radius:10px;min-height:44px;font-size:17px;font-weight:600;cursor:pointer;color:var(--c-texte);
  touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .05s,filter .1s;padding:0 2px}
.calc-touche:active,.calc-touche.appuyee{transform:scale(.95);filter:brightness(.92)}
.calc-touche:focus-visible{outline:2px solid var(--c-accent);outline-offset:1px}
.calc-touche.n{background:var(--c-n);font-size:20px}
.calc-touche.f{background:var(--c-f);font-size:15px}
.calc-touche.o{background:var(--c-o)}
.calc-touche.a{background:var(--c-a);color:var(--c-a-t)}
.calc-touche.egal{background:var(--c-egal);color:var(--c-egal-t);border-color:var(--c-egal);grid-column:span 2;font-size:22px}
.calc-cote{flex:1 1 260px;max-width:400px;background:var(--c-fond);border:1px solid var(--c-bord);border-radius:18px;padding:10px;font-size:13px}
.calc-cote h3{font-size:13px;margin:0 0 6px;display:flex;justify-content:space-between;align-items:center;color:var(--c-doux);text-transform:uppercase;letter-spacing:.05em}
.calc-cote h3 button{border:0;background:none;color:var(--c-doux);font-size:12px;cursor:pointer;text-decoration:underline;text-transform:none;letter-spacing:0}
.calc-hist{list-style:none;margin:0;padding:0;max-height:300px;overflow:auto;display:flex;flex-direction:column;gap:4px}
.calc-hist li{background:var(--c-carte);border:1px solid var(--c-bord);border-radius:8px;padding:5px 8px;display:flex;flex-direction:column;gap:1px}
.calc-hist button{border:0;background:none;padding:0;text-align:left;cursor:pointer;color:inherit;font:inherit;font-variant-numeric:tabular-nums;word-break:break-all}
.calc-hist .q{color:var(--c-doux);font-size:12px}
.calc-hist .r{font-weight:700;text-align:right;font-size:15px}
.calc-hist button:hover{color:var(--c-accent)}
.calc-aide{margin-top:10px;color:var(--c-doux);line-height:1.6}
.calc-aide kbd{background:var(--c-carte);border:1px solid var(--c-bord);border-radius:4px;padding:0 4px;font-size:11px;font-family:inherit}
.calc-vide{color:var(--c-doux);font-style:italic}
@media (max-width:420px){.calc-touche{min-height:46px}.calc-corps{padding:8px}.calc-touches{gap:5px}}
`;

// ─────────────── Plusieurs calculatrices à l'écran : une seule au clavier ──────────────
// Chaque calculatrice affichée s'inscrit dans une pile ; celle du dessus est « active » et
// reçoit seule le clavier. Monter (ouvrir), toucher, cliquer ou donner le focus la remet
// au-dessus ; démontée (fermée, page quittée), elle sort de la pile et le clavier revient
// à la précédente encore affichée.
const PILE_ACTIVES = [];
function activer(racine) {
  const i = PILE_ACTIVES.indexOf(racine);
  if (i !== -1) PILE_ACTIVES.splice(i, 1);
  PILE_ACTIVES.push(racine);
}
function retirer(racine) {
  const i = PILE_ACTIVES.indexOf(racine);
  if (i !== -1) PILE_ACTIVES.splice(i, 1);
}
// Rend active la calculatrice contenue dans `noeud` (clic sur la barre d'une fenêtre, par ex.).
export function activerCalculatriceDans(noeud) {
  const r = PILE_ACTIVES.find((x) => noeud && x.current && noeud.contains(x.current));
  if (r) activer(r);
}
// Vrai si `noeud` est (ou contient) la calculatrice active. Sert aussi à une fenêtre qui
// enveloppe une calculatrice (Échap pour fermer, par exemple).
export function calculatriceActiveDans(noeud) {
  const haut = PILE_ACTIVES[PILE_ACTIVES.length - 1];
  return !!(noeud && haut?.current && noeud.contains(haut.current));
}

// Props facultatives (utilisées quand la calculatrice est ouverte en fenêtre dans un exercice) :
//   compacte  : masque le panneau Historique / aide à droite
//   onInserer : affiche un bouton « Insérer » qui renvoie la valeur du résultat (nombre)
export default function Calculatrice({ compacte = false, onInserer } = {}) {
  const racine = useRef(null);
  useEffect(() => {
    activer(racine);
    return () => retirer(racine);
  }, []);
  const [jetons, setJetons] = useLocal("saisie", []);
  const [resultat, setResultat] = useLocal("resultat", null); // { valeur } | { erreur }
  const [ans, setAns] = useLocal("ans", 0);
  const [memoire, setMemoire] = useLocal("memoire", 0);
  const [degres, setDegres] = useLocal("degres", true);
  const [format, setFormat] = useLocal("format", "auto");
  const [chiffres, setChiffres] = useLocal("chiffres", 3);
  const [ecriture, setEcriture] = useLocal("ecriture", "papier"); // "papier" | "ligne"
  const [historique, setHistorique] = useLocal("historique", []);
  const [vientDeCalculer, setVientDeCalculer] = useLocal("termine", false);
  // Position du curseur dans la saisie (numéro de jeton) ; null = tout au bout.
  const [curseurBrut, setCurseur] = useLocal("curseur", null);
  const curseur = curseurBrut === null ? jetons.length : Math.max(0, Math.min(jetons.length, curseurBrut));
  const [appuyee, setAppuyee] = useState(null);
  const [lettres, setLettres] = useState(""); // lettres tapées en attente d'un mot (sin, log…)

  const texte = jetons.join("");
  const affiche = (v) => formater(v, format, chiffres);

  // Aperçu du résultat pendant la saisie (silencieux s'il n'est pas encore lisible).
  const apercu = useMemo(() => {
    if (vientDeCalculer || jetons.length === 0) return null;
    try { return calculer(texte, { ans, degres }); } catch { return null; }
  }, [texte, ans, degres, vientDeCalculer, jetons.length]);

  // Applique une ou plusieurs touches d'affilée (le clavier peut en envoyer deux
  // à la fois : « s » en attente puis « 3 »), sur un état local puis écrit en une fois.
  const appuyer = useCallback((...touches) => {
    let j = jetons, c = curseur, fini = vientDeCalculer, res = resultat, nouvelAns = null, ajoutHist = null;
    for (const touche of touches) {
      if (!touche) continue;
      if (touche.action === "tout") { j = []; c = 0; res = null; fini = false; continue; }
      if (touche.action === "gauche" || touche.action === "droite" || touche.action === "debut" || touche.action === "fin") {
        // Après « = », une flèche reprend le calcul pour le corriger.
        if (fini) { fini = false; res = null; c = j.length; if (touche.action === "fin" || touche.action === "droite") continue; }
        if (touche.action === "gauche") c = Math.max(0, c - 1);
        else if (touche.action === "droite") c = Math.min(j.length, c + 1);
        else c = touche.action === "debut" ? 0 : j.length;
        continue;
      }
      if (touche.action === "placer") { if (fini) { fini = false; res = null; } c = Math.max(0, Math.min(j.length, touche.position)); continue; }
      if (touche.action === "effacer") {
        if (fini) { fini = false; res = null; c = j.length; }
        else if (c > 0) { j = [...j.slice(0, c - 1), ...j.slice(c)]; c--; }
        continue;
      }
      if (touche.action === "egal") {
        if (j.length === 0) continue;
        const q = j.join("");
        try {
          const v = calculer(q, { ans: nouvelAns ?? ans, degres });
          res = { valeur: v }; nouvelAns = v; ajoutHist = { q, v };
        } catch (e) {
          res = { erreur: e instanceof ErreurCalcul ? e.message : "Erreur de calcul" };
        }
        fini = true;
        c = j.length;
        continue;
      }
      const ajout = touche.insere;
      if (fini) {
        // Après « = » : une opération repart de Ans, un nombre ou une fonction recommence.
        j = res?.valeur !== undefined && CONTINUE_ANS.has(ajout) ? ["Ans", ajout] : [ajout];
        c = j.length; fini = false; res = null;
      } else if (ajout === "(" && c > 0 && j[c - 1].length > 1 && j[c - 1].endsWith("(")) {
        // « sin » ouvre déjà sa parenthèse : la « ( » tapée juste après est absorbée.
      } else {
        const dansLaCase = ecriture === "papier" ? operateurDansLaCase(j, c, ajout) : null;
        if (dansLaCase) { j = dansLaCase.jetons; c = dansLaCase.curseur; }
        else { j = [...j.slice(0, c), ajout, ...j.slice(c)]; c++; }
      }
    }
    setJetons(j); setCurseur(c >= j.length ? null : c); setVientDeCalculer(fini); setResultat(res);
    if (nouvelAns !== null) setAns(nouvelAns);
    if (ajoutHist) setHistorique((h) => [ajoutHist, ...h].slice(0, 50));
  }, [jetons, curseur, ans, degres, ecriture, vientDeCalculer, resultat, setJetons, setCurseur, setResultat, setAns, setHistorique, setVientDeCalculer]);

  // Toucher l'écran : le curseur se place avant ou après le morceau touché (selon le côté).
  const toucherEcran = (e) => {
    const cible = e.target.closest?.("[data-j],[data-pos]");
    let position = jetons.length;
    if (cible?.dataset.pos !== undefined) position = Number(cible.dataset.pos);
    else if (cible) {
      const r = cible.getBoundingClientRect();
      const k = Number(cible.dataset.j);
      position = e.clientX < r.left + r.width / 2 ? k : k + 1;
    }
    appuyer({ action: "placer", position });
  };

  const inserer = (texteAjout) => appuyer({ insere: texteAjout });

  const valeurCourante = () => (resultat?.valeur !== undefined ? resultat.valeur : apercu ?? null);
  const memoriser = (signe) => {
    const v = valeurCourante();
    if (v === null) return;
    setMemoire((m) => Number((m + signe * v).toPrecision(12)));
  };

  // Clavier de l'ordinateur.
  useEffect(() => {
    const surTouche = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!calculatriceActiveDans(racine.current)) return; // une autre calculatrice a le clavier
      const cible = e.target;
      if (cible && (cible.tagName === "INPUT" || cible.tagName === "TEXTAREA" || cible.tagName === "SELECT" || cible.isContentEditable)) return;
      // Entrée sur un bouton qui a le focus : laisser le bouton répondre.
      if ((e.key === "Enter" || e.key === " ") && cible?.tagName === "BUTTON") return;
      const montrer = (libelle) => {
        setAppuyee(libelle);
        window.setTimeout(() => setAppuyee((a) => (a === libelle ? null : a)), 120);
      };
      const enAttente = lettres;
      // « x » multiplie, sauf au milieu d'un mot (exp).
      const lettre = /^[a-z]$/.test(e.key) && (e.key !== "x" || prefixeDeMot(enAttente + "x")) ? e.key : null;

      if (lettre) {
        e.preventDefault();
        const b = enAttente + lettre;
        if (MOTS[b] && !motStrictementPlusLong(b)) { setLettres(""); appuyer(PAR_LIBELLE[MOTS[b]]); montrer(MOTS[b]); return; }
        if (prefixeDeMot(b)) { setLettres(b); return; }
        // Le mot ne mène nulle part : on règle ce qui attendait, puis on repart de cette lettre.
        const avant = resoudreLettres(enAttente);
        if (prefixeDeMot(lettre)) {
          setLettres(lettre);
          if (avant) appuyer(PAR_LIBELLE[avant]);
        } else {
          setLettres("");
          const seule = LETTRE_SEULE[lettre]; // g → log
          appuyer(avant ? PAR_LIBELLE[avant] : null, seule ? PAR_LIBELLE[seule] : null);
          if (seule) montrer(seule);
        }
        return;
      }
      if (enAttente) {
        if (e.key === "Backspace") { e.preventDefault(); setLettres(enAttente.slice(0, -1)); return; }
        if (e.key === "Escape") { e.preventDefault(); setLettres(""); appuyer(PAR_LIBELLE.AC); return; }
      }
      let avant = enAttente ? resoudreLettres(enAttente) : null;
      // « 1.5e2 », « 1.6e-19 » : un e collé à un nombre et suivi d'un chiffre ou d'un
      // signe est l'exposant de la notation scientifique, pas la constante e.
      const dernier = jetons[curseur - 1];
      if (enAttente === "e" && !vientDeCalculer && /^[0-9.]$/.test(dernier || "") && /^[0-9+-]$/.test(e.key)) avant = "×10ⁿ";
      if (enAttente) setLettres("");
      const deplacement = { ArrowLeft: "gauche", ArrowRight: "droite", Home: "debut", End: "fin" }[e.key];
      if (deplacement) { e.preventDefault(); appuyer(avant ? PAR_LIBELLE[avant] : null, { action: deplacement }); return; }
      const libelle = CLAVIER[e.key];
      if (!libelle) { if (avant) appuyer(PAR_LIBELLE[avant]); return; }
      e.preventDefault();
      appuyer(avant ? PAR_LIBELLE[avant] : null, PAR_LIBELLE[libelle]);
      montrer(libelle);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [appuyer, lettres, jetons, curseur, vientDeCalculer]);

  const papier = ecriture === "papier";
  const montrerExpression = (q) => (papier ? <ExpressionPapier jetons={decouperEnTouches(q)} /> : virguleGlobale(q));
  // Résultat : en écriture papier, une fraction exacte s'affiche en fraction (1/3), suivie de sa valeur décimale.
  // Comme sur une calculatrice de lycée : fraction seulement si l'on n'a tapé que des entiers.
  const montrerResultat = (v, q = texte) => {
    const f = papier && format === "auto" && !/[.ᴇ]/.test(q) ? enFraction(v) : null;
    if (!f) return affiche(v);
    return (
      <span className="pp">
        {f.p < 0 && MOINS}
        <span className="pp-frac"><span className="pp-num">{Math.abs(f.p)}</span><span className="pp-den">{f.q}</span></span>
        <span className="pp-approx"> ≈ {affiche(v)}</span>
      </span>
    );
  };
  const curseurVisible = vientDeCalculer ? null : curseur;
  const saisieAffichee = papier
    ? <ExpressionPapier jetons={jetons} curseur={curseurVisible} />
    : <ExpressionLigne jetons={jetons} curseur={curseurVisible} />;
  // Écran à plusieurs lignes : les 3 calculs précédents restent visibles au-dessus.
  const dejaAffiche = vientDeCalculer && resultat?.valeur !== undefined ? 1 : 0;
  const lignesEcran = historique.slice(dejaAffiche, dejaAffiche + 3).reverse();
  let ligneResultat;
  if (resultat?.erreur) ligneResultat = <div className="calc-resultat erreur" role="alert">{resultat.erreur}</div>;
  else if (resultat?.valeur !== undefined) ligneResultat = <div className="calc-resultat" aria-live="polite">{montrerResultat(resultat.valeur)}</div>;
  else if (apercu !== null) ligneResultat = <div className="calc-resultat apercu">= {montrerResultat(apercu)}</div>;
  else ligneResultat = <div className="calc-resultat apercu">&nbsp;</div>;

  return (
    <div className="calc" ref={racine} onPointerDownCapture={() => activer(racine)} onFocusCapture={() => activer(racine)}>
      <style>{STYLE}</style>
      <section className="calc-corps" aria-label="Calculatrice scientifique">
        <div className="calc-ecran">
          <div className="calc-etat">
            <b>{degres ? "DEG" : "RAD"}</b>
            <span>{format === "sci" ? `SCI ${chiffres}` : "AUTO"}</span>
            {memoire !== 0 && <span title={`Mémoire : ${affiche(memoire)}`}>M</span>}
            <span className="calc-fleches">
              <button type="button" className="calc-vider" aria-label="Effacer tout l'écran" title="Effacer tout l'écran (calculs précédents compris)"
                onClick={() => { setHistorique([]); appuyer({ action: "tout" }); }}>🗑 Écran</button>
              <button type="button" aria-label="Curseur à gauche" title="Curseur à gauche (←)" onClick={() => appuyer({ action: "gauche" })}>◀</button>
              <button type="button" aria-label="Curseur à droite" title="Curseur à droite (→)" onClick={() => appuyer({ action: "droite" })}>▶</button>
            </span>
          </div>
          {lignesEcran.map((h, i) => (
            <button key={i} type="button" className="calc-ligne" title="Insérer ce résultat" onClick={() => inserer(versExpression(h.v))}>
              <span className="q">{montrerExpression(h.q)}</span>
              <span className="r">{montrerResultat(h.v, h.q)}</span>
            </button>
          ))}
          <div className="calc-saisie" onClick={toucherEcran} title="Touche l'écran pour placer le curseur">
            {saisieAffichee}{lettres && <span className="calc-lettres">{lettres}</span>}
          </div>
          {ligneResultat}
        </div>

        <div className="calc-reglages">
          <span className="calc-groupe" role="group" aria-label="Unité des angles">
            <button type="button" aria-pressed={degres} onClick={() => setDegres(true)}>DEG</button>
            <button type="button" aria-pressed={!degres} onClick={() => setDegres(false)}>RAD</button>
          </span>
          <span className="calc-groupe" role="group" aria-label="Écriture">
            <button type="button" aria-pressed={papier} title="Fractions empilées, puissances en exposant, comme sur papier" onClick={() => setEcriture("papier")}>Papier</button>
            <button type="button" aria-pressed={!papier} title="Tout sur une ligne" onClick={() => setEcriture("ligne")}>Ligne</button>
          </span>
          <span className="calc-groupe" role="group" aria-label="Format du résultat">
            <button type="button" aria-pressed={format === "auto"} onClick={() => setFormat("auto")}>Auto</button>
            <button type="button" aria-pressed={format === "sci"} onClick={() => setFormat("sci")}>Sci</button>
            {format === "sci" && (
              <select aria-label="Chiffres significatifs" value={chiffres} onChange={(e) => setChiffres(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n} c.s.</option>)}
              </select>
            )}
          </span>
          <span className="calc-groupe calc-mem" role="group" aria-label="Mémoire">
            <button type="button" title="Effacer la mémoire" onClick={() => setMemoire(0)}>MC</button>
            <button type="button" title="Rappeler la mémoire" onClick={() => inserer(versExpression(memoire))}>MR</button>
            <button type="button" title="Ajouter le résultat à la mémoire" onClick={() => memoriser(1)}>M+</button>
            <button type="button" title="Retirer le résultat de la mémoire" onClick={() => memoriser(-1)}>M−</button>
          </span>
        </div>

        <div className="calc-touches">
          {TOUCHES.map((t) => (
            <button
              key={t.l}
              type="button"
              className={`calc-touche ${t.genre}${appuyee === t.l ? " appuyee" : ""}`}
              title={[t.titre, t.aide && `Clavier : ${t.aide}`].filter(Boolean).join(" — ") || undefined}
              aria-label={t.titre || t.l}
              onClick={() => appuyer(t)}
            >
              {t.l}
            </button>
          ))}
        </div>
        {onInserer && (
          <button type="button" className="calc-inserer" disabled={valeurCourante() === null}
            onClick={() => { const v = valeurCourante(); if (v !== null) onInserer(v); }}>
            Insérer le résultat dans ma réponse
          </button>
        )}
      </section>

      {!compacte && <aside className="calc-cote" aria-label="Historique">
        <h3>
          Historique
          {historique.length > 0 && <button type="button" onClick={() => setHistorique([])}>Vider</button>}
        </h3>
        {historique.length === 0
          ? <p className="calc-vide">Les calculs faits s'affichent ici. Touche un calcul pour le reprendre, un résultat pour l'insérer.</p>
          : (
            <ul className="calc-hist">
              {historique.map((h, i) => (
                <li key={i}>
                  <button type="button" className="q" title="Reprendre ce calcul"
                    onClick={() => { setJetons(decouperEnTouches(h.q)); setCurseur(null); setResultat(null); setVientDeCalculer(false); }}>
                    {montrerExpression(h.q)}
                  </button>
                  <button type="button" className="r" title="Insérer ce résultat" onClick={() => inserer(versExpression(h.v))}>
                    {montrerResultat(h.v, h.q)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        <div className="calc-aide">
          <strong>Au clavier :</strong> chiffres, <kbd>+</kbd> <kbd>-</kbd> <kbd>*</kbd> <kbd>/</kbd> <kbd>^</kbd> <kbd>(</kbd> <kbd>)</kbd>,
          {" "}<kbd>Entrée</kbd> = , <kbd>⌫</kbd> efface, <kbd>Échap</kbd> tout effacer, <kbd>←</kbd> <kbd>→</kbd> déplacent le curseur (ou touche l'écran).
          {" "}Fonctions en toutes lettres : <kbd>sin</kbd> <kbd>cos</kbd> <kbd>tan</kbd> <kbd>asin</kbd> <kbd>ln</kbd> <kbd>log</kbd> <kbd>sqrt</kbd> <kbd>exp</kbd> <kbd>pi</kbd> <kbd>ans</kbd>,
          {" "}<kbd>E</kbd> ×10ⁿ (6.02E23), <kbd>x</kbd> ou <kbd>*</kbd> multiplier.
        </div>
      </aside>}
    </div>
  );
}

// Point décimal → virgule à l'affichage, partout dans l'expression.
function virguleGlobale(s) {
  return s.replace(/\./g, ",").replace(new RegExp(EXP, "g"), "×10^");
}

// Reprendre un calcul de l'historique : un caractère = un jeton, sauf noms connus.
function decouperEnTouches(s) {
  const morceaux = [];
  let i = 0;
  const longs = ["sin⁻¹(", "cos⁻¹(", "tan⁻¹(", "sin(", "cos(", "tan(", "ln(", "log(", "√(", "e^(", "10^(", "Ans", "⁻¹"];
  while (i < s.length) {
    const l = longs.find((x) => s.startsWith(x, i));
    if (l) { morceaux.push(l); i += l.length; } else { morceaux.push(s[i]); i++; }
  }
  return morceaux;
}
