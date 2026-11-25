import { google } from "@ai-sdk/google";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import { titleModel } from "./models";
import {
  chatModel as mockChatModel,
  titleModel as mockTitleModel,
} from "./models.mock";

const useLocalMock =
  isTestEnvironment || !process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

export const myProvider = useLocalMock
  ? customProvider({
      languageModels: {
        "chat-model": mockChatModel,
        "title-model": mockTitleModel,
      },
    })
  : null;

export function getLanguageModel(modelId: string) {
  if (useLocalMock || modelId === "krelvia-local") {
    return mockChatModel;
  }

  return google(modelId);
}

export function getTitleModel() {
  if (useLocalMock) {
    return mockTitleModel;
  }
  return google(titleModel.id);
}
