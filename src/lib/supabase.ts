import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://muvqpwhzredrbiuwvhzx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dnFwd2h6cmVkcmJpdXd2aHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDAzNzksImV4cCI6MjA4MDQ3NjM3OX0.Jeb4h9Ruarr8v48P-gN5Q51mGZH1DARRDM2mMKI6M6A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
