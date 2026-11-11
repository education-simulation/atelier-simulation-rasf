// Moteur du site (ne pas modifier) : React + Vite.
// base « ./ » : le même site marche sur l'ordinateur (aperçu) et en ligne (Vercel), sans rien régler.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { basename } from 'node:path'

// Chaque site a SON numéro d'aperçu, tiré du nom de son dossier (entre 5200 et 5899) :
// deux sites ouverts en même temps ne se marchent pas dessus, et un site garde toujours la même adresse.
// Si ce numéro est déjà pris, Vite en choisit un autre et l'affiche (« Local: … »).
const nom = basename(process.cwd())
const port = 5200 + [...nom].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 700, 7)

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port },
})
