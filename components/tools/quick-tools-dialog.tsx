"use client";

import {
  CalculatorIcon,
  CheckIcon,
  Code2Icon,
  CopyIcon,
  FileTextIcon,
  KeyRoundIcon,
  RefreshCwIcon,
  SendIcon,
  WrenchIcon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ToolTab = "iva" | "security" | "dev" | "text";

function formatEur(val: number) {
  return new Intl.NumberFormat("it-IT", {
    currency: "EUR",
    style: "currency",
  }).format(val);
}

function createBrowserPassword(
  length: number,
  options: { upper: boolean; numbers: boolean; symbols: boolean }
) {
  let pool = "abcdefghijklmnopqrstuvwxyz";
  if (options.upper) {
    pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
  if (options.numbers) {
    pool += "0123456789";
  }
  if (options.symbols) {
    pool += "!@#$%^&*()-_=+";
  }
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => pool[n % pool.length]).join("");
}

export function QuickToolsDialog({
  onInsertPrompt,
  triggerVariant = "header",
}: {
  onInsertPrompt?: (prompt: string) => void;
  triggerVariant?: "header" | "sidebar";
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ToolTab>("iva");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // IVA & Sconti state
  const [ivaAmount, setIvaAmount] = useState("1000");
  const [ivaRate, setIvaRate] = useState(22);
  const [ivaMode, setIvaMode] = useState<"add" | "remove">("add");
  const [discountPct, setDiscountPct] = useState("0");

  // Security state
  const [pwdLen, setPwdLen] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState(() =>
    createBrowserPassword(20, { numbers: true, symbols: true, upper: true })
  );
  const [uuid, setUuid] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : "00000000-0000-4000-8000-000000000000"
  );

  // Dev state
  const [devInput, setDevInput] = useState(
    '{"progetto":"Krelvia","responsive":true,"versione":1}'
  );
  const [devOutput, setDevOutput] = useState("");
  const [devError, setDevError] = useState<string | null>(null);

  // Text state
  const [textInput, setTextInput] = useState("");

  const copyText = useCallback((value: string, key: string) => {
    if (!value) {
      return;
    }
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    toast.success("Copiato negli appunti");
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const ivaCalc = useMemo(() => {
    const raw = Number(ivaAmount.replace(",", ".")) || 0;
    const disc = Math.min(Math.max(Number(discountPct) || 0, 0), 100);
    const discounted = raw * (1 - disc / 100);
    if (ivaMode === "add") {
      const iva = (discounted * ivaRate) / 100;
      return {
        imponibile: discounted,
        iva,
        sconto: raw - discounted,
        totale: discounted + iva,
      };
    }
    const imponibile = discounted / (1 + ivaRate / 100);
    const iva = discounted - imponibile;
    return {
      imponibile,
      iva,
      sconto: raw - discounted,
      totale: discounted,
    };
  }, [discountPct, ivaAmount, ivaMode, ivaRate]);

  const textStats = useMemo(() => {
    const trimmed = textInput.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = textInput.length;
    const charsNoSpaces = textInput.replace(/\s/g, "").length;
    const sentences = trimmed
      ? trimmed.split(/[.!?]+/).filter((s) => s.trim()).length
      : 0;
    const readingMin = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;
    return { chars, charsNoSpaces, readingMin, sentences, words };
  }, [textInput]);

  const regeneratePassword = () => {
    setPassword(
      createBrowserPassword(pwdLen, {
        numbers: useNumbers,
        symbols: useSymbols,
        upper: useUpper,
      })
    );
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(devInput);
      setDevOutput(JSON.stringify(parsed, null, 2));
      setDevError(null);
    } catch (err) {
      setDevError(err instanceof Error ? err.message : "JSON non valido");
      setDevOutput("");
    }
  };

  const handleBase64Encode = () => {
    try {
      const bytes = new TextEncoder().encode(devInput);
      const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
      setDevOutput(btoa(bin));
      setDevError(null);
    } catch {
      setDevError("Impossibile codificare in Base64");
    }
  };

  const handleBase64Decode = () => {
    try {
      const bin = atob(devInput.trim());
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      setDevOutput(new TextDecoder().decode(bytes));
      setDevError(null);
    } catch {
      setDevError("Stringa Base64 non valida");
    }
  };

  const tabs: Array<{ id: ToolTab; label: string; icon: React.ReactNode }> = [
    { icon: <CalculatorIcon className="size-3.5" />, id: "iva", label: "IVA & Sconti" },
    { icon: <KeyRoundIcon className="size-3.5" />, id: "security", label: "Password" },
    { icon: <Code2Icon className="size-3.5" />, id: "dev", label: "JSON / B64" },
    { icon: <FileTextIcon className="size-3.5" />, id: "text", label: "Testo" },
  ];

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {triggerVariant === "sidebar" ? (
          <button
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            type="button"
          >
            <WrenchIcon className="size-4 text-primary" />
            <span>Strumenti rapidi</span>
          </button>
        ) : (
          <Button
            aria-label="Strumenti rapidi"
            className="h-8 gap-1.5 rounded-lg border border-border/70 bg-card/80 px-2.5 text-xs font-medium text-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-accent"
            size="sm"
            title="Strumenti rapidi"
            variant="outline"
          >
            <WrenchIcon className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Strumenti</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border border-border/70 bg-card p-5 shadow-2xl sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <WrenchIcon className="size-4" />
            </span>
            Strumenti Rapidi Krelvia
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Utility operative immediate, 100% locali nel browser senza dipendenze esterne.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-muted/70 p-1 sm:grid-cols-4">
          {tabs.map((item) => (
            <button
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                tab === item.id
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={item.id}
              onClick={() => setTab(item.id)}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {tab === "iva" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  className="text-xs text-muted-foreground"
                  htmlFor="iva-amount"
                >
                  Importo (€)
                </Label>
                <Input
                  id="iva-amount"
                  inputMode="decimal"
                  onChange={(e) => setIvaAmount(e.target.value)}
                  placeholder="1000"
                  value={ivaAmount}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  className="text-xs text-muted-foreground"
                  htmlFor="iva-discount"
                >
                  Sconto (%)
                </Label>
                <Input
                  id="iva-discount"
                  inputMode="decimal"
                  onChange={(e) => setDiscountPct(e.target.value)}
                  placeholder="0"
                  value={discountPct}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {[4, 10, 22].map((r) => (
                  <Button
                    key={r}
                    onClick={() => setIvaRate(r)}
                    size="sm"
                    type="button"
                    variant={ivaRate === r ? "default" : "outline"}
                  >
                    IVA {r}%
                  </Button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <Button
                  onClick={() => setIvaMode("add")}
                  size="sm"
                  type="button"
                  variant={ivaMode === "add" ? "default" : "outline"}
                >
                  Aggiungi IVA
                </Button>
                <Button
                  onClick={() => setIvaMode("remove")}
                  size="sm"
                  type="button"
                  variant={ivaMode === "remove" ? "default" : "outline"}
                >
                  Scorpora IVA
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-border/60 bg-muted/40 p-4 sm:grid-cols-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Imponibile
                </div>
                <div className="mt-0.5 text-lg font-semibold">
                  {formatEur(ivaCalc.imponibile)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Quota IVA ({ivaRate}%)
                </div>
                <div className="mt-0.5 text-lg font-semibold text-primary">
                  {formatEur(ivaCalc.iva)}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Totale Finale
                </div>
                <div className="mt-0.5 text-lg font-bold">
                  {formatEur(ivaCalc.totale)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                onClick={() =>
                  copyText(
                    `Imponibile: ${formatEur(ivaCalc.imponibile)} | IVA ${ivaRate}%: ${formatEur(ivaCalc.iva)} | Totale: ${formatEur(ivaCalc.totale)}`,
                    "iva"
                  )
                }
                size="sm"
                type="button"
                variant="outline"
              >
                {copiedKey === "iva" ? (
                  <CheckIcon className="mr-1.5 size-3.5" />
                ) : (
                  <CopyIcon className="mr-1.5 size-3.5" />
                )}
                Copia riepilogo
              </Button>
              {onInsertPrompt && (
                <Button
                  onClick={() => {
                    onInsertPrompt(
                      ivaMode === "add"
                        ? `Calcola IVA al ${ivaRate}% su ${ivaAmount} euro`
                        : `Scorporo IVA al ${ivaRate}% su ${ivaAmount} euro`
                    );
                    setOpen(false);
                  }}
                  size="sm"
                  type="button"
                >
                  <SendIcon className="mr-1.5 size-3.5" />
                  Invia in chat
                </Button>
              )}
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Password sicura ({pwdLen} caratteri)
                </span>
                <div className="flex gap-1.5">
                  <Button
                    aria-label="Rigenera password"
                    onClick={regeneratePassword}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <RefreshCwIcon className="size-3.5" />
                  </Button>
                  <Button
                    onClick={() => copyText(password, "pwd")}
                    size="sm"
                    type="button"
                  >
                    {copiedKey === "pwd" ? (
                      <CheckIcon className="mr-1 size-3.5" />
                    ) : (
                      <CopyIcon className="mr-1 size-3.5" />
                    )}
                    Copia
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg bg-background px-3 py-2.5 font-mono text-sm tracking-wide ring-1 ring-border/60">
                {password}
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <label className="flex items-center gap-2">
                  <span>Lunghezza: {pwdLen}</span>
                  <input
                    className="accent-primary"
                    max={48}
                    min={8}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setPwdLen(next);
                      setPassword(
                        createBrowserPassword(next, {
                          numbers: useNumbers,
                          symbols: useSymbols,
                          upper: useUpper,
                        })
                      );
                    }}
                    type="range"
                    value={pwdLen}
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    checked={useUpper}
                    onChange={(e) => setUseUpper(e.target.checked)}
                    type="checkbox"
                  />
                  Maiuscole
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    checked={useNumbers}
                    onChange={(e) => setUseNumbers(e.target.checked)}
                    type="checkbox"
                  />
                  Numeri
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    checked={useSymbols}
                    onChange={(e) => setUseSymbols(e.target.checked)}
                    type="checkbox"
                  />
                  Simboli
                </label>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-xl border border-border/60 bg-muted/40 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">UUID v4</div>
                <div className="truncate font-mono text-sm font-medium">{uuid}</div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  onClick={() => setUuid(crypto.randomUUID())}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Nuovo
                </Button>
                <Button
                  onClick={() => copyText(uuid, "uuid")}
                  size="sm"
                  type="button"
                >
                  Copia
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === "dev" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                className="text-xs text-muted-foreground"
                htmlFor="dev-input"
              >
                Input JSON o testo Base64
              </Label>
              <Textarea
                className="min-h-[100px] font-mono text-xs"
                id="dev-input"
                onChange={(e) => setDevInput(e.target.value)}
                value={devInput}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleFormatJson} size="sm" type="button">
                Formatta JSON
              </Button>
              <Button
                onClick={handleBase64Encode}
                size="sm"
                type="button"
                variant="outline"
              >
                Base64 Encode
              </Button>
              <Button
                onClick={handleBase64Decode}
                size="sm"
                type="button"
                variant="outline"
              >
                Base64 Decode
              </Button>
              {devOutput && (
                <Button
                  className="ml-auto"
                  onClick={() => copyText(devOutput, "dev")}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Copia output
                </Button>
              )}
            </div>
            {devError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {devError}
              </div>
            )}
            {devOutput && (
              <pre className="max-h-48 overflow-auto rounded-xl border border-border/60 bg-muted/50 p-3 font-mono text-xs">
                {devOutput}
              </pre>
            )}
          </div>
        )}

        {tab === "text" && (
          <div className="space-y-3">
            <Textarea
              aria-label="Testo da analizzare"
              className="min-h-[120px] text-sm"
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Incolla o scrivi qui il testo da analizzare..."
              value={textInput}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { label: "Parole", value: textStats.words },
                { label: "Caratteri", value: textStats.chars },
                { label: "Senza spazi", value: textStats.charsNoSpaces },
                { label: "Frasi", value: textStats.sentences },
                { label: "Lettura", value: `${textStats.readingMin} min` },
              ].map((stat) => (
                <div
                  className="rounded-xl border border-border/60 bg-muted/40 p-2.5 text-center"
                  key={stat.label}
                >
                  <div className="text-[11px] text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-0.5 text-base font-semibold">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setTextInput(textInput.toUpperCase())}
                size="sm"
                type="button"
                variant="outline"
              >
                MAIUSCOLO
              </Button>
              <Button
                onClick={() => setTextInput(textInput.toLowerCase())}
                size="sm"
                type="button"
                variant="outline"
              >
                minuscolo
              </Button>
              <Button
                onClick={() =>
                  setTextInput(textInput.replace(/\s+/g, " ").trim())
                }
                size="sm"
                type="button"
                variant="outline"
              >
                Pulisci spazi
              </Button>
              <Button
                className="ml-auto"
                disabled={!textInput}
                onClick={() => copyText(textInput, "text")}
                size="sm"
                type="button"
              >
                Copia testo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
