import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../server/supabase-storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { authorId, genreId, placement, isPremium, isShortStory, limit, offset } = req.query;
      
      console.log('GET /api/stories - Query params:', { placement, authorId, genreId, isPremium, isShortStory, limit, offset });
      
      const stories = await supabaseStorage.getStories({
        authorId: authorId?.toString(),
        genreId: genreId ? parseInt(genreId as string, 10) : undefined,
        placement: placement as string,
        isPremium: isPremium === 'true',
        isShortStory: isShortStory === 'true',
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined
      });
      
      console.log(`GET /api/stories - Found ${stories.length} stories for placement: ${placement}`);
      
      // Add rating information to each story
      const storiesWithRatings = await Promise.all(
        stories.map(async (story) => {
          const averageRating = await supabaseStorage.getAverageRating(story.id.toString());
          const genres = await supabaseStorage.getStoryGenres(story.id.toString());
          const author = await supabaseStorage.getUser(story.author_id);
          
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
      
      return res.json(storiesWithRatings);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Stories API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
