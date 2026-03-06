// js/supabaseClient.js

// Import the Supabase client from a CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Replace these with your actual Supabase project URL and Anon Key
const supabaseUrl = 'https://vklnchpolnbhntsowboo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbG5jaHBvbG5iaG50c293Ym9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTA4MTYsImV4cCI6MjA4ODI4NjgxNn0.XYad2Rc1rqaESMLC0LSt5mwRzOqGAyxTy6_oTyW918Y';

// Create and export the Supabase client so other files can use it
export const supabase = createClient(supabaseUrl, supabaseAnonKey);