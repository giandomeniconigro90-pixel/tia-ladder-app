import { useState, useMemo, useEffect, useCallback, useReducer } from "react";
import { MODULES } from "./data/modules";
import { QUIZ } from "./data/quiz";
import { GLOSSARY } from "./data/glossary";
import { EXAMPLES } from "./data/examples";
import { createSimulation, simulationReducer } from "./simulation";
import { loadCompleted, saveCompleted } from "./progress";
import "./styles.css";

// ─────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────
const A = "#F59E0B";   // amber – powered / active
const DIM = "#1E293B"; // dark wire
const GRAY = "#475569";
const BG_ELEM = "#0F172A";
const RAIL = "#334155";

// ─────────────────────────────────────────────
// MARKDOWN RENDERER
// ─────────────────────────────────────────────
function Inline({text}){
  const parts=[];
  const re=/(\*\*(.*?)\*\*|`([^`]+)`)/g;let m,last=0;
  while((m=re.exec(text))!==null){
    if(m.index>last) parts.push(<span key={last}>{text.slice(last,m.index)}</span>);
    if(m[0].startsWith("**")) parts.push(<strong key={m.index} className="text-white font-semibold">{m[2]}</strong>);
    else parts.push(<code key={m.index} className="bg-slate-900 text-amber-300 px-1 rounded text-xs font-mono">{m[3]}</code>);
    last=m.index+m[0].length;
  }
  if(last<text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return <>{parts.length?parts:text}</>;
}

function ContentBlock({block}){
  switch(block.t){
    case"h2": return <h2 className="text-amber-400 text-lg font-bold mt-6 mb-3 border-b border-amber-900 pb-1">{block.v}</h2>;
    case"h3": return <h3 className="text-amber-300 text-sm font-semibold mt-4 mb-2">{block.v}</h3>;
    case"p":  return <p className="text-gray-300 text-sm leading-relaxed mb-2"><Inline text={block.v}/></p>;
    case"code": return <pre className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-amber-200 overflow-x-auto mb-3 leading-relaxed">{block.v}</pre>;
    case"info": return <div className="border-l-2 border-amber-500 pl-3 py-1 text-gray-400 text-xs italic mb-3"><Inline text={block.v}/></div>;
    case"list": return (
      <ul className="space-y-1 mb-3">
        {block.v.map((item,i)=>(
          <li key={i} className="flex gap-2 text-gray-300 text-sm">
            <span className="text-amber-500 shrink-0 mt-0.5">▸</span>
            <span><Inline text={item}/></span>
          </li>
        ))}
      </ul>
    );
    case"table": return (
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>{block.cols.map((c,i)=><th key={i} className="bg-slate-900 text-amber-300 px-2 py-1.5 text-left border border-slate-700 font-semibold">{c}</th>)}</tr>
          </thead>
          <tbody>
            {block.rows.map((row,i)=>(
              <tr key={i} className={i%2===0?"bg-slate-800":"bg-slate-800/50"}>
                {row.map((cell,j)=><td key={j} className="text-gray-300 px-2 py-1.5 border border-slate-700"><Inline text={cell}/></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    default: return null;
  }
}

// ─────────────────────────────────────────────
// LADDER SVG
// ─────────────────────────────────────────────
function Contact({x,y,elem,bits,active}){
  const col=active?A:GRAY;
  const cx=x+35;
  return(
    <g>
      <rect x={x} y={y-14} width={68} height={28} rx={3} fill={BG_ELEM} stroke={col} strokeWidth={1.5}/>
      {elem.type==="contact_nc"&&<line x1={x+8} y1={y+11} x2={x+60} y2={y-11} stroke={col} strokeWidth={1.5}/>}
      <text x={cx} y={y-3} textAnchor="middle" fill={col} fontSize={9} fontFamily="monospace">{elem.bit}</text>
      <text x={cx} y={y+10} textAnchor="middle" fill="#6B7280" fontSize={8}>{elem.label}</text>
    </g>
  );
}

function Coil({cx,y,elem,active}){
  const col=active?A:GRAY;
  const label=elem.type==="coil_set"?"S":elem.type==="coil_reset"?"R":"";
  return(
    <g>
      <circle cx={cx} cy={y} r={20} fill={BG_ELEM} stroke={col} strokeWidth={2}/>
      {label?<>
        <text x={cx} y={y-4} textAnchor="middle" fill={col} fontSize={11} fontWeight="bold">{label}</text>
        <text x={cx} y={y+7} textAnchor="middle" fill={col} fontSize={8} fontFamily="monospace">{elem.bit}</text>
      </>:
        <text x={cx} y={y+3} textAnchor="middle" fill={col} fontSize={9} fontFamily="monospace">{elem.bit}</text>
      }
      <text x={cx} y={y+33} textAnchor="middle" fill="#6B7280" fontSize={8}>{elem.label}</text>
    </g>
  );
}

function SimpleRung({rung,bits,powered}){
  const H=80,W=600,wy=40;
  const contacts=rung.contacts;
  const n=contacts.length;
  const coilCX=535;
  const totalW=coilCX-90;
  const gap=n>0?totalW/(n+1):0;
  const cxs=contacts.map((_,i)=>30+gap*(i+1)+68*i-(68/2)*(i));
  // simpler: evenly space n contacts from x=40 to x=coilCX-25
  // contact width=68, so available width for contacts+gaps = coilCX-25 - 40 = 470
  // spacing = 470/(n) roughly
  const positions=[];
  if(n>0){
    const space=Math.min(100,(480-68*n)/(n+1));
    let x=40;
    for(let i=0;i<n;i++){x+=space;positions.push(x);x+=68;}
  }
  const lastRight=n>0?positions[n-1]+68:40;

  const isActive=(elem)=>elem.type==="contact_nc"?!bits[elem.bit]:!!bits[elem.bit];
  const wireCol=powered?A:DIM;

  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <line x1={10} y1={5} x2={10} y2={H-5} stroke={RAIL} strokeWidth={3} strokeLinecap="round"/>
      <line x1={W-10} y1={5} x2={W-10} y2={H-5} stroke={RAIL} strokeWidth={3} strokeLinecap="round"/>
      <line x1={10} y1={wy} x2={n>0?positions[0]:coilCX-20} y2={wy} stroke={wireCol} strokeWidth={2}/>
      {positions.map((px,i)=>{
        const nx=i<n-1?positions[i+1]:coilCX-20;
        return <line key={i} x1={px+68} y1={wy} x2={nx} y2={wy} stroke={wireCol} strokeWidth={2}/>;
      })}
      <line x1={coilCX+20} y1={wy} x2={W-10} y2={wy} stroke={wireCol} strokeWidth={2}/>
      {contacts.map((e,i)=><Contact key={i} x={positions[i]} y={wy} elem={e} bits={bits} active={isActive(e)}/>)}
      {rung.coil&&<Coil cx={coilCX} y={wy} elem={rung.coil} active={powered}/>}
    </svg>
  );
}

function ParallelRung({rung,bits,topPow,botPow,powered}){
  const H=130,W=600,topY=38,botY=95;
  const n_top=rung.top.length,n_bot=rung.bottom.length;
  const splitX=30;
  const perW=70;
  const mergeX=splitX+(Math.max(n_top,n_bot))*perW+20;
  const ser=rung.series;
  const n_ser=ser.length;
  const coilCX=535;
  const serAvail=coilCX-20-mergeX-10;
  const serGap=n_ser>0?serAvail/(n_ser+1):0;
  const serPos=ser.map((_,i)=>mergeX+10+serGap*(i+1)+68*i-(68/2)*i);
  // simpler: space series contacts
  const serPositions=[];
  if(n_ser>0){
    const sp=Math.min(90,(coilCX-20-mergeX-10-68*n_ser)/(n_ser+1));
    let x=mergeX+10;
    for(let i=0;i<n_ser;i++){x+=sp;serPositions.push(x);x+=68;}
  }
  const lastSerRight=n_ser>0?serPositions[n_ser-1]+68:mergeX+10;

  const isActive=(e)=>e.type==="contact_nc"?!bits[e.bit]:!!bits[e.bit];
  const preCol=(topPow||botPow)?A:DIM;
  const mainCol=powered?A:DIM;

  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <line x1={10} y1={5} x2={10} y2={H-5} stroke={RAIL} strokeWidth={3} strokeLinecap="round"/>
      <line x1={W-10} y1={5} x2={W-10} y2={H-5} stroke={RAIL} strokeWidth={3} strokeLinecap="round"/>
      {/* left rail to split */}
      <line x1={10} y1={topY} x2={splitX} y2={topY} stroke={preCol} strokeWidth={2}/>
      {/* split down */}
      <line x1={splitX} y1={topY} x2={splitX} y2={botY} stroke={botPow?A:DIM} strokeWidth={2}/>
      {/* top branch */}
      <line x1={splitX} y1={topY} x2={mergeX} y2={topY} stroke={topPow?A:DIM} strokeWidth={2}/>
      {/* bottom branch */}
      <line x1={splitX} y1={botY} x2={mergeX} y2={botY} stroke={botPow?A:DIM} strokeWidth={2}/>
      {/* merge up */}
      <line x1={mergeX} y1={topY} x2={mergeX} y2={botY} stroke={mainCol} strokeWidth={2}/>
      {/* after merge */}
      <line x1={mergeX} y1={topY} x2={n_ser>0?serPositions[0]:coilCX-20} y2={topY} stroke={mainCol} strokeWidth={2}/>
      {serPositions.map((px,i)=>{
        const nx=i<n_ser-1?serPositions[i+1]:coilCX-20;
        return <line key={i} x1={px+68} y1={topY} x2={nx} y2={topY} stroke={mainCol} strokeWidth={2}/>;
      })}
      <line x1={coilCX+20} y1={topY} x2={W-10} y2={topY} stroke={mainCol} strokeWidth={2}/>
      {/* top contacts */}
      {rung.top.map((e,i)=><Contact key={i} x={splitX+i*perW+5} y={topY} elem={e} bits={bits} active={isActive(e)}/>)}
      {/* bottom contacts */}
      {rung.bottom.map((e,i)=><Contact key={i} x={splitX+i*perW+5} y={botY} elem={e} bits={bits} active={isActive(e)}/>)}
      {/* series contacts */}
      {ser.map((e,i)=><Contact key={i} x={serPositions[i]} y={topY} elem={e} bits={bits} active={isActive(e)}/>)}
      {rung.coil&&<Coil cx={coilCX} y={topY} elem={rung.coil} active={powered}/>}
    </svg>
  );
}

function FunctionRung({example, bits, timer}) {
  const counter = example.id === "ctu_counter";
  const kind = counter ? "CTU" : example.timerType || "TON";
  return <svg role="img" aria-label={`${kind}, uscita Q ${Number(bits["Q0.0"])}`} viewBox="0 0 600 150" className="w-full min-w-[280px]">
    <line x1="10" y1="10" x2="10" y2="140" stroke={RAIL} strokeWidth="3"/>
    <line x1="10" y1="50" x2="210" y2="50" stroke={bits["I0.0"] ? A : GRAY} strokeWidth="2"/>
    <text x="30" y="38" fill="white" fontSize="13">I0.0 = {Number(bits["I0.0"])}</text>
    <rect x="210" y="15" width="185" height="120" rx="8" fill={BG_ELEM} stroke={A}/>
    <text x="302" y="36" textAnchor="middle" fill={A} fontSize="16">{kind}</text>
    <text x="222" y="58" fill="white" fontSize="12">{counter ? "CU" : "IN"}</text>
    <text x="222" y="86" fill="white" fontSize="12">{counter ? `R = ${Number(bits["I0.1"])} · PV = 5` : `PT = ${example.timerPT / 1000} s`}</text>
    <text x="222" y="115" fill="white" fontSize="12">{counter ? `CV = ${bits.CV}` : `ET = ${(timer.et / 1000).toFixed(2)} s`}</text>
    <line x1="395" y1="50" x2="500" y2="50" stroke={bits["Q0.0"] ? A : GRAY} strokeWidth="2"/>
    <text x="375" y="58" fill="white" fontSize="12">Q</text>
    <Coil cx={535} y={50} elem={{bit:"Q0.0",label:"Uscita"}} active={bits["Q0.0"]}/>
  </svg>;
}

function HomeTab({onGo,completed}){
  const totalLessons=MODULES.reduce((s,m)=>s+m.lessons.length,0);
  const pct=totalLessons>0?Math.round((completed.size/totalLessons)*100):0;
  return(
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-900/40 rounded-2xl p-6">
        <div className="text-4xl mb-3">⚙️</div>
        <h1 className="text-white text-2xl font-bold mb-1">TIA Portal & Ladder</h1>
        <p className="text-gray-400 text-sm mb-4">Corso completo di automazione industriale — dal ciclo di scansione alle sequenze avanzate.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-700 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all" style={{width:`${pct}%`}}/>
          </div>
          <span className="text-amber-400 text-sm font-mono">{pct}%</span>
        </div>
        <p className="text-slate-500 text-xs mt-1">{completed.size} / {totalLessons} lezioni completate</p>
      </div>
      {/* Module cards */}
      <div>
        <h2 className="text-white font-semibold mb-3">Moduli del corso</h2>
        <div className="grid grid-cols-1 gap-3">
          {MODULES.map(m=>{
            const done=m.lessons.filter(l=>completed.has(l.id)).length;
            return(
              <button key={m.id} onClick={()=>onGo(m.id)}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-700 rounded-xl p-4 text-left transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold">{m.title}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{m.desc}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-amber-400 text-xs font-mono">{done}/{m.lessons.length}</div>
                    <div className="text-gray-600 text-xs">lezioni</div>
                  </div>
                </div>
                <div className="mt-2 bg-slate-700 rounded-full h-1">
                  <div className="bg-amber-600 h-1 rounded-full" style={{width:`${m.lessons.length>0?(done/m.lessons.length)*100:0}%`}}/>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Quick links */}
      <div>
        <h2 className="text-white font-semibold mb-3">Strumenti</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            {icon:"🎛️",label:"Simulatore",tab:"sim"},
            {icon:"📝",label:"Quiz",tab:"quiz"},
            {icon:"📖",label:"Glossario",tab:"gloss"},
          ].map(item=>(
            <button key={item.tab} onClick={()=>onGo(item.tab)}
              className="bg-slate-800 border border-slate-700 hover:border-amber-700 rounded-xl p-3 text-center transition-all">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-white text-xs font-medium">{item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuliTab({completed,setCompleted,startModule,onStartConsumed}){
  const [modId,setModId]=useState(1);
  const [lesId,setLesId]=useState("1.1");
  useEffect(()=>{
    if(startModule!=null){
      const m=MODULES.find(m=>m.id===startModule);
      if(m){setModId(m.id);setLesId(m.lessons[0].id);}
      onStartConsumed&&onStartConsumed();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[startModule]);

  const mod=MODULES.find(m=>m.id===modId)||MODULES[0];
  const lesson=mod.lessons.find(l=>l.id===lesId)||mod.lessons[0];
  const lesIndex=mod.lessons.findIndex(l=>l.id===lesId);

  const isLast = modId === MODULES[MODULES.length - 1].id && lesIndex === mod.lessons.length - 1;
  const markDone=()=>setCompleted(s=>new Set([...s,lesson.id]));
  const prev=()=>{
    if(lesIndex>0) setLesId(mod.lessons[lesIndex-1].id);
    else{const mi=MODULES.findIndex(m=>m.id===modId);if(mi>0){const pm=MODULES[mi-1];setModId(pm.id);setLesId(pm.lessons[pm.lessons.length-1].id);}}
  };
  const next=()=>{
    markDone();
    if(lesIndex<mod.lessons.length-1) setLesId(mod.lessons[lesIndex+1].id);
    else{const mi=MODULES.findIndex(m=>m.id===modId);if(mi<MODULES.length-1){const nm=MODULES[mi+1];setModId(nm.id);setLesId(nm.lessons[0].id);}}
  };

  return(
    <div className="flex flex-col md:flex-row gap-4 pb-8">
      {/* Sidebar */}
      <div className="w-full md:w-48 shrink-0 space-y-1">
        {MODULES.map(m=>(
          <div key={m.id}>
            <button onClick={()=>{setModId(m.id);setLesId(m.lessons[0].id);}}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${modId===m.id?"bg-amber-900/30 text-amber-300 border border-amber-800":"text-gray-400 hover:text-gray-200"}`}>
              <span>{m.emoji}</span>{m.title}
            </button>
            {modId===m.id&&m.lessons.map(l=>(
              <button key={l.id} onClick={()=>setLesId(l.id)}
                className={`w-full text-left pl-6 pr-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${lesId===l.id?"text-amber-300":"text-gray-500 hover:text-gray-300"}`}>
                {completed.has(l.id)?<span className="text-green-500">✓</span>:<span className="text-gray-700">○</span>}
                {l.title}
              </button>
            ))}
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-amber-500 text-xs font-mono mb-1">{mod.emoji} {mod.title} · {lesson.dur}</div>
              <h2 className="text-white text-lg font-bold">{lesson.title}</h2>
            </div>
            {completed.has(lesson.id)&&<span className="text-green-400 text-xs bg-green-900/30 border border-green-800 px-2 py-1 rounded">✓ Completata</span>}
          </div>
          <div className="space-y-0">
            {lesson.content.map((b,i)=><ContentBlock key={i} block={b}/>)}
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
            <button disabled={modId === MODULES[0].id && lesIndex === 0} onClick={prev} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg transition-all">← Precedente</button>
            <button onClick={next} className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-all">
              {isLast ? (completed.has(lesson.id) ? "Corso completato ✓" : "Completa il corso ✓") : lesIndex<mod.lessons.length-1?"Avanti →":"Prossimo modulo →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulatoreTab(){
  const [state, dispatch] = useReducer(simulationReducer, 0, createSimulation);
  const { exIdx, bits: evaluated, timer } = state;
  const ex = EXAMPLES[exIdx];
  useEffect(() => {
    if (!ex.timerBased) return;
    const id = setInterval(() => dispatch({ type: "tick", now: performance.now() }), 50);
    return () => clearInterval(id);
  }, [exIdx, ex.timerBased]);
  const changeEx = index => dispatch({ type: "example", index });
  const toggleBit = bit => dispatch({ type: "input", bit, now: performance.now() });

  return(
    <div className="space-y-4 pb-8">
      {/* Example selector */}
      <div className="flex gap-2 flex-wrap">
        {EXAMPLES.map((e,i)=>(
          <button key={e.id} onClick={()=>changeEx(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${exIdx===i?"bg-amber-600 text-white":"bg-slate-800 border border-slate-700 text-gray-400 hover:text-white"}`}>
            {e.title}
          </button>
        ))}
      </div>
      <div className="bg-slate-800 border border-amber-900/30 rounded-xl p-4">
        <p className="text-gray-400 text-xs mb-4">{ex.desc}</p>
        <button onClick={() => changeEx(exIdx)} className="mb-4 px-3 py-2 rounded bg-slate-700 text-sm">Azzera esempio</button>
        {ex.timerBased && <div className="mb-4 text-amber-300 font-mono text-sm" aria-live="off">ET: {(timer.et / 1000).toFixed(2)} s / PT: {ex.timerPT / 1000} s · Q: {Number(timer.q)}</div>}
        {ex.id === "ctu_counter" && <div className="mb-4 text-amber-300 font-mono" aria-live="polite">CV: {evaluated.CV} / PV: 5</div>}

        {/* Inputs */}
        <div className="mb-4">
          <div className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2">Ingressi — clicca per attivare</div>
          <div className="flex flex-wrap gap-2">
            {ex.inputs.map(inp=>(
              <button key={inp.bit} aria-pressed={!!evaluated[inp.bit]} onClick={()=>toggleBit(inp.bit)}
                className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all ${evaluated[inp.bit]?"bg-amber-600 border-amber-500 text-white":"bg-slate-900 border-slate-700 text-gray-400 hover:border-slate-500"}`}>
                <div className="font-bold">{inp.bit}</div>
                <div className="text-xs font-sans opacity-80">{inp.label}</div>
                <div className="text-xs mt-0.5">{evaluated[inp.bit]?"■ 1":"□ 0"}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Ladder diagram */}
        <div className="mb-4">
          <div className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2">Diagramma Ladder</div>
          <div className="space-y-2 overflow-x-auto">
            {(ex.timerBased || ex.id === "ctu_counter") ? <FunctionRung example={ex} bits={evaluated} timer={timer}/> : ex.rungs.map((rung,i)=>{
              const coilBit=rung.coil?.bit;
              const powered=coilBit?!!evaluated[coilBit]:false;
              return(
                <div key={i} className="bg-slate-900 rounded-lg p-2 border border-slate-700">
                  <div className="text-slate-500 text-xs font-mono mb-1 px-1">{rung.label}</div>
                  {rung.type==="simple"
                    ?<SimpleRung rung={rung} bits={evaluated} powered={powered}/>
                    :(()=>{
                      const topPow=rung.top.every(e=>e.type==="contact_nc"?!evaluated[e.bit]:!!evaluated[e.bit]);
                      const botPow=rung.bottom.every(e=>e.type==="contact_nc"?!evaluated[e.bit]:!!evaluated[e.bit]);
                      return <ParallelRung rung={rung} bits={evaluated} topPow={topPow} botPow={botPow} powered={powered}/>;
                    })()
                  }
                </div>
              );
            })}
          </div>
        </div>

        {/* Outputs */}
        <div>
          <div className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2">Uscite</div>
          <div className="flex flex-wrap gap-3">
            {ex.outputs.map(out=>(
              <div key={out.bit} className={`px-4 py-3 rounded-xl border-2 transition-all ${evaluated[out.bit]?"border-amber-500 bg-amber-950/50":"border-slate-700 bg-slate-900"}`}>
                <div className={`text-lg font-bold font-mono ${evaluated[out.bit]?"text-amber-400":"text-gray-600"}`}>
                  {evaluated[out.bit]?"■":"□"}
                </div>
                <div className={`text-xs font-mono ${evaluated[out.bit]?"text-amber-300":"text-gray-500"}`}>{out.bit}</div>
                <div className="text-xs text-gray-500">{out.label}</div>
                <div className={`text-xs font-bold mt-1 ${evaluated[out.bit]?"text-green-400":"text-red-500"}`}>
                  {evaluated[out.bit]?"ATTIVO":"SPENTO"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
        <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Legenda</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <svg width="50" height="20"><rect x="2" y="2" width="46" height="16" rx="2" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5"/><text x="25" y="13" textAnchor="middle" fill="#F59E0B" fontSize="9" fontFamily="monospace">I0.0</text></svg>
            Contatto NA attivo
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <svg width="50" height="20"><rect x="2" y="2" width="46" height="16" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="1.5"/><text x="25" y="13" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">I0.0</text></svg>
            Contatto non attivo
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <svg width="50" height="20"><rect x="2" y="2" width="46" height="16" rx="2" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5"/><line x1="6" y1="17" x2="44" y2="3" stroke="#F59E0B" strokeWidth="1.5"/><text x="25" y="13" textAnchor="middle" fill="#F59E0B" fontSize="9" fontFamily="monospace">I0.1</text></svg>
            Contatto NC (barra diagonale)
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <svg width="50" height="20"><circle cx="25" cy="10" r="9" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5"/><text x="25" y="14" textAnchor="middle" fill="#F59E0B" fontSize="8" fontFamily="monospace">Q0.0</text></svg>
            Bobina attiva
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizTab(){
  const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState({});
  const [done,setDone]=useState(false);
  const [showExp,setShowExp]=useState(false);

  const q=QUIZ[idx];
  const selected=answers[idx];
  const correct=selected===q.ans;

  const select=(i)=>{
    if(selected!==undefined) return;
    setAnswers(a=>({...a,[idx]:i}));
    setShowExp(true);
  };

  const score=Object.keys(answers).filter(k=>answers[k]===QUIZ[k]?.ans).length;

  if(done){
    const pct=Math.round((score/QUIZ.length)*100);
    return(
      <div className="flex flex-col items-center py-12 space-y-6">
        <div className="text-6xl">{pct>=80?"🏆":pct>=60?"👍":"📚"}</div>
        <div>
          <div className="text-white text-2xl font-bold text-center">{score} / {QUIZ.length} corrette</div>
          <div className="text-amber-400 text-center text-xl font-mono">{pct}%</div>
        </div>
        <div className={`text-sm text-center px-4 py-2 rounded-lg ${pct>=80?"bg-green-900/30 text-green-400 border border-green-800":pct>=60?"bg-amber-900/30 text-amber-400 border border-amber-800":"bg-slate-800 text-gray-400 border border-slate-700"}`}>
          {pct>=80?"Eccellente! Hai padronanza degli argomenti.":pct>=60?"Buon risultato. Rivedi i moduli con errori.":"Studia ancora i moduli e riprova."}
        </div>
        <button onClick={()=>{setIdx(0);setAnswers({});setDone(false);setShowExp(false);}}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-all">
          Ricomincia
        </button>
      </div>
    );
  }

  return(
    <div className="space-y-4 pb-8">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-800 rounded-full h-1.5">
          <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{width:`${(idx/QUIZ.length)*100}%`}}/>
        </div>
        <span className="text-gray-500 text-xs font-mono">{idx+1}/{QUIZ.length}</span>
      </div>

      {/* Question */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <div className="text-white font-semibold text-sm leading-relaxed">{q.q}</div>
        <div className="space-y-2">
          {q.opts.map((opt,i)=>{
            let cls="w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ";
            if(selected===undefined) cls+="border-slate-700 bg-slate-900 text-gray-300 hover:border-amber-700 hover:text-white";
            else if(i===q.ans) cls+="border-green-600 bg-green-900/30 text-green-300";
            else if(i===selected&&selected!==q.ans) cls+="border-red-700 bg-red-900/20 text-red-400";
            else cls+="border-slate-700 bg-slate-900 text-gray-600";
            return(
              <button key={i} onClick={()=>select(i)} className={cls}>
                <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65+i)})</span>{opt}
              </button>
            );
          })}
        </div>
        {showExp&&(
          <div className={`px-4 py-3 rounded-lg text-xs border ${correct?"bg-green-950 border-green-800 text-green-300":"bg-red-950 border-red-900 text-red-300"}`}>
            <span className="font-bold mr-1">{correct?"✓ Corretto!":"✗ Sbagliato."}</span>{q.exp}
          </div>
        )}
        {selected!==undefined&&(
          <div className="flex gap-3 pt-2">
            {idx<QUIZ.length-1
              ?<button onClick={()=>{setIdx(i=>i+1);setShowExp(false);}} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-all">Prossima →</button>
              :<button onClick={()=>setDone(true)} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-all">Vedi risultato 🏆</button>
            }
          </div>
        )}
      </div>
    </div>
  );
}

function GlossarioTab(){
  const [q,setQ]=useState("");
  const filtered=useMemo(()=>GLOSSARY.filter(g=>g.term.toLowerCase().includes(q.toLowerCase())||g.def.toLowerCase().includes(q.toLowerCase())),[q]);
  return(
    <div className="space-y-4 pb-8">
      <input value={q} onChange={e=>setQ(e.target.value)}
        aria-label="Cerca nel glossario" placeholder="Cerca un termine... (es. Timer, FB, Rung)"
        className="w-full bg-slate-800 border border-slate-700 focus:border-amber-600 rounded-xl px-4 py-3 text-gray-300 text-sm outline-none placeholder-gray-600"/>
      <div className="text-gray-600 text-xs">{filtered.length} termini</div>
      <div className="space-y-2">
        {filtered.map((g)=>(
          <div key={g.term} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
            <div className="text-amber-300 text-sm font-semibold font-mono mb-1">{g.term}</div>
            <div className="text-gray-400 text-xs leading-relaxed">{g.def}</div>
          </div>
        ))}
        {filtered.length===0&&<div className="text-gray-600 text-sm text-center py-8">Nessun termine trovato per "{q}"</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
const TABS=[
  {id:"home",label:"Home",icon:"🏠"},
  {id:"modules",label:"Moduli",icon:"📚"},
  {id:"sim",label:"Simulatore",icon:"🎛️"},
  {id:"quiz",label:"Quiz",icon:"📝"},
  {id:"gloss",label:"Glossario",icon:"📖"},
];

export default function App(){
  const [tab,setTab]=useState("home");
  const [completed,setCompleted]=useState(
    ()=>loadCompleted()
  );
  const [startModule,setStartModule]=useState(null);

  // Persisti progresso su localStorage
  useEffect(()=>{
    saveCompleted(completed);
  },[completed]);

  const goTo=useCallback((dest)=>{
    if(typeof dest==="number"){setStartModule(dest);setTab("modules");}
    else setTab(dest);
  },[]);

  return(
    <div style={{minHeight:"100vh",background:"#0F172A",color:"white",fontFamily:"system-ui,sans-serif"}}>
      {/* Header */}
      <div style={{background:"#1E293B",borderBottom:"1px solid #334155",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",gap:8,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{
                padding:"12px 14px",
                
                borderBottom:`2px solid ${tab===t.id?"#F59E0B":"transparent"}`,
                color:tab===t.id?"#F59E0B":"#9CA3AF",background:"none",borderTop:0,borderLeft:0,borderRight:0,
                cursor:"pointer",whiteSpace:"nowrap",fontSize:13,fontWeight:tab===t.id?600:400,
                display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"
              }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}}>
        {tab==="home"&&<HomeTab onGo={goTo} completed={completed}/>}
        {tab==="modules"&&(
          <ModuliTab
            completed={completed}
            setCompleted={setCompleted}
            startModule={startModule}
            onStartConsumed={()=>setStartModule(null)}
          />
        )}
        {tab==="sim"&&<SimulatoreTab/>}
        {tab==="quiz"&&<QuizTab/>}
        {tab==="gloss"&&<GlossarioTab/>}
      </div>
    </div>
  );
}

