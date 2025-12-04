import { createClient as createClientAdmin } from "@supabase/supabase-js";

export function createAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Anon Key must be defined in environment variables');
  }

  return createClientAdmin(
    supabaseUrl,
    supabaseKey,
  );
}