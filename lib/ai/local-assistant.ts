import { randomBytes, randomUUID } from "node:crypto";

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    currency: "EUR",
    style: "currency",
  }).format(value);
}

function safeEvalMath(expr: string): number | null {
  const cleaned = expr.replace(/,/g, ".").replace(/×/g, "*").replace(/÷/g, "/");
  if (!/^[\d\s+\-*/().%]+$/.test(cleaned)) {
    return null;
  }
  // Support trailing percentage like "1000 + 22%"
  const normalized = cleaned.replace(
    /(\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)%/g,
    "($1 $2 ($1 * $3 / 100))"
  );
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${normalized});`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

function generateSecurePassword(length = 16): string {
  const safeLen = Math.min(Math.max(length, 8), 64);
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
  const bytes = randomBytes(safeLen);
  let out = "";
  for (let i = 0; i < safeLen; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

function handleIva(text: string): string | null {
  const lower = text.toLowerCase();
  if (!lower.includes("iva")) {
    return null;
  }

  const pctMatch = text.match(/(\d+(?:[.,]\d+)?)\s*%/);
  const rate = pctMatch ? Number(pctMatch[1].replace(",", ".")) : 22;
  const textWithoutPct = pctMatch ? text.replace(pctMatch[0], " ") : text;

  const numbers = textWithoutPct
    .match(/\d+(?:[.,]\d+)?/g)
    ?.map((n) => Number(n.replace(",", ".")));
  if (!numbers || numbers.length === 0) {
    return null;
  }

  const amount = numbers[0];
  const isScorporo =
    lower.includes("scorpor") || lower.includes("lordo") || lower.includes("inclus");

  if (isScorporo) {
    const imponibile = amount / (1 + rate / 100);
    const iva = amount - imponibile;
    return [
      `### Scorporo IVA al ${rate}%`,
      "",
      "| Voce | Importo |",
      "| --- | ---: |",
      `| **Totale lordo (IVA inclusa)** | ${formatEuro(amount)} |`,
      `| **Imponibile netto** | ${formatEuro(imponibile)} |`,
      `| **Quota IVA (${rate}%)** | ${formatEuro(iva)} |`,
      "",
      `> Formula applicata: \`Imponibile = ${amount} / ${(1 + rate / 100).toFixed(2)}\``,
    ].join("\n");
  }

  const iva = (amount * rate) / 100;
  const totale = amount + iva;
  return [
    `### Calcolo IVA al ${rate}%`,
    "",
    "| Voce | Importo |",
    "| --- | ---: |",
    `| **Imponibile netto** | ${formatEuro(amount)} |`,
    `| **IVA (${rate}%)** | ${formatEuro(iva)} |`,
    `| **Totale lordo** | **${formatEuro(totale)}** |`,
  ].join("\n");
}

function handleMutuo(text: string): string | null {
  const lower = text.toLowerCase();
  if (!lower.includes("mutuo") && !lower.includes("rata") && !lower.includes("prestito")) {
    return null;
  }
  const nums = text.match(/\d+(?:[.,]\d+)?/g)?.map((n) => Number(n.replace(",", ".")));
  if (!nums || nums.length < 3) {
    return [
      "### Calcolo Rata Mutuo / Prestito",
      "",
      "Indica **importo**, **tasso annuo (%)** e **durata in anni**, ad esempio:",
      "`Calcola rata mutuo 150000 euro al 3.5% per 20 anni`",
    ].join("\n");
  }

  const [capital, annualRate, years] = nums;
  const monthlyRate = annualRate / 100 / 12;
  const months = Math.round(years * 12);
  const monthlyPayment =
    monthlyRate === 0
      ? capital / months
      : (capital * (monthlyRate * (1 + monthlyRate) ** months)) /
        ((1 + monthlyRate) ** months - 1);
  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - capital;

  return [
    "### Simulazione Piano di Ammortamento (Francese)",
    "",
    "| Parametro | Valore |",
    "| --- | ---: |",
    `| **Capitale richiesto** | ${formatEuro(capital)} |`,
    `| **Tasso annuo (TAN)** | ${annualRate}% |`,
    `| **Durata** | ${years} anni (${months} rate) |`,
    `| **Rata mensile stimata** | **${formatEuro(monthlyPayment)}** |`,
    `| **Totale interessi** | ${formatEuro(totalInterest)} |`,
    `| **Totale rimborsato** | ${formatEuro(totalPaid)} |`,
  ].join("\n");
}

function handlePasswordOrUuid(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("uuid") || lower.includes("guid")) {
    const ids = Array.from({ length: 5 }, () => randomUUID());
    return [
      "### UUID v4 Generati",
      "",
      "```text",
      ...ids,
      "```",
      "Generati crittograficamente con `crypto.randomUUID()`.",
    ].join("\n");
  }

  if (lower.includes("password") || lower.includes("passphrase")) {
    const match = text.match(/\b(\d{1,2})\b/);
    const length = match ? Number(match[1]) : 20;
    const passwords = Array.from({ length: 3 }, () =>
      generateSecurePassword(length)
    );
    return [
      `### Password Sicure (${Math.min(Math.max(length, 8), 64)} caratteri)`,
      "",
      "```text",
      ...passwords,
      "```",
      "- Entropia elevata (maiuscole, minuscole, numeri e simboli).",
      "- Puoi anche usare il pannello **Strumenti** in alto per personalizzare i parametri al volo.",
    ].join("\n");
  }

  return null;
}

function handleJsonOrBase64(text: string): string | null {
  const lower = text.toLowerCase();

  if (lower.includes("base64")) {
    const decodeMatch = text.match(/base64\s+decode\s+(.+)/i);
    if (decodeMatch) {
      const decoded = Buffer.from(decodeMatch[1].trim(), "base64").toString(
        "utf-8"
      );
      return `### Decodifica Base64\n\n\`\`\`text\n${decoded}\n\`\`\``;
    }
    const encodeMatch = text.match(/base64(?:\s+encode)?\s+(.+)/i);
    if (encodeMatch) {
      const encoded = Buffer.from(encodeMatch[1].trim(), "utf-8").toString(
        "base64"
      );
      return `### Codifica Base64\n\n\`\`\`text\n${encoded}\n\`\`\``;
    }
  }

  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch && (lower.includes("json") || lower.includes("formatta") || lower.includes("valida"))) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      const formatted = JSON.stringify(parsed, null, 2);
      const keysCount =
        typeof parsed === "object" && parsed !== null
          ? Object.keys(parsed).length
          : 0;
      return [
        "### JSON Valido e Formattato",
        "",
        `Chiavi/elementi principali: **${keysCount}**`,
        "",
        "```json",
        formatted,
        "```",
      ].join("\n");
    } catch (error) {
      return [
        "### Errore di Sintassi JSON",
        "",
        `Il JSON fornito non è valido: \`${error instanceof Error ? error.message : "Errore sconosciuto"}\``,
      ].join("\n");
    }
  }

  return null;
}

function handleTextAnalysis(text: string): string | null {
  const lower = text.toLowerCase();
  if (
    !lower.includes("analizza testo") &&
    !lower.includes("conta parole") &&
    !lower.includes("quante parole")
  ) {
    return null;
  }

  const content = text
    .replace(/^(analizza testo|conta parole|quante parole)[:\s-]*/i, "")
    .trim();

  if (!content) {
    return "Incolla il testo subito dopo il comando, ad esempio: `Analizza testo: Il mio paragrafo...`";
  }

  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const charsNoSpaces = content.replace(/\s/g, "").length;
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim()).length;
  const readMinutes = Math.max(1, Math.ceil(words / 200));

  return [
    "### Analisi del Testo",
    "",
    "| Metrica | Valore |",
    "| --- | ---: |",
    `| **Parole** | ${words} |`,
    `| **Caratteri (con spazi)** | ${chars} |`,
    `| **Caratteri (senza spazi)** | ${charsNoSpaces} |`,
    `| **Frasi stimate** | ${sentences} |`,
    `| **Tempo di lettura** | ~${readMinutes} min |`,
  ].join("\n");
}

function handleEmailTemplate(text: string): string | null {
  const lower = text.toLowerCase();
  if (!lower.includes("email") && !lower.includes("mail")) {
    return null;
  }

  if (lower.includes("preventivo") || lower.includes("offerta")) {
    return [
      "### Bozza Email — Invio Preventivo",
      "",
      "**Oggetto:** Preventivo richiesto — [Nome Progetto / Servizio]",
      "",
      "Gentile [Nome Cliente],",
      "",
      "grazie per il contatto e per l'interesse dimostrato.",
      "In allegato trova il preventivo dettagliato per **[descrizione servizio]**, comprensivo di tempistiche e modalità di consegna.",
      "",
      "**Riepilogo rapido:**",
      "- **Attività incluse:** [elenco sintetico]",
      "- **Tempistica stimata:** [es. 2 settimane lavorative]",
      "- **Validità dell'offerta:** 30 giorni",
      "",
      "Resto a completa disposizione per qualsiasi chiarimento o per fissare una breve chiamata conoscitiva.",
      "",
      "Cordiali saluti,  ",
      "**[Tuo Nome]**  ",
      "[Ruolo / Azienda] • [Telefono]",
    ].join("\n");
  }

  return [
    "### Bozza Email Professionale — Follow-up",
    "",
    "**Oggetto:** Aggiornamento su [Argomento]",
    "",
    "Ciao [Nome],",
    "",
    "ti scrivo per fare un rapido punto della situazione su **[argomento/progetto]**.",
    "",
    "Ho completato i primi passaggi operativi e sono pronto per passare alla fase successiva non appena mi confermi i dettagli condivisi.",
    "",
    "Fammi sapere quando preferisci sentirci (anche 10 minuti vanno benissimo).",
    "",
    "A presto,  ",
    "**[Tuo Nome]**",
  ].join("\n");
}

function handleProjectPlan(text: string): string | null {
  const lower = text.toLowerCase();
  if (
    !lower.includes("piano") &&
    !lower.includes("checklist") &&
    !lower.includes("roadmap") &&
    !lower.includes("progetto")
  ) {
    return null;
  }

  return [
    "### Piano Operativo & Checklist",
    "",
    "| Fase | Obiettivo | Stato |",
    "| --- | --- | --- |",
    "| **1. Analisi** | Definizione requisiti, scope e KPI | `[x]` Pronto |",
    "| **2. Design & Architettura** | Wireframe responsive, schema DB e API | `[ ]` In corso |",
    "| **3. Sviluppo Core** | Implementazione funzionalità principali | `[ ]` Da avviare |",
    "| **4. QA & Sicurezza** | Test E2E, performance e controllo accessi | `[ ]` Da avviare |",
    "| **5. Rilascio** | Deploy, monitoraggio e documentazione | `[ ]` Da avviare |",
    "",
    "**Prossimi 3 passi consigliati:**",
    "1. Blocca le priorità della Fase 1 (massimo 3 funzionalità MVP).",
    "2. Prepara una demo funzionante entro la prima settimana.",
    "3. Raccogli feedback reali prima di estendere le feature secondarie.",
  ].join("\n");
}

function handleCodeSnippet(text: string): string | null {
  const lower = text.toLowerCase();
  if (
    !lower.includes("codice") &&
    !lower.includes("script") &&
    !lower.includes("sql") &&
    !lower.includes("react") &&
    !lower.includes("typescript") &&
    !lower.includes("regex") &&
    !lower.includes("python")
  ) {
    return null;
  }

  if (lower.includes("sql") || lower.includes("postgres")) {
    return [
      "### Query PostgreSQL — Template Ottimizzato",
      "",
      "```sql",
      "SELECT",
      "  u.id,",
      "  u.email,",
      "  COUNT(c.id) AS total_chats,",
      '  MAX(c."createdAt") AS last_activity',
      'FROM "User" u',
      'LEFT JOIN "Chat" c ON c."userId" = u.id',
      "GROUP BY u.id, u.email",
      "ORDER BY total_chats DESC",
      "LIMIT 20;",
      "```",
      "",
      "Puoi adattare i nomi delle tabelle direttamente al tuo schema Drizzle/PostgreSQL.",
    ].join("\n");
  }

  if (lower.includes("regex")) {
    return [
      "### Regex Utili Pronte all'Uso",
      "",
      "| Caso d'uso | Espressione |",
      "| --- | --- |",
      "| **Email** | `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` |",
      "| **Codice Fiscale (IT)** | `/^[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]$/i` |",
      "| **Partita IVA (IT)** | `/^\\d{11}$/` |",
      "| **URL HTTPS** | `/^https:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-._~:/?#[\\]@!$&'()*+,;=]*$/` |",
    ].join("\n");
  }

  return [
    "### Snippet TypeScript / React — Hook con Debounce",
    "",
    "```tsx",
    'import { useEffect, useState } from "react";',
    "",
    "export function useDebounce<T>(value: T, delayMs = 300): T {",
    "  const [debounced, setDebounced] = useState(value);",
    "",
    "  useEffect(() => {",
    "    const timer = setTimeout(() => setDebounced(value), delayMs);",
    "    return () => clearTimeout(timer);",
    "  }, [value, delayMs]);",
    "",
    "  return debounced;",
    "}",
    "```",
    "",
    "Perfetto per filtri di ricerca live senza sovraccaricare le chiamate API.",
  ].join("\n");
}

function handleMath(text: string): string | null {
  const mathExpr = text
    .replace(/^(calcola|quanto fa|risolvi|=)\s*/i, "")
    .replace(/\?+$/, "")
    .trim();

  if (!/\d/.test(mathExpr) || !/[+\-*/%]/.test(mathExpr)) {
    return null;
  }

  const result = safeEvalMath(mathExpr);
  if (result === null) {
    return null;
  }

  const formatted = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 4,
  }).format(result);

  return [
    "### Risultato del Calcolo",
    "",
    `- **Espressione:** \`${mathExpr}\``,
    `- **Risultato:** **${formatted}**`,
  ].join("\n");
}

export function buildLocalAssistantResponse(userText: string): string {
  const trimmed = userText.trim();
  if (!trimmed) {
    return "Scrivimi una richiesta, un calcolo o incolla del testo/JSON per iniziare!";
  }

  const handlers = [
    handleIva,
    handleMutuo,
    handlePasswordOrUuid,
    handleJsonOrBase64,
    handleTextAnalysis,
    handleEmailTemplate,
    handleProjectPlan,
    handleCodeSnippet,
    handleMath,
  ];

  for (const handler of handlers) {
    const result = handler(trimmed);
    if (result) {
      return result;
    }
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("ciao") ||
    lower.includes("salve") ||
    lower.includes("aiuto") ||
    lower.includes("cosa sai fare") ||
    lower.includes("hello")
  ) {
    return [
      "### Ciao! Sono **Krelvia**, il tuo workspace locale.",
      "",
      "Funziono **100% in locale** con PostgreSQL (nessuna API key richiesta) e posso aiutarti subito con:",
      "",
      "- **Calcoli & Finanza:** `Scorporo IVA 1220 euro`, `Calcola rata mutuo 150000 3.5% 20 anni`, `Calcola (450 * 12) + 22%`",
      "- **Sicurezza & Dev:** `Genera password 24 caratteri`, `Genera UUID`, `Formatta JSON {\"nome\":\"Krelvia\",\"attivo\":true}`, `Base64 encode Ciao`",
      "- **Scrittura & Produttività:** `Scrivi email preventivo`, `Crea piano di progetto`, `Analizza testo: ...`",
      "- **Snippet di Codice:** `Query SQL utenti`, `Regex utili`, `Snippet React`",
      "",
      "In più trovi il pannello **Strumenti Rapidi** nell'header per calcolatore IVA, password, JSON/Base64 e analisi testo interattivi!",
    ].join("\n");
  }

  return [
    `Ho salvato il tuo messaggio nella cronologia PostgreSQL: _"${trimmed}"_`,
    "",
    "Al momento stai usando il **motore locale integrato** (zero dipendenze esterne). Prova una di queste azioni pratiche:",
    "- `Calcola IVA su 850 euro` oppure `Scorporo IVA 1220`",
    "- `Calcola rata mutuo 180000 al 3.2% per 25 anni`",
    "- `Genera password 20 caratteri` oppure `Genera UUID`",
    "- `Scrivi email preventivo` oppure `Crea piano di progetto`",
    "- `Formatta JSON {\"progetto\":\"Krelvia\",\"stato\":\"pronto\"}`",
  ].join("\n");
}
