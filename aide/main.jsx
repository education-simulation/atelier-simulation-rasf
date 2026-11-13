// Pages d'aide EN LIGNE (GitHub Pages, dossier docs/) : l'agent donne leur lien dans ses messages.
// Elles réutilisent les morceaux de la page « J'en suis où de l'installation » (src/moteur/Guide.jsx).
// Construire : npm run aide  (écrit docs/, à committer). Ne pas modifier pour son site.
import { createRoot } from 'react-dom/client'
import '@fontsource/outfit/latin-600.css'
import '@fontsource/outfit/latin-800.css'
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-700.css'
import { CSS, ContenuFenetres, FenetreAntigravity } from '../src/moteur/Guide.jsx'

const PLUS = `
body { margin:0; font-family:'Nunito',system-ui,sans-serif; }
.aide-seule .g-fermer { display:none; }
.aide-seule .g-voile { position:static; min-height:100vh; background:linear-gradient(160deg,#eef4ff 0%,#fdf6ec 100%); animation:none; }
.aide-retour { text-align:center; color:#334155; font-size:17px; margin:18px 0 0; }
`
const page = document.body.dataset.page

function Retour() {
  return <p className="aide-retour">✅ Quand tu as fini de regarder, reviens dans Antigravity et réponds à la question.</p>
}

function Fenetres() {
  return (
    <div className="g">
      <div className="g-col">
        <header className="g-hero">
          <span className="g-main" aria-hidden="true">🔐</span>
          <h1>Les petites fenêtres en anglais</h1>
        </header>
        <section className="g-carte"><ContenuFenetres /></section>
        <Retour />
      </div>
    </div>
  )
}

function Antigravity() {
  return (
    <div className="g aide-seule" style={{ padding: 0 }}>
      <FenetreAntigravity fermer={() => {}} />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <>
    <style>{CSS + PLUS}</style>
    {page === 'antigravity' ? <Antigravity /> : <Fenetres />}
  </>,
)
