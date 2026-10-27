import { createClient } from "@supabase/supabase-js";

// Public values only (anon key is safe in the browser; RLS protects the data).
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local");
}

export const supabase = createClient(url, anonKey);
