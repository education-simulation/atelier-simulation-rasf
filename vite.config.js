// Moteur du site (ne pas modifier) : React + Vite.
// base « ./ » : le même site marche sur l'ordinateur (aperçu) et en ligne (Vercel), sans rien régler.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // seulement pour les outils de src/outils/reula/
import { basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Le dossier du site = celui qui contient ce fichier.
const dossier = dirname(fileURLToPath(import.meta.url))

// Chaque site a SON numéro d'aperçu, tiré du nom de son dossier (entre 5200 et 5899) :
// deux sites ouverts en même temps ne se marchent pas dessus, et un site garde toujours la même adresse.
// Si ce numéro est déjà pris, Vite en choisit un autre et l'affiche (« Local: … »).
const nom = basename(dossier)
const port = 5200 + [...nom].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 700, 7)

// Le chemin du dossier du site, affiché dans le bandeau de l'aperçu (sur l'ordinateur seulement).
// Il n'est JAMAIS mis dans le site en ligne : à la construction (npm run build), il reste vide.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: './',
  server: { port },
  define: { __DOSSIER_DU_SITE__: JSON.stringify(command === 'serve' ? dossier : '') },
}))
