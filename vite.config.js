// Moteur du site (ne pas modifier) : React + Vite.
// base « ./ » : le même site marche sur l'ordinateur (aperçu) et en ligne (Vercel), sans rien régler.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // seulement pour les outils de src/outils/reula/
import { basename, dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { statSync, openSync, readSync, closeSync } from 'node:fs'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, unlinkSync } from 'node:fs'
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

// Page « Guide » de l'aperçu (…/?guide) : elle relit PROGRESSION.md par cette adresse, toutes les 2 secondes.
//   GET /__atelier/progression → { texte } (texte vide si le fichier n'existe pas encore). Lecture seule, aperçu seulement.
function progression() {
  return {
    name: 'atelier-progression',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__atelier/progression', (req, res) => {
        const fichier = join(dossier, 'PROGRESSION.md')
        const texte = existsSync(fichier) ? readFileSync(fichier, 'utf8').slice(0, 20000) : ''
        res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ texte }))
      })
    },
  }
}

// Une petite fenêtre d'autorisation d'Antigravity attend-elle un clic ? (pour la bande de la page de progression)
// Antigravity écrit un journal par conversation : ~/.gemini/antigravity/brain/<id>/.system_generated/logs/transcript.jsonl.
// Quand l'IA lance une action (lire/écrire un fichier, une commande), une ligne « action » s'ajoute ; son résultat ne
// s'écrit qu'APRÈS l'action. Une fenêtre d'autorisation bloque l'action : la dernière ligne reste une action sans résultat.
// C'est une déduction (pas une vraie détection) : une commande longue (copie, installation) y ressemble, d'où un délai plus long.
//   GET /__atelier/attente → { attente: true|false, outil, message } (message : le dernier message de l'IA). Lecture seule, aperçu seulement. En cas de doute : false.
function attenteAutorisation() {
  const dossierBrain = join(homedir(), '.gemini', 'antigravity', 'brain')
  const dernieresLignes = (fichier) => {
    const taille = statSync(fichier).size, n = Math.min(taille, 262144), b = Buffer.alloc(n)
    const fd = openSync(fichier, 'r'); readSync(fd, b, 0, n, taille - n); closeSync(fd)
    return b.toString('utf8').split('\n').filter((l) => l.trim())
  }
  const lire = (l) => { try { return JSON.parse(l) } catch { return {} } }
  const etat = () => {
    if (!existsSync(dossierBrain)) return { attente: false }
    let recent = null
    for (const id of readdirSync(dossierBrain)) {
      const f = join(dossierBrain, id, '.system_generated', 'logs', 'transcript.jsonl')
      if (!existsSync(f)) continue
      const t = statSync(f).mtimeMs
      if (!recent || t > recent.t) recent = { f, t }
    }
    if (!recent || Date.now() - recent.t > 30 * 60 * 1000) return { attente: false }
    const lignes = dernieresLignes(recent.f)
    const d = lire(lignes[lignes.length - 1] || '{}')
    // Le dernier message de l'IA pour la personne (une réponse sans action), pour l'afficher dans la page de progression.
    let message = ''
    for (let k = lignes.length - 1; k >= 0; k--) {
      const m = lire(lignes[k])
      if (m.type === 'PLANNER_RESPONSE' && !(m.tool_calls && m.tool_calls.length) && m.content) { message = String(m.content).slice(0, 4000); break }
    }
    const appel = d.type === 'PLANNER_RESPONSE' && Array.isArray(d.tool_calls) && d.tool_calls[0]
    if (!appel) return { attente: false, message }
    const outil = String(appel.name || '')
    const commande = JSON.stringify(appel.args || {})
    const depuis = Date.now() - Date.parse(d.created_at || '')
    if (!Number.isFinite(depuis)) return { attente: false, message }
    // Commandes longues connues (copie, installation, aperçu) : on attend plus longtemps avant de conclure.
    const longue = outil === 'run_command' && /git clone|npm install|npm i\b|npm run dev|IsDaemon/.test(commande)
    const seuil = longue ? 45000 : outil === 'run_command' ? 12000 : 3500
    return { attente: depuis > seuil, outil, message }
  }
  return {
    name: 'atelier-attente-autorisation',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__atelier/attente', (req, res) => {
        let r = { attente: false }
        try { r = etat() } catch { /* format inconnu : on ne dit rien */ }
        res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify(r))
      })
    },
  }
}

// Sauvegardes d'une page (exercice Métamérisme…) : copies de simulations/<Page>.jsx dans versions/<Page>/, sur l'ordinateur.
//   GET  /__atelier/versions?page=P      → liste des sauvegardes
//   POST /__atelier/versions/sauver      { page, nom }      → copie la page actuelle
//   POST /__atelier/versions/restaurer   { page, fichier }  → remet une sauvegarde (après avoir sauvé l'état actuel)
//   POST /__atelier/versions/outils     { page, avec }     → écrit AVEC_COLORIMETRIE ou AVEC_MODELE (true/false) dans la page
//   POST /__atelier/versions/zero        { page, garder?, modele? } → remet versions/depart/<Page>.jsx (après avoir sauvé l'état actuel si garder)
//                                         et, si demandé, vide journal/<Page>.json (après l'avoir sauvé)
// Comme pour le style : seulement pendant l'aperçu ; le site en ligne n'écrit rien.
function versionsDesPages() {
  const pageOk = (s) => typeof s === 'string' && /^[A-Za-z0-9_-]{1,60}$/.test(s)
  const lireCorps = (req) => new Promise((ok, ko) => {
    let c = ''
    req.on('data', (m) => { c += m; if (c.length > 2000) req.destroy() })
    req.on('end', () => { try { ok(JSON.parse(c || '{}')) } catch (e) { ko(e) } })
  })
  const repondre = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
  const horodatage = () => { const d = new Date(), z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}h${z(d.getMinutes())}-${z(d.getSeconds())}` }
  return {
    name: 'atelier-versions',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__atelier/versions', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://local')
          const action = url.pathname.replace(/^\/+/, '')
          if (req.method === 'GET' && action === '') {
            const page = url.searchParams.get('page')
            if (!pageOk(page)) return repondre(res, 400, { erreur: 'page inconnue' })
            const d = join(dossier, 'versions', page)
            const fichiers = existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.jsx')).sort().reverse() : []
            return repondre(res, 200, { dossier: `versions/${page}`, fichiers })
          }
          if (req.method !== 'POST') return repondre(res, 405, {})
          const { page, nom, fichier, effacerJournal, avec, modele, garder } = await lireCorps(req)
          req.effacerJournal = effacerJournal === true
          if (!pageOk(page)) return repondre(res, 400, { erreur: 'page inconnue' })
          const actuel = join(dossier, 'simulations', `${page}.jsx`), d = join(dossier, 'versions', page)
          if (!existsSync(actuel)) return repondre(res, 404, { erreur: 'page introuvable' })
          mkdirSync(d, { recursive: true })
          // Le modèle CONSTRUIT par la personne (ex. src/outils/maColorimetrie.js) suit la page : sauvegardé avec elle,
          // repris avec elle, et mis de côté par « Tout recommencer » (on repart d'un modèle vierge). Seuls les fichiers ma*.js.
          const fichierModele = typeof modele === 'string' && /^src\/outils\/(ma|mon)[A-Za-z0-9_-]*\.js$/.test(modele) ? join(dossier, modele) : null
          const sauver = (etiquette) => {
            const f = `${horodatage()}-${etiquette}.jsx`; copyFileSync(actuel, join(d, f))
            if (fichierModele && existsSync(fichierModele)) copyFileSync(fichierModele, join(d, `${f}.modele.js`))
            return f
          }
          if (action === 'sauver') {
            const etiquette = String(nom || 'version').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'version'
            return repondre(res, 200, { fichier: sauver(etiquette) })
          }
          if (action === 'outils') {
            // Choix du modèle (par défaut / à construire), écrit dans la page :
            // const AVEC_COLORIMETRIE = true | false; (Métamérisme) ou const AVEC_MODELE = true | false; (autres exercices)
            const texte = readFileSync(actuel, 'utf8'), motif = /const (AVEC_COLORIMETRIE|AVEC_MODELE) = (true|false);/
            if (!motif.test(texte)) return repondre(res, 400, { erreur: 'AVEC_COLORIMETRIE ou AVEC_MODELE introuvable dans la page' })
            writeFileSync(actuel, texte.replace(motif, (_, nom) => `const ${nom} = ${avec === false ? 'false' : 'true'};`))
            return repondre(res, 200, { ok: true })
          }
          if (action === 'restaurer') {
            if (typeof fichier !== 'string' || !/^[A-Za-z0-9_.-]+\.jsx$/.test(fichier) || !existsSync(join(d, fichier))) return repondre(res, 400, { erreur: 'sauvegarde introuvable' })
            const avant = sauver('avant-reprise')
            copyFileSync(join(d, fichier), actuel)
            const modeleSauve = join(d, `${fichier}.modele.js`)
            if (fichierModele && existsSync(modeleSauve)) copyFileSync(modeleSauve, fichierModele)
            return repondre(res, 200, { ok: true, avant })
          }
          if (action === 'zero') {
            const depart = join(dossier, 'versions', 'depart', `${page}.jsx`)
            if (!existsSync(depart)) return repondre(res, 404, { erreur: 'pas de version de départ pour cette page' })
            // garder : la personne a choisi d'enregistrer la version actuelle avant de recommencer (page + modèle construit).
            const avant = garder === false ? null : sauver('avant-recommencer')
            copyFileSync(depart, actuel)
            if (fichierModele && existsSync(fichierModele)) unlinkSync(fichierModele)
            // Option : effacer aussi le journal des prompts (journal/<Page>.json), après l'avoir sauvegardé.
            const journal = join(dossier, 'journal', `${page}.json`)
            if (req.effacerJournal && existsSync(journal)) {
              copyFileSync(journal, join(d, `${horodatage()}-journal-avant-zero.json`))
              writeFileSync(journal, '[]\n')
            }
            return repondre(res, 200, { ok: true, avant })
          }
          return repondre(res, 404, {})
        } catch (e) { return repondre(res, 500, { erreur: String(e.message || e) }) }
      })
    },
  }
}

// Le chemin du dossier du site, affiché dans le bandeau de l'aperçu (sur l'ordinateur seulement).
// Il n'est JAMAIS mis dans le site en ligne : à la construction (npm run build), il reste vide.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), enregistrerStyle(), versionsDesPages(), progression(), attenteAutorisation()],
  base: './',
  server: { port },
  define: { __DOSSIER_DU_SITE__: JSON.stringify(command === 'serve' ? dossier : '') },
}))
