// Remplace la connexion de reula.fr : ce site n'a pas de comptes.
// Les outils voient donc toujours « personne n'est connecté ».
export function useAuth() {
  return { user: null, effectiveUserId: null, isImpersonating: false, loading: false };
}
