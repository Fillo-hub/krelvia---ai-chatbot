# Krelvia Workspace

**Piattaforma web AI & produttività aziendale, self-hosted, personalizzabile sul brand del cliente e senza vendor lock-in.**

---

## Il Problema di Business risolto

Le aziende, gli studi professionali e le agenzie digitali che vogliono integrare un assistente AI operativo nei propri flussi quotidiani si scontrano spesso con tre ostacoli concreti: dipendenza da piattaforme proprietarie, costi mensili poco prevedibili e interfacce generiche prive di strumenti pratici.

**Krelvia Workspace** risolve questo problema offrendo una piattaforma web completa, veloce e 100% responsive che unisce:

- **Conversazioni persistenti e multi-utente:** salvate su database PostgreSQL dedicato, con gestione autenticazione, sessioni ospite, controllo della visibilità (Privata/Pubblica) ed esportazione immediata delle chat in Markdown (`.md`).
- **Modalità operativa locale (zero costi API):** anche senza alcuna chiave API esterna, l'assistente funziona da subito eseguendo calcoli fiscali e finanziari reali (calcolo/scorporo IVA 4%/10%/22%, simulazione rata mutuo), generando password sicure e UUID, validando JSON/Base64 e creando bozze email e piani operativi.
- **Pannello Strumenti Rapidi integrato:** quattro utility interattive (*IVA & Sconti*, *Password & UUID*, *JSON / Base64*, *Analisi Testo*) accessibili con un clic da desktop e smartphone.
- **Upgrade immediato ad AI generativa:** inserendo una chiave `GOOGLE_GENERATIVE_AI_API_KEY` nel file `.env.local`, la piattaforma abilita istantaneamente i modelli **Google Gemini** senza dover modificare l'infrastruttura.

---

## Architettura e Tech Stack

- **Frontend & UI/UX:** **Next.js**, **React**, **TypeScript** e **Tailwind CSS** con componenti accessibili (**Radix UI / shadcn/ui**), tema Chiaro/Scuro e interfaccia responsive progettata per desktop, tablet e mobile.
- **Backend & Autenticazione:** Route Handlers e Server Actions di Next.js, autenticazione utenti e sessioni guest gestite tramite **Auth.js** (`next-auth`) e gestione allegati su storage locale (`public/uploads`) con controllo su formato e dimensione.
- **Database:** **PostgreSQL** gestito tramite **Drizzle ORM** per salvare utenti, conversazioni, messaggi e documenti in modo strutturato e portabile.
- **Motore AI modulare:** configurato per funzionare nativamente in **modalità locale Krelvia** (ideale per demo e test offline) con attivazione trasparente di **Google Gemini** tramite semplice variabile d'ambiente.

---

## Trasparenza B2B & Personalizzazione

Questo progetto nasce da una base architetturale open-source in Next.js (rilasciata sotto licenza **Apache 2.0**) ed è stato **profondamente riprogettato per scenari B2B, self-hosted e white-label**:

- **Indipendenza dall'infrastruttura:** eliminate le dipendenze da servizi cloud proprietari per rendere la piattaforma distribuibile su qualsiasi VPS, server aziendale o container Docker con un normale database PostgreSQL.
- **Pronto da testare senza vincoli:** l'introduzione del motore locale permette di provare l'intera applicazione in modo fluido anche senza configurare servizi esterni o piani API a pagamento.
- **Identità visiva e UX su misura:** rifacimento completo del design system, dell'esperienza mobile, del pannello Strumenti Rapidi, dell'esportazione conversazioni e della localizzazione integrale in italiano.

L'architettura è pensata per essere **personalizzata sul brand del cliente finale** (colori, logo, dominio e strumenti dedicati) e messa online in tempi rapidi.

---

## Avvio rapido in locale

```bash
# 1. Installa le dipendenze
pnpm install

# 2. Configura .env.local (copia .env.example e imposta POSTGRES_URL e AUTH_SECRET)
#    GOOGLE_GENERATIVE_AI_API_KEY è opzionale: se vuota si attiva la modalità Krelvia Locale.

# 3. Esegui le migrazioni su PostgreSQL
pnpm db:migrate

# 4. Avvia il server di sviluppo
pnpm dev

```

Apri **http://localhost:3000** nel browser.

© 2026 Filippo De Biase — Tutti i diritti riservati. Codice pubblicato esclusivamente a scopo dimostrativo e di portfolio.