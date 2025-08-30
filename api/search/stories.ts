import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabase } from "../../server/supabase-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { q, genre, author, limit = '20', offset = '0' } = req.query;
      
      let query = supabase
        .from('stories')
        .select(`
          *,
          profiles:author_id (username, full_name, avatar_url)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      // Search by title or description
      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // Filter by genre
      if (genre) {
        query = query.contains('genre', [genre]);
      }

      // Filter by author
      if (author) {
        query = query.eq('author_id', author);
      }

      // Pagination
      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);
      query = query.range(offsetNum, offsetNum + limitNum - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Search stories error:', error);
        return res.status(500).json({ error: 'Failed to search stories' });
      }

      return res.json(data || []);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Search stories API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
