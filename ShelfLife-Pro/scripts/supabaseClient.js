// scripts/supabaseClient.js

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔧 Inserisci qui i TUOI dati da Supabase → Project Settings → API
const supabaseUrl = "https://TUO-PROJECT.supabase.co"; // <-- sostituisci con il tuo URL
const supabaseKey = "LA-TUA-CHIAVE-ANON-PUBLIC"; // <-- sostituisci con la tua chiave pubblica anon

// 🚀 Crea il client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Test: scrive nel log se la connessione è attiva
console.log("✅ Supabase Client caricato correttamente:", supabaseUrl);

