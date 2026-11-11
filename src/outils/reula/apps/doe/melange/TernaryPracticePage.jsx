// ─── TernaryPracticePage.jsx ──────────────────────────────────────────────────
import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { ArrowLeftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { LightBulbIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../../../AuthContext";
import { supabase } from "../../../lib/supabaseClient";

const SQR3_2 = Math.sqrt(3) / 2;
const NORM_L = [-SQR3_2, -0.5];
const NORM_R = [ SQR3_2, -0.5];
const NORM_B = [0, 1];
const AXIS_LABEL = { 1: "X₁", 2: "X₂", 3: "X₃" };
const AXIS_IDX   = { 1: "1",  2: "2",  3: "3"  };
/* Render "Xₙ" as SVG tspan so the subscript digit can be sized independently */
function AxisLabelSVG({ axis, fontSize, color, fontWeight, suffix="" }) {
  const sub = fontSize * 0.88;
  return (
    <>
      <tspan fontSize={fontSize} fill={color} fontWeight={fontWeight}>X</tspan>
      <tspan fontSize={sub} fill={color} fontWeight={fontWeight} baselineShift="sub">{AXIS_IDX[axis]}</tspan>
      {suffix && <tspan fontSize={fontSize} fill={color} fontWeight={fontWeight} baselineShift="baseline">{suffix}</tspan>}
    </>
  );
}

const DEFAULT_STYLE = {
  c1: "#ef4444", c2: "#3b82f6", c3: "#10b981",
  bgFill: "#ffffff",
  borderW: 2, borderColor: "#374151",
  dotR: 12, dotColor: "#2563eb",
  fontTick: 15, fontTitle: 17, fontVertex: 21,
  gridMajorW: 1.3, gridMajorOp: 0.7,
  gridMinorW: 1.3, gridMinorOp: 0.5,
  gridDashShow: true, gridDashW: 1, gridDashOp: 0.75,
  titleOffsets:  { 1: [38, -12.5], 2: [-30.5, -10], 3: [0, 0] },
  vertexOffsets: { 1: [2, -9.5],   2: [-21, 9],     3: [23, 4] },
};

const SIZES = [
  { id: "L",   label: "L",   W: 460  },
  { id: "XL",  label: "XL",  W: 780  },
  { id: "XXL", label: "XXL", W: 1050 },
];
const PAD = { top: 44, left: 62, right: 62, bottom: 68 };

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function clampSimplex([a,b,c]) {
  const arr=[Math.max(0,a),Math.max(0,b),Math.max(0,c)],s=arr[0]+arr[1]+arr[2];
  if(s<1e-9) return[1/3,1/3,1/3];
  return arr.map(v=>v/s);
}
function euclidean([a1,a2,a3],[b1,b2,b3]){return Math.sqrt((a1-b1)**2+(a2-b2)**2+(a3-b3)**2);}
function snapToGrid([x1,x2,x3],m){
  let best=null,bestD=Infinity;
  for(let i=0;i<=m;i++) for(let j=0;j<=m-i;j++){
    const k=m-i-j,d=(x1-i/m)**2+(x2-j/m)**2+(x3-k/m)**2;
    if(d<bestD){bestD=d;best=[i/m,j/m,k/m];}
  }
  return best;
}
function pct(v){return Math.round(v*100);}

// ─── Exercise pools ───────────────────────────────────────────────────────────
function genMultiples(m){const pts=[];for(let i=0;i<=m;i++) for(let j=0;j<=m-i;j++) pts.push([i/m,j/m,(m-i-j)/m]);return pts;}
const ALL10=genMultiples(10),ALL20=genMultiples(20);
const POOLS={
  débutant:[[1,0,0],[0,1,0],[0,0,1],[0.5,0.5,0],[0.5,0,0.5],[0,0.5,0.5],[0.6,0.2,0.2],[0.2,0.6,0.2],[0.2,0.2,0.6],[0.4,0.4,0.2],[0.4,0.2,0.4],[0.2,0.4,0.4],[0.7,0.2,0.1],[0.7,0.1,0.2],[0.2,0.7,0.1],[0.1,0.7,0.2],[0.2,0.1,0.7],[0.1,0.2,0.7],[0.3,0.3,0.4],[0.3,0.4,0.3],[0.4,0.3,0.3]],
  intermédiaire:ALL10,
  avancé:ALL20.filter(([a,b,c])=>a>0&&b>0&&c>0),
  expert:ALL20,
};
const DIFFICULTIES=[
  {id:"débutant",      label:"Débutant",      gridM:10,snapM:20},
  {id:"intermédiaire", label:"Intermédiaire",  gridM:10,snapM:20},
  {id:"avancé",        label:"Avancé",         gridM:10,snapM:20},
  {id:"expert",        label:"Expert",         gridM:10,snapM:20},
];
function pickExercise(difficulty,last){const pool=POOLS[difficulty];let pt,tries=0;do{pt=pool[Math.floor(Math.random()*pool.length)];tries++;}while(last&&tries<30&&euclidean(pt,last)<0.1);return pt;}

const INVERSE_COUNTS={débutant:1,intermédiaire:3,avancé:4,expert:7};
const POINT_COLORS=['#8b5cf6','#f59e0b','#ef4444','#3b82f6','#10b981','#f97316','#ec4899','#14b8a6','#6366f1','#84cc16'];
function genInversePts(difficulty){
  const n=INVERSE_COUNTS[difficulty]??3;
  const pool=[...ALL20];
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return pool.slice(0,n);
}

// ─── Gear icon ────────────────────────────────────────────────────────────────
function GearIcon({className}){
  return(
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
    </svg>
  );
}

// ─── Style panel (live — no internal draft state) ─────────────────────────────
function SLabel({children}){return<span className="text-xs text-gray-500 w-28 flex-shrink-0">{children}</span>;}
function ColorRow({label,value,onChange}){
  return(
    <div className="flex items-center gap-2 h-7">
      <SLabel>{label}</SLabel>
      <input type="color" value={value} onChange={e=>onChange(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-gray-200"/>
      <span className="text-xs font-mono text-gray-400">{value}</span>
    </div>
  );
}
function SliderRow({label,min,max,step=1,value,onChange}){
  return(
    <div className="flex items-center gap-2">
      <SLabel>{label}</SLabel>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))} className="flex-1 accent-green-600 h-1.5"/>
      <span className="text-xs font-mono text-gray-500 w-8 text-right">{value}</span>
    </div>
  );
}
function ToggleRow({label,value,onChange}){
  return(
    <div className="flex items-center gap-2 h-7">
      <SLabel>{label}</SLabel>
      <button onClick={()=>onChange(!value)} className={`w-10 h-5 rounded-full transition-colors relative ${value?"bg-green-600":"bg-gray-300"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value?"translate-x-5":"translate-x-0.5"}`}/>
      </button>
    </div>
  );
}
function SSection({title,children}){
  return(
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StylePanel({open,style,onChange,onSave,onClose}){
  const savedRef=useRef(style);
  useEffect(()=>{if(open) savedRef.current=style;},[open]);

  const set=(key,val)=>onChange({...style,[key]:val});
  const handleCancel=()=>{onChange(savedRef.current);onClose();};
  const handleReset=()=>onChange(DEFAULT_STYLE);

  return(
    <>
      {open&&<div className="fixed inset-0 bg-black/20 z-40" onClick={handleCancel}/>}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${open?"translate-x-0":"translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <GearIcon className="w-4 h-4 text-gray-500"/>
            <span className="font-bold text-gray-800 text-sm">Style du diagramme</span>
          </div>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-700 text-xl leading-none px-1">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <SSection title="Couleurs des axes">
            <ColorRow label="X₁" value={style.c1} onChange={v=>set("c1",v)}/>
            <ColorRow label="X₂" value={style.c2} onChange={v=>set("c2",v)}/>
            <ColorRow label="X₃" value={style.c3} onChange={v=>set("c3",v)}/>
            <ColorRow label="Fond" value={style.bgFill} onChange={v=>set("bgFill",v)}/>
          </SSection>
          <SSection title="Bordure du triangle">
            <SliderRow label="Épaisseur" min={0.5} max={6} step={0.5} value={style.borderW} onChange={v=>set("borderW",v)}/>
            <ColorRow label="Couleur" value={style.borderColor} onChange={v=>set("borderColor",v)}/>
          </SSection>
          <SSection title="Point placé">
            <SliderRow label="Rayon (px)" min={4} max={24} value={style.dotR} onChange={v=>set("dotR",v)}/>
            <ColorRow label="Couleur neutre" value={style.dotColor} onChange={v=>set("dotColor",v)}/>
          </SSection>
          <SSection title="Grille principale">
            <SliderRow label="Épaisseur" min={0.1} max={4} step={0.1} value={style.gridMajorW} onChange={v=>set("gridMajorW",v)}/>
            <SliderRow label="Opacité" min={0} max={1} step={0.05} value={style.gridMajorOp} onChange={v=>set("gridMajorOp",v)}/>
          </SSection>
          <SSection title="Graduation secondaire">
            <SliderRow label="Épaisseur" min={0.1} max={3} step={0.1} value={style.gridMinorW} onChange={v=>set("gridMinorW",v)}/>
            <SliderRow label="Opacité" min={0} max={1} step={0.05} value={style.gridMinorOp} onChange={v=>set("gridMinorOp",v)}/>
          </SSection>
          <SSection title="Pointillés intermédiaires">
            <ToggleRow label="Afficher" value={style.gridDashShow} onChange={v=>set("gridDashShow",v)}/>
            <SliderRow label="Épaisseur" min={0.1} max={3} step={0.1} value={style.gridDashW} onChange={v=>set("gridDashW",v)}/>
            <SliderRow label="Opacité" min={0} max={1} step={0.05} value={style.gridDashOp} onChange={v=>set("gridDashOp",v)}/>
          </SSection>
          <SSection title="Typographie">
            <SliderRow label="Côtés (ticks)" min={6} max={24} value={style.fontTick} onChange={v=>set("fontTick",v)}/>
            <SliderRow label="Titres X₁(%)…" min={6} max={28} value={style.fontTitle} onChange={v=>set("fontTitle",v)}/>
            <SliderRow label="Sommets X₁…" min={6} max={32} value={style.fontVertex} onChange={v=>set("fontVertex",v)}/>
          </SSection>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 space-y-2">
          <div className="flex gap-2">
            <button onClick={handleReset} className="px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Réinitialiser</button>
            <button onClick={onSave} className="flex-1 py-2 text-xs font-bold bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">Sauvegarder</button>
          </div>
          <button
            onClick={() => {
              const json = JSON.stringify(style, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "ternary-style.json"; a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full py-2 text-xs font-semibold text-gray-500 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-1.5">
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"/>
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"/>
            </svg>
            Télécharger le style (JSON)
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Diagram SVG ─────────────────────────────────────────────────────────────
function PracticeDiagram({
  target,placed,onPlace,
  hintLevel,showSolution,validated,
  gridM,snapM,diagramW,
  reticles,onAddReticle,onRemoveReticle,
  style, onStyleChange,
  inversePts,inverseValidated,inverseResults,
  selectedPtIdx,confirmedPts,onSelectPt,
  allowReticle,
}){
  const svgRef=useRef(null);
  const dragging=useRef(null); // null | 'point' | 'reticle' | {type:'title',axis,startX,startY,origDx,origDy,scaleX,scaleY}
  const [activeReticle,setActiveReticle]=useState(null);
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

  const axisColor={1:style.c1,2:style.c2,3:style.c3};
  const W=diagramW, scale=W-PAD.left-PAD.right;
  const svgH=Math.round(SQR3_2*scale)+PAD.top+PAD.bottom;

  const toSVG=useCallback((x1,x2,x3)=>{
    const cx=x1*0.5+x3,cy=x2*SQR3_2+x3*SQR3_2;
    return[PAD.left+cx*scale,PAD.top+cy*scale];
  },[scale]);

  const baryRaw=useCallback((e)=>{
    const rect=svgRef.current.getBoundingClientRect();
    const sx=(e.clientX-rect.left)*(W/rect.width),sy=(e.clientY-rect.top)*(svgH/rect.height);
    const u=(sx-PAD.left)/scale,v=(sy-PAD.top)/scale;
    const x1=1-v/SQR3_2,x3=u-0.5+0.5*v/SQR3_2;
    return[x1,1-x1-x3,x3];
  },[W,svgH,scale]);

  const detectEdge=([x1,x2,x3])=>{
    const T=0.03;
    if(x1<=T&&x1<=x2&&x1<=x3) return 1;
    if(x2<=T&&x2<=x1&&x2<=x3) return 2;
    if(x3<=T&&x3<=x1&&x3<=x2) return 3;
    return 0;
  };

  const reticleLine=useCallback((axis,v)=>{
    if(axis===1) return[toSVG(v,1-v,0),toSVG(v,0,1-v)];
    if(axis===2) return[toSVG(0,v,1-v),toSVG(1-v,v,0)];
    return[toSVG(0,1-v,v),toSVG(1-v,0,v)];
  },[toSVG]);

  const handlePointerDown=useCallback((e)=>{
    e.currentTarget.setPointerCapture(e.pointerId);
    // Check title drag
    const ta=parseInt(e.target.dataset?.titleAxis||'0');
    if(ta>0){
      const rect=svgRef.current.getBoundingClientRect();
      dragging.current={
        type:'title',axis:ta,
        startX:e.clientX,startY:e.clientY,
        origDx:0,origDy:0,
        scaleX:W/rect.width,scaleY:svgH/rect.height,
      };
      setTitleOffsets(prev=>{
        dragging.current={...dragging.current,origDx:prev[ta][0],origDy:prev[ta][1]};
        return prev;
      });
      return;
    }
    // Check vertex drag
    const va=parseInt(e.target.dataset?.vertexAxis||'0');
    if(va>0){
      const rect=svgRef.current.getBoundingClientRect();
      dragging.current={
        type:'vertex',axis:va,
        startX:e.clientX,startY:e.clientY,
        origDx:0,origDy:0,
        scaleX:W/rect.width,scaleY:svgH/rect.height,
      };
      setVertexOffsets(prev=>{
        dragging.current={...dragging.current,origDx:prev[va][0],origDy:prev[va][1]};
        return prev;
      });
      return;
    }
    const rect2=svgRef.current.getBoundingClientRect();
    const cx2=(e.clientX-rect2.left)*(W/rect2.width),cy2=(e.clientY-rect2.top)*(svgH/rect2.height);
    if(inversePts&&onSelectPt){
      for(let i=0;i<inversePts.length;i++){
        const[sx,sy]=toSVG(...inversePts[i]);
        if(Math.sqrt((cx2-sx)**2+(cy2-sy)**2)<style.dotR+8){onSelectPt(i);return;}
      }
    }
    const raw=baryRaw(e);
    const axis=detectEdge(raw);
    if(axis>0&&allowReticle){
      const snapped=snapToGrid(clampSimplex(raw),snapM);
      dragging.current='reticle';
      setActiveReticle({axis,value:snapped[axis-1]});
      return;
    }
    if(inversePts) return;
    if(onPlace){
      dragging.current='point';
      onPlace(snapToGrid(clampSimplex(raw),snapM));
    }
  },[baryRaw,snapM,onPlace,W,svgH,inversePts,onSelectPt,toSVG,style.dotR,allowReticle]);

  const handlePointerMove=useCallback((e)=>{
    if(!dragging.current) return;
    if(dragging.current?.type==='title'){
      const{axis,startX,startY,origDx,origDy,scaleX,scaleY}=dragging.current;
      const dx=(e.clientX-startX)*scaleX,dy=(e.clientY-startY)*scaleY;
      setTitleOffsets(prev=>({...prev,[axis]:[origDx+dx,origDy+dy]}));
      return;
    }
    if(dragging.current?.type==='vertex'){
      const{axis,startX,startY,origDx,origDy,scaleX,scaleY}=dragging.current;
      const dx=(e.clientX-startX)*scaleX,dy=(e.clientY-startY)*scaleY;
      setVertexOffsets(prev=>({...prev,[axis]:[origDx+dx,origDy+dy]}));
      return;
    }
    const raw=baryRaw(e);
    if(dragging.current==='reticle'){
      setActiveReticle(prev=>{
        if(!prev) return prev;
        const snapped=snapToGrid(clampSimplex(raw),snapM);
        return{...prev,value:snapped[prev.axis-1]};
      });
    } else if(dragging.current==='point'&&onPlace){
      onPlace(snapToGrid(clampSimplex(raw),snapM));
    }
  },[baryRaw,snapM,onPlace]);

  const handlePointerUp=useCallback(()=>{
    if(dragging.current==='reticle'&&activeReticle&&onAddReticle){
      onAddReticle(activeReticle);
      setActiveReticle(null);
    }
    dragging.current=null;
  },[activeReticle,onAddReticle]);

  const[vx1,vy1]=toSVG(1,0,0),[vx2,vy2]=toSVG(0,1,0),[vx3,vy3]=toSVG(0,0,1);

  const gridLines=useMemo(()=>{
    const lines=[];
    for(let i=1;i<gridM;i++){
      const t=i/gridM,major=(gridM===10||i%2===0);
      const[ax1,ay1]=toSVG(t,1-t,0),[ax2,ay2]=toSVG(t,0,1-t);
      const[bx1,by1]=toSVG(1-t,t,0),[bx2,by2]=toSVG(0,t,1-t);
      const[cx1,cy1]=toSVG(0,1-t,t),[cx2,cy2]=toSVG(1-t,0,t);
      lines.push({ax1,ay1,ax2,ay2,bx1,by1,bx2,by2,cx1,cy1,cx2,cy2,major});
    }
    return lines;
  },[gridM,toSVG]);

  const interLines=useMemo(()=>{
    const lines=[];
    for(let i=0;i<gridM;i++){
      const t=(i+0.5)/gridM;
      const[ax1,ay1]=toSVG(t,1-t,0),[ax2,ay2]=toSVG(t,0,1-t);
      const[bx1,by1]=toSVG(1-t,t,0),[bx2,by2]=toSVG(0,t,1-t);
      const[cx1,cy1]=toSVG(0,1-t,t),[cx2,cy2]=toSVG(1-t,0,t);
      lines.push({ax1,ay1,ax2,ay2,bx1,by1,bx2,by2,cx1,cy1,cx2,cy2});
    }
    return lines;
  },[gridM,toSVG]);

  const labelStep=gridM===20?2:1,skipSome=W<380,effStep=skipSome?labelStep*2:labelStep;
  const TICK=5,LAB=14,TITL=30;

  const leftTicks=useMemo(()=>{const arr=[];for(let i=effStep;i<gridM;i+=effStep){const t=i/gridM,[px,py]=toSVG(1-t,t,0);arr.push({px,py,lx:px+NORM_L[0]*LAB,ly:py+NORM_L[1]*LAB,label:`${pct(t)}`});}return arr;},[gridM,effStep,toSVG]);
  const rightTicks=useMemo(()=>{const arr=[];for(let i=effStep;i<gridM;i+=effStep){const t=i/gridM,[px,py]=toSVG(1-t,0,t);arr.push({px,py,lx:px+NORM_R[0]*LAB,ly:py+NORM_R[1]*LAB,label:`${pct(1-t)}`});}return arr;},[gridM,effStep,toSVG]);
  const bottomTicks=useMemo(()=>{const arr=[];for(let i=effStep;i<gridM;i+=effStep){const t=i/gridM,[px,py]=toSVG(0,1-t,t);arr.push({px,py,lx:px+NORM_B[0]*LAB,ly:py+NORM_B[1]*LAB,label:`${pct(t)}`});}return arr;},[gridM,effStep,toSVG]);

  const[mx_l,my_l]=toSVG(0.5,0.5,0),[mx_r,my_r]=toSVG(0.5,0,0.5),[mx_b,my_b]=toSVG(0,0.5,0.5);

  // Default title positions
  const titlePos={
    2:{x:mx_l+NORM_L[0]*TITL,    y:my_l+NORM_L[1]*TITL+4,    anchor:"middle"},
    1:{x:mx_r+NORM_R[0]*TITL,    y:my_r+NORM_R[1]*TITL+4,    anchor:"middle"},
    3:{x:mx_b+NORM_B[0]*TITL,    y:my_b+NORM_B[1]*TITL+10,   anchor:"middle"},
  };

  const isoLines=[];
  if(hintLevel>=1){const v=target[0],[ax,ay]=toSVG(v,1-v,0),[bx,by]=toSVG(v,0,1-v);isoLines.push({ax,ay,bx,by,color:style.c1,label:`X₁=${pct(v)}%`});}
  if(hintLevel>=2){const v=target[1],[ax,ay]=toSVG(0,v,1-v),[bx,by]=toSVG(1-v,v,0);isoLines.push({ax,ay,bx,by,color:style.c2,label:`X₂=${pct(v)}%`});}
  if(hintLevel>=3){const v=target[2],[ax,ay]=toSVG(0,1-v,v),[bx,by]=toSVG(1-v,0,v);isoLines.push({ax,ay,bx,by,color:style.c3,label:`X₃=${pct(v)}%`});}

  const[tsx,tsy]=toSVG(...target);
  const[psx,psy]=placed?toSVG(...placed):[null,null];
  const dotColor=validated==="correct"?"#16a34a":validated==="wrong"?"#dc2626":style.dotColor;
  const[hLX,hLY]=toSVG(0.5,0.5,0),[hRX,hRY]=toSVG(0.5,0,0.5),[hBX,hBY]=toSVG(0,0.5,0.5);

  const axisTitleColor={1:style.c1,2:style.c2,3:style.c3};
  const axisTitleLabel={1:"X₁ (%)",2:"X₂ (%)",3:"X₃ (%)"};

  return(
    <svg ref={svgRef}
      viewBox={`0 0 ${W} ${svgH}`}
      style={{display:"block",width:"100%",maxWidth:W,height:"auto",cursor:"crosshair",touchAction:"none",userSelect:"none",fontFamily:"sans-serif"}}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}>

      <polygon points={`${vx1},${vy1} ${vx2},${vy2} ${vx3},${vy3}`} fill={style.bgFill} stroke="none"/>

      {gridLines.map((l,i)=>{
        const sw=l.major?style.gridMajorW:style.gridMinorW,op=l.major?style.gridMajorOp:style.gridMinorOp;
        return(<g key={i}>
          <line x1={l.ax1} y1={l.ay1} x2={l.ax2} y2={l.ay2} stroke="#6b7280" strokeWidth={sw} opacity={op}/>
          <line x1={l.bx1} y1={l.by1} x2={l.bx2} y2={l.by2} stroke="#6b7280" strokeWidth={sw} opacity={op}/>
          <line x1={l.cx1} y1={l.cy1} x2={l.cx2} y2={l.cy2} stroke="#6b7280" strokeWidth={sw} opacity={op}/>
        </g>);
      })}

      {style.gridDashShow&&interLines.map((l,i)=>(
        <g key={i}>
          <line x1={l.ax1} y1={l.ay1} x2={l.ax2} y2={l.ay2} stroke="#6b7280" strokeWidth={style.gridDashW} strokeDasharray="3 3" opacity={style.gridDashOp}/>
          <line x1={l.bx1} y1={l.by1} x2={l.bx2} y2={l.by2} stroke="#6b7280" strokeWidth={style.gridDashW} strokeDasharray="3 3" opacity={style.gridDashOp}/>
          <line x1={l.cx1} y1={l.cy1} x2={l.cx2} y2={l.cy2} stroke="#6b7280" strokeWidth={style.gridDashW} strokeDasharray="3 3" opacity={style.gridDashOp}/>
        </g>
      ))}

      <polygon points={`${vx1},${vy1} ${vx2},${vy2} ${vx3},${vy3}`} fill="none" stroke={style.borderColor} strokeWidth={style.borderW}/>

      {leftTicks.map((t,i)=>(
        <g key={i}>
          <line x1={t.px} y1={t.py} x2={t.px+NORM_L[0]*TICK} y2={t.py+NORM_L[1]*TICK} stroke={style.c2} strokeWidth="1.2"/>
          <text x={t.lx} y={t.ly+3.5} textAnchor="end" fontSize={style.fontTick} fill={style.c2} fontWeight="600">{t.label}</text>
        </g>
      ))}
      {rightTicks.map((t,i)=>(
        <g key={i}>
          <line x1={t.px} y1={t.py} x2={t.px+NORM_R[0]*TICK} y2={t.py+NORM_R[1]*TICK} stroke={style.c1} strokeWidth="1.2"/>
          <text x={t.lx} y={t.ly+3.5} textAnchor="start" fontSize={style.fontTick} fill={style.c1} fontWeight="600">{t.label}</text>
        </g>
      ))}
      {bottomTicks.map((t,i)=>(
        <g key={i}>
          <line x1={t.px} y1={t.py} x2={t.px+NORM_B[0]*TICK} y2={t.py+NORM_B[1]*TICK} stroke={style.c3} strokeWidth="1.2"/>
          <text x={t.lx} y={t.ly+10} textAnchor="middle" fontSize={style.fontTick} fill={style.c3} fontWeight="600">{t.label}</text>
        </g>
      ))}

      {/* Draggable axis titles */}
      {[1,2,3].map(ax=>{
        const p=titlePos[ax],[ox,oy]=titleOffsets[ax];
        return(
          <text key={ax}
            x={p.x+ox} y={p.y+oy}
            textAnchor={p.anchor}
            fontSize={style.fontTitle}
            fill={axisTitleColor[ax]}
            fontWeight="800"
            data-title-axis={ax}
            style={{cursor:"move",userSelect:"none"}}
            title="Glisser pour déplacer · double-clic pour réinitialiser"
            onDoubleClick={()=>setTitleOffsets(prev=>({...prev,[ax]:[0,0]}))}
          >
            {axisTitleLabel[ax]}
          </text>
        );
      })}

      {/* Vertex labels */}
      {[[1,vx1,vy1-10,style.c1],[2,vx2,vy2+18,style.c2],[3,vx3,vy3+18,style.c3]].map(([ax,bx,by,col])=>(
        <text key={ax}
          x={bx+(vertexOffsets[ax]?.[0]??0)} y={by+(vertexOffsets[ax]?.[1]??0)}
          textAnchor="middle" fontSize={style.fontVertex} fontWeight="900" fill={col}
          data-vertex-axis={ax}
          style={{cursor:"move",userSelect:"none"}}
          title="Glisser pour déplacer · double-clic pour réinitialiser"
          onDoubleClick={()=>setVertexOffsets(prev=>({...prev,[ax]:[0,0]}))}
        >X{ax===1?"₁":ax===2?"₂":"₃"}</text>
      ))}

      {allowReticle&&reticles.length===0&&!activeReticle?(()=>{
        const AL=Math.min(scale*0.09,42);
        return([
          {x:hLX,y:hLY,dx:SQR3_2, dy:0.5, col:style.c3},
          {x:hRX,y:hRY,dx:-SQR3_2,dy:0.5, col:style.c2},
          {x:hBX,y:hBY,dx:0,      dy:-1,  col:style.c1},
        ].map((h,i)=>{
          const ex=h.x+h.dx*AL,ey=h.y+h.dy*AL;
          const px=-h.dy,py=h.dx;
          const ah=9,aw=5;
          const pts=`${ex},${ey} ${ex-h.dx*ah-px*aw},${ey-h.dy*ah-py*aw} ${ex-h.dx*ah+px*aw},${ey-h.dy*ah+py*aw}`;
          return(
            <g key={i} pointerEvents="none">
              <circle cx={h.x} cy={h.y} r="6" fill="none" stroke={h.col} strokeWidth="2">
                <animate attributeName="r" values="5;13;5" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.85;0.05;0.85" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx={h.x} cy={h.y} r="4.5" fill={h.col}>
                <animate attributeName="opacity" values="1;0.55;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              <line x1={h.x} y1={h.y} x2={ex} y2={ey} stroke={h.col} strokeWidth="2.5" strokeDasharray="5 3">
                <animate attributeName="stroke-dashoffset" values="0;-16" dur="0.7s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.9;0.35;0.9" dur="2s" repeatCount="indefinite"/>
              </line>
              <polygon points={pts} fill={h.col}>
                <animate attributeName="opacity" values="0.9;0.35;0.9" dur="2s" repeatCount="indefinite"/>
              </polygon>
            </g>
          );
        }));
      })():(
        <g pointerEvents="none">
          <circle cx={hLX} cy={hLY} r="5" fill={style.c3} opacity="0.7"/>
          <circle cx={hRX} cy={hRY} r="5" fill={style.c2} opacity="0.7"/>
          <circle cx={hBX} cy={hBY} r="5" fill={style.c1} opacity="0.7"/>
        </g>
      )}

      {isoLines.map((l,i)=>(
        <g key={i}>
          <line x1={l.ax} y1={l.ay} x2={l.bx} y2={l.by} stroke={l.color} strokeWidth="2" strokeDasharray="6 3" opacity="0.9"/>
          <text x={(l.ax+l.bx)/2} y={(l.ay+l.by)/2-6} textAnchor="middle" fontSize="9.5" fill={l.color} fontWeight="700">{l.label}</text>
        </g>
      ))}

      {reticles.map(r=>{
        const[[ax,ay],[bx,by]]=reticleLine(r.axis,r.value);
        const col=axisColor[r.axis],mx=(ax+bx)/2,my=(ay+by)/2;
        return(
          <g key={r.id}>
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke="transparent" strokeWidth="14"/>
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke={col} strokeWidth="3" strokeDasharray="8 4" opacity="1"/>
            <circle cx={mx} cy={my} r="9" fill={col} style={{cursor:"pointer"}}
              onPointerDown={e=>{e.stopPropagation();onRemoveReticle(r.id);}}/>
            <rect x={mx-28} y={my-27} width="56" height="16" rx="3" fill="white" opacity="0.85" pointerEvents="none"/>
            <text x={mx} y={my-14} textAnchor="middle" pointerEvents="none"><AxisLabelSVG axis={r.axis} fontSize={14} color={col} fontWeight="700" suffix={`=${pct(r.value)}%`}/></text>
            <text x={mx} y={my+4} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" pointerEvents="none">×</text>
          </g>
        );
      })}

      {activeReticle&&(()=>{
        const[[ax,ay],[bx,by]]=reticleLine(activeReticle.axis,activeReticle.value),col=axisColor[activeReticle.axis];
        return(
          <g pointerEvents="none">
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke={col} strokeWidth="4" strokeDasharray="8 4" opacity="0.95"/>
            <rect x={(ax+bx)/2-28} y={(ay+by)/2-22} width="56" height="16" rx="3" fill="white" opacity="0.85"/>
            <text x={(ax+bx)/2} y={(ay+by)/2-9} textAnchor="middle"><AxisLabelSVG axis={activeReticle.axis} fontSize={13.5} color={col} fontWeight="800" suffix={`=${pct(activeReticle.value)}%`}/></text>
          </g>
        );
      })()}

      {showSolution&&(
        <g>
          <circle cx={tsx} cy={tsy} r={style.dotR+5} fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5 3"/>
          <circle cx={tsx} cy={tsy} r="5" fill="#f59e0b"/>
        </g>
      )}
      {!inversePts&&placed&&(
        <g>
          <circle cx={psx} cy={psy} r={style.dotR} fill={dotColor} stroke="white" strokeWidth="2.5"/>
          {validated==="correct"&&<text x={psx} y={psy+5} textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">✓</text>}
          {validated==="wrong"  &&<text x={psx} y={psy+5} textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">✗</text>}
        </g>
      )}
      {!inversePts&&allowReticle&&!placed&&(
        <text x={W/2} y={svgH-10} textAnchor="middle" fontSize="9.5" fill="#9ca3af" fontStyle="italic">
          Cliquez à l'intérieur du triangle · glissez depuis un bord coloré pour une réticule
        </text>
      )}
      {inversePts&&inversePts.map((pt,i)=>{
        const[sx,sy]=toSVG(...pt);
        const col=POINT_COLORS[i%POINT_COLORS.length];
        const ok=inverseResults?.[i];
        const isSelected=selectedPtIdx===i;
        const isConfirmed=confirmedPts?.[i];
        const border=inverseValidated?(ok?"#16a34a":"#dc2626"):null;
        return(
          <g key={i} style={{cursor:'pointer'}} onClick={()=>onSelectPt?.(i)}>
            {isSelected&&<circle cx={sx} cy={sy} r={style.dotR+8} fill="none" stroke={col} strokeWidth="2.5" strokeDasharray="5 3" opacity="0.9"/>}
            {isConfirmed&&!inverseValidated&&<circle cx={sx} cy={sy} r={style.dotR+5} fill="none" stroke={col} strokeWidth="1.5" opacity="0.5"/>}
            <circle cx={sx} cy={sy} r={style.dotR} fill={col} stroke={border||"white"} strokeWidth={border?3:2.5}/>
            <text x={sx} y={sy+4.5} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold" pointerEvents="none">{i+1}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Inverse answer panel ─────────────────────────────────────────────────────
function InverseAnswerPanel({pts,answers,confirmed,selectedIdx,onSelectIdx,onChange,onConfirm,onFinalValidate,validated,results,style}){
  const confirmedCount=Object.keys(confirmed||{}).length;
  const pct100=pts.length?Math.round(confirmedCount/pts.length*100):0;

  const sel=selectedIdx!=null&&selectedIdx<pts.length?selectedIdx:null;
  const ans=sel!=null?(answers[sel]||{c1:'',c2:''}):{c1:'',c2:''};
  const n1=parseInt(ans.c1||0),n2=parseInt(ans.c2||0);
  const n3=(ans.c1!==''&&ans.c2!=='')?Math.max(0,100-n1-n2):'';
  const selCol=sel!=null?POINT_COLORS[sel%POINT_COLORS.length]:'#6b7280';
  const isConfirmed=sel!=null&&confirmed?.[sel];
  const res=sel!=null?results?.[sel]:null;

  return(
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Identifiez les coordonnées</p>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{confirmedCount} / {pts.length} points saisis</span>
          {pct100>0&&<span className="font-semibold text-violet-600">{pct100}%</span>}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div className="h-2 rounded-full bg-violet-500 transition-all duration-500" style={{width:`${pct100}%`}}/>
        </div>
      </div>

      {/* Point selector dots */}
      <div className="flex gap-2 flex-wrap">
        {pts.map((_,i)=>{
          const col=POINT_COLORS[i%POINT_COLORS.length];
          const isSel=selectedIdx===i;
          const isDone=confirmed?.[i];
          const r=results?.[i];
          return(
            <button key={i} onClick={()=>onSelectIdx(i)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all"
              style={{
                backgroundColor:col,
                boxShadow:isSel?`0 0 0 3px white, 0 0 0 5px ${col}`:'none',
                opacity:validated?(r?1:0.55):1,
              }}>
              {validated?(r?'✓':'✗'):isDone?'·':i+1}
            </button>
          );
        })}
      </div>

      {/* Inputs for selected point */}
      {sel!=null&&(
        <div className="space-y-3 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{backgroundColor:selCol}}>{sel+1}</span>
            <span className="text-xs font-semibold text-gray-500">Point {sel+1}</span>
            {isConfirmed&&!validated&&<span className="ml-auto text-xs text-violet-600 font-semibold">✓ Saisi</span>}
            {validated&&(res
              ?<span className="ml-auto text-xs font-bold text-green-700">✓ Correct</span>
              :<span className="ml-auto text-xs font-semibold text-red-600">{pct(pts[sel][0])}% · {pct(pts[sel][1])}% · {pct(pts[sel][2])}%</span>
            )}
          </div>
          <div className="space-y-2">
            {[
              {label:'X₁',key:'c1',color:style.c1,val:ans.c1,ro:false},
              {label:'X₂',key:'c2',color:style.c2,val:ans.c2,ro:false},
              {label:'X₃',key:'c3',color:style.c3,val:String(n3),ro:true},
            ].map(({label,key,color,val,ro})=>(
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm font-bold w-7 flex-shrink-0" style={{color}}>{label}</span>
                <div className="relative flex-1">
                  <input type="number" min="0" max="100" step="5"
                    value={ro?String(n3):val}
                    readOnly={ro||isConfirmed||validated}
                    onChange={e=>!ro&&!isConfirmed&&!validated&&onChange(sel,key,e.target.value)}
                    className={`w-full text-sm font-mono border rounded-lg px-3 py-2 pr-8 text-right focus:outline-none focus:ring-2 ${ro?'bg-gray-50 text-gray-400 border-gray-200':(isConfirmed||validated)?'bg-gray-50 border-gray-200':'bg-white border-gray-300'}`}
                    style={(!ro&&!isConfirmed&&!validated)?{focusRingColor:selCol}:{}}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">%</span>
                </div>
              </div>
            ))}
          </div>
          {!isConfirmed&&!validated&&(
            <button onClick={()=>onConfirm(sel)}
              className="w-full py-2 text-xs font-bold rounded-xl text-white transition-opacity hover:opacity-90"
              style={{backgroundColor:selCol}}>
              Valider le point {sel+1}
            </button>
          )}
        </div>
      )}

      {/* Final validation */}
      {!validated&&confirmedCount>0&&(
        <button onClick={onFinalValidate}
          className="w-full py-2.5 text-sm font-bold bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors">
          Vérifier toutes les réponses ({confirmedCount}/{pts.length})
        </button>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function TernaryPracticePage({onBack}){
  const { user, effectiveUserId, isImpersonating } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    if (isImpersonating) { setIsAdmin(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", effectiveUserId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const[difficulty,setDifficulty]=useState("débutant");
  const[sizeId,setSizeId]=useState("XL");
  const[target,setTarget]=useState(()=>pickExercise("débutant",null));
  const[placed,setPlaced]=useState(null);
  const[hintLevel,setHintLevel]=useState(0);
  const[showSolution,setShowSolution]=useState(false);
  const[validated,setValidated]=useState(null);
  const[score,setScore]=useState({correct:0,total:0});
  const[reticles,setReticles]=useState([]);
  const reticleId=useRef(0);

  const[showIntro,setShowIntro]=useState(true);
  const[mode,setMode]=useState(()=>localStorage.getItem('ternary_mode')||'normal'); // 'normal' | 'inverse'
  const[inversePts,setInversePts]=useState([]);
  const[inverseAnswers,setInverseAnswers]=useState({});
  const[inverseConfirmed,setInverseConfirmed]=useState({});
  const[inverseValidated,setInverseValidated]=useState(false);
  const[inverseResults,setInverseResults]=useState({});
  const[selectedPtIdx,setSelectedPtIdx]=useState(null);

  const[diagramStyle,setDiagramStyle]=useState(DEFAULT_STYLE);
  const[showStylePanel,setShowStylePanel]=useState(false);
  const diagramCardRef=useRef(null);
  const screenRef=useRef(null);

  const handleExportDiagram=useCallback(()=>{
    const svg=diagramCardRef.current?.querySelector('svg');
    if(!svg) return;
    const serializer=new XMLSerializer();
    const svgStr='<?xml version="1.0" encoding="UTF-8"?>'+serializer.serializeToString(svg);
    const blob=new Blob([svgStr],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const img=new Image();
    img.onload=()=>{
      const scale=2;
      const canvas=document.createElement('canvas');
      canvas.width=svg.clientWidth*scale;
      canvas.height=svg.clientHeight*scale;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle=diagramStyle.bgFill||'#ffffff';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.scale(scale,scale);
      ctx.drawImage(img,0,0,svg.clientWidth,svg.clientHeight);
      canvas.toBlob(b=>{
        const u=URL.createObjectURL(b);
        const a=document.createElement('a');
        a.href=u;a.download='diagramme-ternaire.png';a.click();
        URL.revokeObjectURL(u);
      },'image/png');
      URL.revokeObjectURL(url);
    };
    img.src=url;
  },[diagramStyle.bgFill]);

  const handleExportScreen=useCallback(async()=>{
    const el=screenRef.current;
    if(!el) return;
    const{default:html2canvas}=await import('html2canvas');
    const canvas=await html2canvas(el,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false});
    canvas.toBlob(b=>{
      const url=URL.createObjectURL(b);
      const a=document.createElement('a');
      a.href=url;a.download='ternaire-ecran.png';a.click();
      URL.revokeObjectURL(url);
    },'image/png');
  },[]);

  const diffInfo=DIFFICULTIES.find(d=>d.id===difficulty);
  const diagramW=SIZES.find(s=>s.id===sizeId)?.W??460;
  const allowReticle=difficulty==='débutant'||difficulty==='intermédiaire';

  const handleAddReticle=useCallback(({axis,value})=>{setReticles(rs=>[...rs,{id:++reticleId.current,axis,value}]);},[]);
  const handleRemoveReticle=useCallback((id)=>{setReticles(rs=>rs.filter(r=>r.id!==id));},[]);

  const newInverseQuestion=useCallback((diff=difficulty)=>{
    setInversePts(genInversePts(diff));
    setInverseAnswers({});setInverseConfirmed({});
    setInverseValidated(false);setInverseResults({});setSelectedPtIdx(null);
  },[difficulty]);

  // Restore inverse question on first mount if mode was persisted as 'inverse'
  useEffect(()=>{ if(mode==='inverse') newInverseQuestion(); },[]);// eslint-disable-line

  const handleInverseAnswer=useCallback((idx,key,val)=>{
    setInverseAnswers(prev=>({...prev,[idx]:{c1:'',...(prev[idx]||{}),c2:'',...(prev[idx]||{}),[key]:val}}));
  },[]);

  const handleConfirmPt=useCallback((idx)=>{
    setInverseConfirmed(prev=>({...prev,[idx]:true}));
  },[]);

  const handleInverseFinalValidate=useCallback(()=>{
    const results={};let correct=0;
    inversePts.forEach((pt,i)=>{
      const ans=inverseAnswers[i]||{};
      const a1=parseInt(ans.c1||0),a2=parseInt(ans.c2||0),a3=100-a1-a2;
      const ok=a1===pct(pt[0])&&a2===pct(pt[1])&&a3===pct(pt[2]);
      results[i]=ok;
      if(ok) correct++;
    });
    setInverseResults(results);
    setInverseValidated(true);
    setScore(s=>({correct:s.correct+correct,total:s.total+inversePts.length}));
  },[inversePts,inverseAnswers]);

  const handleSwitchMode=useCallback((m)=>{
    setMode(m);
    localStorage.setItem('ternary_mode', m);
    if(m==='inverse') newInverseQuestion();
    else {setPlaced(null);setHintLevel(0);setShowSolution(false);setValidated(null);setReticles([]);}
  },[newInverseQuestion]);

  const newQuestion=useCallback((diff=difficulty)=>{
    setTarget(t=>pickExercise(diff,t));
    setPlaced(null);setHintLevel(0);setShowSolution(false);setValidated(null);setReticles([]);
  },[difficulty]);

  const handleDifficulty=useCallback((id)=>{
    setDifficulty(id);setScore({correct:0,total:0});
    if(mode==='normal'){
      setTarget(pickExercise(id,null));
      setPlaced(null);setHintLevel(0);setShowSolution(false);setValidated(null);setReticles([]);
    } else {
      setInversePts(genInversePts(id));
      setInverseAnswers({});setInverseConfirmed({});
      setInverseValidated(false);setInverseResults({});setSelectedPtIdx(null);
    }
  },[mode]);

  const handleValidate=useCallback(()=>{
    if(!placed||validated) return;
    const ok=euclidean(placed,target)<0.001;
    setValidated(ok?"correct":"wrong");
    setScore(s=>({correct:s.correct+(ok?1:0),total:s.total+1}));
  },[placed,validated,target]);

  const handleSolution=useCallback(()=>{
    setShowSolution(true);
    if(!validated){setValidated("shown");setScore(s=>({...s,total:s.total+1}));}
  },[validated]);

  const questionDone=validated!==null;
  const accuracy=score.total>0?Math.round(score.correct/score.total*100):null;

  return(
    <div className="pb-8">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3 sm:gap-4">
          <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">Maîtriser le diagramme ternaire</h1>
          <div className="ml-auto flex items-center gap-2 text-sm flex-shrink-0">
            <span className="text-green-700 font-bold">{score.correct}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-semibold">{score.total}</span>
            {accuracy!==null&&(
              <span className={`hidden sm:inline ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${accuracy>=70?"bg-green-100 text-green-700":"bg-red-50 text-red-600"}`}>{accuracy}%</span>
            )}
            <button onClick={()=>setScore({correct:0,total:0})} title="Réinitialiser" className="text-gray-300 hover:text-gray-500 transition-colors">
              <ArrowPathIcon className="w-3.5 h-3.5"/>
            </button>
            <button onClick={handleExportDiagram} title="Exporter le diagramme (PNG)"
              className="p-1 rounded-lg text-gray-400 hover:text-green-700 hover:bg-gray-100 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>
              </svg>
            </button>
            {isAdmin && (
              <button onClick={()=>setShowStylePanel(true)} title="Style du diagramme"
                className={`ml-1 p-1 rounded-lg transition-colors ${showStylePanel?"text-green-700 bg-green-50":"text-gray-400 hover:text-green-700 hover:bg-gray-100"}`}>
                <GearIcon className="w-4 h-4"/>
              </button>
            )}
          </div>
        </div>
      </div>

      <StylePanel
        open={showStylePanel}
        style={diagramStyle}
        onChange={setDiagramStyle}
        onSave={()=>setShowStylePanel(false)}
        onClose={()=>setShowStylePanel(false)}
      />

      {showIntro&&(
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 flex gap-4">
            <div className="flex-1 space-y-3">
              <p className="text-sm font-semibold text-violet-900">Comment utiliser cet outil ?</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-violet-100 px-3 py-2">
                  <p className="text-xs font-bold text-violet-700 mb-1">Mode Placer</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Une composition cible (X₁, X₂, X₃) est affichée. Cliquez sur le diagramme pour y placer le point correspondant. Validez pour voir si votre réponse est correcte.
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-violet-100 px-3 py-2">
                  <p className="text-xs font-bold text-violet-700 mb-1">Mode Lire</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Des points sont tracés sur le diagramme. Cliquez sur un point puis saisissez ses coordonnées (X₁, X₂) pour lire sa composition. X₃ est calculé automatiquement.
                  </p>
                </div>
              </div>
            </div>
            <button onClick={()=>setShowIntro(false)} className="text-violet-400 hover:text-violet-700 transition-colors self-start mt-0.5" title="Fermer">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Niveau :</span>
            {DIFFICULTIES.map(d=>(
              <button key={d.id} onClick={()=>handleDifficulty(d.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-colors ${difficulty===d.id?"bg-green-700 text-white border-green-700":"bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}>
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mode :</span>
            {[{id:'normal',label:'Placer'},{id:'inverse',label:'Lire'}].map(m=>(
              <button key={m.id} onClick={()=>handleSwitchMode(m.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-colors ${mode===m.id?"bg-violet-600 text-white border-violet-600":"bg-white text-gray-600 border-gray-200 hover:border-violet-400"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Taille :</span>
            {SIZES.map(s=>(
              <button key={s.id} onClick={()=>{
                const wasXXL=sizeId==='XXL', willBeXXL=s.id==='XXL';
                setSizeId(s.id);
                if(willBeXXL!==wasXXL){
                  document.querySelector('button[aria-label="Étendre sur toute la largeur"]')?.click();
                }
              }}
                className={`w-7 h-7 rounded-lg text-xs font-bold border-2 transition-colors ${sizeId===s.id?"border-green-600 bg-green-600 text-white":"border-gray-200 text-gray-500 hover:border-green-400"}`}>
                {s.id}
              </button>
            ))}
          </div>
        </div>

        {mode==='normal'&&(
          <p className="text-xs text-gray-400 flex items-center gap-1.5 -mt-1">
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="7"/><line x1="10" y1="3" x2="10" y2="17"/><line x1="3" y1="10" x2="17" y2="10"/>
            </svg>
            {allowReticle
              ? <span>Glissez depuis un <span className="font-semibold text-gray-500">bord coloré</span> du diagramme pour tracer une réticule — disponible en <span className="font-semibold text-green-700">Débutant</span> et <span className="font-semibold text-green-700">Intermédiaire</span> uniquement.</span>
              : <span>Les réticules sont désactivés en <span className="font-semibold">{diffInfo.label.toLowerCase()}</span> — disponibles en Débutant et Intermédiaire.</span>
            }
          </p>
        )}

        <div ref={screenRef} className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-start">
          {mode==='inverse'?(
            <div className="w-full lg:flex-1 min-w-0 space-y-4">
              <InverseAnswerPanel
                pts={inversePts}
                answers={inverseAnswers}
                confirmed={inverseConfirmed}
                selectedIdx={selectedPtIdx}
                onSelectIdx={setSelectedPtIdx}
                onChange={handleInverseAnswer}
                onConfirm={handleConfirmPt}
                onFinalValidate={handleInverseFinalValidate}
                validated={inverseValidated}
                results={inverseResults}
                style={diagramStyle}
              />
              <div className="flex justify-end">
                <button onClick={()=>newInverseQuestion()}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors">
                  Nouveaux points →
                </button>
              </div>
            </div>
          ):(
            <div className="w-full lg:flex-1 min-w-0 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {diffInfo.label}
                  <span className="ml-2 normal-case font-normal text-gray-300">· grille {100/diffInfo.gridM}%</span>
                </p>
                <p className="text-sm text-gray-500">Placez le point :</p>
                <div className="bg-gray-50 rounded-xl px-4 py-3 font-mono text-sm font-bold space-y-0.5">
                  <div><span style={{color:diagramStyle.c1}}>X₁</span> = {pct(target[0])} %</div>
                  <div><span style={{color:diagramStyle.c2}}>X₂</span> = {pct(target[1])} %</div>
                  <div><span style={{color:diagramStyle.c3}}>X₃</span> = {pct(target[2])} %</div>
                </div>
                {hintLevel>0&&(
                  <div className="space-y-1 pt-1 border-t border-gray-100">
                    {hintLevel>=1&&<div className="flex items-center gap-2 text-xs" style={{color:diagramStyle.c1}}><span className="w-5 border-t-2 border-dashed flex-shrink-0" style={{borderColor:diagramStyle.c1}}/>Iso-ligne X₁ = {pct(target[0])}%</div>}
                    {hintLevel>=2&&<div className="flex items-center gap-2 text-xs" style={{color:diagramStyle.c2}}><span className="w-5 border-t-2 border-dashed flex-shrink-0" style={{borderColor:diagramStyle.c2}}/>Iso-ligne X₂ = {pct(target[1])}%</div>}
                    {hintLevel>=3&&<div className="flex items-center gap-2 text-xs" style={{color:diagramStyle.c3}}><span className="w-5 border-t-2 border-dashed flex-shrink-0" style={{borderColor:diagramStyle.c3}}/>Iso-ligne X₃ = {pct(target[2])}% — l'intersection donne le point</div>}
                  </div>
                )}
              </div>

              {reticles.length>0&&(
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Réticules</span>
                    <button onClick={()=>setReticles([])} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Tout effacer</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {reticles.map(r=>(
                      <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                        style={{backgroundColor:{1:diagramStyle.c1,2:diagramStyle.c2,3:diagramStyle.c3}[r.axis]}}>
                        {AXIS_LABEL[r.axis]}={pct(r.value)}%
                        <button onClick={()=>handleRemoveReticle(r.id)} className="hover:opacity-75 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {placed&&validated&&(
                <div className={`rounded-2xl border px-4 py-3 text-sm space-y-2 ${validated==="correct"?"bg-green-50 border-green-200":validated==="wrong"?"bg-red-50 border-red-200":"bg-gray-50 border-gray-200"}`}>
                  <p className="text-xs font-semibold text-gray-400">Votre point</p>
                  <div className="font-mono text-xs text-gray-700 space-y-0.5">
                    <div>X₁ = {pct(placed[0])} %</div>
                    <div>X₂ = {pct(placed[1])} %</div>
                    <div>X₃ = {pct(placed[2])} %</div>
                  </div>
                  {validated==="correct"&&<p className="flex items-center gap-1.5 text-xs font-bold text-green-700"><CheckCircleIcon className="w-4 h-4 flex-shrink-0"/>Correct !</p>}
                  {validated==="wrong"  &&<p className="flex items-center gap-1.5 text-xs font-bold text-red-700"><XCircleIcon className="w-4 h-4 flex-shrink-0"/>Raté — réponse : ({pct(target[0])}%, {pct(target[1])}%, {pct(target[2])}%)</p>}
                  {validated==="shown"  &&<p className="text-xs text-gray-500 italic">Solution affichée sur le diagramme</p>}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {!questionDone?(
                  <>
                    <button onClick={()=>setHintLevel(h=>Math.min(h+1,3))} disabled={hintLevel>=3}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 disabled:opacity-40 transition-colors">
                      <LightBulbIcon className="w-4 h-4"/>Indice{hintLevel>0?` (${hintLevel}/3)`:""}
                    </button>
                    <button onClick={handleSolution}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-200 bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors">
                      <EyeIcon className="w-4 h-4"/>Solution
                    </button>
                    <button onClick={handleValidate} disabled={!placed}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 text-white text-xs font-bold hover:bg-green-800 disabled:opacity-40 transition-colors ml-auto">
                      <CheckCircleIcon className="w-4 h-4"/>Valider
                    </button>
                  </>
                ):(
                  <button onClick={()=>newQuestion()}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-bold hover:bg-green-800 transition-colors ml-auto">
                    Question suivante →
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={diagramCardRef} className="w-full bg-white rounded-2xl border border-gray-200 p-3 shadow-sm select-none" style={{maxWidth:diagramW}}>
            <PracticeDiagram
              target={target} placed={placed}
              onPlace={validated?undefined:setPlaced}
              hintLevel={hintLevel} showSolution={showSolution} validated={validated}
              gridM={diffInfo.gridM} snapM={diffInfo.snapM} diagramW={diagramW}
              reticles={reticles} onAddReticle={handleAddReticle} onRemoveReticle={handleRemoveReticle}
              style={diagramStyle} onStyleChange={setDiagramStyle}
              allowReticle={difficulty==='débutant'||difficulty==='intermédiaire'}
              inversePts={mode==='inverse'?inversePts:null}
              inverseValidated={inverseValidated} inverseResults={inverseResults}
              selectedPtIdx={selectedPtIdx} confirmedPts={inverseConfirmed}
              onSelectPt={setSelectedPtIdx}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
