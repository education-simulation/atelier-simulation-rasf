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
`
const page = document.body.dataset.page

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
        <div className="ga-barre-titre"><span /><span /><span /><b>Atelier · Les petites fenêtres d'autorisation</b><em>infos</em></div>
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
    {page === 'antigravity' ? <div className="g" style={{ paddingBottom: 110 }}><VisiteAntigravity /><Bande quoi="Quand tu as fini, écris 1 (J'ai regardé, on continue), puis Entrée." /></div> : page === 'etape' ? <PageEtape n={Number(new URLSearchParams(location.search).get('n')) || 1} /> : <Fenetres />}
  </>,
)
