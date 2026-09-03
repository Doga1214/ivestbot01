import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://rqzqwvcgdupzkinqwdcx.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxenF3dmNnZHVwemtpbnF3ZGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwODI4NzIsImV4cCI6MjEwMzY1ODg3Mn0.zCNyABP8nckzEyNsen3zidj74xCRxrf1Z-tQNE_ntWo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

