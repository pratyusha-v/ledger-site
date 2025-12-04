// Supabase client initialization
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm';

const SUPABASE_URL = 'https://yvrgxpcjjjfqrofisumr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cmd4cGNqampmcXJvZmlzdW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MDgzMTksImV4cCI6MjA4MDM4NDMxOX0.P-HNDc43SitimDcO_1kDFHMfdGB1BvTVb1S7eKXomxU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function for error handling
export async function handleSupabaseError(error) {
    console.error('[SUPABASE ERROR]', error);
    return null;
}
