import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xygadfvudziwnddcicbb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Z2FkZnZ1ZHppd25kZGNpY2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTk3MzQsImV4cCI6MjA3NTA5NTczNH0.PKjf4J65QlbXg9cnfkJk0292t-l4v2rfKQxtGrKKe-M"

export const supabase = createClient(supabaseUrl, supabaseKey);
