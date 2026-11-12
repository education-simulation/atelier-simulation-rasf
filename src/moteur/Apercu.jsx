// Aperçu (moteur, ne pas modifier).
// estApercu : vrai seulement sur l'ordinateur (localhost), jamais sur le site publié.
// Le bandeau bleu « aperçu » et le bouton « Les étapes » ont été retirés : le suivi des étapes se fait
// dans PROGRESSION.md et dans la conversation (ligne « 🏁 Étape N sur 6 terminée »).
export const estApercu = typeof location !== "undefined" && ["localhost", "127.0.0.1"].includes(location.hostname);

export function Apercu() {
  return null;
}
