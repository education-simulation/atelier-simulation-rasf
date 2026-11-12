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
3. **Crée le projet de ton site** (une seule fois) : c'est ce qui évite une petite fenêtre d'autorisation pour chaque fichier.
   - Dans la barre de gauche d'Antigravity, clique sur l'icône **dossier avec un +** (nouveau projet), puis **Add Folder**.
   - Dans la fenêtre qui s'ouvre, va sur ton **Bureau**, clique **Nouveau dossier**, appelle-le **mon-site** (lettres minuscules et tirets, sans espace ni accent : c'est aussi le début de l'adresse de ton site en ligne), sélectionne-le, puis clique **Create**.
4. **Avant de commencer, retiens une seule chose** : pendant tout le parcours, des petites fenêtres « Allow… ? » vont s'afficher sous la conversation. **Clique à chaque fois sur « Yes, and always allow »** (le 3e choix). Toutes ces actions sont sans danger pour ton ordinateur, et chacune ne sera demandée qu'une fois.
5. Dans ce projet, colle cette phrase dans la conversation avec l'agent. Pour la prendre, clique sur le petit bouton **⧉** à droite du cadre gris (ou sélectionne-la, puis **Cmd + C** sur Mac, **Ctrl + C** sur Windows). Pour la coller : **Cmd + V** ou **Ctrl + V**.

   ```text
   Crée mon site avec le modèle GitHub education-simulation/atelier-simulation-rasf, puis suis ses consignes pour me guider.
   ```

6. L'agent te présente ce qui va se passer et copie le modèle dans ton dossier. **Pendant qu'il copie, il te fait créer ton compte gratuit Vercel** (il t'ouvre la bonne page ; choisis « Continue with Google ») : c'est lui qui mettra ton site en ligne.

L'agent te guide ensuite pas à pas, avec des questions à cliquer : le nom et la couleur de ton site, le voir sur ton ordinateur, le mettre en ligne avec Vercel, puis des idées pour la suite.
Au départ, il vérifie que **Node.js** est installé (le moteur gratuit qui fait tourner l'aperçu de ton site). S'il manque, il te guide pour l'installer en 5 minutes depuis nodejs.org.

### Les fois suivantes

Ouvre Antigravity, clique sur le projet de ton site dans la barre de gauche, puis écris à l'agent : **« Reprends mon site »**.

---

Modèle proposé par le RASF, d'après la Paillasse virtuelle de Nils Aronssohn (lycée Argouges, Grenoble).
