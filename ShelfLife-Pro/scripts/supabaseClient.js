// scripts/supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔗 Inserisci qui i TUOI dati Supabase (li hai copiati poco fa)
const SUPABASE_URL = "https://zzpcvjbvkvxvjflpcxvr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HVsmqYrV0CQ9UJGEIIx7EQ_2LlgkVo..."; // la tua chiave completa

// ✅ Crea il client Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
