/**
 * Centralized Gemini Configuration with Multi-Key Failover and Model Cascading
 */

export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];

  const addKeys = (val?: string) => {
    if (!val) return;
    // Support single key or comma/newline separated multiple keys
    const parts = val.split(/[,\n]/);
    for (const part of parts) {
      const trimmed = part.trim();
      if (
        trimmed &&
        !trimmed.includes("your_gemini_api_key") &&
        trimmed !== "undefined" &&
        !keys.includes(trimmed)
      ) {
        keys.push(trimmed);
      }
    }
  };

  // Primary key
  addKeys(process.env.GEMINI_API_KEY);

  // Fallback keys (supports various natural variable names)
  addKeys(process.env.GEMINI_API_KEY_FALLBACK);
  addKeys(process.env.GEMINI_FALLBACK_API_KEY);
  addKeys(process.env.GEMINI_API_KEY_2);

  return keys;
}

export function getCandidateGeminiModels(): string[] {
  const envModel = process.env.GEMINI_MODEL?.trim();
  const candidates: string[] = [];

  // Exclude deprecated / retired model versions
  if (
    envModel &&
    !envModel.includes("2.0") &&
    !envModel.includes("2.5") &&
    !envModel.includes("1.5") &&
    !envModel.includes("1.0")
  ) {
    candidates.push(envModel);
  }

  // Active stable high-performance models
  const defaults = ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.8-flash"];
  for (const d of defaults) {
    if (!candidates.includes(d)) candidates.push(d);
  }

  return candidates;
}
