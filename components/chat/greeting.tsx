import { motion } from "framer-motion";
import {
  CalculatorIcon,
  Code2Icon,
  DatabaseIcon,
  SparklesIcon,
} from "lucide-react";

export const Greeting = () => (
  <div
    className="relative flex w-full max-w-2xl flex-col items-center px-4 text-center"
    key="overview"
  >
    <div className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-44 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl sm:h-52 sm:w-96" />

    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary"
      initial={{ opacity: 0, y: 8 }}
      transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <SparklesIcon className="size-3.5" />
      <span>Krelvia Workspace • 100% Locale &amp; Responsive</span>
    </motion.div>

    <motion.h1
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text font-semibold text-3xl tracking-tight text-transparent sm:text-4xl"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      Come posso aiutarti oggi?
    </motion.h1>

    <motion.p
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: 0.3, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      Esegui calcoli fiscali e finanziari, genera password e snippet di codice,
      formatta JSON o scrivi bozze professionali con cronologia salvata su
      PostgreSQL.
    </motion.p>

    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground"
      initial={{ opacity: 0, y: 8 }}
      transition={{ delay: 0.4, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/70 px-2.5 py-1">
        <CalculatorIcon className="size-3 text-primary" />
        IVA &amp; Mutui
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/70 px-2.5 py-1">
        <Code2Icon className="size-3 text-primary" />
        JSON, Base64 &amp; Snippet
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/70 px-2.5 py-1">
        <DatabaseIcon className="size-3 text-primary" />
        PostgreSQL Locale
      </span>
    </motion.div>
  </div>
);
