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
  addKeys(process.env.Gemini_API_Key);

  // Fallback keys (supporting Gemini_API_Key_FallBack, GEMINI_API_KEY_FALLBACK, etc.)
  addKeys(process.env.Gemini_API_Key_FallBack);
  addKeys(process.env.GEMINI_API_KEY_FALLBACK);
  addKeys(process.env.GEMINI_FALLBACK_API_KEY);
  addKeys(process.env.Gemini_Fallback_API_Key);
  addKeys(process.env.GEMINI_API_KEY_2);
  addKeys(process.env["Gemini API Key2"]);
  addKeys(process.env["Gemini API Key 2"]);

  // Case-insensitive dynamic check for fallback keys in process.env
  for (const envKey of Object.keys(process.env)) {
    const normalizedKey = envKey.toLowerCase().replace(/[\s_-]/g, "");
    if (
      normalizedKey === "geminiapikeyfallback" ||
      normalizedKey === "geminifallbackapikey" ||
      normalizedKey === "geminiapikey2"
    ) {
      addKeys(process.env[envKey]);
    }
  }

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
  const defaults = ["gemini-3.5-flash", "gemini-3.8-flash"];
  for (const d of defaults) {
    if (!candidates.includes(d)) candidates.push(d);
  }

  return candidates;
}
