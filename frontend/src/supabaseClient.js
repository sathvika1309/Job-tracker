import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ssulhwxwadvkdeywvsmp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdWxod3h3YWR2a2RleXd2c21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNTgwNTQsImV4cCI6MjA4NjgzNDA1NH0.qV8j-0zQYDwBuFPU2BLO6I56j0Zk83Mfle3xNR3nvZQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
