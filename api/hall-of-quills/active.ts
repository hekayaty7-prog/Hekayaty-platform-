import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;
      
      // Get active Hall of Quills entries (top-rated stories/authors)
      const stories = await supabaseStorage.getStories({
        limit: limitNum,
        placement: 'hall_of_quills'
      });
      
      const activeEntries = await Promise.all(
        stories.map(async (story) => {
          const author = await supabaseStorage.getUser(story.author_id);
          const averageRating = await supabaseStorage.getAverageRating(story.id.toString());
          
          return {
            id: story.id,
            title: story.title,
            author: author?.username || 'Unknown',
            rating: averageRating || 0,
            reads: Math.floor(Math.random() * 10000), // Placeholder
            cover_url: story.cover_url
          };
        })
      );
      
      return res.json(activeEntries);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Hall of Quills active API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
