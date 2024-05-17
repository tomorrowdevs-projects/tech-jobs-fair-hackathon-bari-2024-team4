# Tech Jobs Fair Hackathon Bari 2024

L'obiettivo finale dell'attività è lavorare su di un progetto ripercorrendo le stesse modalità di lavoro in azienda.

Lo strumento per raggiungere tale obiettivo sarà la realizzazione di un MVP di un progetto.

Lo sviluppo si completerà **Venerdi 17 Maggio**, quando tutti i team termineranno il loro lavoro.

## Calendario Attività:

### Lunedi 13 Maggio 2024

#### Ore 9.00: Meeting di ritrovo su [link zoom] e saluti

#### Fase 1: brainstorming progetto
In call con tutti i team, verranno raccolti i requisiti attraverso una sessione di domande e risposte.
L'obiettivo di questa fase è trasmettere un metodo di approccio ai progetti.

Terminata la prima fase, i team inizieranno a lavorare in modo indipendente, comunicando attraverso i gruppi Telegram che sono stati creati nei giorni precedenti. 

#### Fase 2: analisi e architettura
Durante questa fase i team analizzeranno i requisiti, ed inizieranno a ragionare su un'architettura da dare al progetto, scegliendo anche quelle che sarà lo stack tecnologico, sulla base della loro stessa analisi.
Quest'attività è volutamente lasciata in capo ai team, che saranno comunque seguiti, poichè è parte integrante delle dinamiche lavorative quando ci si approccia a nuovi progetti.

#### Fase 3: Sviluppo
I team svilupperanno la loro soluzione, concentrandosi sulle funzionalità principali, definite e prioritizzate in fase di analisi.

### 14,15,16 Maggio
I team continueranno a lavorare in modo indipendente sui loro progetti, cercando di implementare più funzionalità possibili.

### Daily Review

Ogni giorno, a partire dal 14 Maggio, ci sarà un'attività di review con ogni singolo team

### Venerdi 17 Maggio, ore 17: Meeting finale su [link zoom] e saluti

# Requisito tecnico

## TECH JOBS FAIR QUIZ

### Scopo del Progetto:
Realizzare un'applicazione collaborativa che permetta agli utenti di partecipare ad un Quiz in tempo reale.

L'applicazione dovrà permettere di:
- far accedere allo stesso URL diversi partecipanti, chiedendo loro un nome con cui partecipare (o assegnandone uno di fantasia)
- Quando almeno 2 partecipanti sono presenti, può essere avviata una nuova partita
- Tutti i partecipanti presenti sull'URL in quel momento, avranno possibilità di dare una risposta
- Gli utenti dovranno rispondere entro un tempo prestabilito
- Una volta esaurito il tempo, dovrà essere mostrata la classifica dei partecipanti, tenendo conto dell'esattezza della risposta e del tempo impiegato per rispondere
- Ogni partita dura 10 domande
- Chi accede all'URL durante una partita in corso, dovrà essere messo in attesa per la partita successiva

### Funzionalità Essenziali:

1. Accesso multiplo ad un unico URL
2. Visualizzazione mobile-first
3. Utilizzo di https://opentdb.com/api_config.php come fonte dati per le domande
4. Meccanismo di base del quiz
   1. Avvio partita
   2. Visualizzazione nuova domanda
   3. Gestione delle risposte
   4. Visualizzazione classifica partita
   5. Temporizzazione domanda
   6. Conclusione partita e classifica finale
 5. Deploy pubblico su indirizzo accessibile 

### Funzionalità Opzionali:

1. Rispetto degli standard base [OWASP](https://owasp.org/) per la sicurezza
2. Creazione di container Docker per i vari elementi dell'applicazione
