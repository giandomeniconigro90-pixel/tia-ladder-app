export const EXAMPLES = [
  {
    id:"start_stop", title:"Start / Stop Motore",
    desc:"Circuito classico con auto-mantenimento. Premi START per avviare, STOP per fermare.",
    initialBits:{"I0.0":false,"I0.1":false,"M0.0":false,"Q0.0":false},
    inputs:[{bit:"I0.0",label:"START (NA)"},{bit:"I0.1",label:"STOP (NC)"}],
    outputs:[{bit:"Q0.0",label:"MOTORE"}],
    evaluate:(bits)=>{
      const n={...bits};
      n["M0.0"]=(bits["I0.0"]||bits["M0.0"])&&!bits["I0.1"];
      n["Q0.0"]=n["M0.0"];
      return n;
    },
    rungs:[
      {label:"Rung 1 — Controllo marcia",type:"parallel",
       top:[{type:"contact_no",bit:"I0.0",label:"START"}],
       bottom:[{type:"contact_no",bit:"M0.0",label:"Auto-man."}],
       series:[{type:"contact_nc",bit:"I0.1",label:"STOP"}],
       coil:{type:"coil",bit:"M0.0",label:"Marcia"}},
      {label:"Rung 2 — Uscita motore",type:"simple",
       contacts:[{type:"contact_no",bit:"M0.0",label:"Marcia"}],
       coil:{type:"coil",bit:"Q0.0",label:"MOTORE"}},
    ]
  },
  {
    id:"and_or", title:"Logica AND / OR",
    desc:"Serie = AND, Parallelo = OR. Sperimenta le combinazioni di A, B, C.",
    initialBits:{"I0.0":false,"I0.1":false,"I0.2":false,"Q0.0":false,"Q0.1":false},
    inputs:[{bit:"I0.0",label:"A"},{bit:"I0.1",label:"B"},{bit:"I0.2",label:"C"}],
    outputs:[{bit:"Q0.0",label:"AND (A·B)"},{bit:"Q0.1",label:"OR (A+C)"}],
    evaluate:(bits)=>{
      const n={...bits};
      n["Q0.0"]=bits["I0.0"]&&bits["I0.1"];
      n["Q0.1"]=bits["I0.0"]||bits["I0.2"];
      return n;
    },
    rungs:[
      {label:"Rung 1 — AND (contatti in serie)",type:"simple",
       contacts:[{type:"contact_no",bit:"I0.0",label:"A"},{type:"contact_no",bit:"I0.1",label:"B"}],
       coil:{type:"coil",bit:"Q0.0",label:"AND"}},
      {label:"Rung 2 — OR (contatti in parallelo)",type:"parallel",
       top:[{type:"contact_no",bit:"I0.0",label:"A"}],
       bottom:[{type:"contact_no",bit:"I0.2",label:"C"}],
       series:[],
       coil:{type:"coil",bit:"Q0.1",label:"OR"}},
    ]
  },
  {
    id:"set_reset", title:"SET / RESET Lampada",
    desc:"Bobine bistabili. ON accende la lampada, OFF la spegne — lo stato si mantiene.",
    initialBits:{"I0.0":false,"I0.1":false,"M0.0":false,"Q0.0":false},
    inputs:[{bit:"I0.0",label:"ON (SET)"},{bit:"I0.1",label:"OFF (RESET)"}],
    outputs:[{bit:"Q0.0",label:"LAMPADA"}],
    evaluate:(bits,prev={})=>{
      const n={...bits};
      if(bits["I0.0"]) n["M0.0"]=true;
      if(bits["I0.1"]) n["M0.0"]=false;
      n["Q0.0"]=n["M0.0"];
      return n;
    },
    rungs:[
      {label:"Rung 1 — SET lampada",type:"simple",
       contacts:[{type:"contact_no",bit:"I0.0",label:"ON"}],
       coil:{type:"coil_set",bit:"M0.0",label:"S Lampada"}},
      {label:"Rung 2 — RESET lampada",type:"simple",
       contacts:[{type:"contact_no",bit:"I0.1",label:"OFF"}],
       coil:{type:"coil_reset",bit:"M0.0",label:"R Lampada"}},
      {label:"Rung 3 — Uscita",type:"simple",
       contacts:[{type:"contact_no",bit:"M0.0",label:"Lampada"}],
       coil:{type:"coil",bit:"Q0.0",label:"LUCE"}},
    ]
  },
  {
    id:"ton_timer", title:"Timer TON — Ritardo avvio",
    desc:"Timer TON reale con PT = 5 secondi. Tieni premuto IN: dopo 5 secondi l'uscita Q si attiva. Rilascia IN per resettare il timer.",
    timerBased: true,
    timerPT: 5000,
    initialBits:{"I0.0":false,"Q0.0":false},
    inputs:[{bit:"I0.0",label:"IN — Abilita timer"}],
    outputs:[{bit:"Q0.0",label:"Q — Uscita TON (ET≥PT=5s)"}],
    evaluate:(bits,prev={},timerState={})=>{
      const n={...bits};
      n["Q0.0"]=!!(timerState&&timerState.q);
      return n;
    },
    rungs:[
      {label:"Rung 1 — Abilitazione TON (PT=5s)",type:"simple",
       contacts:[{type:"contact_no",bit:"I0.0",label:"IN"}],
       coil:{type:"coil",bit:"Q0.0",label:"Q TON"}},
    ]
  },
  {
    id:"tof_timer", title:"Timer TOF — Ritardo spegnimento",
    desc:"Timer TOF reale con PT = 4 secondi. Attiva IN: Q si attiva subito. Disattiva IN: Q rimane attivo altri 4 secondi poi si spegne.",
    timerBased: true,
    timerType: "TOF",
    timerPT: 4000,
    initialBits:{"I0.0":false,"Q0.0":false},
    inputs:[{bit:"I0.0",label:"IN — Segnale"}],
    outputs:[{bit:"Q0.0",label:"Q — Uscita TOF (ritardo OFF)"}],
    evaluate:(bits,prev={},timerState={})=>{
      const n={...bits};
      n["Q0.0"]=!!(timerState&&timerState.q);
      return n;
    },
    rungs:[
      {label:"Rung 1 — Abilitazione TOF (PT=4s)",type:"simple",
       contacts:[{type:"contact_no",bit:"I0.0",label:"IN"}],
       coil:{type:"coil",bit:"Q0.0",label:"Q TOF"}},
    ]
  },
  {
    id:"ctu_counter", title:"Contatore CTU — Conta pezzi",
    desc:"Simula CTU con PV=5. Premi PEZZO per ogni fronte di salita (0→1). A 5 pezzi Q scatta. Premi RESET per azzerare il contatore.",
    initialBits:{"I0.0":false,"I0.1":false,"M_C0":false,"M_C1":false,"M_C2":false,"M_C3":false,"M_C4":false,"Q0.0":false,"M_PREV":false},
    inputs:[{bit:"I0.0",label:"CU — PEZZO rilevato"},{bit:"I0.1",label:"R — RESET contatore"}],
    outputs:[{bit:"Q0.0",label:"Q — 5 pezzi raggiunti (CV≥PV)"}],
    evaluate:(bits,prev={})=>{
      const n={...bits};
      if(bits["I0.1"]){
        ["M_C0","M_C1","M_C2","M_C3","M_C4"].forEach(k=>n[k]=false);
        n["Q0.0"]=false;n["M_PREV"]=false;return n;
      }
      const rising=bits["I0.0"]&&!prev["M_PREV"];
      n["M_PREV"]=bits["I0.0"];
      if(rising){
        const cnt=[n["M_C0"],n["M_C1"],n["M_C2"],n["M_C3"],n["M_C4"]];
        const f=cnt.filter(Boolean).length;
        if(f<5) cnt[f]=true;
        n["M_C0"]=cnt[0];n["M_C1"]=cnt[1];n["M_C2"]=cnt[2];n["M_C3"]=cnt[3];n["M_C4"]=cnt[4];
      }
      n["Q0.0"]=n["M_C0"]&&n["M_C1"]&&n["M_C2"]&&n["M_C3"]&&n["M_C4"];
      return n;
    },
    rungs:[
      {label:"Rung 1 — Conta fronti CU (sensore pezzo)",type:"simple",
       contacts:[{type:"contact_no",bit:"I0.0",label:"CU"}],
       coil:{type:"coil",bit:"M_C0",label:"CV++"}},
      {label:"Rung 2 — Uscita Q (CV≥PV=5)",type:"simple",
       contacts:[{type:"contact_no",bit:"M_C0",label:"C1"},{type:"contact_no",bit:"M_C4",label:"C5"}],
       coil:{type:"coil",bit:"Q0.0",label:"Q CTU"}},
    ]
  },
];
