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
      // Get stories with "Hekayaty Original" genre or placement
      const stories = await supabaseStorage.getStories({
        placement: 'hekayaty_original'
      });
      
      // Add author and rating information to each story
      const originalsWithDetails = await Promise.all(
        stories.map(async (story) => {
          const author = await supabaseStorage.getUser(story.author_id);
          const averageRating = await supabaseStorage.getAverageRating(story.id.toString());
          const genres = await supabaseStorage.getStoryGenres(story.id.toString());
          
          return {
            id: story.id,
            title: story.title,
            synopsis: story.description,
            cover: story.cover_url || '📚',
            cover_url: story.cover_url,
            poster_url: story.poster_url,
            genre: genres?.[0]?.name || 'Fantasy',
            author: author ? {
              id: author.id,
              username: author.username,
              fullName: author.full_name,
              avatarUrl: author.avatar_url
            } : 'Unknown Author',
            averageRating: averageRating || 0
          };
        })
      );
      
      return res.json(originalsWithDetails);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Originals API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
