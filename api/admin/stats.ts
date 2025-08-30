import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const genres = await supabaseStorage.getAllGenres();
      const stories = await supabaseStorage.getStories();
      const featuredStories = await supabaseStorage.getFeaturedStories();
      const topRatedStories = await supabaseStorage.getTopRatedStories();
      const users = await supabaseStorage.countUsers();
      const lords = await supabaseStorage.countSubscribers();
      const revenue_month = 0;
      
      return res.json({ 
        users, 
        stories: stories.length, 
        lords, 
        revenue_month, 
        genres, 
        featuredStories, 
        topRatedStories 
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
