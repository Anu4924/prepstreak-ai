import { createBrowserClient } from "@supabase/ssr";

/**
 * Checks whether Supabase is configured with real credentials (not placeholder or empty).
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("placeholder-project") &&
      !supabaseUrl.includes("your-project-id") &&
      !supabaseAnonKey.includes("placeholder") &&
      !supabaseAnonKey.includes("your-supabase")
  );
}

/**
 * Creates a Supabase client for browser/client components.
 * Credentials are read safely from public environment variables.
 */
export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return client with dummy strings to prevent crashes on initial render.
    // Auth actions check isSupabaseConfigured() before attempting network calls.
    return createBrowserClient(
      supabaseUrl || "https://placeholder-project.supabase.co",
      supabaseAnonKey || "placeholder-anon-key"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
