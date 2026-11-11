// ============================================================
//  EXERCICE MÉTAMÉRISME — les étapes du parcours guidé et les idées de l'exploration libre.
//  Les « indices » servent aussi de CRITÈRES à l'agent pour analyser les prompts de la personne.
//  La « proposition » est une réponse possible, montrée seulement si la personne la demande :
//  l'agent ne doit JAMAIS s'en servir pour compléter un prompt.
// ============================================================

export const ETAPES = [
  {
    titre: "Ajouter le choix des illuminants",
    consigne: "Rédige un prompt pour demander à l'IA d'ajouter plusieurs illuminants : on doit pouvoir choisir la lumière de la cabine.",
    indices: [
      "Nomme précisément les illuminants voulus et ce qu'ils représentent (A : lampe à incandescence, D65 : lumière du jour, F11 : tube fluorescent).",
      "Dis où mettre le choix (par exemple trois boutons au-dessus de la scène) et ce qui doit changer quand on clique (la teinte de l'intérieur de la cabine).",
      "Pense au confort : le choix doit être retenu quand on recharge la page. Et précise bien la page concernée (« Dans la page Métamérisme… »).",
    ],
    proposition: "Dans la page Métamérisme, ajoute au-dessus de la scène trois boutons pour choisir la lumière de la cabine : A (lampe à incandescence), D65 (lumière du jour) et F11 (tube fluorescent). L'intérieur de la cabine prend la teinte de la lumière choisie. Retiens le choix au rechargement de la page.",
  },
  {
    titre: "Faire glisser les cartes dans la cabine",
    consigne: "Rédige un prompt pour que l'on puisse déplacer les deux cartes de la table jusque dans la cabine.",
    indices: [
      "Comment déplace-t-on les cartes ? Pense à la souris ET au doigt (tablette, téléphone).",
      "Sur un petit écran, glisser est difficile : demande aussi un bouton qui place les deux cartes dans la cabine.",
      "Dis ce qui change quand une carte entre dans la cabine (elle prend la lumière de la cabine) et quand elle est sur la table (lumière du jour).",
    ],
    proposition: "Dans la page Métamérisme, rends les deux cartes déplaçables : on peut les faire glisser, à la souris ou au doigt, de la table jusque dans la cabine. Ajoute aussi un bouton « Mettre les deux cartes dans la cabine » pour le téléphone. Une carte dans la cabine prend la lumière de la cabine ; sur la table, elle reste à la lumière du jour.",
  },
  {
    titre: "Calculer les couleurs à partir des spectres",
    consigne: "Rédige un prompt pour que les couleurs des cartes soient calculées (et non choisies à la main), avec une différence visible sous l'illuminant A.",
    indices: [
      "À partir de quoi calcule-t-on une couleur ? Des spectres (de la lumière et de la carte) et de l'observateur CIE 1931. Le site a déjà un outil pour ça : src/outils/colorimetrie.js.",
      "Que doit-on observer ? Les deux cartes ont la même couleur sous D65, mais pas sous A : c'est une « paire métamère ».",
      "Comment mesurer la différence ? Demande d'afficher l'écart ΔE*ab entre les deux cartes, avec une phrase qui dit si la différence se voit.",
    ],
    proposition: "Dans la page Métamérisme, calcule la couleur des cartes à partir des spectres, avec src/outils/colorimetrie.js : observateur CIE 1931, illuminants A, D65 et F11. Les deux cartes forment une paire métamère : exactement la même couleur sous D65, mais une différence nette sous A. Affiche sous la scène l'écart ΔE*ab entre les deux cartes quand elles sont toutes les deux dans la cabine, avec une phrase qui dit si la différence se voit.",
  },
  {
    titre: "Montrer les spectres des illuminants",
    consigne: "Rédige un prompt pour afficher, dans une fenêtre, les spectres des trois illuminants.",
    indices: [
      "Où les afficher ? Par exemple un bouton qui ouvre une fenêtre (popup), pour ne pas encombrer la page.",
      "Quel graphique ? Les longueurs d'onde de 380 à 780 nm, les trois courbes ramenées à la même luminosité pour pouvoir les comparer, avec une légende.",
      "Quel message ? Une phrase qui fait remarquer que A est très fort dans le rouge, D65 presque plat, F11 fait de trois raies étroites.",
    ],
    proposition: "Dans la page Métamérisme, ajoute un bouton « Spectres des illuminants » qui ouvre une fenêtre avec un graphique : les spectres de A, D65 et F11 entre 380 et 780 nm, ramenés à la même luminosité, avec une légende. Ajoute une phrase : A est très fort dans le rouge, D65 est presque plat, F11 a trois raies étroites.",
  },
  {
    titre: "Montrer les spectres des deux cartes",
    consigne: "Rédige un prompt pour afficher les spectres de réflexion des deux cartes et faire comprendre pourquoi elles paraissent différentes sous A.",
    indices: [
      "Les deux spectres doivent être superposés sur le même graphique, pour pouvoir les comparer.",
      "Qu'est-ce qui doit sauter aux yeux ? Les courbes sont très proches et se croisent en 3 points : demande de marquer ces points avec leur longueur d'onde.",
      "Où sont-elles différentes ? Surtout dans le rouge : demande de surligner cette zone, et d'expliquer le lien avec l'illuminant A.",
    ],
    proposition: "Dans la page Métamérisme, ajoute un bouton « Spectres des deux cartes » qui ouvre une fenêtre avec leurs spectres de réflexion superposés (380 à 780 nm). On doit voir que les deux courbes sont très proches, se croisent en 3 points (marque-les avec leur longueur d'onde) et divergent surtout dans le rouge (surligne la zone 600-700 nm). Explique en deux phrases pourquoi les cartes paraissent différentes sous A.",
  },
  {
    titre: "Le message à retenir",
    consigne: "Rédige un prompt pour ajouter la conclusion de la simulation, puis terminer la page.",
    indices: [
      "Quelle forme ? Un encadré « À retenir », bien visible en bas de la page.",
      "Quel contenu ? La définition du métamérisme, et une conséquence pratique : comment comparer correctement deux couleurs.",
      "Pour finir la page : le cadre de l'exercice (guide, journal, sauvegardes) n'a plus lieu d'être. Demande de le retirer pour ne garder que la simulation.",
    ],
    proposition: "Dans la page Métamérisme, ajoute en bas un encadré « À retenir » : deux couleurs identiques sous une lumière peuvent être différentes sous une autre ; c'est le métamérisme. Pour comparer deux couleurs, on les regarde toujours sous la même lumière, et de préférence sous plusieurs lumières (cabine de lumière). Puis retire le cadre de l'exercice (<CadreExercice>) pour ne garder que la simulation.",
  },
];

export const IDEES = [
  "ajoute une troisième carte, d'une autre couleur, qui reste identique sous les trois lumières (elle sert de témoin)",
  "ajoute un curseur pour régler la température de couleur de la lampe de la cabine, de 2700 K à 6500 K",
  "affiche en grand, sous la scène, l'écart ΔE*ab entre les deux cartes, avec une couleur verte, orange ou rouge selon qu'il se voit ou non",
  "ajoute une question à choix pour l'élève : « Sous quelle lumière les deux cartes sont-elles différentes ? », avec la correction",
];
