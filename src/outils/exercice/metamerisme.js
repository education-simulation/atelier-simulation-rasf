// ============================================================
//  EXERCICE MÉTAMÉRISME — les étapes du parcours guidé et les idées de l'exploration libre.
//  Les « indices » servent aussi de CRITÈRES à l'agent pour analyser les prompts de la personne.
//  La « proposition » est une réponse possible, la PLUS COURTE qui marche (l'IA devine le reste),, montrée seulement si la personne la demande :
//  l'agent ne doit JAMAIS s'en servir pour compléter un prompt.
// ============================================================

export const ETAPES = [
  {
    titre: "Faire fonctionner les boutons des illuminants",
    motsCles: ["sur le bord de la cabine", "cabine de lumière 3D", "illuminant A", "illuminant D65", "illuminant F11", "fais fonctionner", "quand on clique", "un voyant s'allume", "retiens le choix au rechargement", "ne change rien d'autre"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Les trois boutons A, D65 et F11 sont déjà sur le bord de la cabine, mais ils ne font rien. Rédige un prompt pour qu'ils permettent de choisir la lumière de la cabine.",
    indices: [
      "Nomme les boutons : A, D65 et F11. L'IA sait ce que sont ces illuminants, inutile de les décrire.",
      "Dis en quelques mots ce que fait un clic : il éclaire la cabine avec cette lumière.",
      "Pas besoin de dire « dans la page Métamérisme » : l'agent le sait. Le reste (teinte exacte, voyant), l'IA le devine.",
    ],
    proposition: "Fais fonctionner les boutons A, D65 et F11 : un clic éclaire la cabine avec cet illuminant.",
  },

  {
    titre: "Choisir la couleur des cartes",
    motsCles: ["sur chaque carte", "sous la scène", "échantillon", "carte de contraste", "une palette de couleurs", "quand on clique", "paire métamère", "illuminant D65", "illuminant A", "réflectance spectrale", "observateur CIE 1931", "calcule à partir des spectres", "calculé, pas choisi à la main", "utilise src/outils/colorimetrie.js", "retiens le choix au rechargement"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Les deux cartes sont vierges. Rédige un prompt pour pouvoir choisir la couleur d'un échantillon peint sur la carte 1, la carte 2 étant calculée pour former avec elle une paire métamère.",
    indices: [
      "Où et comment choisir ? Un échantillon peint au centre de chaque carte, et une palette de quelques couleurs : un clic choisit la couleur de la carte 1.",
      "La carte 2 n'est pas choisie : elle est calculée pour former une paire métamère avec la carte 1 (même couleur à la lumière du jour D65, différente sous l'illuminant A). Le site a déjà un outil pour ça : src/outils/colorimetrie.js (fonction paireMetamere).",
      "Les couleurs affichées doivent être calculées à partir des spectres (réflectance spectrale de l'échantillon, distribution spectrale de la lumière, observateur CIE 1931), pas choisies à la main.",
    ],
    proposition: "Ajoute une palette pour choisir la couleur de l'échantillon de la carte 1 ; la carte 2 est sa paire métamère, calculée avec colorimetrie.js.",
  },
  {
    titre: "Construire les distributions spectrales",
    motsCles: ["sous la scène", "dans une fenêtre (popup)", "un bouton", "distribution spectrale", "réflectance spectrale", "illuminant A", "illuminant D65", "illuminant F11", "échantillon", "affiche", "graphique de 380 à 780 nm", "courbes superposées", "légende", "utilise src/outils/colorimetrie.js"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Rédige un prompt pour voir la distribution spectrale de l'illuminant choisi et la réflectance spectrale des deux échantillons.",
    indices: [
      "Où les afficher ? À toi de choisir : sous la scène, ou dans une fenêtre qui s'ouvre avec un bouton.",
      "Quel graphique ? Les longueurs d'onde de 380 à 780 nm, des courbes superposées pour comparer les deux échantillons, une légende, et des axes nommés.",
      "Que doit-on remarquer ? Les deux réflectances se croisent en plusieurs points (marque-les avec leur longueur d'onde), et le graphique de la lumière change quand on clique sur A, D65 ou F11. Les données sont déjà dans src/outils/colorimetrie.js.",
    ],
    proposition: "Affiche sous la scène la distribution spectrale de l'illuminant choisi et les réflectances spectrales des deux échantillons, avec colorimetrie.js.",
  },
  {
    titre: "Faire glisser les cartes dans la cabine",
    motsCles: ["carte de contraste", "cabine de lumière 3D", "un bouton", "rends déplaçable", "quand on fait glisser", "à la souris et au doigt", "sur téléphone", "calcule à partir des spectres", "ne change rien d'autre"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Rédige un prompt pour que l'on puisse déplacer les deux cartes de la table jusque dans la cabine.",
    indices: [
      "Comment déplace-t-on les cartes ? Pense à la souris ET au doigt (tablette, téléphone).",
      "Sur un petit écran, glisser est difficile : demande aussi un bouton qui place les deux cartes dans la cabine.",
      "Dis ce qui change quand une carte entre dans la cabine : sa couleur est recalculée sous la lumière de la cabine ; sur la table, elle reste à la lumière du jour (D65).",
    ],
    proposition: "Rends les deux cartes déplaçables dans la cabine, à la souris et au doigt.",
  },
  {
    titre: "Mesurer l'écart de couleur",
    motsCles: ["sous la scène", "écart ΔE*ab", "échantillon", "utilise src/outils/colorimetrie.js", "calcule à partir des spectres", "affiche", "valeur arrondie", "vert / orange / rouge selon le résultat", "phrase d'explication pour l'élève", "surligne", "zone surlignée", "réflectance spectrale"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Rédige un prompt pour mesurer et afficher la différence de couleur entre les deux cartes, sous la lumière où elles se trouvent.",
    indices: [
      "Quelle mesure ? L'écart ΔE*ab entre les deux échantillons, calculé avec src/outils/colorimetrie.js, sous la lumière où sont les cartes.",
      "Comment le rendre lisible ? Une valeur arrondie, une couleur verte, orange ou rouge selon que la différence se voit ou non, et une phrase d'explication.",
      "Pour comprendre pourquoi : surligne sur le graphique des réflectances la zone où les deux courbes s'écartent le plus, et fais le lien avec la lumière choisie.",
    ],
    proposition: "Affiche l'écart ΔE*ab entre les deux cartes sous la lumière où elles sont, en vert, orange ou rouge.",
  },
  {
    titre: "Le message à retenir",
    motsCles: ["sous la scène", "paire métamère", "ajoute", "retire", "encadré « À retenir »", "phrase d'explication pour l'élève"], // surlignés dans la liste des mots clés quand l'étape est ouverte
    consigne: "Rédige un prompt pour ajouter la conclusion de la simulation, puis terminer la page.",
    indices: [
      "Quelle forme ? Un encadré « À retenir », bien visible en bas de la page.",
      "Quel contenu ? La définition du métamérisme, et une conséquence pratique : comment comparer correctement deux couleurs.",
      "Pour finir la page : le cadre de l'exercice (guide, mots clés, sauvegardes) n'a plus lieu d'être. Demande de le retirer pour ne garder que la simulation.",
    ],
    proposition: "Ajoute un encadré « À retenir » sur le métamérisme, puis retire le cadre de l'exercice (<CadreExercice>).",
  },
];

export const IDEES = [
  "ajoute une troisième carte, d'une autre couleur, qui reste identique sous les trois lumières (elle sert de témoin)",
  "ajoute un curseur pour régler la température de couleur de la lampe de la cabine, de 2700 K à 6500 K",
  "affiche en grand, sous la scène, l'écart ΔE*ab entre les deux cartes, avec une couleur verte, orange ou rouge selon qu'il se voit ou non",
  "ajoute une question à choix pour l'élève : « Sous quelle lumière les deux cartes sont-elles différentes ? », avec la correction",
];

// Mots clés : le vocabulaire qui rend un prompt précis (affiché à côté de la simulation ; un clic copie le mot).
export const MOTS_CLES = [
  { titre: "📍 Où ?", mots: ["sur le bord de la cabine", "au-dessus de la scène", "sous la scène", "sur chaque carte", "dans une fenêtre (popup)"] },
  { titre: "🧱 Les objets", mots: ["cabine de lumière 3D", "un bouton", "illuminant A", "illuminant D65", "illuminant F11", "carte de contraste", "échantillon", "une palette de couleurs", "distribution spectrale", "réflectance spectrale", "observateur CIE 1931", "écart ΔE*ab", "paire métamère"] },
  { titre: "🛠 Les actions", mots: ["ajoute", "fais fonctionner", "remplace", "rends déplaçable", "calcule à partir des spectres", "affiche", "surligne", "retire"] },
  { titre: "⚙️ Le comportement", mots: ["quand on clique", "quand on fait glisser", "à la souris et au doigt", "sur téléphone", "retiens le choix au rechargement", "un voyant s'allume"] },
  { titre: "📈 L'affichage", mots: ["graphique de 380 à 780 nm", "courbes superposées", "légende", "zone surlignée", "encadré « À retenir »", "valeur arrondie", "vert / orange / rouge selon le résultat"] },
  { titre: "✅ Les exigences", mots: ["calculé, pas choisi à la main", "utilise src/outils/colorimetrie.js", "ne change rien d'autre", "une étape à la fois", "phrase d'explication pour l'élève"] },
];
