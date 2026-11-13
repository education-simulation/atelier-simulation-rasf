// ============================================================
//  site.config.js — LE FICHIER PRINCIPAL DE TON SITE
// ============================================================
//  - Le titre, la couleur, les menus et les pages viennent tous d'ici.
//  - Une page = un fichier dans le dossier simulations/
//    + une ligne dans la liste « pages » ci-dessous.
//  - Ton agent s'en occupe : dis-lui simplement ce que tu veux,
//    par exemple « renomme le menu A en Analyse » ou « remplace la page A1 par … ».
// ============================================================

export default {
  // Nom du site (en haut à gauche et dans l'onglet du navigateur).
  titre: "Mes simulations",

  // Grande phrase de la page d'accueil. Le morceau entre [crochets] est surligné.
  accroche: "Essayer, observer, [comprendre.]",

  // Petit texte de présentation, sous la grande phrase.
  presentation: "Des simulations, support de mes cours : on change les réglages, on observe, on comprend.",

  // Ton nom ou ton pseudo, et ton établissement (laisse "" pour ne rien afficher).
  auteur: "Prof de sciences",
  etablissement: "",

  // Couleur principale (titre, boutons, menu actif). Code couleur au format #RRGGBB.
  couleur: "#0b4f94",

  // Le style du site :
  //   "blocs"   : menus en haut, accueil en grands blocs de couleur (d'après la Paillasse virtuelle)
  //   "lateral" : barre de menus sombre à gauche, accueil sobre en cartes
  //   "liste"   : menus en haut, accueil en simple liste, le plus rapide à lire
  style: "lateral",

  // Les menus, dans l'ordre. Chacun a aussi sa place sur l'accueil.
  //   id    : abréviation courte (sert au rangement des pages, affichée en gros sur l'accueil)
  //   nom   : nom affiché dans le menu
  //   fond  : couleur du bloc sur l'accueil (style « blocs ») ; texte : couleur des écritures sur ce bloc
  menus: [
    { id: "IA", nom: "Construire avec l'IA", fond: "#7c3aed", texte: "#ffffff" },
    { id: "A", nom: "Menu A", fond: "#5b4bdb", texte: "#ffffff" },
    { id: "B", nom: "Menu B", fond: "#1f8a7a", texte: "#ffffff" },
    { id: "C", nom: "Menu C", fond: "#c2410c", texte: "#ffffff" },
    { id: "Outils", nom: "Outils", fond: "#0f766e", texte: "#ffffff" },
    { id: "Ex", nom: "Exemples", fond: "#f5a31a", texte: "#3a2500" },
  ],

  // Les pages. Chacune :
  //   id      : son adresse (lettres minuscules, chiffres et tirets) → …/?sim=extrait-sec
  //   titre   : son nom dans le menu
  //   icone   : un émoji
  //   menu    : l'id du menu où la ranger
  //   fichier : le nom du fichier dans simulations/ (sans « .jsx »)
  //   description : (facultatif) une phrase courte, affichée sur l'accueil des styles « lateral » et « liste »
  pages: [
    { id: "metamerisme", titre: "Métamérisme", icone: "🎨", menu: "IA", fichier: "Metamerisme", description: "Exercice : construis la simulation avec l'IA, une étape à la fois, à partir d'une cabine et de deux cartes." },
    { id: "titrage-direct", titre: "Titrage direct", icone: "⚗️", menu: "IA", fichier: "TitrageDirect", description: "Exercice : construis le titrage du diiode du Lugol avec l'IA, à partir d'une burette et d'un bécher vides." },

    { id: "masse-volumique", titre: "Masse volumique au pycnomètre", icone: "⚖️", menu: "Ex", fichier: "MasseVolumique", description: "Parcours guidé : peser, calculer, comparer à la valeur attendue." },
    { id: "extrait-sec", titre: "Extrait sec à l'étuve", icone: "🔥", menu: "Ex", fichier: "ExtraitSec", description: "Sécher jusqu'à masse constante et calculer la teneur en matière sèche." },
    { id: "jeu-equations", titre: "Jeu : défi chrono des équations", icone: "🎮", menu: "Ex", fichier: "JeuEquations", description: "60 secondes pour équilibrer un maximum d'équations." },
    { id: "instabilite", titre: "Instabilité des milieux dispersés", icone: "🫧", menu: "Ex", fichier: "Instabilite", description: "Crémage et sédimentation, loi de Stokes. Exemple à améliorer." },

    { id: "a1", titre: "Page A1", icone: "📄", menu: "A", fichier: "PageA1" },
    { id: "a2", titre: "Page A2", icone: "📄", menu: "A", fichier: "PageA2" },
    { id: "b1", titre: "Page B1", icone: "📄", menu: "B", fichier: "PageB1" },
    { id: "b2", titre: "Page B2", icone: "📄", menu: "B", fichier: "PageB2" },
    { id: "c1", titre: "Page C1", icone: "📄", menu: "C", fichier: "PageC1" },
    { id: "c2", titre: "Page C2", icone: "📄", menu: "C", fichier: "PageC2" },

    { id: "diagramme-ternaire", titre: "Diagramme ternaire", icone: "🔺", menu: "Outils", fichier: "DiagrammeTernaire", description: "Construire un diagramme ternaire ou s'exercer à lire et placer des points." },
    { id: "calculatrice", titre: "Calculatrice scientifique", icone: "🧮", menu: "Outils", fichier: "Calculatrice", description: "Une calculatrice scientifique, utilisable partout." },
    { id: "graphe-vierge", titre: "Graphe vierge", icone: "📈", menu: "Outils", fichier: "GrapheVierge", description: "Papier millimétré, logarithmique ou ternaire, à exporter ou imprimer." },
  ],
};
