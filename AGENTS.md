# AGENTS.md — l'installation du site (à lire en premier)

Tu es l'agent d'Antigravity. Tu aides une **prof débutante** à installer son site de simulations. Ce fichier ne contient **que l'installation**, jusqu'à l'ouverture de la **page guide**. La suite est dans **`CONSIGNES.md`** : tu le liras à la fin (étape 8).

## Les règles de l'installation
- **Tout en français.** N'écris **rien** entre tes actions (ni « je vais… », ni anglais). Tu ne parles à la personne que par tes **messages à choix numérotés**, qui terminent ton tour.
- **Comment poser une question (partout, toujours)** : **n'utilise JAMAIS ton outil de question** (pas de carte avec « Submit »). Écris un **message texte**, qui **termine ton tour** (tu attends la réponse), sous cette forme exacte :

  **💬 Pour toi :** <la question, en une ou deux phrases ; un lien éventuel en entier>
  1. <premier choix>
  2. <deuxième choix>
  3. 😕 Je suis perdu·e
  ✍️ *Écris le numéro de ta réponse dans la zone de message, en bas, puis appuie sur Entrée.*

  Pas de « (Recommended) » ni de « recommandé » dans les choix (sauf « Bureau (recommandé) ») ; le choix le plus courant en premier. La personne répond « 1 », « 2 »… ou écrit autre chose avec ses mots : comprends-la. Si elle écrit « je suis perdu·e » à n'importe quel moment, aide-la (voir « Je suis perdu·e »).
  Dans ce fichier, « question à choix » veut dire **ce message numéroté**. Ne mets jamais de nom de fichier ni de commande dans un message.
- **Le plus vite possible** : aucune commande de vérification (`ls`, `pwd`, `which`, `cat`), aucune lecture de fichier (ni `package.json`, ni `PROGRESSION.md`), aucune question en plus.
- **Une commande = une seule action courte**, chemin écrit en clair, sans `;`, sans variables, sans script.
- **Hors du bac à sable dès le premier essai** (option « BypassSandbox » de ton outil de commande) : `git clone`, `mv`, `npm install`, `npm run dev`. Dans le bac à sable, elles échouent ou restent bloquées.
- **N'ouvre aucune page toi-même** (ni `open`, ni `Start-Process`, ni outil de navigateur) : tu donnes les liens dans une question, la personne clique.
- **Ne parle pas de Vercel** pendant l'installation : la page guide s'en occupe.

## Les 8 étapes, dans cet ordre, sans t'arrêter entre deux

**1. La présentation** — question à choix, texte exact :
« Bonjour ! On va créer ton site de simulations ensemble, en 15 minutes environ : je le copie sur ton ordinateur, puis je t'ouvre une page guide en français. 👉 Des petites fenêtres en anglais vont s'afficher : clique toujours sur « Yes, and always allow » (le 3e choix), c'est sans danger. »
Choix : 1. **C'est parti !** · 2. **😕 Je suis perdu·e**

**2. Node.js** — commande `node -v`.
- Un numéro `v20.19` ou plus : passe à l'étape 3, sans rien dire.
- Sinon (« command not found », « n'est pas reconnu », numéro plus petit) : arrête l'installation et pose cette question à choix :
  « Il manque un logiciel gratuit, Node.js (le moteur de l'aperçu de ton site). 1) Clique sur ce lien : https://nodejs.org/fr/download 2) Télécharge l'installateur (« macOS Installer » sur Mac, « Windows Installer » sur Windows), ouvre-le et clique Continuer, Accepter, Installer. 3) Quitte complètement Antigravity, rouvre-le et colle à nouveau la phrase du début. »
  Choix : 1. **C'est installé** · 2. **😕 Je suis bloqué·e**. Si « C'est installé » dans cette conversation : relance `node -v`.

**3. Le dossier** — question à choix « Dans quel dossier de ton ordinateur veux-tu ranger ton site ? »
Choix : 1. **Bureau (recommandé)** · 2. **Documents** · 3. **😕 Je suis perdu·e**. Rien d'autre. **Pas de question sur le nom** : le dossier s'appelle `mon-site`.
- Bureau : `Desktop` sur Mac ; sur Windows, souvent `C:\Users\<nom>\OneDrive\Bureau` (prends le vrai chemin).
- Si `mon-site` existe déjà à cet endroit, prends `mon-site-2` (puis `mon-site-3`), sans rien demander. Ne copie jamais par-dessus un dossier existant.

**4. La copie** — une commande, hors du bac à sable :
- si le modèle est déjà dans `.gemini/antigravity/scratch` : Mac/Linux `mv <chemin du scratch> <dossier>/mon-site` ; Windows `Move-Item "<chemin du scratch>" "<dossier>\mon-site"` ;
- sinon : `git clone --depth 1 https://github.com/education-simulation/atelier-simulation-rasf <dossier>/mon-site`.

**5. L'installation** — `npm install`, avec le dossier du site comme dossier de travail, hors du bac à sable, **au premier plan** : attends qu'il ait fini.

**6. L'aperçu** — `npm run dev`, avec le dossier du site comme dossier de travail, hors du bac à sable, **en arrière-plan** (il doit continuer à tourner). **N'attends pas sa sortie** : l'adresse est connue d'avance.

**7. La page guide** — question à choix, avec le lien **complet** dans le texte :
« ✅ Ton site est installé ! Ta page guide est prête, en français : 👉 clique sur ce lien : http://localhost:5799/?guide — garde cet onglet ouvert, il te montre où tu en es et traduit les petites fenêtres en anglais. »
Choix : 1. **J'ai ouvert ma page guide** · 2. **😕 Je suis perdu·e**
- Adresse : `mon-site` → **http://localhost:5799/?guide** ; `mon-site-2` → `http://localhost:5484/?guide` ; `mon-site-3` → `http://localhost:5485/?guide`. (Seulement si la page ne s'ouvre pas : lis la ligne « Local: » de l'aperçu et redonne ce lien.)
- « Je suis perdu·e » : redis en une phrase de cliquer sur le lien bleu (il s'ouvre à droite, dans Antigravity), puis repose la question.

**8. La suite** — seulement maintenant :
1. écris `PROGRESSION.md` à la racine du site, avec ton **outil d'écriture de fichier** :
   ```
   # Progression
   Pour reprendre plus tard : ouvre Antigravity, ouvre une nouvelle conversation et écris « Reprends mon site, dossier mon-site sur le Bureau ». (Dossier du site : <chemin complet>)

   - [x] Étape 0 — Copier le modèle
   ```
2. **lis `CONSIGNES.md` en entier** (il est long : lis-le jusqu'au bout, en plusieurs fois s'il le faut) ;
3. enchaîne sur son **étape 1** (questions à choix : le nom du site, sa couleur…).

## Si la personne revient (« Reprends mon site… »)
Le site existe déjà (dossier qu'elle donne ; sinon `Desktop/mon-site`, puis `Documents/mon-site`). Ne copie rien : fais les étapes **6 et 7** (aperçu, puis la question avec le lien du guide), puis lis `PROGRESSION.md` et `CONSIGNES.md`, et reprends à la première étape non cochée.

## Une page d'exercice te renvoie ici (« relis AGENTS.md, section … »)
Les sections des exercices (Métamérisme, Titrage direct…) sont dans **`CONSIGNES.md`** : lis-les là.
