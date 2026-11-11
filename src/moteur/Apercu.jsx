// Bandeau « aperçu » et bouton flottant « Les étapes de ton site » (moteur, ne pas modifier).
// Le bouton des étapes disparaît quand toutes les étapes sont cochées.
// Visibles seulement sur l'ordinateur (localhost), pendant que le prof travaille avec Antigravity,
// jamais sur le site publié. Les étapes cochées viennent de PROGRESSION.md, tenu à jour par l'assistant.
import { useEffect, useRef, useState } from "react";
import { useFermerDehors } from "./ChoixStyle";
import { STYLE_BOUTONS_RONDS } from "./InspecteurLocal";

const ETAPES = [
  ["Copier le modèle sur l'ordinateur", "L'agent copie le modèle dans le dossier que tu as choisi et vérifie que Node.js est installé (sinon, il te guide pour l'installer). C'est fait si tu lis ce texte."],
  ["Faire connaissance", "Quelques questions à cliquer : le nom du site, sa couleur, son style, ton établissement, ton nom ou pseudo."],
  ["Voir ton site sur ton ordinateur", "C'est cette page. Les menus Exemples, A, B et C sont là pour démarrer : tu les changeras en parlant à l'agent."],
  ["Mettre en ligne avec Vercel", "L'agent met ton site sur Internet. Si Vercel n'est pas encore connecté sur cet ordinateur, il te donne un lien : « Continue with Google » avec ton compte d'établissement, vérifie le code, puis « Confirm ». Sinon, rien à faire."],
  ["Voir le site en ligne", "Ouvre l'adresse en .vercel.app donnée par l'agent, aussi sur ton téléphone. Tu pourras plus tard choisir un nom de domaine."],
  ["Choisir la suite", "L'agent te propose des idées à cliquer : améliorer un exemple, remplir la page A1, renommer un menu… ou ta propre idée."],
];

// Chemin du dossier du site, fourni par vite.config.js pendant l'aperçu seulement (vide dans le site en ligne).
const DOSSIER = typeof __DOSSIER_DU_SITE__ !== "undefined" ? __DOSSIER_DU_SITE__ : "";

export const estApercu = typeof location !== "undefined" && ["localhost", "127.0.0.1"].includes(location.hostname);

export function Apercu() {
  const [faites, setFaites] = useState(new Set());
  const [charge, setCharge] = useState(false); // évite que le bouton clignote avant la lecture de PROGRESSION.md
  const [ouvert, setOuvert] = useState(() => { try { return localStorage.getItem("atelier.voletEtapes") === "1"; } catch { return false; } });

  useEffect(() => {
    fetch("PROGRESSION.md", { cache: "no-cache" })
      .then((r) => (r.ok ? r.text() : ""))
      .then((t) => {
        if (!t || /<html/i.test(t)) return;
        const f = new Set([0]); // la copie est forcément faite si l'agent a écrit ce fichier
        t.split("\n").forEach((l) => { const m = l.match(/\[x\]\s*Étape\s*(\d+)/i); if (m) f.add(+m[1]); });
        // Une adresse en ligne notée = le site a été mis en ligne, même si l'étape n'a pas été cochée.
        if (/Adresse du site\s*:\s*https?:\/\//i.test(t)) f.add(3);
        setFaites(f);
      })
      .catch(() => {})
      .finally(() => setCharge(true));
  }, []);

  const refEtapes = useRef(null);
  const changerOuvert = (o) => { setOuvert(o); try { localStorage.setItem("atelier.voletEtapes", o ? "1" : "0"); } catch { /* sans importance */ } };
  useFermerDehors(refEtapes, ouvert, () => changerOuvert(false));

  return (
    <>
      <div className="bandeau-apercu">
        <strong>👀 Aperçu de ton site, sur ton ordinateur.</strong> Cette page affiche le code rangé dans le dossier
        {DOSSIER ? <> <code className="bandeau-dossier">{DOSSIER}</code></> : " de ton site"}. Toi seul la vois : le site en ligne, lui, est visible par tous.
      </div>
      {charge && faites.size < ETAPES.length && (
        <div ref={refEtapes} style={{ position: "fixed", bottom: 84, right: 20, zIndex: 9999 }}>
          <style>{STYLE_BOUTONS_RONDS}</style>
          <button type="button" className="bouton-rond" style={{ background: "#336fa3" }}
            aria-label="Les étapes de ton site" aria-expanded={ouvert}
            onClick={() => changerOuvert(!ouvert)}>
            <span aria-hidden="true">{ouvert ? "✕" : "📋"}</span>
            <span className="pastille">{faites.size}/{ETAPES.length}</span>
            <span className="bulle">Les étapes de ton site ({faites.size}/{ETAPES.length} faites) · visible seulement sur ton ordinateur</span>
          </button>
          {ouvert && (
            <div className="volet-etapes" role="dialog" aria-label="Les étapes de ton site"
              style={{ position: "absolute", right: 66, bottom: 0, width: "min(380px, calc(100vw - 110px))", maxHeight: "70vh", overflow: "auto",
                borderRadius: 14, border: "1px solid #cbd5e1", boxShadow: "0 10px 25px rgba(0,0,0,.2)", padding: "10px 14px" }}>
              <strong>📋 Les étapes de ton site</strong>
              <span style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 2 }}>🔒 Ce bouton n'est visible que sur ton ordinateur.</span>
              <ol start="0">
                {ETAPES.map(([titre, detail], i) => (
                  <li key={i} className={faites.has(i) ? "faite" : ""}>
                    <strong>{faites.has(i) ? "✅ " : ""}{titre}</strong><br /><span>{detail}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </>
  );
}
