import { createClient } from '@supabase/supabase-js';

// Fix: Use process.env for environment variables to resolve TypeScript errors and align with project conventions.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PostData {
  title: string;
  content: string;
  raw_newsletter_data: string;
}

export const savePost = async (post: PostData) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([post]);

  if (error) {
    console.error('Error saving post to Supabase:', error);
    throw error;
  }

  return data;
};
