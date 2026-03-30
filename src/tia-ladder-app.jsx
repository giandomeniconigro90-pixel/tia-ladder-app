import { useState, useMemo, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────
const A = "#F59E0B";   // amber – powered / active
const DIM = "#1E293B"; // dark wire
const GRAY = "#475569";
const BG_ELEM = "#0F172A";
const RAIL = "#334155";

// ─────────────────────────────────────────────
// MODULES DATA
// ─────────────────────────────────────────────
const MODULES = [
  {
    id: 1, emoji: "🏭", title: "Introduzione ai PLC",
    desc: "Cos'è un PLC, architettura e ciclo di scansione",
    lessons: [
      { id:"1.1", title:"Cos'è un PLC", dur:"10 min", content:[
        {t:"h2",v:"Cos'è un PLC?"},
        {t:"p",v:"Un **PLC** (Programmable Logic Controller) è un computer industriale progettato per controllare processi e macchinari in ambienti difficili (polvere, vibrazioni, temperature estreme)."},
        {t:"h3",v:"Caratteristiche principali"},
        {t:"list",v:["**Robustezza**: resiste a vibrazioni, umidità, temperature estreme","**Affidabilità**: progettato per funzionare 24/7 senza interruzioni","**Tempo reale**: risponde agli eventi in millisecondi","**Programmabilità**: la logica di controllo è software modificabile"]},
        {t:"h3",v:"Dove si usa"},
        {t:"list",v:["Linee di produzione automotive","Macchine per la plastica (presse, soffiaggio, stampaggio)","Impianti di imbottigliamento e confezionamento","Nastri trasportatori","Trattamento acque e ascensori"]},
        {t:"info",v:"I PLC nacquero negli anni '60 per sostituire i sistemi a relè nelle fabbriche. Il primo PLC commerciale fu il Modicon 084 (1968). Siemens introdusse i suoi SIMATIC negli anni '70 e oggi domina il mercato mondiale con la serie S7."},
      ]},
      { id:"1.2", title:"Architettura del PLC", dur:"15 min", content:[
        {t:"h2",v:"Architettura PLC Siemens S7-1200/1500"},
        {t:"h3",v:"1. CPU — Unità Centrale di Elaborazione"},
        {t:"p",v:"Il cervello del PLC. Contiene processore, memoria programma, memoria dati e porta di comunicazione (PROFINET/Ethernet)."},
        {t:"h3",v:"2. Moduli di Ingresso (Input)"},
        {t:"list",v:["**DI** (Digital Input): pulsanti, finecorsa, sensori ON/OFF","**AI** (Analog Input): sensori di temperatura/pressione/portata — segnali 4-20 mA o 0-10 V"]},
        {t:"h3",v:"3. Moduli di Uscita (Output)"},
        {t:"list",v:["**DQ** (Digital Output): contattori, valvole, spie luminose","**AQ** (Analog Output): controllo velocità inverter, valvole proporzionali"]},
        {t:"h3",v:"Indirizzamento Siemens"},
        {t:"table",cols:["Tipo","Prefisso","Esempio","Significato"],rows:[
          ["Ingresso digitale","I","I0.0","Byte 0, Bit 0"],
          ["Uscita digitale","Q","Q0.0","Byte 0, Bit 0"],
          ["Merker (memoria)","M","M0.0","Bit di memoria interna"],
          ["Data Block","DB","DB1.DBX0.0","Dato in Data Block 1"],
        ]},
        {t:"info",v:"Un modulo da 16 DI occupa I0.0 → I1.7 (16 bit = 2 byte). Questo vale anche per le uscite."},
      ]},
      { id:"1.3", title:"Il Ciclo di Scansione", dur:"12 min", content:[
        {t:"h2",v:"Il Ciclo di Scansione (Scan Cycle)"},
        {t:"p",v:"Il PLC esegue continuamente un ciclo di 3 fasi — ogni pochi millisecondi:"},
        {t:"h3",v:"Fase 1 — Lettura Ingressi"},
        {t:"p",v:"Il PLC legge tutti gli ingressi fisici e li copia nell'**Immagine di Processo degli Ingressi (IPI)** in memoria."},
        {t:"code",v:"Sensore fisico → [LETTURA] → I0.0 in memoria RAM"},
        {t:"h3",v:"Fase 2 — Esecuzione Programma"},
        {t:"p",v:"Il PLC esegue tutto il codice dall'inizio alla fine, usando i valori letti nella fase 1."},
        {t:"code",v:"Legge I0.0 → Esegue logica Ladder → Calcola Q0.0"},
        {t:"h3",v:"Fase 3 — Scrittura Uscite"},
        {t:"p",v:"Il PLC copia i valori calcolati nell'**Immagine di Processo delle Uscite (IPO)** sulle uscite fisiche."},
        {t:"code",v:"Q0.0 in memoria → [SCRITTURA] → Contattore fisico"},
        {t:"h3",v:"Tempi di ciclo tipici"},
        {t:"table",cols:["PLC","Tempo tipico"],rows:[["S7-1200","1 – 10 ms"],["S7-1500","0.1 – 1 ms"]]},
        {t:"info",v:"Il PLC è deterministico — ogni ciclo esegue esattamente le stesse operazioni nello stesso ordine. Questo lo rende prevedibile e sicuro per applicazioni critiche."},
      ]},
    ]
  },
  {
    id: 2, emoji: "💻", title: "TIA Portal",
    desc: "Installazione, interfaccia e primo progetto",
    lessons: [
      { id:"2.1", title:"Cos'è TIA Portal", dur:"10 min", content:[
        {t:"h2",v:"TIA Portal — Totally Integrated Automation Portal"},
        {t:"p",v:"TIA Portal è l'ambiente di sviluppo integrato Siemens per programmare PLC, creare HMI/SCADA (WinCC), configurare inverter (Startdrive) e fare diagnostica."},
        {t:"h3",v:"Versioni principali"},
        {t:"table",cols:["Versione","Note"],rows:[
          ["V16","Molto stabile, ancora molto diffusa"],
          ["V17","Supporto avanzato S7-1500"],
          ["V18","OPC UA integrato"],
          ["V19","Ultima versione (2024)"],
        ]},
        {t:"h3",v:"Licenze"},
        {t:"list",v:[
          "**STEP 7 Basic**: solo S7-1200, funzionalità limitate",
          "**STEP 7 Professional**: tutti i PLC, funzionalità complete",
          "**Trial**: 21 giorni gratuiti su siemens.com",
        ]},
        {t:"h3",v:"Requisiti di sistema (V18)"},
        {t:"list",v:["Windows 10/11 Pro 64-bit","RAM: 16 GB (consigliati 32 GB)","Spazio disco: 40 GB",".NET Framework 4.8"]},
        {t:"info",v:"Per iniziare gratis: scarica TIA Portal V18 Trial + PLCSIM Advanced da siemens.com/tia-portal. Con PLCSIM puoi simulare senza hardware reale!"},
      ]},
      { id:"2.2", title:"Interfaccia TIA Portal", dur:"15 min", content:[
        {t:"h2",v:"L'Interfaccia di TIA Portal"},
        {t:"h3",v:"Project Tree — Pannello sinistro"},
        {t:"p",v:"Struttura gerarchica del progetto: PLC, blocchi programma (OB, FC, FB), tag tables, HMI screens, configurazione hardware."},
        {t:"code",v:"📁 Progetto_1\n  📁 PLC_1 [CPU 1214C]\n    📁 Program blocks\n      📄 Main [OB1]       ← ciclo principale\n      📄 FC_Motore [FC1]  ← funzione\n      📄 FB_Valvola [FB1] ← blocco funzione\n    📁 PLC tags\n      📄 Default tag table\n  📁 HMI_1 [TP700]\n    📁 Screens"},
        {t:"h3",v:"Barra degli strumenti Ladder"},
        {t:"table",cols:["Simbolo","Elemento","Descrizione"],rows:[
          ["[ ]","Contatto NA","Si chiude quando il bit è 1"],
          ["[/]","Contatto NC","Si chiude quando il bit è 0"],
          ["( )","Bobina normale","Attiva l'uscita"],
          ["(S)","Bobina SET","Attiva e mantiene"],
          ["(R)","Bobina RESET","Spegne un SET"],
          ["TON","Timer on delay","Ritardo all'eccitazione"],
          ["TOF","Timer off delay","Ritardo alla diseccitazione"],
          ["CTU","Contatore up","Conta fronti di salita"],
        ]},
        {t:"h3",v:"Inspector Window — Pannello inferiore"},
        {t:"p",v:"Mostra proprietà dell'oggetto selezionato, info di diagnostica e cross-reference (dove è usata ogni variabile)."},
      ]},
      { id:"2.3", title:"Creare il primo progetto", dur:"20 min", content:[
        {t:"h2",v:"Creare un Progetto in TIA Portal"},
        {t:"h3",v:"Passo 1 — Nuovo progetto"},
        {t:"list",v:["Avvia TIA Portal","Click **'Create new project'**","Inserisci nome, percorso, autore","Click **'Create'**"]},
        {t:"h3",v:"Passo 2 — Aggiungi il PLC"},
        {t:"list",v:["Nel Portal View: click **'Configure a device'**","Click **'Add new device'**","Seleziona: Controllers → SIMATIC S7-1200 → CPU 1214C DC/DC/DC","Click **OK**"]},
        {t:"h3",v:"Passo 3 — Crea le variabili (Tag Table)"},
        {t:"table",cols:["Name","Data Type","Address"],rows:[
          ["Pulsante_Start","Bool","%I0.0"],
          ["Pulsante_Stop","Bool","%I0.1"],
          ["Motore_Marcia","Bool","%Q0.0"],
          ["Spia_Guasto","Bool","%Q0.1"],
        ]},
        {t:"h3",v:"Passo 4 — Simulazione con PLCSIM"},
        {t:"p",v:"Non serve hardware reale! Vai su **Online → Simulation → Start** per simulare il PLC sul PC. Puoi forzare ingressi e osservare le uscite in tempo reale."},
        {t:"info",v:"Best practice: usa sempre nomi simbolici (es. 'Pulsante_Start') invece degli indirizzi assoluti (%I0.0). Il codice diventa molto più leggibile e manutenibile."},
      ]},
    ]
  },
  {
    id: 3, emoji: "🪜", title: "Linguaggio Ladder",
    desc: "Contatti, bobine, logica e auto-mantenimento",
    lessons: [
      { id:"3.1", title:"Contatti e Bobine", dur:"15 min", content:[
        {t:"h2",v:"Contatti e Bobine — Gli elementi base"},
        {t:"h3",v:"Il Rung (Gradino)"},
        {t:"p",v:"Ogni riga orizzontale del Ladder si chiama **rung**. La 'corrente' scorre da sinistra a destra se la logica è soddisfatta."},
        {t:"code",v:"|----[ I0.0 ]----[ /I0.1 ]----(Q0.0)----|"},
        {t:"h3",v:"Contatto Normalmente Aperto (NA) — [ ]"},
        {t:"list",v:["Si **chiude** (lascia passare) quando il bit è **1 (TRUE)**","Simbolo: `---[ ]---`","Esempio: `[ I0.0 ]` → passa corrente se il pulsante è premuto"]},
        {t:"h3",v:"Contatto Normalmente Chiuso (NC) — [/]"},
        {t:"list",v:["Si **apre** (blocca) quando il bit è **1 (TRUE)**","Si **chiude** quando il bit è **0 (FALSE)**","Simbolo: `---[/]---`","Uso tipico: pulsante di STOP, finecorsa di sicurezza"]},
        {t:"h3",v:"Bobina — ( )"},
        {t:"list",v:["Si **attiva** (diventa 1) quando riceve corrente da sinistra","Metti **sempre la bobina a destra** nel rung","Una bobina attiva può essere usata come contatto in altri rung"]},
        {t:"h3",v:"Logica AND — Contatti in serie"},
        {t:"code",v:"|----[ I0.0 ]----[ I0.1 ]----(Q0.0)----|\nQ0.0 = 1  solo se  I0.0 = 1  E  I0.1 = 1"},
        {t:"h3",v:"Logica OR — Rami paralleli"},
        {t:"code",v:"|----[ I0.0 ]----+----(Q0.0)----|\n                 |                  |\n|----[ I0.1 ]----+                  |\nQ0.0 = 1  se  I0.0 = 1  O  I0.1 = 1"},
      ]},
      { id:"3.2", title:"Circuito Start/Stop", dur:"20 min", content:[
        {t:"h2",v:"Il Circuito Start/Stop con Auto-mantenimento"},
        {t:"p",v:"È il circuito più importante nel Ladder! Permette di avviare e arrestare un motore con due pulsanti mantenendo lo stato."},
        {t:"h3",v:"Il Problema"},
        {t:"p",v:"Un pulsante NA rilasciato torna a 0. Come manteniamo il motore in marcia senza tenere premuto START?"},
        {t:"h3",v:"La Soluzione — Auto-mantenimento (Self-Holding)"},
        {t:"code",v:"Rung 1 — Controllo Marcia:\n|----[ I0.0 ]----+----[/I0.1]----(M0.0)----|\n   (START NA)    |   (STOP NC)  (Marcia)    |\n                 |                           |\n             [ M0.0 ]                        |\n            (Auto-man.)                     |\n\nRung 2 — Uscita Motore:\n|----[ M0.0 ]----(Q0.0)----|\n   (Marcia)    (Motore)"},
        {t:"h3",v:"Spiegazione passo-passo"},
        {t:"list",v:[
          "**Avvio**: premi START (I0.0=1) → corrente arriva a M0.0 → Marcia=1",
          "**Mantenimento**: rilasci START → M0.0 chiude il ramo parallelo → motore continua",
          "**Arresto**: premi STOP (I0.1=1) → [/I0.1] si apre → M0.0=0 → motore fermo",
        ]},
        {t:"h3",v:"Best Practice"},
        {t:"list",v:[
          "STOP sempre su contatto **NC** — sicurezza: se il cavo si rompe, il motore si ferma",
          "Aggiungi protezioni termiche in serie al STOP",
          "Usa **M (merker)** per la logica interna, **Q** solo per le uscite fisiche",
        ]},
        {t:"info",v:"💡 Prova il circuito Start/Stop nel Simulatore! Vedrai il flusso di corrente in tempo reale."},
      ]},
      { id:"3.3", title:"Bobine SET e RESET", dur:"12 min", content:[
        {t:"h2",v:"Bobine SET (S) e RESET (R)"},
        {t:"p",v:"Le bobine SET e RESET mantengono il loro stato anche quando la condizione che le ha attivate scompare — sono **bistabili**."},
        {t:"h3",v:"Bobina SET — (S)"},
        {t:"p",v:"Porta il bit a **1** quando riceve corrente. Mantiene il bit a 1 anche quando la corrente scompare. Si resetta solo con una bobina RESET."},
        {t:"h3",v:"Bobina RESET — (R)"},
        {t:"p",v:"Porta il bit a **0** quando riceve corrente."},
        {t:"code",v:"Rung 1 — SET lampada:\n|----[ I0.0 ]----(S M0.0)----|\n   (Pulsante ON)  (SET)\n\nRung 2 — RESET lampada:\n|----[ I0.1 ]----(R M0.0)----|\n   (Pulsante OFF) (RESET)\n\nRung 3 — Uscita:\n|----[ M0.0 ]----(Q0.0)----|\n              (Lampada)"},
        {t:"h3",v:"Priorità in caso di conflitto"},
        {t:"p",v:"Se SET e RESET si attivano contemporaneamente, **il RESET ha priorità** (viene eseguito dopo nel ciclo di scansione). Metti sempre il RESET dopo il SET nei rung."},
        {t:"table",cols:["Situazione","Preferisci"],rows:[
          ["Logica semplice","Auto-mantenimento"],
          ["Più punti di attivazione/disattivazione","SET/RESET"],
          ["Sequenze complesse","SET/RESET"],
          ["Massima leggibilità","SET/RESET"],
        ]},
      ]},
    ]
  },
  {
    id: 4, emoji: "⏱️", title: "Timer e Contatori",
    desc: "TON, TOF, TP, CTU, CTD",
    lessons: [
      { id:"4.1", title:"Timer TON", dur:"15 min", content:[
        {t:"h2",v:"Timer TON — On Delay"},
        {t:"p",v:"Il TON è il timer più usato. Attiva l'uscita **Q** dopo che l'ingresso **IN** è attivo da un tempo pari a **PT** (Preset Time)."},
        {t:"code",v:"IN  ___|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|___\n       |← PT = 5s →|\nQ   ___|________________|‾‾‾‾‾‾‾‾‾|___"},
        {t:"h3",v:"Parametri"},
        {t:"table",cols:["Pin","Tipo","Descrizione"],rows:[
          ["IN","Bool","Ingresso abilitazione"],
          ["PT","Time","Tempo preimpostato (es. T#5s)"],
          ["Q","Bool","Uscita — 1 quando ET ≥ PT"],
          ["ET","Time","Elapsed Time — tempo trascorso"],
        ]},
        {t:"h3",v:"Formati del tempo"},
        {t:"code",v:"T#500ms  → 500 millisecondi\nT#5s     → 5 secondi\nT#2m30s  → 2 minuti e 30 secondi\nT#1h     → 1 ora"},
        {t:"h3",v:"Esempio — Ritardo avvio motore"},
        {t:"code",v:"Rung 1 — Timer:\n|----[ I0.0 ]----[TON PT:=T#5s]----(Q)----(M0.1)----|\n\nRung 2 — Uscita dopo 5 secondi:\n|----[ M0.1 ]----(Q0.0)----|\n            (Motore)"},
        {t:"info",v:"⚠️ Il TON resetta ET → 0 appena IN torna a 0! Se vuole un timer che mantiene il risultato, usa SET/RESET con il timer."},
      ]},
      { id:"4.2", title:"Timer TOF e TP", dur:"12 min", content:[
        {t:"h2",v:"Timer TOF e TP"},
        {t:"h3",v:"TOF — Off Delay"},
        {t:"p",v:"Mantiene l'uscita attiva per un tempo dopo che l'ingresso si è disattivato."},
        {t:"code",v:"IN  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾|__________________________\n               |← PT →|\nQ   ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|____________________"},
        {t:"p",v:"**Uso tipico**: ventilatore che continua 30s dopo lo spegnimento del riscaldamento."},
        {t:"h3",v:"TP — Pulse"},
        {t:"p",v:"Genera un impulso di durata fissa all'attivazione dell'ingresso."},
        {t:"code",v:"IN  __|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|_________________________\n    |← PT (impulso) →|\nQ   __|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|___________________________"},
        {t:"p",v:"**Uso tipico**: valvola che si apre esattamente 2 secondi ad ogni comando."},
        {t:"h3",v:"Confronto"},
        {t:"table",cols:["Timer","Q si attiva","Q si disattiva"],rows:[
          ["TON","Dopo PT da IN=1","Subito quando IN=0"],
          ["TOF","Subito quando IN=1","Dopo PT da IN=0"],
          ["TP","Subito quando IN=1","Dopo PT (anche se IN=0)"],
        ]},
      ]},
      { id:"4.3", title:"Contatori CTU e CTD", dur:"15 min", content:[
        {t:"h2",v:"Contatori CTU, CTD, CTUD"},
        {t:"h3",v:"CTU — Counter Up"},
        {t:"p",v:"Conta i **fronti di salita** (0→1) dell'ingresso CU. Quando il valore attuale **CV** raggiunge il valore preimpostato **PV**, l'uscita Q diventa 1."},
        {t:"code",v:"CU  _|‾|_|‾|_|‾|_|‾|_|‾|_\n     1   2   3   4   5\n                       ↑ CV = PV → Q = 1"},
        {t:"h3",v:"Parametri CTU"},
        {t:"table",cols:["Pin","Tipo","Descrizione"],rows:[
          ["CU","Bool","Count Up — fronte di salita"],
          ["R","Bool","Reset — azzera il contatore"],
          ["PV","Int","Preset Value — valore target"],
          ["Q","Bool","1 quando CV ≥ PV"],
          ["CV","Int","Current Value — valore attuale"],
        ]},
        {t:"h3",v:"Esempio — Conta pezzi su nastro"},
        {t:"code",v:"Rung 1 — Conta fronti sensore:\n|----[P I0.0]----[CTU PV:=10]----(Q)----(M0.0)----|\n   (Sensore)                   (10 pezzi?)"},
        {t:"h3",v:"Perché usare [P] — rilevazione fronte"},
        {t:"p",v:"Senza **[P]**, il CTU incrementerebbe ogni scan cycle (migliaia di volte al secondo!). Con **[P]** si conta solo il fronte 0→1: un solo incremento per ogni attivazione reale."},
        {t:"h3",v:"CTD — Counter Down"},
        {t:"p",v:"Parte da PV e conta verso il basso. Q = 1 quando CV ≤ 0. **Uso tipico**: distributore che parte con 100 pezzi e si svuota."},
        {t:"info",v:"CTUD combina entrambi: ha sia CU (conta su) che CD (conta giù) — utile per sistemi che caricano e scaricano pezzi contemporaneamente."},
      ]},
    ]
  },
  {
    id: 5, emoji: "🏗️", title: "Struttura del Programma",
    desc: "OB, FC, FB e Data Block",
    lessons: [
      { id:"5.1", title:"Organization Block (OB)", dur:"12 min", content:[
        {t:"h2",v:"Organization Block — Il punto di partenza"},
        {t:"p",v:"Gli OB sono i blocchi di livello più alto. Il sistema operativo del PLC li chiama automaticamente in base a eventi o al ciclo."},
        {t:"table",cols:["OB","Nome","Quando viene chiamato"],rows:[
          ["OB1","Program Cycle","Ad ogni ciclo di scansione — logica principale"],
          ["OB100","Startup","Una sola volta all'avvio del PLC"],
          ["OB30-38","Interrupt ciclici","A intervalli fissi (es. ogni 100ms) — PID"],
          ["OB40-47","Interrupt hardware","Al cambio stato di un ingresso — risposta µs"],
          ["OB80/82","Gestione errori","In caso di errori del sistema"],
        ]},
        {t:"h3",v:"Struttura tipica di un progetto"},
        {t:"code",v:"OB100 (Startup)\n  └── Inizializza variabili\n  └── Imposta parametri default\n\nOB1 (Ciclo principale)\n  └── Chiama FC_GestioneIngressi()\n  └── Chiama FC_Sicurezza()\n  └── Chiama FB_Motore_1(DB1)\n  └── Chiama FB_Motore_2(DB2)\n  └── Chiama FB_Valvola_1(DB3)\n  └── Chiama FC_GestioneUscite()"},
        {t:"info",v:"OB1 è obbligatorio — deve sempre esistere nel progetto. È il cuore del programma che viene eseguito continuamente."},
      ]},
      { id:"5.2", title:"FC e FB", dur:"18 min", content:[
        {t:"h2",v:"FC e FB — Blocchi riutilizzabili"},
        {t:"h3",v:"FC — Function"},
        {t:"p",v:"Blocco **senza memoria propria**. I parametri vengono passati dall'esterno. Ideale per calcoli e logica stateless."},
        {t:"code",v:"FC_ScalaAnalogico:\n  INPUT:  ValoreRaw : Int    (0 - 27648)\n  INPUT:  MinEng    : Real   (es. 0.0 bar)\n  INPUT:  MaxEng    : Real   (es. 10.0 bar)\n  OUTPUT: Valore    : Real\n\n  Formula: Valore := (ValoreRaw / 27648.0)\n                     * (MaxEng - MinEng) + MinEng"},
        {t:"h3",v:"FB — Function Block"},
        {t:"p",v:"Blocco **con memoria propria** (Instance Data Block). Mantiene il proprio stato tra le chiamate. Ideale per controllare dispositivi."},
        {t:"code",v:"FB_Motore:\n  INPUT:  Start  : Bool\n  INPUT:  Stop   : Bool\n  INPUT:  Guasto : Bool\n  OUTPUT: Marcia : Bool\n  STATIC: Stato  : Int   ← memoria interna!"},
        {t:"h3",v:"Instance Data Block (IDB)"},
        {t:"p",v:"Ogni volta che usi un FB, TIA Portal crea un DB per ogni istanza — stessa logica, dati separati:"},
        {t:"code",v:"FB_Motore → DB1 (Motore 1)\nFB_Motore → DB2 (Motore 2)\nFB_Motore → DB3 (Motore 3)\n// Stesso codice, tre set di variabili!"},
        {t:"table",cols:["Usa FC quando…","Usa FB quando…"],rows:[
          ["Non serve memoria","Hai stati da memorizzare"],
          ["Calcoli puri","Controllo dispositivi fisici"],
          ["Utility generiche","Hai timer/contatori interni"],
          ["Non hai istanze multiple","Hai N dispositivi identici"],
        ]},
      ]},
    ]
  },
];

// ─────────────────────────────────────────────
// QUIZ
// ─────────────────────────────────────────────
const QUIZ = [
  { q:"Cosa significa l'acronimo PLC?", opts:["Programmable Logic Controller","Process Line Computer","Programmable Line Control","Process Logic Computer"], ans:0, exp:"PLC = Programmable Logic Controller — controllore logico programmabile." },
  { q:"In quale ordine si svolge il ciclo di scansione del PLC?", opts:["Esecuzione → Lettura → Scrittura","Lettura ingressi → Esecuzione → Scrittura uscite","Scrittura → Lettura → Esecuzione","Lettura → Scrittura → Esecuzione"], ans:1, exp:"Il ciclo corretto: 1) Legge ingressi, 2) Esegue il programma, 3) Scrive le uscite." },
  { q:"Quale prefisso identifica un'uscita digitale Siemens?", opts:["I","M","Q","D"], ans:2, exp:"Q identifica le uscite (Output). I = Ingressi, M = Merker (memoria)." },
  { q:"Un contatto Normalmente Chiuso [/] lascia passare corrente quando...", opts:["Il bit è 1","Il bit è 0","Si preme un pulsante fisico","La bobina è attiva"], ans:1, exp:"Il contatto NC [/] è chiuso (lascia passare) quando il bit associato è 0 (FALSE)." },
  { q:"Nell'auto-mantenimento, il contatto in parallelo al pulsante START serve per...", opts:["Invertire la logica","Mantenere il circuito chiuso quando il pulsante viene rilasciato","Proteggere il motore da sovraccarico","Aggiungere un ritardo di avvio"], ans:1, exp:"Il self-holding mantiene M0.0 attivo anche dopo aver rilasciato START — il motore continua a girare." },
  { q:"Un timer TON con PT = T#5s: quando diventa 1 l'uscita Q?", opts:["Subito quando IN = 1","5 secondi dopo che IN torna a 0","5 secondi dopo che IN diventa 1","Dopo 5 cicli di scansione"], ans:2, exp:"TON = On Delay. Q si attiva dopo PT secondi dall'attivazione di IN." },
  { q:"Perché si usa [P] (rilevazione fronte) in ingresso a un CTU?", opts:["Per velocizzare il conteggio","Per evitare che il contatore incrementi ad ogni scan cycle","Per resettare il contatore","Per abilitare il conteggio in discesa"], ans:1, exp:"Senza [P], il CTU incrementerebbe migliaia di volte al secondo. Con [P] conta solo il fronte 0→1 reale." },
  { q:"Qual è la differenza principale tra FC e FB?", opts:["L'FC è più veloce","L'FB ha una memoria propria (Instance DB), l'FC no","L'FC può essere usato solo in OB1","L'FB non può avere parametri di ingresso"], ans:1, exp:"L'FB mantiene variabili statiche nel suo Instance DB tra una chiamata e l'altra. L'FC non ha memoria propria." },
  { q:"In TIA Portal, quale OB viene eseguito una sola volta all'avvio del PLC?", opts:["OB1","OB30","OB100","OB40"], ans:2, exp:"OB100 (Startup) viene eseguito una sola volta all'avvio — ideale per inizializzare variabili e parametri default." },
  { q:"Il timer TOF mantiene Q = 1...", opts:["Per il tempo PT dopo che IN diventa 1","Per il tempo PT dopo che IN torna a 0","Fino al reset manuale","Indefinitamente dopo l'attivazione"], ans:1, exp:"TOF = Off Delay. Q rimane attivo per PT secondi dopo che IN si è disattivato." },
];

// ─────────────────────────────────────────────
// GLOSSARY
// ─────────────────────────────────────────────
const GLOSSARY = [
  { term:"AI (Analog Input)", def:"Modulo di ingresso analogico. Legge segnali continui come 4-20mA o 0-10V da sensori di temperatura, pressione, portata." },
  { term:"AQ (Analog Output)", def:"Modulo di uscita analogico. Genera segnali continui per controllare inverter, valvole proporzionali." },
  { term:"CTD", def:"Counter Down — contatore in discesa. Parte da PV e conta verso il basso. Q=1 quando CV≤0." },
  { term:"CTU", def:"Counter Up — contatore in salita. Conta fronti di salita dell'ingresso CU. Q=1 quando CV≥PV." },
  { term:"Ciclo di scansione", def:"Il ciclo ripetuto del PLC: 1) Legge ingressi, 2) Esegue programma, 3) Scrive uscite. Dura tipicamente 1-10ms." },
  { term:"CPU", def:"Unità centrale di elaborazione del PLC. Contiene processore, memoria programma, memoria dati e interfacce." },
  { term:"DB (Data Block)", def:"Area di memoria strutturata per memorizzare dati del programma. Può essere Global DB (condiviso) o Instance DB (di un FB)." },
  { term:"DI (Digital Input)", def:"Modulo di ingresso digitale. Legge segnali ON/OFF da pulsanti, sensori, finecorsa." },
  { term:"DQ (Digital Output)", def:"Modulo di uscita digitale. Comanda contattori, valvole, luci, relè." },
  { term:"FB (Function Block)", def:"Blocco funzione con memoria propria (Instance DB). Mantiene il proprio stato tra le chiamate. Usato per controllo dispositivi." },
  { term:"FC (Function)", def:"Funzione senza memoria propria. Ogni chiamata è indipendente. Ideale per calcoli e utilità generiche." },
  { term:"HMI", def:"Human Machine Interface — pannello operatore touch screen per visualizzare e controllare il processo." },
  { term:"I (Ingresso)", def:"Prefisso Siemens per gli ingressi digitali. I0.0 = byte 0, bit 0." },
  { term:"IDB (Instance Data Block)", def:"Data Block creato automaticamente per ogni istanza di un FB. Contiene le variabili statiche dell'FB." },
  { term:"Ladder (LAD)", def:"Linguaggio di programmazione PLC che rappresenta la logica con simboli di contatti e bobine, simile agli schemi a relè." },
  { term:"M (Merker)", def:"Bit di memoria interna del PLC. Non corrisponde a nessun ingresso/uscita fisico — usato per variabili di supporto." },
  { term:"NA (Normalmente Aperto)", def:"Contatto che si chiude (lascia passare corrente) quando il bit associato è 1 (TRUE)." },
  { term:"NC (Normalmente Chiuso)", def:"Contatto che si apre (blocca la corrente) quando il bit associato è 1 (TRUE). Usato per STOP e sicurezze." },
  { term:"OB (Organization Block)", def:"Blocco organizzativo chiamato dal SO del PLC. OB1 = ciclo principale. OB100 = startup." },
  { term:"PLC", def:"Programmable Logic Controller — computer industriale robusto per il controllo automatico di macchine e processi." },
  { term:"PLCSIM", def:"Software Siemens per simulare un PLC sul PC senza hardware reale. Incluso in TIA Portal." },
  { term:"PROFINET", def:"Protocollo Ethernet industriale Siemens per comunicazione PLC-HMI-periferiche-PLC." },
  { term:"Q (Uscita)", def:"Prefisso Siemens per le uscite digitali. Q0.0 = byte 0, bit 0." },
  { term:"Rung", def:"Singola riga orizzontale del programma Ladder. Ogni rung è una equazione logica." },
  { term:"SET/RESET", def:"Bobine bistabili: SET porta il bit a 1 e lo mantiene; RESET lo porta a 0. Il RESET ha priorità." },
  { term:"TIA Portal", def:"Totally Integrated Automation Portal — ambiente di sviluppo integrato Siemens per PLC, HMI e azionamenti." },
  { term:"TOF", def:"Timer Off Delay — mantiene Q=1 per il tempo PT dopo che IN torna a 0." },
  { term:"TON", def:"Timer On Delay — attiva Q dopo che IN è attivo da un tempo pari a PT." },
  { term:"TP", def:"Timer Pulse — genera un impulso di durata fissa PT all'attivazione di IN." },
];

// ─────────────────────────────────────────────
// SIMULATOR EXAMPLES
// ─────────────────────────────────────────────
const EXAMPLES = [
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
    evaluate:(bits,prev)=>{
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
    desc:"Simula un TON (PT=5 click). Premi IN ripetutamente: ogni click è un 'tick'. Dopo 5 tick consecutivi l'uscita Q si attiva. Rilascia IN per resettare.",
    initialBits:{"I0.0":false,"M_T0":false,"M_T1":false,"M_T2":false,"M_T3":false,"M_T4":false,"Q0.0":false},
    inputs:[{bit:"I0.0",label:"IN — Abilita timer"}],
    outputs:[{bit:"Q0.0",label:"Q — Uscita TON (ET≥PT=5)"}],
    evaluate:(bits,prev={})=>{
      const n={...bits};
      if(!bits["I0.0"]){
        n["M_T0"]=false;n["M_T1"]=false;n["M_T2"]=false;n["M_T3"]=false;n["M_T4"]=false;
        n["Q0.0"]=false;
      } else {
        const cnt=[n["M_T0"],n["M_T1"],n["M_T2"],n["M_T3"],n["M_T4"]];
        const filled=cnt.filter(Boolean).length;
        if(filled<5) cnt[filled]=true;
        n["M_T0"]=cnt[0];n["M_T1"]=cnt[1];n["M_T2"]=cnt[2];n["M_T3"]=cnt[3];n["M_T4"]=cnt[4];
        n["Q0.0"]=cnt.every(Boolean);
      }
      return n;
    },
    rungs:[
      {label:"Rung 1 — Abilitazione IN",type:"simple",
       contacts:[{type:"contact_no",bit:"I0.0",label:"IN"}],
       coil:{type:"coil",bit:"M_T0",label:"ET tick"}},
      {label:"Rung 2 — Uscita Q (ET≥PT)",type:"simple",
       contacts:[{type:"contact_no",bit:"M_T0",label:"T1"},{type:"contact_no",bit:"M_T4",label:"T5"}],
       coil:{type:"coil",bit:"Q0.0",label:"Q TON"}},
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

// ─────────────────────────────────────────────
// MARKDOWN RENDERER
// ─────────────────────────────────────────────
function Inline({text}){
  const parts=[];let rem=text,i=0;
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
      <line x1={splitX} y1={topY} x2={splitX+n_top*perW+5} y2={topY} stroke={topPow?A:DIM} strokeWidth={2}/>
      {/* bottom branch */}
      <line x1={splitX} y1={botY} x2={splitX+n_bot*perW+5} y2={botY} stroke={botPow?A:DIM} strokeWidth={2}/>
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

function LadderDiagram({example,bits}){
  const evaluated=useMemo(()=>example.evaluate(bits),[bits,example]);
  return(
    <div className="space-y-3">
      {example.rungs.map((rung,i)=>{
        const coilBit=rung.coil?.bit;
        const powered=coilBit?!!evaluated[coilBit]:false;
        return(
          <div key={i} className="bg-slate-900 rounded-lg p-2 border border-slate-700">
            <div className="text-xs text-slate-500 font-mono mb-1 px-1">{rung.label}</div>
            {rung.type==="simple"
              ?<SimpleRung rung={rung} bits={evaluated} powered={powered}/>
              :()=>{
                const topPow=rung.top.every(e=>e.type==="contact_nc"?!evaluated[e.bit]:!!evaluated[e.bit]);
                const botPow=rung.bottom.every(e=>e.type==="contact_nc"?!evaluated[e.bit]:!!evaluated[e.bit]);
                return <ParallelRung rung={rung} bits={evaluated} topPow={topPow} botPow={botPow} powered={powered}/>;
              }
            }
            {rung.type==="parallel"&&(()=>{
              const topPow=rung.top.every(e=>e.type==="contact_nc"?!evaluated[e.bit]:!!evaluated[e.bit]);
              const botPow=rung.bottom.every(e=>e.type==="contact_nc"?!evaluated[e.bit]:!!evaluated[e.bit]);
              return <ParallelRung rung={rung} bits={evaluated} topPow={topPow} botPow={botPow} powered={powered}/>;
            })()}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────
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
    <div className="flex gap-4 pb-8">
      {/* Sidebar */}
      <div className="w-48 shrink-0 space-y-1">
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
            <button onClick={prev} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded-lg transition-all">← Precedente</button>
            <button onClick={next} className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-all">
              {lesIndex<mod.lessons.length-1?"Avanti →":"Prossimo modulo →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulatoreTab(){
  const [exIdx,setExIdx]=useState(0);
  const ex=EXAMPLES[exIdx];
  const [bits,setBits]=useState({...ex.initialBits});
  const [prevBits,setPrevBits]=useState({...ex.initialBits});

  const evaluated=useMemo(()=>ex.evaluate(bits,prevBits),[bits,ex]);

  const changeEx=(i)=>{setExIdx(i);setBits({...EXAMPLES[i].initialBits});setPrevBits({...EXAMPLES[i].initialBits});};

  const toggleBit=(bit)=>setBits(b=>{
    const nb={...b,[bit]:!b[bit]};
    const result=ex.evaluate(nb,b);
    setPrevBits(nb);
    return result;
  });

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

        {/* Inputs */}
        <div className="mb-4">
          <div className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2">Ingressi — clicca per attivare</div>
          <div className="flex flex-wrap gap-2">
            {ex.inputs.map(inp=>(
              <button key={inp.bit} onClick={()=>toggleBit(inp.bit)}
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
          <div className="space-y-2">
            {ex.rungs.map((rung,i)=>{
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
        placeholder="Cerca un termine... (es. Timer, FB, Rung)"
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
    ()=>new Set(JSON.parse(localStorage.getItem("tia_completed")||"[]"))
  );
  const [startModule,setStartModule]=useState(null);

  // Persisti progresso su localStorage
  useEffect(()=>{
    localStorage.setItem("tia_completed",JSON.stringify([...completed]));
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
                color:tab===t.id?"#F59E0B":"#9CA3AF",background:"none",border:"none",
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
