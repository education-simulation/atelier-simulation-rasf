// ============================================================
//  LE MODÈLE COULEUR ACTIF (cadre de l'exercice, ne pas modifier).
//  La page ne doit JAMAIS importer un fichier de modèle directement : elle prend ses fonctions ici,
//    const { LONGUEURS, ILLUMINANTS, xyz, blanc, lab, deltaE, versEcran, paireMetamere } = modeleCouleur(AVEC_COLORIMETRIE);
//  Ainsi, basculer « Par défaut / À construire » dans le guide RECALCULE toute la simulation avec l'autre modèle :
//  on peut comparer les deux.
//  - true  : le modèle par défaut (src/outils/colorimetrie.js) ;
//  - false : le modèle construit à l'étape 0 (src/outils/maColorimetrie.js), s'il existe (sinon, celui par défaut).
//  Toujours enchaîner les fonctions d'un MÊME modèle (versEcran(xyz(R, S), blanc(S))) : les formats internes peuvent différer.
// ============================================================
import * as MODELE_PAR_DEFAUT from "../colorimetrie.js";

const PERSO = import.meta.glob("../maColorimetrie.js", { eager: true });

export function modeleCouleur(avecModeleParDefaut) {
  const perso = PERSO["../maColorimetrie.js"];
  return avecModeleParDefaut || !perso ? MODELE_PAR_DEFAUT : perso;
}
