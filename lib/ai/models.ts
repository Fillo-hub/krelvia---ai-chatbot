export const DEFAULT_CHAT_MODEL = "krelvia-local";

export const titleModel = {
  description: "Modello rapido per la generazione dei titoli",
  id: "gemini-2.5-flash-lite",
  name: "Gemini 2.5 Flash-Lite",
  provider: "google",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities?: ModelCapabilities;
};

export const chatModels: ChatModel[] = [
  {
    capabilities: { reasoning: false, tools: false, vision: false },
    description:
      "Motore locale istantaneo: calcoli IVA/mutui, password, JSON/Base64 e bozze senza API key",
    id: "krelvia-local",
    name: "Krelvia Locale",
    provider: "local",
  },
  {
    capabilities: { reasoning: true, tools: true, vision: true },
    description: "Modello multimodale rapido (richiede GOOGLE_GENERATIVE_AI_API_KEY)",
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
  },
  {
    capabilities: { reasoning: true, tools: true, vision: true },
    description: "Modello avanzato per codice e ragionamento (richiede API key)",
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
  },
];

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return Object.fromEntries(
    chatModels.map((model) => [
      model.id,
      model.capabilities ?? { reasoning: false, tools: true, vision: true },
    ])
  );
}

export const isDemo = false;

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  return chatModels.map((model) => ({
    ...model,
    capabilities: model.capabilities ?? {
      reasoning: false,
      tools: true,
      vision: true,
    },
  }));
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

export type ModelAvailability = "healthy" | "impacted" | "unknown";

export async function getModelAvailability(
  _modelId: string
): Promise<ModelAvailability> {
  return "healthy";
}
