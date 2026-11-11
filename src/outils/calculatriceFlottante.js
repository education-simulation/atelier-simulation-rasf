// La calculatrice flottante du site : une seule fenêtre, ouverte ou fermée pour TOUT le site.
// Elle reste ouverte quand on change de page ou de menu, et aussi après un rechargement.
// Une page l'ouvre avec ouvrirCalculatrice() (ou basculerCalculatrice()) ; le moteur (src/App.jsx) l'affiche.
import { useSyncExternalStore } from "react";

const CLE = "atelier.calculatriceFlottante";
let ouverte = (() => { try { return localStorage.getItem(CLE) === "1"; } catch { return false; } })();
const abonnes = new Set();

function changer(v) {
  ouverte = v;
  try { localStorage.setItem(CLE, v ? "1" : "0"); } catch { /* sans importance */ }
  abonnes.forEach((f) => f());
}

export const ouvrirCalculatrice = () => changer(true);
export const fermerCalculatrice = () => changer(false);
export const basculerCalculatrice = () => changer(!ouverte);

export function useCalculatriceOuverte() {
  return useSyncExternalStore((f) => { abonnes.add(f); return () => abonnes.delete(f); }, () => ouverte);
}
