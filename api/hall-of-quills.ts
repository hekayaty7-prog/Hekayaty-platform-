import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../server/supabase-storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // GET /api/hall-of-quills?action=active - Active entries
    if (req.method === 'GET' && action === 'active') {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;
      
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
            reads: Math.floor(Math.random() * 10000),
            cover_url: story.cover_url
          };
        })
      );
      
      return res.json(activeEntries);
    }

    // GET /api/hall-of-quills?action=best - Best creators
    if (req.method === 'GET' && action === 'best') {
      const bestCreators = await supabaseStorage.getTopCreators();
      
      const best = bestCreators.map((c) => ({
        id: c.id,
        name: c.username,
        title: `${c.comics_count || 0} published works`,
        avatar: c.avatar_url || "https://placehold.co/96x96",
        stories: c.comics_count || 0,
        reads: "-",
      }));
      
      return res.json(best);
    }

    // GET /api/hall-of-quills?action=competitions - Writing competitions
    if (req.method === 'GET' && action === 'competitions') {
      const competitions = [
        {
          id: 1,
          title: "Fantasy Writing Contest 2024",
          description: "Write your best fantasy story",
          deadline: "2024-12-31",
          prize: "1000 USD",
          participants: 156
        }
      ];
      
      return res.json(competitions);
    }

    // GET /api/hall-of-quills?action=honorable - Honorable mentions
    if (req.method === 'GET' && action === 'honorable') {
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
    console.error('Hall of Quills API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
