import { createClient } from "@supabase/supabase-js";

// ⚡ Mejor usar variables de entorno (más seguro)
const supabaseUrl = "https://xygadfvudziwnddcicbb.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Z2FkZnZ1ZHppd25kZGNpY2JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxOTczNCwiZXhwIjoyMDc1MDk1NzM0fQ.KSc84hsragAyua8RhRaekeiJ1mPqtI28sXZmOzdQKOg" 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

