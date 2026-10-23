// Deprecated legacy file - replaced with gemini.server.ts for direct Google Gemini API usage.
import { getGeminiModel } from "./gemini.server";

export function createLovableAiGatewayProvider() {
  return (modelName: string) => getGeminiModel(modelName);
}