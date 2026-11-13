# AGENTS.md — l'installation du site (à lire en premier)

Tu es l'agent d'Antigravity. Tu aides une **prof débutante** à installer son site de simulations. Ce fichier ne contient **que l'installation**, jusqu'à l'ouverture de la **page guide**. La suite est dans **`CONSIGNES.md`** : tu le liras à la fin (étape 7).

## Les règles de l'installation
- **Tout en français.** N'écris **rien** entre tes actions (ni « je vais… », ni anglais). Tu ne parles à la personne que par tes **messages à choix numérotés**, qui terminent ton tour.
- **Comment poser une question (partout, toujours)** : **n'utilise JAMAIS ton outil de question** (pas de carte avec « Submit »). Écris un **message texte**, qui **termine ton tour** (tu attends la réponse), sous cette forme exacte :

  ```
  **💬 Pour toi :**

  <la question, en une phrase courte>

  👉 <un lien éventuel, en entier, seul sur sa ligne>

  1. <premier choix>
  2. <deuxième choix>
  3. 😕 Je suis perdu·e

  ✍️ *Écris le numéro de ta réponse (ou ta réponse avec tes mots) dans la zone de message, en bas, puis Entrée. Perdu·e ? Écris simplement « je suis perdu ».*
  ```
  Les trois accents graves ``` ne servent qu'à te montrer la forme : **ne les écris jamais** (sinon le message s'affiche comme du code et le lien n'est plus cliquable).
  **Aère** : une **ligne vide** entre chaque bloc (titre, question, lien, liste, consigne ✍️), sinon tout se colle en un pavé. Une idée par ligne, phrases courtes. Le lien et la consigne ✍️ ne sont **jamais** collés à une autre phrase.

  Pas de « (Recommended) » ni de « recommandé » dans les choix (sauf « Bureau (recommandé) ») ; le choix le plus courant en premier. La personne répond « 1 », « 2 »… ou écrit autre chose avec ses mots : comprends-la. Si elle écrit « je suis perdu·e » à n'importe quel moment, aide-la (voir « Je suis perdu·e »).
  Dans ce fichier, « question à choix » veut dire **ce message numéroté**. Ne mets jamais de nom de fichier ni de commande dans un message.
- **Les liens** : écris toujours la phrase devant le lien, mot pour mot (« 👉 Clique sur ce lien : … », « 👉 Voir à quoi elles ressemblent : … »), jamais l'adresse seule.
- **Le plus vite possible** : aucune commande de vérification (`ls`, `pwd`, `which`, `cat`), aucune lecture de fichier (ni `package.json`, ni `PROGRESSION.md`), aucune question en plus.
- **Une commande = une seule action courte**, chemin écrit en clair, sans `;`, sans variables, sans script.
- **Hors du bac à sable dès le premier essai** (option « BypassSandbox » de ton outil de commande) : `git clone`, `mv`, `npm install`, `npm run dev`. Dans le bac à sable, elles échouent ou restent bloquées.
- **N'ouvre aucune page toi-même** (ni `open`, ni `Start-Process`, ni outil de navigateur) : tu donnes les liens dans une question, la personne clique.
- **Ne parle pas de Vercel** pendant l'installation : la page guide s'en occupe.

## Les 8 étapes, dans cet ordre, sans t'arrêter entre deux

**1. La présentation** — question à choix, aérée exactement ainsi :
```
**💬 Pour toi :**

Bonjour ! Bienvenue dans l'atelier « Je crée des simulations en ligne pour illustrer mon cours ».

Tu te laisses guider tout au long du processus. La première partie est technique, mais pas d'inquiétude : tu n'auras qu'à suivre mes instructions.

Pour t'aider à visualiser les étapes qui mèneront jusqu'à la page qui affichera tes simulations, je te propose d'abord de créer une page « Progression de l'installation de ton interface simulations ». Elle te donnera tout un tas d'infos, mais ce ne sera pas la page finale.
```
Choix : 1. **C'est parti mon kiki** · 2. **En voiture Simone** · 3. **😕 Je suis perdu·e** (1 et 2 veulent dire la même chose : on démarre).

**1 bis. Antigravity en un coup d'œil** — question à choix : « Veux-tu que je te montre comment fonctionne Antigravity ? »
Choix : 1. **Oui, montre-moi** · 2. **Non, on continue** · 3. **😕 Je suis perdu·e**
- « Oui » : question à choix, aérée ainsi :
  ```
  **💬 Pour toi :**

  👉 Clique sur ce lien : https://education-simulation.github.io/atelier-simulation-rasf/antigravity.html

  Choisis « ▶ Démo » (une présentation animée d'environ 1 minute) ou « 🔢 Explorer » (l'écran numéroté, à ton rythme).
  ```
  Choix : 1. **J'ai regardé, on continue** · 2. **😕 Je suis perdu·e**. Puis étape 2.
- « Non » : étape 2, sans rien dire.

**2. Node.js** — commande `node -v`, puis **un message à part**, avant la question du dossier.
- **Un numéro `v20.19` ou plus** : question à choix, aérée ainsi :
  ```
  **💬 Pour toi :**

  ✅ Node.js est bien installé sur ton ordinateur.
  ```
  Choix : 1. **Continuer** · 2. **C'est quoi Node.js ?** · 3. **😕 Je suis perdu·e**
  - « Continuer » → étape 3 (le dossier).
  - « C'est quoi Node.js ? » → explique en deux phrases simples, **au début du message de l'étape 3**, puis pose la question du dossier dans ce même message : « Node.js est un logiciel gratuit qui fait tourner ton interface sur ton ordinateur, comme un moteur : c'est grâce à lui que tu vois ton interface avant de la mettre en ligne. Tu n'as rien à faire avec : il travaille tout seul, en coulisses. »
- **Sinon** (« command not found », « n'est pas reconnu », numéro plus petit) : arrête l'installation et pose cette question à choix :
  « ⚠️ Il manque un logiciel gratuit, Node.js (le moteur qui fait tourner ton interface sur ton ordinateur). 1) Clique sur ce lien : https://nodejs.org/fr/download 2) Télécharge l'installateur (« macOS Installer » sur Mac, « Windows Installer » sur Windows), ouvre-le et clique Continuer, Accepter, Installer. 3) Quitte complètement Antigravity, rouvre-le et colle à nouveau la phrase du début. »
  Choix : 1. **C'est installé** · 2. **😕 Je suis bloqué·e**. Si « C'est installé » dans cette conversation : relance `node -v`.

**3. Le dossier** — question à choix « Dans quel dossier de ton ordinateur veux-tu ranger ton interface ? » (sans redire que Node.js est installé)
Choix : 1. **Bureau (recommandé)** · 2. **Documents** · 3. **😕 Je suis perdu·e**. **Sous la ligne ✍️**, ajoute un trait horizontal (`---`) puis, exactement :
  ```
  🔐 Juste après, des petites fenêtres d'autorisation en anglais vont s'afficher : clique sur « Yes, and always allow » (le 3e choix), puis sur Submit. C'est sans danger.

  👉 Voir à quoi elles ressemblent : https://education-simulation.github.io/atelier-simulation-rasf/fenetres.html
  ```
  Rien d'autre. **Pas de question sur le nom** : le dossier s'appelle `mon-site`.
- Bureau : `Desktop` sur Mac ; sur Windows, souvent `C:\Users\<nom>\OneDrive\Bureau` (prends le vrai chemin).
- **Ne touche JAMAIS à un dossier qui existe déjà** : la personne peut déjà avoir un site (créé dans une autre conversation), qu'il ne faut ni écraser, ni remplir, ni supprimer. **Ne cherche pas à vérifier toi-même** si le dossier existe (dans le bac à sable, le Bureau paraît vide : un `ls` y répond « rien » même quand le dossier est là). C'est la **copie** qui vérifie, à l'étape 4.

**4. La copie** — **toujours avec `git clone`, jamais avec `mv`** (même si le modèle est déjà dans `.gemini/antigravity/scratch`), hors du bac à sable :
`git clone --depth 1 https://github.com/education-simulation/atelier-simulation-rasf <dossier>/mon-site`
- Si git répond « **already exists and is not an empty directory** » : ce dossier est un autre site, **n'y touche pas**. Recommence aussitôt avec `mon-site-2`, puis `mon-site-3`… jusqu'à ce que la copie réussisse. Sans rien demander.
- Garde le nom qui a réussi pour tout le reste (installation, aperçu, page guide, `PROGRESSION.md`, phrase de reprise).
- `git clone` ne remplit jamais un dossier existant : c'est ce qui protège les autres sites. `mv`, lui, rangerait la copie **dans** l'autre site : interdit.

**5. L'installation** — `npm install`, avec le dossier du site comme dossier de travail, hors du bac à sable, **au premier plan** : attends qu'il ait fini.

**6. L'aperçu** — `npm run dev`, avec le dossier du site comme dossier de travail, hors du bac à sable, **en arrière-plan** (il doit continuer à tourner). **Puis lis sa sortie** (quelques secondes suffisent) : la ligne « Local: » donne l'adresse **réelle**. Si le numéro prévu est déjà pris (un autre site, ou le même site déjà ouvert dans une autre conversation), Vite en choisit un autre tout seul : **utilise toujours le numéro de la ligne « Local: »**, jamais un numéro supposé.

**7. Avant le message** (sans rien écrire à la personne, sans t'arrêter) :
1. écris `PROGRESSION.md` à la racine du site, avec ton **outil d'écriture de fichier** :
   ```
   # Progression
   Pour reprendre plus tard : ouvre Antigravity, ouvre une nouvelle conversation et écris « Reprends mon site, dossier <nom du dossier> <sur le Bureau ou dans Documents> : lis d'abord son fichier AGENTS.md ». (Dossier du site : <chemin complet>)

   - [x] Étape 0 — Installer la page guide
   ```
2. **lis `CONSIGNES.md` en entier** (il est long : lis-le jusqu'au bout, en plusieurs fois s'il le faut).

**8. Un seul message, très court : le lien de la page de progression, et rien d'autre** (pas de question, pas de ligne ✍️ : c'est la page de progression qui dit à la personne, dans sa bande verte en bas, d'écrire « continue »). Aéré exactement ainsi :
```
**💬 Pour toi :**

✅ Ta page de progression de l'installation est prête, en français.

👉 Clique sur ce lien : http://localhost:5799/?guide
```
Puis attends. Quand la personne écrit « continue » (ou n'importe quoi d'autre qui veut dire qu'elle est prête), pose la 1re question de l'étape 1 de `CONSIGNES.md` (« Veux-tu personnaliser ton interface maintenant ? »), avec ses choix (1. **Oui, je personnalise** · 2. **Non, je garde les réglages par défaut** · 3. **😕 Je suis perdu·e**) et la ligne ✍️ habituelle.
- Adresse habituelle, selon le nom du dossier (**mais c'est la ligne « Local: » qui fait foi**) : `mon-site` → **http://localhost:5799/?guide** ; `mon-site-2` → `5484` ; `mon-site-3` → `5485` ; `mon-site-4` → `5486` ; `mon-site-5` → `5487` ; `mon-site-6` → `5488` (même forme : `http://localhost:NNNN/?guide`). Si la ligne « Local: » donne un autre numéro, c'est lui qu'il faut écrire dans le lien.
- « Je suis perdu·e » (avant « continue ») : redis en une phrase de cliquer sur le lien bleu (il s'ouvre à droite, dans Antigravity), puis d'écrire « continue ».
- Ensuite, suis `CONSIGNES.md` à partir de la réponse à cette question.
- Le bloc 🔐 sur les petites fenêtres d'autorisation (étape 3) ne sert qu'**avant** la page de progression : une fois qu'elle est ouverte, c'est elle qui le dit (bande rouge). **Ne le répète jamais** dans un message suivant.

## Si la personne revient (« Reprends mon site… »)
Le site existe déjà (dossier qu'elle donne ; sinon `Desktop/mon-site`, puis `Documents/mon-site`). Ne copie rien : relance l'aperçu (étape 6), lis `PROGRESSION.md` et `CONSIGNES.md`, puis **un seul message** : le lien de la page de progression (comme à l'étape 8), et rien d'autre ; quand la personne écrit « continue », pose la question de la première étape non cochée.

## Une page d'exercice te renvoie ici (« relis AGENTS.md, section … »)
Les sections des exercices (Métamérisme, Titrage direct…) sont dans **`CONSIGNES.md`** : lis-les là.
