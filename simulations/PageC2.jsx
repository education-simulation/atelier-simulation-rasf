// ============================================================
//  PAGE C2 — page vide, prête à être remplacée.
//  Dis par exemple à ton agent : « Remplace la page C2 par une simulation sur … »
//  ou « Renomme le menu C en … ».
// ============================================================

export default function PageC2() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", background: "#fff", border: "2px dashed #cbd5e1", borderRadius: 22, padding: "28px 26px", textAlign: "center" }}>
      <div style={{ fontSize: 46 }} aria-hidden="true">📄</div>
      <h2 style={{ margin: "8px 0 6px" }}>Page C2</h2>
      <p style={{ color: "#475569", margin: "0 0 18px" }}>Cette page est vide pour l'instant. Elle attend ta prochaine simulation.</p>
      <div style={{ textAlign: "left", background: "#f8fafc", borderRadius: 14, padding: "14px 18px", color: "#334155" }}>
        <strong>Pour la remplir, dis à ton agent par exemple :</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.7 }}>
          <li>« Remplace la page C2 par une simulation sur la dilution. »</li>
          <li>« Renomme la page C2 en Titrage acide-base. »</li>
          <li>« Renomme le menu C en Analyse. »</li>
        </ul>
      </div>
    </div>
  );
}
