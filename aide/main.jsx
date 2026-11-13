// Pages d'aide EN LIGNE (GitHub Pages, dossier docs/) : l'agent donne leur lien dans ses messages.
// Elles réutilisent les morceaux de la page de progression (src/moteur/Guide.jsx), avec le même habillage.
// Construire : npm run aide  (écrit docs/, à committer). Ne pas modifier pour son site.
import { createRoot } from 'react-dom/client'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/outfit/latin-800.css'
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-700.css'
import { CSS, ContenuFenetres, VisiteAntigravity, PageEtape } from '../src/moteur/Guide.jsx'

const PLUS = `
body { margin:0; font-family:'Nunito',system-ui,sans-serif; }
.aide-fermer { all:unset; cursor:pointer; margin-left:auto; color:#fff; background:#3f3f46; border:1px solid #52525b; border-radius:8px; padding:4px 12px; font-weight:800; font-size:13px; }
.aide-fermer:hover { background:#dc2626; border-color:#dc2626; }
.aide-fermer.flottant { position:fixed; top:12px; right:12px; z-index:70; background:#0b0b0f; padding:7px 14px; font-size:14px; }
`
const page = document.body.dataset.page

// « ✕ Fermer » : ferme cet onglet (et la fenêtre si c'est son seul onglet). Si le navigateur refuse
// (page ouverte autrement que par un lien), on explique comment fermer l'onglet à la main.
function fermer() {
  window.close()
  setTimeout(() => { if (!window.closed) alert("Ferme cet onglet avec le × de l'onglet, en haut.") }, 300)
}
export function BoutonFermer({ flottant }) {
  return <button type="button" className={`aide-fermer${flottant ? ' flottant' : ''}`} onClick={fermer}>✕ Fermer</button>
}

// La même bande jaune que la page de progression : rappelle de revenir répondre à l'IA.
function Bande({ quoi }) {
  return (
    <div className="ga-repondre" role="note">
      <span className="ga-fleche" aria-hidden="true">⬅</span>
      <span className="ga-repondre-texte"><b>Réponds à l'IA</b> <em>dans la zone de message d'Antigravity, en bas à gauche</em><span className="ga-quoi">👉 {quoi}</span></span>
    </div>
  )
}

function Fenetres() {
  return (
    <div className="ga">
      <div className="ga-fenetre">
        <div className="ga-barre-titre"><span /><span /><span /><b>Atelier · Les petites fenêtres d'autorisation</b><BoutonFermer /></div>
        <div className="ga-corps">
          <div className="pe2-titre"><span aria-hidden="true">🔐</span><h1>Les petites fenêtres d'autorisation en anglais</h1></div>
          <ContenuFenetres />
          <p className="pe2-retour">✅ Reviens dans Antigravity quand tu as vu.</p>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <>
    <style>{CSS + PLUS}</style>
    {page === 'antigravity' ? <div className="g" style={{ paddingBottom: 110 }}><BoutonFermer flottant /><VisiteAntigravity /><Bande quoi="Quand tu as fini, écris 1 (J'ai regardé, on continue), puis Entrée." /></div> : page === 'etape' ? <PageEtape n={Number(new URLSearchParams(location.search).get('n')) || 1} fermer={<BoutonFermer />} /> : <Fenetres />}
  </>,
)
