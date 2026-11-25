import type { LanguageModelV4 } from "@ai-sdk/provider";
import type { LanguageModel } from "ai";
import { buildLocalAssistantResponse } from "./local-assistant";

const mockUsage = {
  inputTokens: {
    cacheRead: 0,
    cacheWrite: 0,
    noCache: 10,
    total: 10,
  },
  outputTokens: {
    reasoning: 0,
    text: 25,
    total: 25,
  },
};

const finishReason = {
  raw: "stop",
  unified: "stop" as const,
};

function extractLastUserMessage(prompt: unknown): string {
  if (!Array.isArray(prompt)) {
    return "";
  }
  for (let i = prompt.length - 1; i >= 0; i--) {
    const msg = prompt[i] as {
      role?: string;
      content?: string | Array<{ type?: string; text?: string }>;
    };
    if (msg?.role === "user") {
      if (typeof msg.content === "string") {
        return msg.content;
      }
      if (Array.isArray(msg.content)) {
        const textPart = msg.content.find(
          (part) => part.type === "text" && typeof part.text === "string"
        );
        if (textPart?.text) {
          return textPart.text;
        }
      }
    }
  }
  return "";
}

const createMockModel = (): LanguageModel => {
  const model: LanguageModelV4 = {
    doGenerate: async ({ prompt }) => ({
      content: [
        {
          text: buildLocalAssistantResponse(extractLastUserMessage(prompt)),
          type: "text",
        },
      ],
      finishReason,
      usage: mockUsage,
      warnings: [],
    }),
    doStream: async ({ prompt }) => {
      const response = buildLocalAssistantResponse(
        extractLastUserMessage(prompt)
      );
      const chunks = response.match(/\S+\s*/g) ?? [response];

      return {
        stream: new ReadableStream({
          async start(controller) {
            controller.enqueue({ id: "t1", type: "text-start" });
            for (const chunk of chunks) {
              controller.enqueue({
                delta: chunk,
                id: "t1",
                type: "text-delta",
              });
              await new Promise((resolve) => {
                setTimeout(resolve, 10);
              });
            }
            controller.enqueue({ id: "t1", type: "text-end" });
            controller.enqueue({
              finishReason,
              type: "finish",
              usage: mockUsage,
            });
            controller.close();
          },
        }),
      };
    },
    modelId: "krelvia-local",
    provider: "krelvia-local",
    specificationVersion: "v4",
    supportedUrls: {},
  };

  return model;
};

const createMockTitleModel = (): LanguageModel => {
  const model: LanguageModelV4 = {
    doGenerate: async ({ prompt }) => {
      const userText = extractLastUserMessage(prompt).trim();
      const title = userText
        ? userText.slice(0, 42) + (userText.length > 42 ? "..." : "")
        : "Nuova conversazione";
      return {
        content: [{ text: title, type: "text" }],
        finishReason,
        usage: mockUsage,
        warnings: [],
      };
    },
    doStream: async ({ prompt }) => {
      const userText = extractLastUserMessage(prompt).trim();
      const title = userText
        ? userText.slice(0, 42) + (userText.length > 42 ? "..." : "")
        : "Nuova conversazione";
      return {
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue({ id: "t1", type: "text-start" });
            controller.enqueue({
              delta: title,
              id: "t1",
              type: "text-delta",
            });
            controller.enqueue({ id: "t1", type: "text-end" });
            controller.enqueue({
              finishReason,
              type: "finish",
              usage: mockUsage,
            });
            controller.close();
          },
        }),
      };
    },
    modelId: "krelvia-title-local",
    provider: "krelvia-local",
    specificationVersion: "v4",
    supportedUrls: {},
  };

  return model;
};

export const chatModel = createMockModel();
export const titleModel = createMockTitleModel();
