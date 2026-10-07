# Proposte di evoluzione

## Prima priorità: percorso didattico

- Associare ogni domanda al modulo e riportare le lezioni da ripassare al termine del quiz.
- Aggiungere esercizi guidati con obiettivo verificabile: auto-mantenimento, ritardo avvio, conta pezzi.
- Introdurre TP, CTD e CTUD con test dedicati delle transizioni e dei casi limite.
- Integrare progetti PLCSIM scaricabili, indicando CPU e versione TIA Portal e verificandoli nell’ambiente Siemens.
- Revisionare il corso rispetto a manuali Siemens: distinguere schemi concettuali e istruzioni compilabili, aggiungere riferimenti per le singole lezioni.

## Esperienza d’uso

- Riprendere dall’ultima lezione, salvare il quiz incompleto e mostrare una revisione delle risposte.
- Ricerca globale nelle lezioni, oltre al glossario; link tra termini, lezioni ed esercizi.
- Pulsanti momentanei opzionali con tastiera e gestione corretta di rilascio/cancellazione del puntatore.
- Timeline di ingressi, ET, CV e Q per spiegare i fronti e i timer.
- Esportare/importare progressi, segnalare storage indisponibile e permettere di ripetere singole lezioni.
- Verifica visiva su telefoni e desktop, contrasto, screen reader e navigazione completa da tastiera.

## Architettura e distribuzione

- Separare schede, blocchi di contenuto e componenti SVG in file dedicati.
- Aggiungere test di interazione nel browser oltre ai test della logica.
- Creare PWA installabile con cache offline e aggiornamenti controllati.
- Configurare hosting e percorso base solo dopo aver identificato la destinazione effettiva.
- Valutare aggiornamento di Vite e dipendenze con verifica della compatibilità.

## Funzioni avanzate

- Editor Ladder limitato a istruzioni supportate, con motore di scansione separato e diagnostica dei rung.
- Simulazione di guasti e interblocchi in scenari didattici documentati.
- Account e sincronizzazione solo se serve usare il corso su più dispositivi: comportano backend, manutenzione e gestione dei dati personali.
