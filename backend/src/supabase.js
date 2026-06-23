const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Cria a conexão oficial com o Supabase na nuvem
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("⚡ Conexão com o Supabase configurada com sucesso!");

module.exports = supabase;