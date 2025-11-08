import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Legge le variabili ambiente impostate su Vercel
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Se mancano, mostra un errore in console
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase URL o ANON KEY mancanti! Controlla le variabili su Vercel.");
}

// Crea il client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Log per debug
console.log("✅ Supabase Client caricato:", SUPABASE_URL);


