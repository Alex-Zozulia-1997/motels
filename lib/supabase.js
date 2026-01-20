import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epmcpjqkbdfpnshwmedj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwbWNwanFrYmRmcG5zaHdtZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDg0OTAsImV4cCI6MjA4NDQyNDQ5MH0.CaypX4k_LxOMhWf0SwchhzgcgleE7fjtDzKl1Isibi0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
