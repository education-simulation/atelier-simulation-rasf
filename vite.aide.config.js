// Construit les pages d'aide en ligne (aide/ → docs/, servi par GitHub Pages). Lancer : npm run aide
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  root: 'aide',
  base: './',
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    rollupOptions: { input: { fenetres: resolve('aide/fenetres.html'), antigravity: resolve('aide/antigravity.html') } },
  },
})
