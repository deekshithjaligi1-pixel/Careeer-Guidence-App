import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Returns a configured Google Gemini model instance using GEMINI_API_KEY from environment.
 * Throws a clean, user-friendly error if GEMINI_API_KEY is not configured.
 */
export function getGeminiModel(modelName: string = "gemini-3.5-flash-lite") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_actual_key_here") {
    throw new Error(
      "Missing GEMINI_API_KEY. Please set GEMINI_API_KEY in your .env file."
    );
  }
  const provider = createGoogleGenerativeAI({
    apiKey: apiKey.trim(),
  });
  // Use gemini-3.5-flash-lite as the fast, highly available default
  const resolvedModel =
    !modelName ||
    modelName === "gemini-2.5-flash" ||
    modelName === "gemini-2.5-flash-lite" ||
    modelName === "gemini-2.0-flash"
      ? "gemini-3.5-flash-lite"
      : modelName;
  return provider(resolvedModel);
}

/**
 * Executes generateText with automated multi-model fallback to bypass high demand spikes on any single model.
 */
export async function generateWithGeminiFallback(options: {
  system?: string;
  prompt: string;
}) {
  const candidateModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const model = getGeminiModel(modelName);
      const result = await generateText({
        model,
        system: options.system,
        prompt: options.prompt,
      });
      return result;
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${modelName} failed or busy, trying next available model...`, err?.message || err);
    }
  }

  throw lastError || new Error("Failed to generate response with Gemini models.");
}


