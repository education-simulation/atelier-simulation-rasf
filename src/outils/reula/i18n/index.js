// Remplace la traduction de reula.fr : ces outils n'existent ici qu'en français.
// t("clé") ou t("clé", { n: 3 }) → le texte français, avec ses variables remplacées.
import fr from "./fr.js";

const t = (key, vars) => {
  let str = fr[key] ?? key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
  return str;
};

export function useLang() {
  return { lang: "fr", setLang: () => {}, t };
}
