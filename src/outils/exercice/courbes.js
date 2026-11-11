// ============================================================
//  COURBES PUBLIÉES PAR LA SIMULATION (cadre de l'exercice, ne pas modifier).
//  La page appelle publierCourbes(...) avec les réflectances ACTUELLES de ses cartes :
//  le bouton « 📈 Voir les courbes de réflectance » du guide les montre alors telles quelles
//  (sinon il montre un exemple tiré du modèle couleur).
//  Forme : [{ nom: "carte 1", couleur: "rgb(…)", valeurs: [81 nombres, 380 → 780 nm] }, …]
// ============================================================
let courbes = null;

export function publierCourbes(series) {
  courbes = Array.isArray(series) && series.length ? series : null;
}

export const courbesPubliees = () => courbes;
