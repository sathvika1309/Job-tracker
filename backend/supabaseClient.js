// backend/supabaseClient.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ssulhwxwadvkdeywvsmp.supabase.co";
const supabaseKey = "key";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
