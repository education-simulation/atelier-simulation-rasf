// Moteur du site (ne pas modifier) : React + Vite.
// base « ./ » : le même site marche sur l'ordinateur (aperçu) et en ligne (Vercel), sans rien régler.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // seulement pour les outils de src/outils/reula/
import { basename, dirname, join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Le dossier du site = celui qui contient ce fichier.
const dossier = dirname(fileURLToPath(import.meta.url))

// Chaque site a SON numéro d'aperçu, tiré du nom de son dossier (entre 5200 et 5899) :
// deux sites ouverts en même temps ne se marchent pas dessus, et un site garde toujours la même adresse.
// Si ce numéro est déjà pris, Vite en choisit un autre et l'affiche (« Local: … »).
const nom = basename(dossier)
const port = 5200 + [...nom].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 700, 7)

// Bouton « 🎨 Style » de l'aperçu : il enregistre le style choisi dans site.config.js (ligne « style: … »).
// Cela ne marche QUE pendant l'aperçu, sur l'ordinateur : le site en ligne n'a pas de serveur qui écrit.
const STYLES_PERMIS = ['blocs', 'lateral', 'liste']
function enregistrerStyle() {
  return {
    name: 'atelier-enregistrer-style',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__atelier/style', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; return res.end() }
        let corps = ''
        req.on('data', (m) => { corps += m; if (corps.length > 200) req.destroy() })
        req.on('end', () => {
          try {
            const { style } = JSON.parse(corps || '{}')
            if (!STYLES_PERMIS.includes(style)) { res.statusCode = 400; return res.end('style inconnu') }
            const fichier = join(dossier, 'site.config.js')
            const avant = readFileSync(fichier, 'utf8')
            const apres = avant.replace(/^(\s*style:\s*)["'][a-z]+["']/m, `$1"${style}"`)
            if (apres === avant && !new RegExp(`^\\s*style:\\s*["']${style}["']`, 'm').test(avant)) { res.statusCode = 500; return res.end('ligne style introuvable') }
            if (apres !== avant) writeFileSync(fichier, apres)
            res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: true, style }))
          } catch (e) { res.statusCode = 500; res.end(String(e.message || e)) }
        })
      })
    },
  }
}

// Le chemin du dossier du site, affiché dans le bandeau de l'aperçu (sur l'ordinateur seulement).
// Il n'est JAMAIS mis dans le site en ligne : à la construction (npm run build), il reste vide.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), enregistrerStyle()],
  base: './',
  server: { port },
  define: { __DOSSIER_DU_SITE__: JSON.stringify(command === 'serve' ? dossier : '') },
}))
