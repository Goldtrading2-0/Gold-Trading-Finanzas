import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.error("Faltan las variables VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. Revisá tu archivo .env");
}

export const supabase = createClient(url, key);
