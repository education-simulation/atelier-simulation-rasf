// Sauvegardes du graphe vierge, rangées dans CE navigateur (pas de compte, pas de base de données).
// Mêmes fonctions que sur reula.fr : listConfigs, saveConfig, updateConfig, deleteConfig.
const CLE = "atelier.graphes";

const lire = () => { try { return JSON.parse(localStorage.getItem(CLE) || "[]"); } catch { return []; } };
const ecrire = (liste) => { try { localStorage.setItem(CLE, JSON.stringify(liste)); } catch { throw new Error("Impossible d'enregistrer dans ce navigateur."); } };
const resume = ({ id, name, created_at, updated_at }) => ({ id, name, created_at, updated_at });

export async function listConfigs() {
  return lire().sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
}

export async function saveConfig({ name, config }) {
  const maintenant = new Date().toISOString();
  const g = { id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: name?.trim() || "Graphe sans titre", data: config, created_at: maintenant, updated_at: maintenant };
  ecrire([...lire(), g]);
  return resume(g);
}

export async function updateConfig(id, { name, config }) {
  const liste = lire();
  const g = liste.find((x) => x.id === id);
  if (!g) throw new Error("Graphe introuvable.");
  if (name !== undefined) g.name = name.trim() || "Graphe sans titre";
  if (config !== undefined) g.data = config;
  g.updated_at = new Date().toISOString();
  ecrire(liste);
  return resume(g);
}

export async function deleteConfig(id) {
  ecrire(lire().filter((x) => x.id !== id));
}
