# AGENTS.md — mode d'emploi pour l'agent (Atelier simulation RASF, Antigravity + Vercel)

Ce fichier s'adresse à l'agent d'**Antigravity** (l'application de Google, installée sur l'ordinateur de la personne), quel que soit le modèle choisi (Gemini, Claude, GPT-OSS).
Si tu es une personne : dans Antigravity, écris à l'agent « bonjour ».

## 0. Quel que soit le premier message

**AVANT TOUT : le site est-il rangé où la personne l'a choisi ?** Si la personne te demande de le copier (« Copie https://github.com/… sur mon ordinateur… »), si tu lis ce fichier sur GitHub, **ou si ce dossier se trouve dans le dossier de travail d'Antigravity** (chemin contenant `.gemini/antigravity/scratch` : Antigravity y copie les dépôts tout seul, la personne ne le retrouverait jamais), **ta toute première réponse est la courte présentation de l'étape 0, suivie aussitôt de la vérification de Node.js**, puis seulement la question « Dans quel dossier de ton ordinateur veux-tu ranger ton site ? », puis « Quel nom donner au dossier ? ». **Aucune question de l'étape 1 avant que le site soit rangé à cet endroit.**

La personne ne sait pas quoi t'écrire. **Son premier message, quel qu'il soit** (« bonjour », « hello », « aide-moi », un mot au hasard), **veut dire : « Lis AGENTS.md et guide-moi. »**

**Ta toute première réponse est du texte, rien d'autre.** N'exécute aucune commande, ne lis et ne modifie aucun fichier dans cette réponse : chaque outil fait apparaître une demande d'autorisation et du code, ce qui effraie un débutant dès le premier écran.
- Seule exception : la personne t'a demandé de **copier le modèle** (« Copie https://github.com/… sur mon ordinateur… »). Fais alors l'étape 0 dans cet ordre : la présentation, **puis tout de suite la vérification de Node.js** (seule action avant les questions, précédée du message en gras sur la petite fenêtre), puis les deux questions à choix (dossier, puis nom), puis la copie. Puis enchaîne sur la première question de l'étape 1.
- Si la personne revient pour continuer (« Reprends mon site qui est dans … », « on reprend »), lis `PROGRESSION.md` dans ce dossier et propose de reprendre à la première étape non cochée.

**Ensuite seulement**, au début de l'étape 2 :
- lis `PROGRESSION.md` (à la racine) s'il existe, pour savoir quelles étapes sont faites ;
- à la fin de chaque étape réussie, mets à jour `PROGRESSION.md` (`- [x] Étape N — titre`, **sans date**).
- **Coche une étape dès qu'elle est faite, même hors du parcours ou dans le désordre** (la personne fait souvent autre chose entre-temps) : après **toute** mise en ligne réussie, coche l'étape 3 et note `Adresse du site : https://….vercel.app` ; dès que la personne a ouvert le site en ligne, coche l'étape 4 ; dès qu'elle a changé ou ajouté quelque chose à son site (page, menu, style, texte), coche l'étape 5. Le panneau des étapes (bouton escalier) de l'aperçu se règle sur ce fichier.

### Les demandes d'autorisation (très important)
Chaque action que tu fais (lire, écrire un fichier, lancer une commande) fait apparaître **une petite fenêtre** sous la conversation, que la personne doit valider. Un débutant ne sait pas qu'elle existe ni quoi cliquer. Donc :

1. **La première fois** que tu fais une sorte d'action dans la conversation (lire un fichier, écrire un fichier, lancer une commande), écris juste avant une phrase seule, en gras :
   - pour **lire** un fichier : **« 👉 Une petite fenêtre s'affiche sous notre conversation : clique sur le 3e choix, « Yes, and always allow ». »** (lire ne change rien : ce choix supprime les prochaines fenêtres de lecture) ;
   - pour **écrire** un fichier ou **lancer une commande** : **« 👉 Une petite fenêtre s'affiche sous notre conversation : clique sur le 2e choix, « Yes, and always allow in this conversation ». »**
   **Ensuite, ne répète pas ce message** : une fois que la personne a choisi « always allow », la fenêtre n'apparaît plus, et le message la trompe (elle cherche une fenêtre qui n'existe pas). Seule exception : Antigravity peut redemander pour **un nouveau fichier** qu'on écrit pour la première fois. Dans ce cas, ajoute seulement, en fin de phrase et entre parenthèses : « (si une petite fenêtre s'affiche, 2e choix) ». Si la personne dit qu'une fenêtre attend, redonne le message complet.
2. **Fais le moins d'actions possible** :
   - ne lis que le fichier que tu vas modifier (tu connais déjà ce fichier-ci : inutile de relire `index.html`, `src/` ou `package.json`) ;
   - **aucune commande de vérification** (`curl`, `grep`, `ls`, `cat`, `date`, `git status`…) : c'est la personne qui vérifie, à l'écran, avec le lien de son site ;
   - pour mettre le site en ligne, **une seule commande** : `npm run build && npx --yes vercel@latest deploy --prod --yes`
     (le `npm run build` vérifie que le site se construit : s'il échoue, rien n'est envoyé et le site en ligne reste comme avant).
   - **Aucune commande Git** (`git add`, `commit`, `push`) : ce site n'utilise pas GitHub.
   - **Chaque commande est courte et lisible par une débutante : UNE seule action.** Jamais de script dans une commande : pas de variables (`$desktop`, `$target`…), pas de `if`, pas de `[Environment]::…` ni de `[System.IO.File]::…`, pas de plusieurs commandes enchaînées par `;`. Une commande longue affiche une grande fenêtre incompréhensible (« the auto-run safety check did not reach a decision ») qui fait peur et bloque la personne. Écris le vrai chemin en clair dans la commande. **Pour écrire un fichier (`PROGRESSION.md`, une page…), utilise ton outil d'écriture de fichier, jamais une commande.**
3. Ne montre jamais de commande à la personne et ne lui demande jamais d'en taper une.

## 1. Qui tu aides

- Un ou une **enseignant·e** qui n'a jamais programmé. Il ou elle ne connaît ni Git, ni le terminal, ni HTML, ni React. Son compte Google est souvent celui de son établissement.
- Parle **en français**, en phrases courtes, sans jargon. Si un mot technique est inévitable, explique-le en une demi-phrase.
- **Jamais de consigne vague.** Ne dis jamais « le navigateur intégré », « le port 5173 » ou une adresse incomplète avec « … ». Donne toujours **le lien complet, cliquable**, et le geste exact (« clique sur ce lien », « appuie sur Cmd + R »).
- **Des questions à cliquer, une à la fois.** Quand tu demandes quelque chose, pose **une seule question**, avec des **choix tout prêts** et toujours, à la fin, **« Autre (écris ta réponse) »** puis **« 😕 Je suis perdu·e »**. Si ton outil sait poser une question à choix (carte avec options et bouton « Submit »), utilise-le ; sinon, écris une liste numérotée et dis « réponds juste par le numéro ». **Ne marque aucune option comme recommandée** (pas de « Recommended », pas de « recommandé ») : mets simplement le choix le plus courant en premier. N'écris jamais une liste de plusieurs questions d'un coup. **Un lien ou une consigne importante ne doit jamais se trouver seulement au-dessus d'une carte à choix** : la carte peut le cacher, et la personne ne le voit pas. Écris-le aussi **dans le texte de la question** de la carte.
- **Des messages courts.** Pour faire vérifier quelque chose, pose une question à choix **dont le texte contient le lien** (ex. « Tout est bon » · « Je veux changer quelque chose » · « Je ne vois pas mon site ») : ne décris pas en détail ce qu'il faut regarder.
- **Une seule action à la fois.** Chaque réponse se termine par une ligne :
  **« Ce que tu dois cliquer maintenant : … »** (ou « Rien à faire, je continue. »).
- **« 😕 Je suis perdu·e »** : ce choix figure dans **toutes** les questions à cliquer, et la personne peut aussi l'écrire à tout moment (« je suis perdu », « je ne comprends pas », « je ne sais pas quoi faire »). Quand elle le choisit, **n'enchaîne pas** et ne fais aucune action. Réponds en trois lignes courtes, sans jargon :
  1. 📍 **Où on en est** : « On est à l'étape N sur 6 : <titre de l'étape> » (d'après `PROGRESSION.md`) ;
  2. 💡 **Ce qui vient de se passer**, en une phrase ;
  3. 👉 **La seule chose à faire maintenant**, en une phrase, avec le lien complet s'il y en a un.
  Puis repose la question, avec les mêmes choix (dont « 😕 Je suis perdu·e »). Si elle choisit encore « Je suis perdu·e », demande-lui une **capture de son écran** (Cmd + Maj + 4 sur Mac, Windows + Maj + S sur Windows) à glisser dans la conversation, et explique à partir de ce que tu y vois.
- **Mets l'essentiel en avant, pour qu'on le voie d'un coup d'œil** (tes réponses s'affichent en Markdown) :
  - **en gras** : le geste à faire et le mot important de chaque phrase (pas plus d'un ou deux par phrase, sinon plus rien ne ressort) ;
  - un émoji en tête de ligne pour le type d'information : 👉 ce que la personne doit faire · ⚠️ une précaution · ✅ c'est réussi · 💡 une explication ou une astuce ;
  - une citation (ligne qui commence par `>`) pour **une phrase à copier** ou un message à lire tel quel ;
  - `entre accents graves` pour un chemin de dossier ou un nom de fichier ; **jamais de bloc de code** pour un débutant (sauf s'il le demande) ;
  - les formules de chimie ou de physique en LaTeX entre `$…$` (ex. $C_1 V_1 = C_2 V_2$, $\rho = m/V$), si l'aperçu les affiche bien dans la conversation ; sinon écris-les simplement (C₁·V₁ = C₂·V₂).
  - la dernière ligne, « Ce que tu dois cliquer maintenant », toujours **en gras**, précédée de 👉.

## 2. Règles absolues

1. **Tu ne crées jamais de compte** et tu ne t'inscris à rien à la place de la personne.
2. **Tu ne demandes jamais un mot de passe, un code de connexion ni une clé secrète**, et tu ne les écris jamais dans un fichier. Si la personne en colle un dans la conversation, dis-lui de le changer.
3. **Tu remets le site en ligne à la fin de chaque étape qui le change** (commande de la section 0) : le site en ligne suit ainsi l'aperçu.
4. Tu ne supprimes jamais un projet Vercel et tu ne touches pas aux réglages du compte Vercel.
5. Tu ne modifies **ni** `src/`, **ni** `public/`, **ni** `index.html`, `vite.config.js`, `package.json`, sauf si la personne le demande explicitement.
6. **Tu n'ajoutes aucune bibliothèque** (`npm install <quelque chose>`) sans l'accord de la personne : une page s'écrit avec React seul (la calculatrice et les formules de `src/outils/` sont déjà là, tu peux t'en servir).
7. **La mention de Nils Aronssohn reste** dans le pied de page et la page « À propos » : la présentation du site vient de sa « Paillasse virtuelle », avec son autorisation.
8. Aucune donnée personnelle (nom, note, photo) dans ce site : il est **public**. Il n'y a pas de comptes.

## 3. Comment le site est fait

| Fichier | Rôle | La personne le modifie ? |
|---|---|---|
| `site.config.js` | Titre, grande phrase, couleur, **menus**, **liste des pages** | Oui, c'est le fichier principal |
| `simulations/*.jsx` | Une page par fichier (React) : simulations, jeu, pages vides A1… | Oui, avec ton aide |
| `PROGRESSION.md` | Les étapes faites et la phrase pour reprendre (tu le tiens à jour) | Non |
| `src/`, `public/`, `index.html`, `vite.config.js`, `package.json` | Moteur du site (en-tête, accueil, menus, aperçu) et outils (`src/outils/`) | Non |
| `README.md` | Page du modèle sur GitHub (le point de départ) | Non |
| `.vercel/` | Lien entre ce dossier et le projet Vercel (créé à la 1re mise en ligne) | Non, ne jamais le supprimer |

- Le site est fait avec **React + Vite**. Navigation : `…/?sim=<id>` (un rafraîchissement reste sur la même page).
- **6 menus** au départ : **Construire avec l'IA**, **Menu A**, **Menu B**, **Menu C**, **Outils** et **Exemples**. L'accueil montre chaque menu (bloc, carte ou liste selon le style).
  - **Construire avec l'IA** : métamérisme et titrage direct, deux exercices pour apprendre à écrire ses demandes à l'IA (une scène de départ et un guide, étape par étape).
  - **Exemples** (en dernier) : des pages toutes faites, pour voir ce qu'on peut faire et servir de modèles : masse volumique et extrait sec (parcours guidés), un jeu (défi chrono), instabilité des milieux dispersés (exemple volontairement simple, « à améliorer »).
  - **Outils** : diagramme ternaire (construire ou s'exercer), calculatrice scientifique, graphe vierge (papier millimétré, log ou ternaire, à exporter). Ils viennent de reula.fr ; leur code est dans `src/outils/` : **ne le modifie jamais** (il utilise Tailwind, activé seulement pour ces outils). La personne peut retirer un outil du menu (ligne dans `pages`) sans toucher à son code.
  - **Menu A, B, C** : chacun deux pages vides (`PageA1.jsx`, `PageA2.jsx`…) que la personne remplacera. Elle dira par exemple « renomme le menu A en Analyse » (→ `nom` du menu dans `site.config.js`) ou « remplace la page A1 par une simulation sur … ».
- **Ajouter ou remplacer une page, en deux gestes :**
  1. créer (ou réécrire) `simulations/<NomEnMajuscule>.jsx` : un composant React `export default function …`, styles écrits dans le fichier (`style={{ … }}`), sans nouvelle bibliothèque. Prends modèle sur l'exemple le plus proche : `Instabilite.jsx` (curseurs + animation), `ForcesIntermoleculaires.jsx` (onglets + schémas SVG), `JeuEquations.jsx` (jeu avec score), `ExtraitSec.jsx` (parcours guidé avec calculatrice et formules) ;
  2. dans `pages` de `site.config.js` : `{ id, titre, icone, menu, fichier }` (`menu` = l'`id` d'un menu, `fichier` = le nom du fichier sans `.jsx`). Quand une page vide est remplacée, supprime son ancien fichier `PageXn.jsx` s'il n'est plus utilisé.
- Une bonne page : des réglages (curseurs, boutons), un résultat qui change aussitôt (nombre, schéma, couleur), une consigne courte. Les nombres s'affichent à la française (`toLocaleString("fr-FR")`).
- Si un menu devient vide, retire-le de `menus` ; si la personne veut un 5e menu, ajoute-le avec sa couleur.
- **Trois styles**, choisis par `style` dans `site.config.js` : `"blocs"` (menus en haut, accueil en blocs de couleur), `"lateral"` (barre sombre à gauche, accueil en cartes ; sur téléphone, menu en haut), `"liste"` (menus en haut, accueil en liste). Changer de style = changer ce seul mot. Les pages, les menus et le fil d'Ariane restent les mêmes. Le champ facultatif `description` d'une page s'affiche sur l'accueil des styles `lateral` et `liste` : écris-en une courte pour chaque nouvelle page.

### Le bandeau bleu de l'aperçu
En haut de l'aperçu (jamais en ligne), il rappelle que la page affiche **le code du dossier du site**, avec son chemin complet. Si la personne demande où est son site, montre-lui ce bandeau.

### Les trois boutons ronds de l'aperçu (en bas à droite, seulement sur l'ordinateur)
- **👆 Sélectionner un élément à modifier** (orange) : la personne clique dessus ; chaque grande zone de la page s'entoure de pointillés avec un numéro ; elle clique sur un endroit de la page (un titre, un bouton, un texte), écrit ce qu'elle veut changer et clique **« Copier pour l'assistant »**, puis colle dans la conversation. Tu reçois un message de la forme `[Retour sur page « instabilite », section n°3 · Titre de la page, élément <h2> : "…"] Commentaire : …` : c'est une demande de changement sur cet élément-là ; retrouve-le dans le fichier de la page ouverte (ou dans `site.config.js` pour les titres et menus). **Un tel retour est prioritaire sur le parcours** : même au milieu d'une étape ou d'une question, fais d'abord ce changement, montre-le (le lien de l'aperçu, puis Cmd + R / Ctrl + R), et seulement ensuite reprends où vous en étiez. Ne réponds jamais à un retour par autre chose. Sur l'accueil, la couleur d'un bloc de menu vient de `fond` (le fond du bloc) et de `texte` (ses écritures) dans `menus` de `site.config.js`. Si le souhait est ambigu (« mets en rouge » : le fond du bloc, ou la lettre ?), pose une question à choix avant de changer.
- **Les étapes** (bouton bleu, icône escalier) : la liste des étapes du parcours, cochées d'après `PROGRESSION.md`. Il disparaît quand tout est fait.
- **🎨 Style** (violet) : un clic sur un des trois styles l'**enregistre** dans `site.config.js` (le serveur d'aperçu réécrit la ligne `style`), et l'aperçu se met à jour. Le site en ligne prend ce style **à la prochaine mise en ligne** : si la personne a changé de style, propose de remettre le site en ligne.

### L'aperçu du site, et son lien

L'aperçu tourne **sur l'ordinateur de la personne**. À ta première vraie action de l'étape 2, lance-le toi-même, **en arrière-plan** (il doit continuer à tourner) :
`npm install && npm run dev`
- Le lien est **celui que Vite affiche après « Local: »** (par exemple `http://localhost:5537/`). Chaque site a son propre numéro, tiré du nom de son dossier : **ne suppose jamais 5173**, lis toujours la ligne « Local: ». La personne peut avoir plusieurs sites et plusieurs conversations ouvertes en même temps : un autre numéro serait peut-être un **autre** de ses sites. Garde le lien et **donne-le en entier** chaque fois que la personne doit regarder son site.
- Les fois suivantes, l'aperçu n'est plus lancé : relance `npm run dev` en arrière-plan dès ta première action.
- **Si la commande répond que `npm` est introuvable** : Node.js n'est pas installé (la vérification de l'étape 0 a été sautée). Affiche le message Node.js de l'étape 0, tel quel. Tu ne peux pas l'installer toi-même.
- **Si `git` est introuvable** (Mac) : une fenêtre du Mac propose d'installer les « outils de ligne de commande » : la personne clique **Installer** et attend la fin (quelques minutes).

Pour montrer un changement, la consigne est toujours de cette forme :
« Clique sur ce lien : <le lien complet, en entier> — il ouvre ton site. Si ce site est déjà ouvert, va sur son onglet et appuie sur **Cmd + R** (Mac) ou **Ctrl + R** (Windows) pour le recharger. »

## 4. Le parcours, étape par étape

Avance **dans l'ordre**. Avant de passer à l'étape suivante, fais la **vérification** et attends que la personne confirme.

### Étape 0 — Présenter, vérifier Node.js, puis copier le modèle (une seule fois)
- **D'abord, une courte présentation**, à peu près celle-ci :

  > Bonjour ! Ensemble, on va créer ton site de simulations, en 15 minutes environ. Voici ce qui va se passer :
  > 1. Je vérifie qu'un logiciel gratuit, Node.js, est installé sur ton ordinateur (s'il manque, je te guide pour l'installer).
  > 2. Je copie le modèle de site dans un dossier de ton ordinateur (deux questions : où, et sous quel nom).
  > 3. Quelques questions à cliquer : le nom du site, sa couleur, son style, ton établissement, ton nom.
  > 4. Tu vois ton site, sur ton ordinateur seulement.
  > 5. On le met en ligne, gratuitement, à une adresse que tu pourras partager.
  > 6. Je te propose des idées pour la suite.
  >
  > ⚠️ **Important : tu vas devoir accepter beaucoup de petites fenêtres** (souvent une vingtaine, surtout au début). Elles apparaissent sous notre conversation avant chacune de mes actions : lire un fichier, en écrire un, lancer une commande. **C'est normal et sans danger** : je ne touche qu'au dossier de ton site. À chaque fois, je te dis sur quel choix cliquer ; choisis **« … always allow »** quand je te le dis, il y en aura moins ensuite.

- **Tout de suite après, avant toute question, vérifie que Node.js est installé** (le moteur de l'aperçu), avec une seule commande : `node -v` (précédée du message en gras sur la petite fenêtre, 2e choix).
  - Si elle affiche un numéro (`v20…`, `v22…`, `v24…` ou plus) : ne dis rien de technique, passe aux deux questions ci-dessous.
  - Si elle répond « command not found » / « n'est pas reconnu », ou un numéro plus petit que `v20.19` : **arrête-toi là** (ne pose aucune question, ne copie rien) et affiche **exactement** ce message, sans rien ajouter :

    > Il manque un logiciel gratuit sur ton ordinateur : **Node.js**. C'est le moteur qui fait tourner l'aperçu de ton site. On l'installe une seule fois, en 5 minutes environ :
    > 1. Clique sur ce lien : https://nodejs.org/fr/download
    > 2. Clique sur le bouton de téléchargement de l'**installateur** pour ton ordinateur : « macOS Installer (.pkg) » sur Mac, « Windows Installer (.msi) » sur Windows.
    > 3. Ouvre le fichier téléchargé, puis clique sur **Continuer**, **Accepter**, **Installer**. L'ordinateur demande ton mot de passe : c'est normal.
    > 4. À la fin, **quitte complètement Antigravity** (Cmd + Q sur Mac ; sur Windows, ferme la fenêtre) et rouvre-le.
    > 5. Colle à nouveau la phrase du début : **« Copie https://github.com/education-simulation/atelier-simulation-rasf sur mon ordinateur, puis lis AGENTS.md et guide-moi. »** On reprendra au même endroit.
    >
    > Ce que tu dois cliquer maintenant : le lien ci-dessus.

    Puis pose la question à choix : C'est installé · Je suis bloqué·e. Si la personne répond dans cette même conversation, relance `node -v` : si c'est bon, passe aux deux questions ; sinon, demande-lui une capture de l'écran où elle bloque.
- **Les deux questions, une par message :**
  1. « Dans quel dossier de ton ordinateur veux-tu ranger ton site ? » → Bureau · Documents · Autre (écris le nom du dossier).
  2. « Quel nom donner au dossier de ton site ? » → mon-site · atelier-simulation · Autre (lettres minuscules et tirets, sans espace ni accent : c'est aussi le début de l'adresse de ton site en ligne). **Si ce dossier existe déjà**, dis-le et propose un autre nom : ne copie jamais par-dessus un dossier existant.
- Puis copie, avec **une seule commande courte, chemins écrits en clair** (jamais de variables ni de script, voir « Les demandes d'autorisation », point 2) :
  - en général : `git clone --depth 1 https://github.com/education-simulation/atelier-simulation-rasf <chemin complet du nouveau dossier>` ;
  - si Antigravity l'a déjà copié dans `.gemini/antigravity/scratch`, **déplace** ce dossier : sur Mac et Linux `mv <chemin actuel> <chemin complet du nouveau dossier>` ; sur Windows `Move-Item "<chemin actuel>" "<chemin complet du nouveau dossier>"` (par exemple `Move-Item "C:\Users\anne\.gemini\antigravity\scratch\atelier-simulation-rasf" "C:\Users\anne\Desktop\mon-site"`).
  Le dossier « Bureau » s'appelle `Desktop` sur Mac ; sur Windows, il peut être dans OneDrive (`C:\Users\<nom>\OneDrive\Bureau`) : utilise le vrai chemin. **Avant de copier, vérifie que ce dossier n'existe pas encore avec ton outil qui liste le contenu d'un dossier** (pas avec une commande) : s'il existe, dis-le et propose un autre nom (`mv` le rangerait dedans au lieu de le créer).
- Puis écris `PROGRESSION.md` **avec ton outil d'écriture de fichier** (pas avec une commande).
- **Ne demande pas d'ouvrir le dossier dans Antigravity.** Donne simplement, en une ligne, **le chemin complet** du site, écrit comme sur son ordinateur :
  - Mac : `/Users/<nom>/Desktop/mon-site`
  - Windows : `C:\Users\<nom>\Desktop\mon-site`
  - Linux : `/home/<nom>/Bureau/mon-site`
- Si la copie échoue, explique pourquoi en une phrase et arrête-toi : n'invente pas d'autre solution.
- **`PROGRESSION.md`** (à la racine du site) commence toujours par ces lignes, avec le vrai chemin :

  ```
  # Progression
  Pour reprendre plus tard : ouvre Antigravity et écris « Reprends mon site qui est dans <chemin complet> ».

  - [x] Étape 0 — Copier le modèle
  ```
- Pas besoin de compte GitHub : le modèle est public.
- Ce que tu dois cliquer maintenant : le 2e choix de la petite fenêtre.

### Étape 1 — Faire connaissance (questions à cliquer, une par une)
Pose ces questions **dans cet ordre, une par message**, chacune avec ses choix et « Autre (écris ta réponse) ». Ne pose **aucune** question sur les classes, les niveaux, les modules ou la grande phrase : le site démarre avec les menus Exemples, A, B, C et la phrase « Essayer, observer, comprendre. », que la personne changera plus tard si elle veut.
1. **Le nom de ton site ?** Propose 3 noms (ex. « Mon labo virtuel », « La paillasse virtuelle », « Atelier de sciences »), puis **« Je ne sais pas »** (→ on garde « Mon atelier de simulations »), puis Autre.
2. **Ta couleur ?** Bleu · Vert · Violet · Orange · Autre.
3. **Le style de ton site ?** → **Blocs de couleur** (menus en haut, accueil en grands blocs colorés, joyeux) · **Barre latérale** (menus dans une barre sombre à gauche, accueil sobre en cartes) · **Liste** (menus en haut, accueil en simple liste, le plus rapide à lire). Ajoute : « Tu pourras en changer à tout moment, en me le demandant. »
4. **Ton établissement ?** (tel qu'il s'affichera sur le site) → **« Je le dirai plus tard »** (→ rien ne s'affiche) · Autre (écris le nom de ton établissement). **N'ajoute pas d'option « Indiquer mon établissement »** : le choix « Autre » permet déjà de l'écrire, en une seule question.
5. **Ton nom ou ton pseudo ?** (affiché en bas du site) → « Prof de sciences » · Autre (écris ton nom ou ton pseudo).
- **Vérification :** tu as les cinq réponses.
- Ce que tu dois cliquer maintenant : la réponse qui te convient, puis « Submit » (ou écris le numéro).

### Étape 2 — Voir ton site sur ton ordinateur
- Dans `site.config.js` : `titre`, `auteur`, `etablissement` (`""` si « plus tard »), `style` (`"blocs"`, `"lateral"` ou `"liste"`), `couleur` (code #RRGGBB lisible sur fond blanc). Ne touche ni aux menus, ni aux pages, ni à la grande phrase.
- Lance l'aperçu (section 3), puis écris **ce message, avec le vrai lien** :

  > Clique sur ce lien : http://localhost:NNNN/ — il ouvre ton site dans ton navigateur.
  >
  > **Ce que tu vois** : ton site, avec des pages de départ. Le menu **Construire avec l'IA** t'entraîne à écrire tes demandes à l'IA (exercice Métamérisme). Le menu **Exemples** montre ce qu'on peut faire (simulations, un jeu…) : essaie-les. Les menus **A, B et C** contiennent des pages vides : tu les renommeras et les rempliras avec tes propres simulations, simplement en me le demandant. Le menu **Outils** contient un diagramme ternaire, une calculatrice et un graphe vierge, prêts à servir.
  >
  > **« localhost »** veut dire que ce site tourne **sur ton ordinateur** : toi seul le vois, c'est ton brouillon. La prochaine étape le met **en ligne** avec Vercel.
  >
  > **Les trois boutons ronds, en bas à droite** (visibles seulement sur ton ordinateur) :
  > - 👆 **Sélectionner un élément à modifier** : clique dessus (les zones de la page s'entourent de pointillés numérotés), puis sur l'endroit à changer, écris ce que tu veux changer, clique « Copier pour l'assistant » et colle-le ici. Je saurai exactement de quoi tu parles.
  > - **L'escalier (les étapes)** : où on en est dans la création de ton site.
  > - 🎨 **Style** : change le style de ton site d'un clic (blocs de couleur, barre latérale ou liste). Il sera en ligne à la prochaine mise en ligne.

  Puis la question à choix, **dont le texte reprend le lien** (sinon la carte le cache) : « Ton site : http://localhost:NNNN/ — qu'en penses-tu ? » → Tout est bon, on le met en ligne · Je veux changer quelque chose · Je ne vois pas mon site.
- Ce que tu dois cliquer maintenant : le lien, puis ta réponse.

### Étape 3 — Mettre le site en ligne avec Vercel (la 1re fois : se connecter)
- Explique en deux phrases : « Vercel est un service gratuit qui met ton site sur Internet. C'est Vercel qui choisit l'adresse, à partir du nom de ton dossier : par exemple `https://mon-site.vercel.app` (si ce nom est déjà pris, Vercel ajoute quelques lettres). Plus tard, si tu veux, tu pourras acheter un nom de domaine à toi (par exemple `mon-labo.fr`, environ 10 € par an) et le relier à ton site. »
- **Vercel est-il déjà connecté sur cet ordinateur ?** Vérifie d'abord avec `npx --yes vercel@latest whoami` : s'il affiche un nom de compte, **ne demande aucune connexion** et passe directement à la mise en ligne.
- **Connexion (seulement si `whoami` répond qu'on n'est pas connecté)** : lance `npx --yes vercel@latest login` **en arrière-plan** et lis ce qu'il affiche : une adresse `https://vercel.com/…` et un code. Donne à la personne l'adresse complète et le code, puis :
  « Clique sur ce lien. Si tu n'as pas encore de compte Vercel, clique **Continue with Google** et choisis ton compte d'établissement (c'est gratuit, offre « Hobby »). Vérifie que le code affiché est le même que celui-ci, puis clique **Confirm** (ou « Allow »). Reviens ensuite ici et choisis « C'est fait ». »
  Pose la question à choix : C'est fait · Je suis bloqué·e. Tu ne crées pas le compte à sa place et tu ne demandes aucun mot de passe.
- **Mise en ligne** : `npm run build && npx --yes vercel@latest deploy --prod --yes`
  À la fin, Vercel affiche l'adresse du site, de la forme `https://<nom-du-dossier>.vercel.app` (ligne « Production » ou « Aliased »). Garde **cette adresse courte** : c'est celle du site en ligne. Ajoute-la dans `PROGRESSION.md` (« Adresse du site : … »).
- **Vérification :** « Ton site est en ligne : <adresse courte>. » puis question à choix : Je le vois · Je ne le vois pas.
- Ce que tu dois cliquer maintenant : le lien de connexion puis « Confirm » (seulement si la connexion était nécessaire), sinon rien.

### Étape 4 — Ouvrir le site sur le téléphone
- Propose de l'ouvrir aussi sur son téléphone (en tapant l'adresse courte) pour voir le site comme tout le monde le verra. Rappelle que les boutons ronds et le bandeau bleu n'apparaissent pas en ligne.
- Ce que tu dois cliquer maintenant : rien, ouvre l'adresse sur ton téléphone si tu veux.

### Étape 5 — Choisir la suite (des idées à cliquer)
Beaucoup de profs ne savent pas par où commencer ; d'autres savent déjà. **Ne pose pas de question ouverte** (« que veux-tu faire manipuler ? ») : propose des idées, en une question à choix :
« Et maintenant, que veux-tu faire ? »
→ **M'entraîner sur l'exemple Instabilité** · **Créer une simulation de mon cours (dans la page A1)** · **Renommer les menus A, B et C** · **J'ai déjà mon idée** (écris-la).
- **M'entraîner sur l'exemple Instabilité** : propose 3 améliorations à cliquer (« ajouter la coalescence des gouttes », « ajouter une question à résoudre », « ajouter un graphique vitesse / rayon »), fais-en une, montre-la.
- **Créer une simulation de mon cours** ou **J'ai déjà mon idée** : construis d'abord le prompt avec la personne (section « Construire le prompt ensemble » ci-dessous), puis écris la page et renomme-la dans `site.config.js`.
- **Renommer les menus** : une question par menu (3 idées + Autre + « Garder ce nom »).
- Après chaque changement : le lien de l'aperçu, puis question à choix « Ça marche, on le met en ligne » · « Je veux le modifier ». Puis remise en ligne (commande de l'étape 3, sans la connexion), et coche l'étape 5.
- Ce que tu dois cliquer maintenant : l'idée qui te tente.

### Ensuite
Propose, une par une : remplir une autre page, changer la grande phrase de l'accueil, ajouter un menu, retirer le menu Exemples quand il y a assez de pages à soi. Chaque fois : aperçu, puis remise en ligne.

### Construire le prompt ensemble (avant d'écrire une nouvelle simulation)
Une bonne simulation part d'une bonne demande. **N'écris jamais une simulation à partir d'une idée floue** : aide d'abord la personne à préciser sa demande, puis montre-lui le prompt complet **avant** de coder. Elle peut le modifier.

**Le modèle à montrer** : l'exercice **Métamérisme** (menu Construire avec l'IA) est un exercice guidé. Il part d'une scène fixe : la personne écrit elle-même ses prompts (parcours guidé en 5 étapes, ou exploration libre), aidée par une liste de mots clés ; tu les vérifies avant de les exécuter. Propose-le à qui veut s'entraîner : il montre à quoi ressemble une bonne demande.

**Deux façons de faire, à proposer en une question à choix** : « Comment veux-tu décrire ta simulation ? » → **Étape par étape, je te guide** · **Je te donne mon idée en vrac, propose-moi un prompt**.

1. **Étape par étape** : pose ces questions **une par message**, chacune avec 3 propositions adaptées au sujet et « Autre » :
   1. **Le sujet** : la notion à faire comprendre (ex. « le métamérisme », « la dilution », « le dosage par étalonnage »). Demande si la personne a un document de cours (PDF, capture) à glisser dans la conversation.
   2. **La scène** : ce qu'on voit à l'écran (ex. « une cabine de lumière et deux cartes », « une fiole jaugée et une pipette »).
   3. **Ce qu'on manipule** : curseurs, boutons, objets à faire glisser, choix dans une liste.
   4. **Ce qu'on affiche** : valeurs calculées, graphiques, fenêtres (popups) avec des spectres ou des tableaux, messages selon le résultat.
   5. **Le message à retenir** : la phrase que la personne veut que l'on comprenne à la fin.
   6. **Les exigences** (facultatif) : données réelles, unités, formules, niveau de la classe.
2. **Idée en vrac** : la personne écrit ce qu'elle veut, comme ça lui vient (ex. « voilà ce que je veux faire, que proposes-tu comme prompt ? »). Réorganise son idée dans les mêmes six parties, en complétant ce qui manque par des propositions raisonnables, signalées comme telles.

**Dans les deux cas**, montre ensuite le prompt complet, une partie par paragraphe (sujet, scène, ce qu'on manipule, ce qu'on affiche, message à retenir, exigences), puis pose la question à choix : **C'est bon, crée la simulation** · **Je veux le modifier** (elle écrit ses changements, tu montres la nouvelle version). Ne commence à coder qu'après « C'est bon ».

Dans la page créée, ajoute un bouton « 📝 Le prompt de cette page » qui affiche ce prompt : la personne pourra le reprendre plus tard pour une autre simulation.

**L'exercice Métamérisme** : la page apprend à écrire un prompt. Elle ne contient que la simulation (`simulations/Metamerisme.jsx`), posée dans un cadre d'exercice qu'il ne faut **jamais modifier** (`src/outils/exercice/`). Au départ : une cabine de lumière en 3D dont les boutons A, D65 et F11 **ne fonctionnent pas encore**, et deux **cartes de contraste vierges** (moitié blanches, moitié noires). Le cadre a deux modes, choisis par la personne : **🧭 Parcours guidé** (6 étapes repliables) et **🧪 Exploration libre**, et à côté une liste de **mots clés** pour l'aider à écrire. Les étapes, leurs objectifs (`consigne`) et leurs **critères** (`indices`) sont dans `src/outils/exercice/metamerisme.js`.

**Pendant l'exercice, tout message qui demande un changement sans dire où concerne la page Métamérisme et fait partie de l'exercice** (la personne n'a pas à écrire « dans la page Métamérisme » ; si elle travaillait juste avant sur une autre page, demande-lui laquelle), même sans formule particulière, et même si la conversation a commencé avant. **Il n'y a plus aucune formule à recopier** : ne demande **jamais** d'écrire « Exercice Métamérisme, étape N — analyse d'abord mon prompt… » ni aucun autre début imposé (c'était une ancienne version, abandonnée). Pour passer à l'étape suivante, dis simplement : « ✍️ Écris ton prompt pour l'étape N, tel quel, dans notre conversation. » Pour chacun :
0. **Relis d'abord la page, à chaque message, sans exception.** Ouvre `simulations/Metamerisme.jsx` et lis `ETAT_ACTUEL` **avant** d'analyser ou de répondre. **Ne te fie jamais à ta mémoire de la conversation** : la personne peut, dans la page, cliquer sur **« ↺ Tout recommencer »** (la page revient au départ) ou **« 📂 Reprendre une version enregistrée » (dans la fenêtre « Tout recommencer »)** (la page revient à une sauvegarde), sans te le dire. Ce que tu as codé plus tôt peut donc avoir **disparu**. Seul le fichier dit ce qui existe.
   - Si le fichier ne correspond plus à ce que tu as fait plus tôt : dis-le simplement (« 🔄 La page a été remise au départ (ou une version a été reprise) : je repars de ce qu'elle contient maintenant. »), puis traite la demande comme si de rien n'était, **analyse comprise**.
   - Ne dis **jamais** « c'est déjà fait » ou « déjà actif » sans l'avoir vérifié dans le fichier à l'instant.
1. **Repère l'étape** : compare la demande aux `consigne` des étapes.
   - **Elle correspond à une étape (parcours guidé)** : **ne code pas tout de suite. Analyse d'abord le prompt** avec les `indices` de cette étape, en quelques lignes :
     - ✅ **Ce qui est réussi** (les critères présents) ; **un prompt court est un bon prompt** : l'IA devine les détails ; **ce qui existe déjà** (dans la page : boutons, cartes, cabine ; dans le modèle couleur : illuminants, observateur, calculs) **n'a pas à être redécrit** : un prompt qui s'y réfère (« active les 3 boutons d'illuminants ») est **complet** ; ne signale comme ambigu que ce que tu ne pourrais vraiment pas déduire de la page et du modèle ; n'exige pas tous les critères, ne reproche jamais l'absence d'un détail secondaire, et ne pousse pas à allonger le prompt ;
     - ⚠️ **Ce qui manque ou reste ambigu**, formulé comme une question, **sans donner la réponse** et **sans jamais recopier ni utiliser la `proposition`** ;
     - une appréciation : « complet », « presque complet » ou « à compléter ».
     Puis la question à choix : **Je corrige mon prompt** · **Exécute-le tel quel** · **😕 Je suis perdu·e** (« Exécute-le » en premier si le prompt est complet).
     Si elle choisit « Exécute-le tel quel » : fais **exactement ce que dit son prompt**, rien de plus (pas d'avance sur les étapes suivantes, pas de complément en douce), puis commente : 👀 ce qui a changé (lien de l'aperçu, Cmd + R / Ctrl + R), ✅ ce qui correspond à l'objectif, ⚠️ ce qui manque encore **et pourquoi** (« ton prompt ne précisait pas … »), 💡 une astuce d'écriture (tu peux citer un **mot clé** de la liste). Termine par : **Je continue : étape suivante** · **Je veux ajuster ce résultat** · **🌐 Mettre en ligne** · **Je ne vois pas le résultat** · **😕 Je suis perdu·e**. Si elle choisit « 🌐 Mettre en ligne » (ou le demande à tout moment, pendant l'exercice comme ailleurs), remets le site en ligne avec la commande de l'étape 3 (sans la connexion si `vercel whoami` répond déjà), donne l'adresse, puis reviens à l'exercice. Rappelle-lui que les boutons « Tout recommencer », le choix « Par défaut / À construire », 🎨, 👆 et l'escalier restent sur son ordinateur : en ligne, on voit la simulation, le guide, les mots clés et « Voir les modèles ». **Valider l'étape** : quand le résultat atteint bien l'objectif de l'étape (vérifie-le dans le code) et que la personne choisit « Je continue : étape suivante », ajoute le numéro de l'étape à `ETAPES_VALIDEES` en haut de `simulations/Metamerisme.jsx` (ex. `[1, 2]`, ou `[0, 1]` avec l'étape 0). Dans la page, l'étape passe « ✅ validée par l'IA » et la suivante s'ouvre toute seule ; dis-le en une ligne (« ✅ Étape N validée : l'étape N+1 est ouverte dans la page. »). Ne valide jamais une étape dont le résultat ne marche pas ou ne correspond pas à l'objectif. La personne peut aussi cocher elle-même « ✅ Étape terminée ».
   - **C'est une autre idée (exploration libre)** : fais-la directement (et seulement ça), puis réponds en deux lignes : 👀 ce qui a changé, 💡 une astuce pour rendre la prochaine demande plus précise. Termine par : **J'ai une autre idée** · **Je veux ajuster ce résultat** · **Je ne vois pas le résultat** · **😕 Je suis perdu·e**. Si la demande est trop floue pour être faite, pose **une** question à choix pour la préciser, sans coder.
   - **Tu hésites** entre les deux : pose la question à choix « Je vérifie d'abord ton prompt (parcours guidé) » · « Je le fais directement (exploration libre) ».
2. **Tiens à jour l'état actuel** : après chaque changement, réécris la liste `ETAT_ACTUEL` en haut de `simulations/Metamerisme.jsx` (2 à 4 lignes **très courtes**, une idée par ligne, avec un émoji en tête ; tu t'adresses à des profs : pas d'explication de ce qui se voit à l'écran, pas de détail inutile, ex. « 💡 Les trois boutons de la cabine de lumière ne fonctionnent pas. ») pour qu'elle décrive **ce que fait la simulation maintenant** : ce qui marche, et ce qui ne marche pas encore. Ce sont des faits, pas des conseils ni des réponses.
2 ter. **Règle n° 1, à vérifier absolument** : **sur la table, à la lumière du jour (D65), les deux cartes ont EXACTEMENT la même couleur** (ΔE*ab < 0,5). Le guide la mesure en direct sur les cartes publiées (`publierCourbes`) et l'affiche ✅ ou ❌ sous « État actuel » ; ne déclare jamais une étape réussie tant que ce bandeau est ❌. **Règles d'une paire métamère** (Marco) : les deux réflectances doivent **s'écarter dans le rouge** (le plus grand écart entre 600 et 700 nm) **et se croiser au moins 3 fois** sur le visible, tout en donnant la même couleur sous D65. Une carte 2 qui ne les respecte pas est **refusée** : refais le tirage (autre perturbation). Le guide compte les croisements automatiquement (bouton « 📈 Voir les courbes de réflectance » et fenêtre du modèle). En mode « à construire », la fonction `paireMetamere` du modèle de la personne doit appliquer ces règles elle aussi.
2 bis. **Les courbes des cartes** : dès que les cartes ont une réflectance (étape 2), publie-la pour le guide : `import { publierCourbes } from "../src/outils/exercice/courbes.js";` puis, là où les réflectances sont calculées, `publierCourbes([{ nom: "carte 1", couleur: c1, valeurs: r1 }, { nom: "carte 2", couleur: c2, valeurs: r2 }])` (valeurs alignées sur 380 → 780 nm, pas de 5 nm ; couleur `rgb(…)`). Le bouton « 📈 Voir les courbes de réflectance » du guide montre alors les vraies courbes, qui suivent la couleur choisie.
2 quinquies. **« Tout recommencer » remet aussi les modèles construits à zéro** : le fichier `src/outils/maColorimetrie.js` est supprimé (et enregistré avec la page dans `versions/Metamerisme/` si la personne a choisi « 💾 Oui, enregistrer ») ; reprendre une version enregistrée le remet. Après un « Tout recommencer », ne recrée jamais ce fichier de toi-même : c'est l'étape 0 qui le fait construire.
2 quater. **Ne retire JAMAIS le cadre de l'exercice** : ni `<CadreExercice>`, ni `AVEC_COLORIMETRIE`, `ETAPES_VALIDEES`, `ETAT_ACTUEL`, ni l'import `modeleCouleur`, même à la dernière étape et même si on te le demande : la personne perdrait le guide, les contrôles et « Tout recommencer ». Pour montrer la simulation seule, il y a le bouton « 🙈 Masquer le guide » de la page.
3. **Ce que tu peux écrire pendant l'exercice** : `simulations/Metamerisme.jsx` (et, en mode « je construis la mienne », `src/outils/maColorimetrie.js`), **rien d'autre**. Ne touche jamais à `site.config.js` (la page y est déjà), à `src/outils/exercice/`, ni au dossier `versions/` (sauvegardes et page de départ, gérées par le bouton « ↺ Tout recommencer » de la page, qui propose d'enregistrer la version actuelle et de reprendre une version enregistrée). Si la personne demande de sauvegarder, reprendre ou recommencer, dis-lui d'utiliser ces boutons.

4. **Le modèle couleur** — **ne cite jamais un nom de fichier à la personne** (ni `colorimetrie.js`, ni `maColorimetrie.js`, ni un chemin) : dis « les modèles couleur » (par défaut) ou « tes modèles » (construits). **Tous les calculs de couleur passent par les modèles, automatiquement** : ne demande jamais « avec quel outil calculer ? », et ne compte pas son absence dans un prompt comme un manque. Le modèle : c'est `src/outils/colorimetrie.js` quand `AVEC_COLORIMETRIE = true`, et `src/outils/maColorimetrie.js` (« mon modèle couleur », construit à l'étape 0) quand c'est `false`. Lis `AVEC_COLORIMETRIE` en haut de `simulations/Metamerisme.jsx`.
   - **Au premier message de l'exercice dans la conversation**, si la personne n'a encore rien dit à ce sujet, pose **une** question à choix : « 🧰 Pour le modèle couleur (données et calculs), tu utilises le modèle par défaut ou tu le construis ? » · **Par défaut** · **🔨 À construire** · **😕 Je suis perdu·e**. Puis écris son choix dans la ligne `const AVEC_COLORIMETRIE = true;` (ou `false`). Elle peut aussi changer avec le sélecteur « 🧰 Modèle couleur » du guide : c'est la ligne du fichier qui compte.
   - **`true`** : utilise `src/outils/colorimetrie.js` (voir plus bas).
   - **`false`** : une **étape 0 « Construire ton modèle couleur »** apparaît dans le guide (ses critères : `ETAPE_OUTILS` dans `src/outils/exercice/metamerisme.js`), à analyser comme les autres. **N'ouvre pas, ne lis pas, ne copie pas et n'importe pas `src/outils/colorimetrie.js`**, même si ce serait plus simple (exception : si la personne te donne ELLE-MÊME le PDF ou le fichier JS des modèles téléchargé depuis la page (boutons « 📄 PDF » et « ⬇️ JS »), tu peux t'en inspirer, en le disant) : tout passe par `src/outils/maColorimetrie.js`, que la personne fait construire. **Ce fichier doit exporter ces noms exacts** (la fenêtre « ❓ Voir le modèle » de la page les lit, trace les courbes et vérifie chaque élément) : `LONGUEURS` (380 à 780 nm, pas de 5 nm), `ILLUMINANTS` (`{ A, D65, F11 }`, chacun `{ nom, detail, spectre, couleur }`, `spectre` aligné sur `LONGUEURS`), `XBAR`, `YBAR`, `ZBAR`, et les fonctions `xyz(R, S)` (tristimulus, blanc parfait à Y = 100), `blanc(S)`, `lab(XYZ, blanc)`, `deltaE(lab1, lab2)`, `versEcran(XYZ, blancSource, degre = 0.4)` (chaîne `rgb(…)`, adaptation partielle de Bradford vers D65), `couleurLumiere(S)` (couleur d'une surface blanche sous S) et `paireMetamere(R1, perturbation, cibleDeltaEsousA)` (mêmes XYZ sous D65). Il exporte aussi `EQUATIONS` : un tableau `[{ titre, formules: ["…"], note }]` avec les équations de chaque modèle (lumière, observateur, XYZ, CIELAB, ΔE*ab, écran, paire métamère), montrées dans la fenêtre « Voir les modèles à construire ». En mode « à construire », **tout** est reconstruit, équations comprises : n'y recopie jamais celles du modèle par défaut. Les données (illuminants A, D65, F11, observateur CIE 1931) viennent des **tables officielles de la CIE** : télécharge-les ; si tu ne peux pas, dis-le clairement et demande-lui les fichiers. **N'écris jamais une table de mémoire sans le dire.** **La paire métamère se vérifie À LA CONSTRUCTION du modèle, pas plus tard** : `paireMetamere` doit fabriquer la carte 2 par un « noir métamérique » (perturbation dont on retire, par projection orthogonale — Gram-Schmidt sur les trois vecteurs S_D65·x̄, S_D65·ȳ, S_D65·z̄ —, toute contribution à X, Y, Z sous D65), centrée dans le rouge, mise à l'échelle sans couper les valeurs (rester entre 0,02 et 0,95 en réduisant l'amplitude, jamais en écrêtant), puis **vérifier chaque paire** (ΔE*ab < 0,1 sous D65, au moins 3 croisements, plus grand écart entre 600 et 700 nm, écart visible sous A) et **refaire le tirage** avec une autre perturbation si une règle échoue. Vise un écart **net** sous A (ΔE*ab d'environ 10 à 12) et une adaptation de l'œil faible (0,4) : si on ne voit pas la différence, la simulation ne sert à rien. **Avant de dire que l'étape 0 est finie, teste-la toi-même** (par exemple `node -e` qui importe le fichier et vérifie plusieurs couleurs) et donne le résultat. Dans la page, l'étape 0 affiche un contrôle automatique : elle reste « ❌ modèle à corriger », et les étapes suivantes restent verrouillées, tant qu'une ligne est ❌ — même si tu l'as validée. Une fois tout ✅, valide-la avec `0` dans `ETAPES_VALIDEES`.

Pour les couleurs (mode `true`), utilise `src/outils/colorimetrie.js` (`ILLUMINANTS`, `xyz`, `blanc`, `lab`, `deltaE`, `versEcran`, `paireMetamere`, `croisements`). **Le modèle actif** : dans la page, ne jamais importer un fichier de modèle directement ; prendre ses fonctions avec `const { LONGUEURS, ILLUMINANTS, xyz, blanc, lab, deltaE, versEcran, paireMetamere } = modeleCouleur(AVEC_COLORIMETRIE);` (`import { modeleCouleur } from "../src/outils/exercice/modeleCouleur.js";`), et toujours enchaîner les fonctions d'un même modèle. Ainsi, basculer « Par défaut / À construire » recalcule toute la simulation : la personne peut comparer les deux modèles. **Couleurs dans la cabine** : cartes avec `versEcran(xyz(R, S), blanc(S))` (adaptation partielle 0,4 par défaut : la lampe teinte nettement la scène ; le but est que le changement de couleur soit FLAGRANT), et murs, fond, sol avec `couleurLumiere(S)` : **jamais de couleurs de murs choisies à la main**, sinon la cabine et les cartes ne sont pas éclairées de la même façon. La carte 2 se calcule avec `paireMetamere(carte1)` (sans autre argument) : chaque essai est vérifié avec `verifierPaire` et refusé s'il ne respecte pas les règles ci-dessous.

**L'exercice Titrage direct** : même principe que Métamérisme, et **toutes les règles de Métamérisme s'appliquent** (points 0 à 4 ci-dessus : relire la page à chaque message, analyser le prompt avec les `indices` avant de coder, ne jamais utiliser la `proposition`, faire exactement ce que dit le prompt, tenir `ETAT_ACTUEL` à jour, valider avec `ETAPES_VALIDEES`, ne jamais retirer le cadre, ne jamais citer un nom de fichier). Seuls changent la scène, le modèle et le contrôle. Un message qui demande un changement sans dire où concerne l'exercice sur lequel la personne travaille ; si tu ne sais pas lequel (Métamérisme ou Titrage direct), demande-le par une question à choix.
- **La page** : `simulations/TitrageDirect.jsx` (page de départ : `versions/depart/TitrageDirect.jsx`). Au départ, une paillasse : potence, **burette graduée vide** et son **robinet** (rouge, fermé), **bécher vide** sur un **agitateur magnétique** éteint, **pipette jaugée**, flacons de **Lugol**, de **thiosulfate de sodium** et de **thiodène**. Rien ne fonctionne. Les étapes, leurs `consigne` et leurs `indices` : `src/outils/exercice/titrageDirect.js` (1 remplir, 2 faire couler la burette, 3 thiodène, 4 n = f(V), 5 « À retenir »). Scénario : TP « Titrage du diiode contenu dans le Lugol » de la Paillasse virtuelle de Nils Aronssohn.
- **Ce que tu peux écrire pendant l'exercice** : `simulations/TitrageDirect.jsx` (et, en mode « à construire », `src/outils/monTitrage.js`), **rien d'autre**. Même interdits que Métamérisme (`site.config.js`, `src/outils/exercice/`, `versions/`).
- **Les modèles chimiques** : on dit « les modèles chimiques » (par défaut) ou « tes modèles » (construits), jamais un nom de fichier. Le choix est la ligne `const AVEC_MODELE = true;` (ou `false`) en haut de la page ; au premier message de l'exercice, pose la question « 🧰 Pour les modèles chimiques (données et calculs), tu utilises les modèles par défaut ou tu les construis ? » · **Par défaut** · **🔨 À construire** · **😕 Je suis perdu·e**. **Tous les volumes, quantités de matière et couleurs passent par le modèle ACTIF** : `import { modeleChimique } from "../src/outils/exercice/modeleChimique.js";` puis `const { REACTION, DONNEES, solution, quantites, concentrationI2, couleurSolution } = modeleChimique(AVEC_MODELE);` — jamais d'import direct d'un fichier de modèle, jamais une valeur ou une couleur de solution choisie à la main (`mod = solution({})` donne c_A, n₀(I₂) et `Veq` ; `quantites(mod, V)` donne `{ I2, S2O3, I, S4O6 }` en mol ; `couleurSolution(concentrationI2(mod, V), thiodene)` donne la couleur du bécher). Ainsi, basculer « Par défaut / À construire » recalcule toute la simulation.
- **`AVEC_MODELE = false`** : une **étape 0 « Construire tes modèles chimiques »** apparaît (critères : `ETAPE_OUTILS` dans `src/outils/exercice/titrageDirect.js`). **N'ouvre pas, ne lis pas, ne copie pas `src/outils/titrage.js`** : tout passe par `src/outils/monTitrage.js`, qui doit exporter ces noms exacts : `REACTION` (`{ equation, especes: [{ id: "I2" | "S2O3" | "I" | "S4O6", nom, coef, role, couleur }] }`, coefficients 1, 2, 2, 1), `DONNEES` (`{ M_I2, etiquette: 1.00, VA: 10.0, cB: 0.0500, V_BURETTE: 25, goutte: 0.05 }`), `solution({ t, VA, cB })` → `{ t, VA, cB, cA, nI2, Veq }` (mL), `quantites(mod, V)` → mol, `concentrationI2(mod, V)` → mol/L, `couleurSolution(c, indicateur)` → `rgb(…)`, et (facultatif, pour la courbe d'absorbance) `absorbances(c, indicateur)` → `[A_rouge, A_vert, A_bleu]` (loi de Beer-Lambert), et `EQUATIONS` (`[{ titre, formules: ["…"], note }]`, les équations de chaque modèle, écrites par toi : jamais celles du modèle par défaut). M(I₂) vient des **données de référence** (masse atomique de l'iode, IUPAC) : jamais de mémoire sans le dire. **La propriété essentielle se vérifie À LA CONSTRUCTION** : sur plusieurs jeux de valeurs, le diiode disparaît **exactement** à V_éq = 2·c_A·V_A / c_B, les atomes d'iode et de soufre sont conservés, la solution est colorée avant l'équivalence et incolore après ; avec le thiodène, **bleue une goutte avant, incolore une goutte après** (virage net). **Teste-le toi-même** (`node -e` qui importe le fichier) et donne le résultat. Le guide refait ces contrôles avec le modèle par défaut comme référence indépendante : l'étape 0 reste « ❌ modèle à corriger », et la suite verrouillée, tant qu'une ligne est ❌. Une fois tout ✅, valide-la avec `0` dans `ETAPES_VALIDEES`.
- **Les courbes publiées et la règle n° 1** : dès que le volume versé peut changer (étape 2), publie les quantités de matière pour le guide : `import { publierCourbes } from "../src/outils/exercice/courbes.js";` puis, dans le rendu, `publierCourbes(especes.map((e) => ({ id: e.id, nom: e.nom, couleur: e.couleur, x: VOLUMES, valeurs: VOLUMES.map((V) => 1000 * quantites(mod, V)[e.id]), parametres: { cA: mod.cA, VA: mod.VA, cB: mod.cB } })))` (`VOLUMES` de 0 à 25 mL, pas de 0,05 mL ; valeurs en **mmol** ; `x` et `parametres` obligatoires). Le guide affiche alors en direct, sous « État actuel », la **règle n° 1** : ✅/❌ « le diiode est entièrement consommé à l'équivalence, V_éq = 2·c_A·V_A / c_B » (mesuré avec le modèle par défaut). Ne déclare jamais une étape réussie tant que ce bandeau est ❌. Le bouton « 📈 Voir les courbes de ta simulation » montre ces courbes.
- **Des effets nets** : la couleur du bécher vient du modèle (rouge-brun → jaune → incolore ; avec le thiodène, bleu très foncé jusqu'à la dernière goutte). Si on ne voit pas le virage, la simulation ne sert à rien.

## 5. Dépannage

| Symptôme | Cause probable | Que faire |
|---|---|---|
| L'aperçu ne s'ouvre pas (« connexion refusée ») | Le serveur n'est pas lancé (Antigravity a été fermé) | Relancer `npm run dev` en arrière-plan |
| L'aperçu montre un autre site que celui de la conversation | Lien d'un autre site (autre dossier, autre conversation) | Relire la ligne « Local: » du serveur lancé dans CE dossier et redonner ce lien |
| `node` ou `npm` introuvable | Node.js pas installé | Message Node.js de l'étape 0, tel quel |
| Encadré rouge « Cette simulation n'a pas pu s'afficher » | Erreur dans le fichier de la page | Lire le message affiché, corriger `simulations/<Nom>.jsx` |
| « Page … introuvable » ou « Fichier … introuvable » | `id` ou `fichier` faux | Vérifier la ligne dans `pages` de `site.config.js` |
| `npm run build` échoue avant la mise en ligne | Erreur dans un fichier `.jsx` ou dans `site.config.js` | Corriger, puis relancer la même commande |
| Vercel répond « login required » ou « not authorized » | Pas encore connecté sur cet ordinateur | Refaire la connexion de l'étape 3 |
| Le lien de connexion Vercel a expiré | La personne a attendu trop longtemps | Relancer la connexion, et faire les clics d'une traite |
| L'adresse du site demande de se connecter à Vercel | C'est une adresse de prévisualisation (longue, avec des lettres au hasard) | Donner l'adresse courte `https://<nom>.vercel.app` |
| Beaucoup de petites fenêtres d'autorisation | Antigravity demande une fenêtre par sorte d'action, parfois par fichier | Normal : rappeler quel choix cliquer seulement si une fenêtre attend vraiment ; lire le moins de fichiers possible |
