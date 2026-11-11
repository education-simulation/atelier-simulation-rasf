// ============================================================
//  COURBES PUBLIÉES PAR LA SIMULATION (cadre de l'exercice, ne pas modifier).
//  La page appelle publierCourbes(...) avec les réflectances ACTUELLES de ses cartes :
//  - le bouton « 📈 Voir les courbes de réflectance » du guide les montre telles quelles ;
//  - le guide vérifie EN DIRECT que les deux cartes ont la même couleur à la lumière du jour.
//  Forme : [{ nom: "carte 1", couleur: "rgb(…)", valeurs: [81 nombres, 380 → 780 nm] }, …]
// ============================================================
import { useSyncExternalStore } from "react";

let courbes = null;
const abonnes = new Set();

export function publierCourbes(series) {
  const suivantes = Array.isArray(series) && series.length ? series : null;
  if (JSON.stringify(suivantes) === JSON.stringify(courbes)) return;
  courbes = suivantes;
  // Après le rendu en cours (la page publie pendant son propre calcul).
  queueMicrotask(() => abonnes.forEach((f) => f()));
}

export const courbesPubliees = () => courbes;

export function useCourbesPubliees() {
  return useSyncExternalStore((f) => { abonnes.add(f); return () => abonnes.delete(f); }, () => courbes);
}
