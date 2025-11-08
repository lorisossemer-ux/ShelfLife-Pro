import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Legge le variabili d’ambiente da Vercel (client-side)
const SUPABASE_URL = window.__env?.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "https://zzpcvjbykvxjyflpcxvr.supabase.co";
const SUPABASE_ANON_KEY = window.__env?.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cGN2amJ5a3Z4anlmbHBjeHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTY5MDIsImV4cCI6MjA3ODE3MjkwMn0.DrTQVzzDfTcsxBFL_4M7h8eQmslBfn0bhjNdnnpHl5c";

// ✅ Crea il client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase Client inizializzato:", SUPABASE_URL);



