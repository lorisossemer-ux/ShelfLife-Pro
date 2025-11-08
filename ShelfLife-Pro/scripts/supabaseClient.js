// scripts/supabaseClient.js

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = "const supabaseUrl = "https://zzpcvjbykvxjyflpcxvr.supabase.co";
"; //
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cGN2amJ5a3Z4anlmbHBjeHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTY5MDIsImV4cCI6MjA3ODE3MjkwMn0.DrTQVzzDfTcsxBFL_4M7h8eQmslBfn0bhjNdnnpHl5c"; // <-- sostituisci con la tua chiave pubblica anon

// 🚀 Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Test: scrive nel log se la connessione è attiva
console.log("✅ Supabase Client caricato correttamente:", supabaseUrl);

