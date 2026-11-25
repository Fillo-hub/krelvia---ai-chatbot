"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import {
  CalculatorIcon,
  KeyRoundIcon,
  LandmarkIcon,
  MailIcon,
} from "lucide-react";
import { memo, useCallback } from "react";
import type { ChatMessage } from "@/lib/types";
import type { VisibilityType } from "./visibility-selector";

type SuggestedActionsProps = {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  selectedVisibilityType: VisibilityType;
};

const SUGGESTION_CARDS = [
  {
    category: "Fisco & Calcoli",
    icon: CalculatorIcon,
    prompt: "Scorporo IVA al 22% su 1220 euro",
    subtitle: "Calcola imponibile e quota IVA",
    title: "Scorporo IVA 22%",
  },
  {
    category: "Finanza",
    icon: LandmarkIcon,
    prompt: "Calcola rata mutuo 180000 euro al 3.2% per 25 anni",
    subtitle: "Simulazione rata e interessi",
    title: "Calcola rata mutuo",
  },
  {
    category: "Sicurezza Dev",
    icon: KeyRoundIcon,
    prompt: "Genera password sicura da 24 caratteri",
    subtitle: "Chiavi ad alta entropia pronte",
    title: "Genera password sicura",
  },
  {
    category: "Scrittura",
    icon: MailIcon,
    prompt: "Scrivi una email professionale di invio preventivo",
    subtitle: "Template pronto da personalizzare",
    title: "Email invio preventivo",
  },
];

function PureSuggestedActions({ chatId, sendMessage }: SuggestedActionsProps) {
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      window.history.pushState(
        {},
        "",
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/chat/${chatId}`
      );
      sendMessage({
        parts: [{ text: suggestion, type: "text" }],
        role: "user",
      });
    },
    [chatId, sendMessage]
  );

  return (
    <div
      className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2"
      data-testid="suggested-actions"
    >
      {SUGGESTION_CARDS.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.button
            animate={{ opacity: 1, y: 0 }}
            className="group flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card/80 p-3.5 text-left shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-md"
            exit={{ opacity: 0, y: 12 }}
            initial={{ opacity: 0, y: 12 }}
            key={card.title}
            onClick={() => handleSuggestionClick(card.prompt)}
            transition={{
              delay: 0.05 * index,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            type="button"
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {card.category}
              </div>
              <div className="truncate text-sm font-medium text-foreground">
                {card.title}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {card.subtitle}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }

    return true;
  }
);
