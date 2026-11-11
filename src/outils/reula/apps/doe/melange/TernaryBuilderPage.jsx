// ─── TernaryBuilderPage.jsx ──────────────────────────────────────────────────
import { useState, useRef, useCallback, useMemo, useEffect } from "react";

const SQR3_2 = Math.sqrt(3) / 2;
const NORM_L = [-SQR3_2, -0.5];
const NORM_R = [ SQR3_2, -0.5];
const NORM_B = [0, 1];
const PAD = { top: 44, left: 62, right: 62, bottom: 68 };
const TICK = 5, LAB = 14, TITL = 30;

const DEFAULT_STYLE = {
  c1: "#ef4444", c2: "#3b82f6", c3: "#10b981",
  bgFill: "#ffffff",
  borderW: 2, borderColor: "#374151",
  dotR: 10,
  fontTick: 15, fontTitle: 17, fontVertex: 21,
  gridMajorW: 1.3, gridMajorOp: 0.7,
  gridMinorW: 1.3, gridMinorOp: 0.5,
  gridDashShow: true, gridDashW: 1, gridDashOp: 0.75,
  titleOffsets:  { 1: [38, -12.5], 2: [-30.5, -10], 3: [0, 0] },
  vertexOffsets: { 1: [2, -9.5],   2: [-21, 9],     3: [23, 4] },
};

const SIZES = [{ id: "L", W: 460 }, { id: "XL", W: 780 }, { id: "XXL", W: 1050 }];

const PALETTE = [
  "#dc2626","#2563eb","#16a34a","#d97706",
  "#7c3aed","#0891b2","#be185d","#374151",
  "#ea580c","#0d9488","#65a30d","#6366f1",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pct(v) { return Math.round(v * 100); }
function clampSimplex([a, b, c]) {
  const arr = [Math.max(0, a), Math.max(0, b), Math.max(0, c)];
  const s = arr.reduce((x, y) => x + y, 0);
  if (s < 1e-9) return [1/3, 1/3, 1/3];
  return arr.map(v => v / s);
}
function snapToGrid([x1, x2, x3], m) {
  let best = null, bestD = Infinity;
  for (let i = 0; i <= m; i++) for (let j = 0; j <= m - i; j++) {
    const k = m - i - j, d = (x1 - i/m)**2 + (x2 - j/m)**2 + (x3 - k/m)**2;
    if (d < bestD) { bestD = d; best = [i/m, j/m, k/m]; }
  }
  return best;
}

// ─── Gear icon ────────────────────────────────────────────────────────────────
function GearIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
    </svg>
  );
}

// ─── Style panel ──────────────────────────────────────────────────────────────
function SLabel({ children }) {
  return <span className="text-xs text-gray-500 w-28 flex-shrink-0">{children}</span>;
}
function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2 h-7">
      <SLabel>{label}</SLabel>
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-gray-200"/>
      <span className="text-xs font-mono text-gray-400">{value}</span>
    </div>
  );
}
function SliderRow({ label, min, max, step = 1, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <SLabel>{label}</SLabel>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="flex-1 accent-green-600 h-1.5"/>
      <span className="text-xs font-mono text-gray-500 w-8 text-right">{value}</span>
    </div>
  );
}
function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2 h-7">
      <SLabel>{label}</SLabel>
      <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-green-600" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`}/>
      </button>
    </div>
  );
}
function SSection({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StylePanel({ open, style, onChange, onSave, onClose }) {
  const savedRef = useRef(style);
  useEffect(() => { if (open) savedRef.current = style; }, [open]);

  const set = (key, val) => onChange({ ...style, [key]: val });
  const handleCancel = () => { onChange(savedRef.current); onClose(); };
  const handleReset = () => onChange(DEFAULT_STYLE);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-40" onClick={handleCancel}/>}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <GearIcon className="w-4 h-4 text-gray-500"/>
            <span className="font-bold text-gray-800 text-sm">Style du diagramme</span>
          </div>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-700 text-xl leading-none px-1">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <SSection title="Couleurs des axes">
            <ColorRow label="X₁" value={style.c1} onChange={v => set("c1", v)}/>
            <ColorRow label="X₂" value={style.c2} onChange={v => set("c2", v)}/>
            <ColorRow label="X₃" value={style.c3} onChange={v => set("c3", v)}/>
            <ColorRow label="Fond" value={style.bgFill} onChange={v => set("bgFill", v)}/>
          </SSection>
          <SSection title="Bordure du triangle">
            <SliderRow label="Épaisseur" min={0.5} max={6} step={0.5} value={style.borderW} onChange={v => set("borderW", v)}/>
            <ColorRow label="Couleur" value={style.borderColor} onChange={v => set("borderColor", v)}/>
          </SSection>
          <SSection title="Points">
            <SliderRow label="Rayon (px)" min={4} max={24} value={style.dotR} onChange={v => set("dotR", v)}/>
          </SSection>
          <SSection title="Grille principale">
            <SliderRow label="Épaisseur" min={0.1} max={4} step={0.1} value={style.gridMajorW} onChange={v => set("gridMajorW", v)}/>
            <SliderRow label="Opacité" min={0} max={1} step={0.05} value={style.gridMajorOp} onChange={v => set("gridMajorOp", v)}/>
          </SSection>
          <SSection title="Graduation secondaire">
            <SliderRow label="Épaisseur" min={0.1} max={3} step={0.1} value={style.gridMinorW} onChange={v => set("gridMinorW", v)}/>
            <SliderRow label="Opacité" min={0} max={1} step={0.05} value={style.gridMinorOp} onChange={v => set("gridMinorOp", v)}/>
          </SSection>
          <SSection title="Pointillés intermédiaires">
            <ToggleRow label="Afficher" value={style.gridDashShow} onChange={v => set("gridDashShow", v)}/>
            <SliderRow label="Épaisseur" min={0.1} max={3} step={0.1} value={style.gridDashW} onChange={v => set("gridDashW", v)}/>
            <SliderRow label="Opacité" min={0} max={1} step={0.05} value={style.gridDashOp} onChange={v => set("gridDashOp", v)}/>
          </SSection>
          <SSection title="Typographie">
            <SliderRow label="Côtés (ticks)" min={6} max={24} value={style.fontTick} onChange={v => set("fontTick", v)}/>
            <SliderRow label="Titres X₁(%)…" min={6} max={28} value={style.fontTitle} onChange={v => set("fontTitle", v)}/>
            <SliderRow label="Sommets X₁…" min={6} max={32} value={style.fontVertex} onChange={v => set("fontVertex", v)}/>
          </SSection>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 space-y-2">
          <div className="flex gap-2">
            <button onClick={handleReset} className="px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Réinitialiser</button>
            <button onClick={onSave} className="flex-1 py-2 text-xs font-bold bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">Sauvegarder</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Context menu ─────────────────────────────────────────────────────────────
function ContextMenu({ menu, compNames, diagStyle, onClose, onOpenStyle,
  onRenameComp, onResetTitleOffset, onResetVertexOffset }) {
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");
  const ref = useRef(null);
  // adjusted position (keep within viewport)
  const [pos, setPos] = useState({ left: menu.x, top: menu.y });

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    // slight delay so the pointerup that opened the menu doesn't immediately close it
    const tid = setTimeout(() => {
      document.addEventListener('pointerdown', handler);
    }, 0);
    return () => { clearTimeout(tid); document.removeEventListener('pointerdown', handler); };
  }, [onClose]);

  useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    setPos({
      left: Math.min(menu.x, vw - r.width - 8),
      top:  Math.min(menu.y, vh - r.height - 8),
    });
  }, [menu.x, menu.y]);

  const startEdit = (i) => { setEditIdx(i); setEditVal(compNames[i]); };
  const confirmEdit = () => {
    if (editIdx !== null) { onRenameComp(editIdx, editVal); setEditIdx(null); onClose(); }
  };

  const item = (emoji, label, onClick, danger = false) => (
    <button
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "7px 12px", border: "none",
        background: "none", textAlign: "left", cursor: "pointer",
        fontSize: 13, color: danger ? "#dc2626" : "#18181b", borderRadius: 6,
      }}
      onPointerEnter={e => e.currentTarget.style.background = "#f5f5f5"}
      onPointerLeave={e => e.currentTarget.style.background = "none"}
      onClick={onClick}
    >
      <span style={{ fontSize: 15 }}>{emoji}</span>
      <span>{label}</span>
    </button>
  );

  const sep = () => <div style={{ height: 1, background: "#f0f0f0", margin: "3px 0" }}/>;

  const sectionLabel = (txt) => (
    <div style={{ padding: "4px 12px 2px", fontSize: 10, fontWeight: 700,
      color: "#9ca3af", letterSpacing: ".06em", textTransform: "uppercase" }}>
      {txt}
    </div>
  );

  const axisColors = [diagStyle.c1, diagStyle.c2, diagStyle.c3];

  const renameRow = (i) => (
    <div key={i} style={{ padding: "3px 8px" }}>
      {editIdx === i ? (
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <input
            autoFocus
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") confirmEdit();
              if (e.key === "Escape") { setEditIdx(null); onClose(); }
            }}
            style={{
              flex: 1, border: "1.5px solid #3b82f6", borderRadius: 6,
              padding: "4px 8px", fontSize: 13, outline: "none",
            }}
          />
          <button onClick={confirmEdit}
            style={{ padding: "4px 10px", background: "#2563eb", color: "#fff",
              border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            ✓
          </button>
        </div>
      ) : (
        <button
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "5px 4px", border: "none", background: "none",
            cursor: "pointer", borderRadius: 6, fontSize: 13, color: "#18181b", textAlign: "left",
          }}
          onPointerEnter={e => e.currentTarget.style.background = "#f5f5f5"}
          onPointerLeave={e => e.currentTarget.style.background = "none"}
          onClick={() => startEdit(i)}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: axisColors[i], flexShrink: 0, display: "inline-block" }}/>
          <span style={{ color: "#9ca3af", minWidth: 22, fontSize: 11 }}>{["X₁","X₂","X₃"][i]}</span>
          <span style={{ flex: 1, fontWeight: 600 }}>{compNames[i]}</span>
          <span style={{ color: "#9ca3af", fontSize: 12 }}>✏️</span>
        </button>
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      onPointerDown={e => e.stopPropagation()}
      style={{
        position: "fixed", left: pos.left, top: pos.top,
        background: "#fff",
        border: "1px solid #e4e4e7",
        borderRadius: 10,
        boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
        zIndex: 500, minWidth: 230, padding: "4px",
        fontFamily: "var(--font-sans,sans-serif)",
      }}
    >
      {menu.type === 'background' && (<>
        {item("⚙️", "Style du diagramme", () => { onOpenStyle(); onClose(); })}
        {sep()}
        {sectionLabel("Noms des composants")}
        {[0, 1, 2].map(i => renameRow(i))}
        {sep()}
        {item("🔄", "Réinitialiser titres des axes",   () => { onResetTitleOffset(null);  onClose(); })}
        {item("🔄", "Réinitialiser labels des sommets", () => { onResetVertexOffset(null); onClose(); })}
      </>)}

      {menu.type === 'vertex' && (<>
        {sectionLabel(`Sommet — ${compNames[menu.axis - 1]}`)}
        {sep()}
        {renameRow(menu.axis - 1)}
        {item("🔄", "Réinitialiser position", () => { onResetVertexOffset(menu.axis); onClose(); })}
      </>)}

      {menu.type === 'title' && (<>
        {sectionLabel(`Titre axe ${["X₁","X₂","X₃"][menu.axis - 1]}`)}
        {sep()}
        {item("🔄", "Réinitialiser position", () => { onResetTitleOffset(menu.axis); onClose(); })}
      </>)}
    </div>
  );
}

// ─── Builder SVG diagram ──────────────────────────────────────────────────────
function BuilderDiagram({
  compNames, points, selectedId, showLines, gridM, snapEnabled,
  W, svgRef, style, onStyleChange, onAddPoint, onMovePoint, onSelectPoint, onMoveLabel,
  onShowContextMenu,
}) {
  const dragging = useRef(null);
  const longPressTimer = useRef(null);
  const downClient = useRef(null);

  const scale = W - PAD.left - PAD.right;
  const svgH  = Math.round(SQR3_2 * scale) + PAD.top + PAD.bottom;

  const toSVG = useCallback((x1, x2, x3) => {
    const cx = x1 * 0.5 + x3, cy = x2 * SQR3_2 + x3 * SQR3_2;
    return [PAD.left + cx * scale, PAD.top + cy * scale];
  }, [scale]);

  const baryRaw = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (W / rect.width);
    const sy = (e.clientY - rect.top)  * (svgH / rect.height);
    const u = (sx - PAD.left) / scale, v = (sy - PAD.top) / scale;
    const x1 = 1 - v / SQR3_2, x3 = u - 0.5 + 0.5 * v / SQR3_2;
    return [x1, 1 - x1 - x3, x3];
  }, [W, svgH, scale]);

  const titleOffsets = style.titleOffsets;
  const setTitleOffsets = useCallback((updater) => {
    onStyleChange(s => {
      const next = typeof updater === 'function' ? updater(s.titleOffsets) : updater;
      return { ...s, titleOffsets: next };
    });
  }, [onStyleChange]);

  const vertexOffsets = style.vertexOffsets;
  const setVertexOffsets = useCallback((updater) => {
    onStyleChange(s => {
      const next = typeof updater === 'function' ? updater(s.vertexOffsets) : updater;
      return { ...s, vertexOffsets: next };
    });
  }, [onStyleChange]);

  const [vx1, vy1] = toSVG(1, 0, 0);
  const [vx2, vy2] = toSVG(0, 1, 0);
  const [vx3, vy3] = toSVG(0, 0, 1);

  const [mx_l, my_l] = toSVG(0.5, 0.5, 0);
  const [mx_r, my_r] = toSVG(0.5, 0, 0.5);
  const [mx_b, my_b] = toSVG(0, 0.5, 0.5);

  const titlePos = {
    2: { x: mx_l + NORM_L[0] * TITL, y: my_l + NORM_L[1] * TITL + 4, anchor: "middle" },
    1: { x: mx_r + NORM_R[0] * TITL, y: my_r + NORM_R[1] * TITL + 4, anchor: "middle" },
    3: { x: mx_b + NORM_B[0] * TITL, y: my_b + NORM_B[1] * TITL + 10, anchor: "middle" },
  };

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 1; i < gridM; i++) {
      const t = i / gridM, major = (gridM === 10 || i % 2 === 0);
      const [ax1, ay1] = toSVG(t, 1-t, 0),   [ax2, ay2] = toSVG(t, 0, 1-t);
      const [bx1, by1] = toSVG(1-t, t, 0),   [bx2, by2] = toSVG(0, t, 1-t);
      const [cx1, cy1] = toSVG(0, 1-t, t),   [cx2, cy2] = toSVG(1-t, 0, t);
      lines.push({ ax1, ay1, ax2, ay2, bx1, by1, bx2, by2, cx1, cy1, cx2, cy2, major });
    }
    return lines;
  }, [gridM, toSVG]);

  const interLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < gridM; i++) {
      const t = (i + 0.5) / gridM;
      const [ax1, ay1] = toSVG(t, 1-t, 0),   [ax2, ay2] = toSVG(t, 0, 1-t);
      const [bx1, by1] = toSVG(1-t, t, 0),   [bx2, by2] = toSVG(0, t, 1-t);
      const [cx1, cy1] = toSVG(0, 1-t, t),   [cx2, cy2] = toSVG(1-t, 0, t);
      lines.push({ ax1, ay1, ax2, ay2, bx1, by1, bx2, by2, cx1, cy1, cx2, cy2 });
    }
    return lines;
  }, [gridM, toSVG]);

  const labelStep = gridM === 20 ? 2 : 1;
  const skipSome  = W < 380;
  const effStep   = skipSome ? labelStep * 2 : labelStep;

  const leftTicks = useMemo(() => {
    const arr = [];
    for (let i = effStep; i < gridM; i += effStep) {
      const t = i / gridM, [px, py] = toSVG(1-t, t, 0);
      arr.push({ px, py, lx: px + NORM_L[0] * LAB, ly: py + NORM_L[1] * LAB, label: `${pct(t)}` });
    }
    return arr;
  }, [gridM, effStep, toSVG]);

  const rightTicks = useMemo(() => {
    const arr = [];
    for (let i = effStep; i < gridM; i += effStep) {
      const t = i / gridM, [px, py] = toSVG(1-t, 0, t);
      arr.push({ px, py, lx: px + NORM_R[0] * LAB, ly: py + NORM_R[1] * LAB, label: `${pct(1-t)}` });
    }
    return arr;
  }, [gridM, effStep, toSVG]);

  const bottomTicks = useMemo(() => {
    const arr = [];
    for (let i = effStep; i < gridM; i += effStep) {
      const t = i / gridM, [px, py] = toSVG(0, 1-t, t);
      arr.push({ px, py, lx: px + NORM_B[0] * LAB, ly: py + NORM_B[1] * LAB, label: `${pct(t)}` });
    }
    return arr;
  }, [gridM, effStep, toSVG]);

  const handlePointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;

    // 1. Title drag
    const ta = parseInt(e.target.dataset?.titleAxis || '0');
    if (ta > 0) {
      const rect = svgRef.current.getBoundingClientRect();
      dragging.current = {
        type: 'title', axis: ta,
        startX: e.clientX, startY: e.clientY,
        origDx: 0, origDy: 0,
        scaleX: W / rect.width, scaleY: svgH / rect.height,
      };
      setTitleOffsets(prev => {
        dragging.current = { ...dragging.current, origDx: prev[ta][0], origDy: prev[ta][1] };
        return prev;
      });
      return;
    }

    // 2. Vertex drag
    const va = parseInt(e.target.dataset?.vertexAxis || '0');
    if (va > 0) {
      const rect = svgRef.current.getBoundingClientRect();
      dragging.current = {
        type: 'vertex', axis: va,
        startX: e.clientX, startY: e.clientY,
        origDx: 0, origDy: 0,
        scaleX: W / rect.width, scaleY: svgH / rect.height,
      };
      setVertexOffsets(prev => {
        dragging.current = { ...dragging.current, origDx: prev[va][0], origDy: prev[va][1] };
        return prev;
      });
      return;
    }

    // 3. Label drag
    const labelId = e.target.dataset?.labelId;
    if (labelId) {
      const id = parseInt(labelId);
      const rect = svgRef.current.getBoundingClientRect();
      const pt = points.find(p => p.id === id);
      dragging.current = {
        type: 'label', id,
        startX: e.clientX, startY: e.clientY,
        origDx: pt?.labelDx || 0, origDy: pt?.labelDy || 0,
        scaleX: W / rect.width, scaleY: svgH / rect.height,
      };
      return;
    }

    // 4. Point drag
    const ptId = e.target.dataset?.ptId;
    if (ptId) {
      const id = parseInt(ptId);
      onSelectPoint(id);
      dragging.current = { type: 'point', id };
      return;
    }

    // 5. Empty area — place point on left-click, context menu on long-press
    const raw = baryRaw(e);
    if (raw[0] >= -0.01 && raw[1] >= -0.01 && raw[2] >= -0.01) {
      downClient.current = { x: e.clientX, y: e.clientY };
      longPressTimer.current = setTimeout(() => {
        longPressTimer.current = null;
        downClient.current = null;
        onShowContextMenu?.({ type: 'background', x: e.clientX, y: e.clientY });
      }, 600);
      onSelectPoint(null);
      const clamped = clampSimplex(raw);
      onAddPoint(snapEnabled ? snapToGrid(clamped, gridM) : clamped);
    }
  }, [baryRaw, points, gridM, snapEnabled, onAddPoint, onSelectPoint, onShowContextMenu, W, svgH, setTitleOffsets, setVertexOffsets]);

  const handlePointerMove = useCallback((e) => {
    // Cancel long press if finger/cursor moved significantly
    if (longPressTimer.current && downClient.current) {
      const dx = e.clientX - downClient.current.x;
      const dy = e.clientY - downClient.current.y;
      if (dx * dx + dy * dy > 36) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
    if (!dragging.current) return;

    if (dragging.current?.type === 'title') {
      const { axis, startX, startY, origDx, origDy, scaleX, scaleY } = dragging.current;
      const dx = (e.clientX - startX) * scaleX, dy = (e.clientY - startY) * scaleY;
      setTitleOffsets(prev => ({ ...prev, [axis]: [origDx + dx, origDy + dy] }));
      return;
    }

    if (dragging.current?.type === 'vertex') {
      const { axis, startX, startY, origDx, origDy, scaleX, scaleY } = dragging.current;
      const dx = (e.clientX - startX) * scaleX, dy = (e.clientY - startY) * scaleY;
      setVertexOffsets(prev => ({ ...prev, [axis]: [origDx + dx, origDy + dy] }));
      return;
    }

    if (dragging.current?.type === 'label') {
      const { id, startX, startY, origDx, origDy, scaleX, scaleY } = dragging.current;
      onMoveLabel(id, origDx + (e.clientX - startX) * scaleX, origDy + (e.clientY - startY) * scaleY);
      return;
    }

    if (dragging.current?.type === 'point') {
      const raw = baryRaw(e);
      const clamped = clampSimplex(raw);
      const coords = snapEnabled ? snapToGrid(clamped, gridM) : clamped;
      onMovePoint(dragging.current.id, coords);
    }
  }, [baryRaw, gridM, snapEnabled, onMovePoint, onMoveLabel, setTitleOffsets, setVertexOffsets]);

  const handlePointerUp = useCallback(() => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    downClient.current = null;
    dragging.current = null;
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    const ta = parseInt(e.target.dataset?.titleAxis || '0');
    const va = parseInt(e.target.dataset?.vertexAxis || '0');
    if (ta > 0) {
      onShowContextMenu?.({ type: 'title', axis: ta, x: e.clientX, y: e.clientY });
    } else if (va > 0) {
      onShowContextMenu?.({ type: 'vertex', axis: va, x: e.clientX, y: e.clientY });
    } else {
      onShowContextMenu?.({ type: 'background', x: e.clientX, y: e.clientY });
    }
  }, [onShowContextMenu]);

  const axisColor = { 1: style.c1, 2: style.c2, 3: style.c3 };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${svgH}`}
      style={{
        display: "block", width: "100%", maxWidth: W, height: "auto",
        cursor: "crosshair", touchAction: "none", userSelect: "none", fontFamily: "sans-serif",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <polygon points={`${vx1},${vy1} ${vx2},${vy2} ${vx3},${vy3}`} fill={style.bgFill} stroke="none"/>

      {/* Grid lines */}
      {gridLines.map((l, i) => {
        const sw = l.major ? style.gridMajorW : style.gridMinorW;
        const op = l.major ? style.gridMajorOp : style.gridMinorOp;
        return (
          <g key={i} pointerEvents="none">
            <line x1={l.ax1} y1={l.ay1} x2={l.ax2} y2={l.ay2} stroke="#6b7280" strokeWidth={sw} opacity={op}/>
            <line x1={l.bx1} y1={l.by1} x2={l.bx2} y2={l.by2} stroke="#6b7280" strokeWidth={sw} opacity={op}/>
            <line x1={l.cx1} y1={l.cy1} x2={l.cx2} y2={l.cy2} stroke="#6b7280" strokeWidth={sw} opacity={op}/>
          </g>
        );
      })}

      {/* Dashed intermediate lines */}
      {style.gridDashShow && interLines.map((l, i) => (
        <g key={i} pointerEvents="none">
          <line x1={l.ax1} y1={l.ay1} x2={l.ax2} y2={l.ay2} stroke="#6b7280" strokeWidth={style.gridDashW} strokeDasharray="3 3" opacity={style.gridDashOp}/>
          <line x1={l.bx1} y1={l.by1} x2={l.bx2} y2={l.by2} stroke="#6b7280" strokeWidth={style.gridDashW} strokeDasharray="3 3" opacity={style.gridDashOp}/>
          <line x1={l.cx1} y1={l.cy1} x2={l.cx2} y2={l.cy2} stroke="#6b7280" strokeWidth={style.gridDashW} strokeDasharray="3 3" opacity={style.gridDashOp}/>
        </g>
      ))}

      {/* Triangle border */}
      <polygon points={`${vx1},${vy1} ${vx2},${vy2} ${vx3},${vy3}`} fill="none" stroke={style.borderColor} strokeWidth={style.borderW} pointerEvents="none"/>

      {/* Left ticks (X2) */}
      {leftTicks.map((t, i) => (
        <g key={i} pointerEvents="none">
          <line x1={t.px} y1={t.py} x2={t.px + NORM_L[0] * TICK} y2={t.py + NORM_L[1] * TICK} stroke={style.c2} strokeWidth="1.2"/>
          <text x={t.lx} y={t.ly + 3.5} textAnchor="end" fontSize={style.fontTick} fill={style.c2} fontWeight="600">{t.label}</text>
        </g>
      ))}

      {/* Right ticks (X1) */}
      {rightTicks.map((t, i) => (
        <g key={i} pointerEvents="none">
          <line x1={t.px} y1={t.py} x2={t.px + NORM_R[0] * TICK} y2={t.py + NORM_R[1] * TICK} stroke={style.c1} strokeWidth="1.2"/>
          <text x={t.lx} y={t.ly + 3.5} textAnchor="start" fontSize={style.fontTick} fill={style.c1} fontWeight="600">{t.label}</text>
        </g>
      ))}

      {/* Bottom ticks (X3) */}
      {bottomTicks.map((t, i) => (
        <g key={i} pointerEvents="none">
          <line x1={t.px} y1={t.py} x2={t.px + NORM_B[0] * TICK} y2={t.py + NORM_B[1] * TICK} stroke={style.c3} strokeWidth="1.2"/>
          <text x={t.lx} y={t.ly + 10} textAnchor="middle" fontSize={style.fontTick} fill={style.c3} fontWeight="600">{t.label}</text>
        </g>
      ))}

      {/* Draggable axis titles */}
      {[1, 2, 3].map(ax => {
        const p = titlePos[ax], [ox, oy] = titleOffsets[ax];
        return (
          <text key={ax}
            x={p.x + ox} y={p.y + oy}
            textAnchor={p.anchor}
            fontSize={style.fontTitle}
            fill={axisColor[ax]}
            fontWeight="800"
            data-title-axis={ax}
            style={{ cursor: "move", userSelect: "none" }}
            onDoubleClick={() => setTitleOffsets(prev => ({ ...prev, [ax]: [0, 0] }))}
          >
            {compNames[ax - 1]} (%)
          </text>
        );
      })}

      {/* Vertex labels */}
      {[[1, vx1, vy1 - 10, style.c1], [2, vx2, vy2 + 18, style.c2], [3, vx3, vy3 + 18, style.c3]].map(([ax, bx, by, col]) => (
        <text key={ax}
          x={bx + (vertexOffsets[ax]?.[0] ?? 0)}
          y={by + (vertexOffsets[ax]?.[1] ?? 0)}
          textAnchor="middle" fontSize={style.fontVertex} fontWeight="900" fill={col}
          data-vertex-axis={ax}
          style={{ cursor: "move", userSelect: "none" }}
          onDoubleClick={() => setVertexOffsets(prev => ({ ...prev, [ax]: [0, 0] }))}
        >
          {compNames[ax - 1]}
        </text>
      ))}

      {/* Lines between points */}
      {showLines && points.length >= 2 && points.slice(1).map((pt, i) => {
        const prev = points[i];
        const x3p = 1 - prev.x1 - prev.x2;
        const x3c = 1 - pt.x1 - pt.x2;
        if (x3p < -0.001 || x3c < -0.001) return null;
        const [px, py] = toSVG(prev.x1, prev.x2, Math.max(0, x3p));
        const [cx, cy] = toSVG(pt.x1, pt.x2, Math.max(0, x3c));
        return (
          <line key={i} x1={px} y1={py} x2={cx} y2={cy}
            stroke="#6b7280" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7} pointerEvents="none"/>
        );
      })}

      {/* Points */}
      {points.map((pt, i) => {
        const x3 = 1 - pt.x1 - pt.x2;
        if (x3 < -0.001) return null;
        const [sx, sy] = toSVG(pt.x1, pt.x2, Math.max(0, x3));
        const isSelected = pt.id === selectedId;
        const lx = sx + (pt.labelDx || 0);
        const ly = sy - style.dotR - 6 + (pt.labelDy || 0);
        return (
          <g key={pt.id}>
            {isSelected && (
              <circle cx={sx} cy={sy} r={style.dotR + 5} fill="none" stroke={pt.color}
                strokeWidth={2} strokeDasharray="4 2" opacity={0.8} pointerEvents="none"/>
            )}
            <circle cx={sx} cy={sy} r={style.dotR} fill={pt.color} stroke="white" strokeWidth={2.5}
              data-pt-id={pt.id} style={{ cursor: "grab", pointerEvents: "all" }}/>
            <text x={lx} y={ly} textAnchor="middle" fontSize={13} fill={pt.color} fontWeight="700"
              data-label-id={pt.id} style={{ cursor: "move", userSelect: "none", pointerEvents: "all" }}>
              {pt.label || `P${i + 1}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div style={{
      background: "var(--bg-card,#fff)",
      border: "1px solid var(--border,#e4e4e7)",
      borderRadius: 12, padding: 14,
    }}>
      {title && (
        <p style={{
          fontSize: 11, fontWeight: 800,
          color: "var(--text-muted,#6b7280)",
          letterSpacing: ".06em", textTransform: "uppercase",
          marginBottom: 10, marginTop: 0,
        }}>{title}</p>
      )}
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TernaryBuilderPage() {
  const [compNames,     setCompNames]     = useState(["X₁", "X₂", "X₃"]);
  const [points,        setPoints]        = useState([]);
  const [selectedId,    setSelectedId]    = useState(null);
  const [showLines,     setShowLines]     = useState(false);
  const [snapEnabled,   setSnapEnabled]   = useState(false);
  const [gridM,         setGridM]         = useState(10);
  const [sizeId,        setSizeId]        = useState("XL");
  const [style,         setStyle]         = useState(DEFAULT_STYLE);
  const [stylePanelOpen, setStylePanelOpen] = useState(false);
  const [newColor,      setNewColor]      = useState(PALETTE[0]);
  const svgRef   = useRef(null);
  const ptIdRef  = useRef(0);
  const [ctxMenu, setCtxMenu] = useState(null);

  const W = SIZES.find(s => s.id === sizeId)?.W ?? 780;
  const selectedPt = points.find(p => p.id === selectedId);

  const handleAddPoint = useCallback(([x1, x2, x3]) => {
    const id = ++ptIdRef.current;
    setPoints(pts => [...pts, { id, x1, x2, label: "", color: newColor, labelDx: 0, labelDy: 0 }]);
    setSelectedId(id);
  }, [newColor]);

  const handleMovePoint = useCallback((id, [x1, x2]) => {
    setPoints(pts => pts.map(p => p.id === id ? { ...p, x1, x2 } : p));
  }, []);

  const handleMoveLabel = useCallback((id, dx, dy) => {
    setPoints(pts => pts.map(p => p.id === id ? { ...p, labelDx: dx, labelDy: dy } : p));
  }, []);

  const handleSelectPoint = useCallback((id) => { setSelectedId(id); }, []);

  const updateSelectedLabel = useCallback((label) => {
    setPoints(pts => pts.map(p => p.id === selectedId ? { ...p, label } : p));
  }, [selectedId]);

  const updateSelectedColor = useCallback((color) => {
    setPoints(pts => pts.map(p => p.id === selectedId ? { ...p, color } : p));
    setNewColor(color);
  }, [selectedId]);

  const removeSelected = useCallback(() => {
    setPoints(pts => pts.filter(p => p.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const handleShowContextMenu = useCallback((menu) => { setCtxMenu(menu); }, []);

  const handleResetTitleOffset = useCallback((axis) => {
    setStyle(s => ({
      ...s,
      titleOffsets: axis
        ? { ...s.titleOffsets, [axis]: [0, 0] }
        : { 1: [0, 0], 2: [0, 0], 3: [0, 0] },
    }));
  }, []);

  const handleResetVertexOffset = useCallback((axis) => {
    setStyle(s => ({
      ...s,
      vertexOffsets: axis
        ? { ...s.vertexOffsets, [axis]: [0, 0] }
        : { 1: [0, 0], 2: [0, 0], 3: [0, 0] },
    }));
  }, []);

  const handleRenameComp = useCallback((idx, val) => {
    setCompNames(n => n.map((v, i) => i === idx ? val : v));
  }, []);

  const exportSVG = useCallback(() => {
    const svg = svgRef.current; if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = '<?xml version="1.0" encoding="UTF-8"?>' + serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'diagramme-ternaire.svg'; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportPNG = useCallback(() => {
    const svg = svgRef.current; if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = '<?xml version="1.0" encoding="UTF-8"?>' + serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const sc = 2;
      const canvas = document.createElement('canvas');
      canvas.width  = svg.clientWidth  * sc;
      canvas.height = svg.clientHeight * sc;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = style.bgFill || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(sc, sc);
      ctx.drawImage(img, 0, 0, svg.clientWidth, svg.clientHeight);
      canvas.toBlob(b => {
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u; a.download = 'diagramme-ternaire.png'; a.click();
        URL.revokeObjectURL(u);
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [style.bgFill]);

  const inputStyle = {
    border: "1px solid var(--border,#e4e4e7)",
    borderRadius: 6, padding: "4px 8px",
    fontSize: 13,
    background: "var(--bg,#fff)",
    color: "var(--text,#18181b)",
    width: "100%", boxSizing: "border-box",
  };

  // Derived values for selected point display
  const selX1 = selectedPt ? pct(selectedPt.x1) : null;
  const selX2 = selectedPt ? pct(selectedPt.x2) : null;
  const selX3 = selectedPt ? Math.max(0, pct(1 - selectedPt.x1 - selectedPt.x2)) : null;

  return (
    <div style={{ fontFamily: "var(--font-sans,sans-serif)", padding: "1rem 0 2rem", width: "100%" }}>
      <StylePanel
        open={stylePanelOpen}
        style={style}
        onChange={setStyle}
        onSave={() => setStylePanelOpen(false)}
        onClose={() => setStylePanelOpen(false)}
      />

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", padding: "0 1rem" }}>

        {/* ── Left panel ── */}
        <div style={{ width: 272, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Composants */}
          <Card title="Composants">
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: [style.c1, style.c2, style.c3][i],
                }}/>
                <input
                  value={compNames[i]}
                  onChange={e => setCompNames(n => n.map((v, j) => j === i ? e.target.value : v))}
                  placeholder={`Composant ${i + 1}`}
                  style={inputStyle}
                />
              </div>
            ))}
          </Card>

          {/* Point sélectionné */}
          {selectedPt && (
            <Card title="Point sélectionné">
              {/* Coordinates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                {[
                  { label: "X₁", val: selX1, color: style.c1 },
                  { label: "X₂", val: selX2, color: style.c2 },
                  { label: "X₃", val: selX3, color: style.c3 },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{
                    background: "var(--bg-secondary,#f9fafb)",
                    borderRadius: 8, padding: "6px 4px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text,#18181b)", fontFamily: "monospace" }}>{val}%</div>
                  </div>
                ))}
              </div>

              {/* Label input */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: "var(--text-muted,#6b7280)", fontWeight: 600, display: "block", marginBottom: 3 }}>Étiquette</label>
                <input
                  value={selectedPt.label}
                  onChange={e => updateSelectedLabel(e.target.value)}
                  placeholder="Nom du point…"
                  style={inputStyle}
                />
              </div>

              {/* Color palette */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: "var(--text-muted,#6b7280)", fontWeight: 600, display: "block", marginBottom: 4 }}>Couleur</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {PALETTE.map(c => (
                    <button key={c} onClick={() => updateSelectedColor(c)}
                      style={{
                        width: 20, height: 20, borderRadius: 4, background: c, cursor: "pointer",
                        border: selectedPt.color === c ? "2px solid #18181b" : "1.5px solid transparent",
                        padding: 0,
                      }}/>
                  ))}
                </div>
              </div>

              {/* Remove */}
              <button onClick={removeSelected}
                style={{
                  width: "100%", padding: "6px 0",
                  background: "#fee2e2", color: "#dc2626",
                  border: "none", borderRadius: 8,
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}>
                Supprimer ce point
              </button>
            </Card>
          )}

          {/* Nouveau point */}
          {!selectedPt && (
            <Card title="Nouveau point">
              <p style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginBottom: 10, marginTop: 0 }}>
                Cliquez sur le diagramme pour placer un point.
              </p>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-muted,#6b7280)", fontWeight: 600, display: "block", marginBottom: 4 }}>Couleur du prochain point</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {PALETTE.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      style={{
                        width: 20, height: 20, borderRadius: 4, background: c, cursor: "pointer",
                        border: newColor === c ? "2px solid #18181b" : "1.5px solid transparent",
                        padding: 0,
                      }}/>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Points list */}
          {points.length > 0 && (
            <Card title={`Points (${points.length})`}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={showLines} onChange={e => setShowLines(e.target.checked)}
                    style={{ accentColor: "#16a34a" }}/>
                  Relier les points
                </label>
                <button onClick={() => { setPoints([]); setSelectedId(null); }}
                  style={{ fontSize: 10, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                  Tout effacer
                </button>
              </div>
              <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                {points.map((pt, i) => {
                  const isSelected = pt.id === selectedId;
                  return (
                    <div key={pt.id}
                      onClick={() => setSelectedId(id => id === pt.id ? null : pt.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 8px", borderRadius: 7, cursor: "pointer",
                        background: isSelected ? "#eff6ff" : "var(--bg-secondary,#f9fafb)",
                        border: isSelected ? "1.5px solid #3b82f6" : "1.5px solid transparent",
                      }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: pt.color, flexShrink: 0 }}/>
                      <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: "var(--text,#18181b)" }}>
                        {pt.label || `P${i + 1}`} · {pct(pt.x1)}/{pct(pt.x2)}/{Math.max(0, pct(1 - pt.x1 - pt.x2))}
                      </span>
                      <button onClick={e => { e.stopPropagation(); if (isSelected) setSelectedId(null); setPoints(pts => pts.filter(p => p.id !== pt.id)); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 15, lineHeight: 1, padding: "0 2px" }}>
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Grille */}
          <Card title="Grille">
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {[{ id: 10, label: "10%" }, { id: 20, label: "5%" }].map(g => (
                <button key={g.id} onClick={() => setGridM(g.id)}
                  style={{
                    flex: 1, padding: "5px 0", fontSize: 12, fontWeight: 700,
                    border: "1.5px solid", borderRadius: 6, cursor: "pointer",
                    borderColor: gridM === g.id ? "#16a34a" : "var(--border,#e4e4e7)",
                    background:  gridM === g.id ? "#f0fdf4" : "var(--bg,#fff)",
                    color:       gridM === g.id ? "#16a34a" : "var(--text-muted,#6b7280)",
                  }}>{g.label}</button>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={snapEnabled} onChange={e => setSnapEnabled(e.target.checked)}
                style={{ accentColor: "#16a34a" }}/>
              Accrocher à la grille
            </label>
          </Card>

          {/* Taille d'export */}
          <Card title="Taille d'export">
            <div style={{ display: "flex", gap: 6 }}>
              {SIZES.map(s => (
                <button key={s.id} onClick={() => setSizeId(s.id)}
                  style={{
                    flex: 1, padding: "5px 0", fontSize: 12, fontWeight: 700,
                    border: "1.5px solid", borderRadius: 6, cursor: "pointer",
                    borderColor: sizeId === s.id ? "#2563eb" : "var(--border,#e4e4e7)",
                    background:  sizeId === s.id ? "#eff6ff" : "var(--bg,#fff)",
                    color:       sizeId === s.id ? "#2563eb" : "var(--text-muted,#6b7280)",
                  }}>{s.id}</button>
              ))}
            </div>
          </Card>

          {/* Style + export buttons */}
          <button
            onClick={() => setStylePanelOpen(true)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              width: "100%", padding: "8px 0",
              background: "var(--bg,#fff)", border: "1.5px solid var(--border,#e4e4e7)",
              borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
              color: "var(--text-muted,#6b7280)",
            }}>
            <GearIcon className="w-4 h-4" style={{ width: 16, height: 16 }}/>
            Style
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportSVG}
              style={{
                flex: 1, padding: "8px 0",
                border: "1.5px solid #e4e4e7", borderRadius: 8,
                background: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", color: "#374151",
              }}>
              ↓ SVG
            </button>
            <button onClick={exportPNG}
              style={{
                flex: 1, padding: "8px 0",
                background: "#2563eb", border: "none", borderRadius: 8,
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
              ↓ PNG ×2
            </button>
          </div>

        </div>

        {/* ── Diagram ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: "#fff",
            border: "1px solid #e4e4e7",
            borderRadius: 16, padding: 16,
            overflow: "auto",
          }}>
            <BuilderDiagram
              compNames={compNames}
              points={points}
              selectedId={selectedId}
              showLines={showLines}
              gridM={gridM}
              snapEnabled={snapEnabled}
              W={W}
              svgRef={svgRef}
              style={style}
              onStyleChange={setStyle}
              onAddPoint={handleAddPoint}
              onMovePoint={handleMovePoint}
              onSelectPoint={handleSelectPoint}
              onMoveLabel={handleMoveLabel}
              onShowContextMenu={handleShowContextMenu}
            />
          </div>
        </div>

      </div>

      {ctxMenu && (
        <ContextMenu
          menu={ctxMenu}
          compNames={compNames}
          diagStyle={style}
          onClose={() => setCtxMenu(null)}
          onOpenStyle={() => setStylePanelOpen(true)}
          onRenameComp={handleRenameComp}
          onResetTitleOffset={handleResetTitleOffset}
          onResetVertexOffset={handleResetVertexOffset}
        />
      )}
    </div>
  );
}
