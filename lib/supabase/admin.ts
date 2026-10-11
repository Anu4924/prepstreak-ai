import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client using the service role key.
 * Used strictly in protected backend Route Handlers to bypass confirmation email rate-limits
 * when creating and managing verified users.
 * NEVER import this file into client components or expose the service role key to the browser.
 */
export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("your-supabase")) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport:
        typeof WebSocket !== "undefined"
          ? WebSocket
          : (class DummyWS {} as unknown as typeof WebSocket),
    },
  });
}
