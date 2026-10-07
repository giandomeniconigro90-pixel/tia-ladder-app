# TIA Portal & Ladder — Corso interattivo

Corso React in italiano per avvicinarsi ai PLC Siemens S7-1200/1500: 7 moduli, 20 lezioni, 15 domande, glossario e 6 esercizi interattivi. Simulazione didattica locale, senza collegamento a PLC o hardware.

## Avvio e verifica

Richiede Node.js 22 o successivo.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

La build è in `dist/`. Tailwind viene compilato localmente: non richiede la CDN in produzione. Per hosting sotto una sottocartella impostare il `base` di Vite secondo il percorso effettivo.

## Struttura

- `src/data/`: unica fonte dei contenuti del corso, quiz, glossario ed esempi.
- `src/simulation.js`: transizioni pure della simulazione. Un aggiornamento per evento; il rendering non modifica lo stato.
- `src/progress.js`: caricamento e salvataggio robusti dei progressi.
- `src/tia-ladder-app.jsx`: interfaccia e diagrammi SVG.
- `tests/`: regressioni su timer, fronti del contatore, logica, contenuti e storage.

## Come funzionano gli esercizi

I pulsanti commutano ingressi mantenuti: clic per attivare, altro clic per disattivare. Start/Stop usa STOP_OK = 1 a riposo e 0 premuto; START deve essere rilasciato per osservare l’auto-mantenimento. Il TON attende 5 secondi con IN attivo. Il TOF mantiene Q per 4 secondi dopo la disattivazione. ET segue un orologio monotono; gli aggiornamenti grafici avvengono circa ogni 50 ms e possono rallentare in una scheda in background. Il CTU conta fronti 0→1 e continua oltre PV, fino al limite INT. RESET prevale sul conteggio. Azzera esempio ripristina ingressi, uscite e memoria.

I diagrammi sono rappresentazioni didattiche, non progetti TIA Portal importabili. Il simulatore non riproduce l’intera scansione PLC, diagnostica hardware, retentività o funzioni di sicurezza.

## Progressi

La chiave `tia_completed` conserva le lezioni completate nel browser. Gli ID esistenti sono mantenuti. Dati corrotti o non riconosciuti vengono ignorati. Se lo storage non è disponibile, il corso rimane utilizzabile ma il progresso può non persistere. Cambiare scheda dell’app azzera quiz e simulatore; non azzera le lezioni completate.

## Riferimenti didattici

Consultare la documentazione Siemens della propria CPU, firmware e versione TIA Portal. In particolare, il CTU IEC rileva autonomamente il fronte di salita:
https://docs.tia.siemens.cloud/r/en-us/v21/fbd-s7-1200-s7-1500-s7-1200-g2/counter-operations-s7-1200-s7-1500-s7-1200-g2/ctu-count-up-s7-1200-s7-1500-s7-1200-g2

Le rappresentazioni analogiche dipendono dal modulo e dalla configurazione del canale. Le bobine separate SET/RESET seguono l’ordine di esecuzione; i blocchi SR/RS hanno priorità proprie.

Vedere `ROADMAP.md` per le proposte di evoluzione.
