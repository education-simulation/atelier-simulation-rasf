// Remplace la base de données de reula.fr : ce site n'en a pas.
// Toute requête répond « rien trouvé », sans erreur, pour que les outils fonctionnent tels quels.
const vide = { data: null, error: null };
const chaine = new Proxy(function () {}, {
  get: (_, prop) => (prop === "then" ? (ok) => Promise.resolve(vide).then(ok) : chaine),
  apply: () => chaine,
});
export const supabase = chaine;
export default supabase;
