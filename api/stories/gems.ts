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
        placement: 'writers_gems'
      });
      
      const gemsStories = await Promise.all(
        stories.map(async (story) => {
          const author = await supabaseStorage.getUser(story.author_id);
          const averageRating = await supabaseStorage.getAverageRating(story.id.toString());
          const genres = await supabaseStorage.getStoryGenres(story.id.toString());
          
          return {
            ...story,
            averageRating: averageRating || 0,
            genres: genres || [],
            author: author ? {
              id: author.id,
              username: author.username,
              fullName: author.full_name,
              avatarUrl: author.avatar_url
            } : null
          };
        })
      );
      
      return res.json(gemsStories);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Writers gems API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
