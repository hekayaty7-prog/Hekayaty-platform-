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
      const [
        totalUsers,
        totalStories,
        totalSubscribers,
        topCreators,
        featuredStories,
        topRatedStories
      ] = await Promise.all([
        supabaseStorage.countUsers(),
        supabaseStorage.countStories(),
        supabaseStorage.countSubscribers(),
        supabaseStorage.getTopCreators(5),
        supabaseStorage.getFeaturedStories(5),
        supabaseStorage.getTopRatedStories(5)
      ]);

      return res.json({
        users: totalUsers,
        stories: totalStories,
        subscribers: totalSubscribers,
        revenue_month: 0, // Placeholder
        topCreators,
        featuredStories,
        topRatedStories
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Analytics stats API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
