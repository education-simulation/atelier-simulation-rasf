// Pages d'aide EN LIGNE (GitHub Pages, dossier docs/) : l'agent donne leur lien dans ses messages.
// Elles réutilisent les morceaux de la page « J'en suis où de l'installation » (src/moteur/Guide.jsx).
// Construire : npm run aide  (écrit docs/, à committer). Ne pas modifier pour son site.
import { createRoot } from 'react-dom/client'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/outfit/latin-800.css'
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-700.css'
import { CSS, ContenuFenetres, VisiteAntigravity } from '../src/moteur/Guide.jsx'

const PLUS = `
body { margin:0; font-family:'Nunito',system-ui,sans-serif; }
.aide-retour { text-align:center; color:#334155; font-size:17px; margin:18px 0 0; }
`
const page = document.body.dataset.page

function Fenetres() {
  return (
    <div className="g">
      <div className="g-col">
        <header className="g-hero">
          <span className="g-main" aria-hidden="true">🔐</span>
          <h1>Les petites fenêtres en anglais</h1>
        </header>
        <section className="g-carte"><ContenuFenetres /></section>
        <p className="aide-retour">✅ Quand tu as fini de regarder, reviens dans Antigravity et réponds à la question.</p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <>
    <style>{CSS + PLUS}</style>
    {page === 'antigravity' ? <div className="g"><VisiteAntigravity /></div> : <Fenetres />}
  </>,
)
