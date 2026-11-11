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
  titre: "Mon atelier de simulations",

  // Grande phrase de la page d'accueil. Le morceau entre [crochets] est surligné.
  accroche: "Manipuler, se tromper, [recommencer.]",

  // Petit texte de présentation, sous la grande phrase.
  presentation: "Des simulations pour mes élèves : on change les réglages, on observe, on comprend.",

  // Ton nom ou ton pseudo, et ton établissement (laisse "" pour ne rien afficher).
  auteur: "Prénom Nom",
  etablissement: "",

  // Couleur principale (titre, boutons, menu actif). Code couleur au format #RRGGBB.
  couleur: "#0b4f94",

  // Les menus, en haut du site, dans l'ordre. Chacun a aussi son bloc de couleur sur l'accueil.
  //   id    : abréviation courte (sert au rangement des pages, affichée en gros sur l'accueil)
  //   nom   : nom affiché dans le menu
  //   fond  : couleur du bloc sur l'accueil ; texte : couleur des écritures sur ce bloc
  menus: [
    { id: "Ex", nom: "Exemples", fond: "#f5a31a", texte: "#3a2500" },
    { id: "A", nom: "Menu A", fond: "#5b4bdb", texte: "#ffffff" },
    { id: "B", nom: "Menu B", fond: "#1f8a7a", texte: "#ffffff" },
    { id: "C", nom: "Menu C", fond: "#c2410c", texte: "#ffffff" },
  ],

  // Les pages. Chacune :
  //   id      : son adresse (lettres minuscules, chiffres et tirets) → …/?sim=extrait-sec
  //   titre   : son nom dans le menu
  //   icone   : un émoji
  //   menu    : l'id du menu où la ranger
  //   fichier : le nom du fichier dans simulations/ (sans « .jsx »)
  pages: [
    { id: "masse-volumique", titre: "Masse volumique au pycnomètre", icone: "⚖️", menu: "Ex", fichier: "MasseVolumique" },
    { id: "extrait-sec", titre: "Extrait sec à l'étuve", icone: "🔥", menu: "Ex", fichier: "ExtraitSec" },
    { id: "calculatrice", titre: "Calculatrice scientifique", icone: "🧮", menu: "Ex", fichier: "Calculatrice" },
    { id: "forces-intermoleculaires", titre: "Cohésion de la matière : forces intermoléculaires", icone: "🧲", menu: "Ex", fichier: "ForcesIntermoleculaires" },
    { id: "jeu-equations", titre: "Jeu : défi chrono des équations", icone: "🎮", menu: "Ex", fichier: "JeuEquations" },
    { id: "instabilite", titre: "Instabilité des milieux dispersés", icone: "🫧", menu: "Ex", fichier: "Instabilite" },

    { id: "a1", titre: "Page A1", icone: "📄", menu: "A", fichier: "PageA1" },
    { id: "a2", titre: "Page A2", icone: "📄", menu: "A", fichier: "PageA2" },
    { id: "b1", titre: "Page B1", icone: "📄", menu: "B", fichier: "PageB1" },
    { id: "b2", titre: "Page B2", icone: "📄", menu: "B", fichier: "PageB2" },
    { id: "c1", titre: "Page C1", icone: "📄", menu: "C", fichier: "PageC1" },
    { id: "c2", titre: "Page C2", icone: "📄", menu: "C", fichier: "PageC2" },
  ],
};
