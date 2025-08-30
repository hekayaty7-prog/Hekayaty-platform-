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
      const stories = await supabaseStorage.getStories({
        limit: 10,
        placement: 'honorable_mentions'
      });
      
      const honorableEntries = await Promise.all(
        stories.map(async (story) => {
          const author = await supabaseStorage.getUser(story.author_id);
          const averageRating = await supabaseStorage.getAverageRating(story.id.toString());
          
          return {
            id: story.id,
            title: story.title,
            author: author?.username || 'Unknown',
            rating: averageRating || 0,
            cover_url: story.cover_url
          };
        })
      );
      
      return res.json(honorableEntries);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Hall of Quills honorable API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
