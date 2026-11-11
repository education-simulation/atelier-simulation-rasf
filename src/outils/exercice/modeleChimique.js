// ============================================================
//  LE MODÈLE CHIMIQUE ACTIF (cadre de l'exercice « Titrage direct », ne pas modifier).
//  La page ne doit JAMAIS importer un fichier de modèle directement : elle prend ses fonctions ici,
//    const { REACTION, DONNEES, solution, quantites, concentrationI2, couleurSolution } = modeleChimique(AVEC_MODELE);
//  Ainsi, basculer « Par défaut / À construire » dans le guide RECALCULE toute la simulation avec l'autre modèle :
//  on peut comparer les deux.
//  - true  : le modèle par défaut (src/outils/titrage.js) ;
//  - false : le modèle construit à l'étape 0 (src/outils/monTitrage.js), s'il existe (sinon, celui par défaut).
// ============================================================
import * as MODELE_PAR_DEFAUT from "../titrage.js";

const PERSO = import.meta.glob("../monTitrage.js", { eager: true });

export function modeleChimique(avecModeleParDefaut) {
  const perso = PERSO["../monTitrage.js"];
  return avecModeleParDefaut || !perso ? MODELE_PAR_DEFAUT : perso;
}
