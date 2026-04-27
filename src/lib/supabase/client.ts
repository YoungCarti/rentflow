import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseKey);
}
