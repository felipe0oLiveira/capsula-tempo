const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Debug: verificar qual chave está sendo usada
console.log('=== SUPABASE CLIENT DEBUG ===');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY (primeiros 20 chars):', supabaseKey?.substring(0, 20) + '...');
console.log('SUPABASE_KEY contém "service_role":', supabaseKey?.includes('service_role'));

// Use service role key for backend operations to bypass RLS policies
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabase; 