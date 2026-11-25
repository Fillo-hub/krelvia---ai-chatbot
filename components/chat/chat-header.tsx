"use client";

import {
  DownloadIcon,
  MoonIcon,
  PanelLeftIcon,
  SparklesIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { memo, useCallback } from "react";
import { toast } from "sonner";
import { QuickToolsDialog } from "@/components/tools/quick-tools-dialog";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import type { ChatMessage } from "@/lib/types";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
  messages = [],
  onInsertPrompt,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  messages?: ChatMessage[];
  onInsertPrompt?: (prompt: string) => void;
}) {
  const { toggleSidebar } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();

  const handleExportMarkdown = useCallback(() => {
    if (messages.length === 0) {
      return;
    }
    const md = messages
      .map((msg) => {
        const role = msg.role === "user" ? "Utente" : "Krelvia";
        const text = msg.parts
          .filter(
            (part): part is { type: "text"; text: string } =>
              part.type === "text"
          )
          .map((part) => part.text)
          .join("\n");
        return `## ${role}\n\n${text}`;
      })
      .join("\n\n---\n\n");

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krelvia-chat-${chatId.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Conversazione esportata in Markdown");
  }, [chatId, messages]);

  const handleToggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border/50 bg-sidebar/90 px-3 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          aria-label="Apri menu"
          className="md:hidden"
          onClick={toggleSidebar}
          size="icon-sm"
          variant="ghost"
        >
          <PanelLeftIcon className="size-4" />
        </Button>

        <div className="flex items-center gap-2 md:hidden">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <SparklesIcon className="size-3.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Krelvia
          </span>
        </div>

        {!isReadonly && (
          <VisibilitySelector
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <QuickToolsDialog onInsertPrompt={onInsertPrompt} />

        {messages.length > 0 && (
          <Button
            className="h-8 gap-1.5 rounded-lg border border-border/70 bg-card/80 px-2.5 text-xs font-medium text-foreground shadow-xs hover:bg-accent"
            onClick={handleExportMarkdown}
            size="sm"
            title="Esporta conversazione in Markdown"
            variant="outline"
          >
            <DownloadIcon className="size-3.5" />
            <span className="hidden sm:inline">Esporta .md</span>
          </Button>
        )}

        <Button
          aria-label="Cambia tema"
          className="size-8 rounded-lg border border-border/70 bg-card/80 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={handleToggleTheme}
          size="icon-sm"
          title="Cambia tema chiaro/scuro"
          variant="outline"
        >
          <SunIcon className="hidden size-3.5 dark:block" />
          <MoonIcon className="block size-3.5 dark:hidden" />
        </Button>
      </div>
    </header>
  );
}

export const ChatHeader = memo(
  PureChatHeader,
  (prevProps, nextProps) =>
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly &&
    prevProps.messages?.length === nextProps.messages?.length
);
