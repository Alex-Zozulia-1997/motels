import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epmcpjqkbdfpnshwmedj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwbWNwanFrYmRmcG5zaHdtZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDg0OTAsImV4cCI6MjA4NDQyNDQ5MH0.CaypX4k_LxOMhWf0SwchhzgcgleE7fjtDzKl1Isibi0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchMotelStats() {
	// Fetch from place_summary view for all relevant stats
	const { data, error } = await supabase
		.from('place_summary')
		.select(`
			place_id,
			title,
			city,
			state,
			country_code,
			total_score,
			reviews_count,
			actual_images_count,
			actual_reviews_count,
			decision
		`);
	if (error) throw error;
	return data || [];
}
