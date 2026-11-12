# Atelier simulation RASF

Un site de simulations, simple et gratuit, que tu construis en parlant à l'agent d'**Antigravity** (l'application gratuite de Google, avec ton compte Google d'établissement), et que **Vercel** met en ligne gratuitement.

Ton site démarre avec :
- un menu **Construire avec l'IA** : les exercices Métamérisme et Titrage direct, pour apprendre à écrire ses demandes à l'IA ;
- trois menus **A, B et C**, avec des pages vides que tu renommes et remplis en le demandant à l'agent ;
- un menu **Outils** : diagramme ternaire, calculatrice scientifique et graphe vierge (repris de [reula.fr](https://reula.fr/outils)) ;
- un menu **Exemples**, en dernier, rempli de pages toutes faites : masse volumique, extrait sec, un jeu, et un exemple simple pour t'entraîner (instabilité des milieux dispersés).

Sa présentation (menus, page d'accueil en blocs de couleur) vient de la [Paillasse virtuelle](https://paillasse-virtuelle.fr/) de Nils Aronssohn, avec son autorisation.

Pas besoin de compte GitHub. Il te faut seulement **Antigravity**, installé sur ton ordinateur et connecté à ton compte Google.

---

### Pour commencer

1. Ouvre **Antigravity**.
2. **Deux réglages, à faire une seule fois** (ils réduisent beaucoup les petites fenêtres d'autorisation) :
   - **Le mode Auto** : ouvre les réglages (**Settings**), puis **General** → **Global Permissions** → **Permission Preset** → choisis **Auto**. Si ce choix n'apparaît pas, mets à jour Antigravity (sur Windows, version 2.26 ou plus récente) ; s'il n'apparaît toujours pas, ton compte ne le permet pas : garde le réglage proposé.
   - **Le modèle d'IA** : en bas de la conversation, clique sur le nom du modèle et choisis **Gemini 3.8 Flash**, puis **Low**. C'est rapide et suffisant pour ton site. Vérifie ce choix au début de chaque nouvelle conversation.
3. Copie cette phrase (sélectionne-la, puis **Cmd + C** sur Mac ou **Ctrl + C** sur Windows) et colle-la dans la conversation avec l'agent (**Cmd + V** ou **Ctrl + V**) :

   > **Copie https://github.com/education-simulation/atelier-simulation-rasf sur mon ordinateur, puis lis AGENTS.md et guide-moi.**

4. L'agent te présente ce qui va se passer, puis te demande dans quel dossier ranger ton site et quel nom lui donner : clique sur ta réponse. **Pendant qu'il copie, il te fait créer ton compte gratuit Vercel** (https://vercel.com/signup, « Continue with Google ») : c'est lui qui mettra ton site en ligne.
5. **Attends-toi à accepter des petites fenêtres** (une vingtaine si tu n'as pas pu choisir le mode Auto) : elles demandent la permission avant chaque action de l'agent. C'est normal et sans danger ; l'agent te dit à chaque fois sur quel choix cliquer.

L'agent te guide ensuite pas à pas, avec des questions à cliquer : le nom et la couleur de ton site, le voir sur ton ordinateur, le mettre en ligne avec Vercel, puis des idées pour la suite.
Au départ, il vérifie que **Node.js** est installé (le moteur gratuit qui fait tourner l'aperçu de ton site). S'il manque, il te guide pour l'installer en 5 minutes depuis nodejs.org.

### Les fois suivantes

Ouvre Antigravity et écris à l'agent : **« Reprends mon site qui est dans … »**, suivi du chemin de ton dossier. L'agent te l'a donné au début ; il est aussi écrit en haut du fichier `PROGRESSION.md`, dans le dossier de ton site.

---

Modèle proposé par le RASF, d'après la Paillasse virtuelle de Nils Aronssohn (lycée Argouges, Grenoble).
