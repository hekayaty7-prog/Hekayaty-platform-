import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../server/supabase-storage";
import { supabase } from "../server/supabase-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // GET /api/misc?action=genres - Get all genres
    if (req.method === 'GET' && action === 'genres') {
      const genres = await supabaseStorage.getAllGenres();
      return res.json(genres);
    }

    // GET /api/misc?action=characters - Get all characters
    if (req.method === 'GET' && action === 'characters') {
      const characters = await supabaseStorage.getCharacters();
      return res.json(characters);
    }

    // GET /api/misc?action=tales-of-prophets - Get tales of prophets
    if (req.method === 'GET' && action === 'tales-of-prophets') {
      const stories = await supabaseStorage.getStories({
        placement: 'tales_of_prophets'
      });
      
      const talesWithDetails = await Promise.all(
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
      
      return res.json(talesWithDetails);
    }

    // GET /api/misc?action=search - Search functionality
    if (req.method === 'GET' && action === 'search') {
      const { q, type } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Query parameter q is required' });
      }

      let results: any[] = [];
      
      if (!type || type === 'stories') {
        const stories = await supabaseStorage.getStories();
        const filteredStories = stories.filter(s => 
          s.title.toLowerCase().includes((q as string).toLowerCase()) ||
          s.description.toLowerCase().includes((q as string).toLowerCase())
        );
        results = [...results, ...filteredStories.map(s => ({ ...s, type: 'story' }))];
      }
      
      if (!type || type === 'comics') {
        const comics = await supabaseStorage.getComics();
        const filteredComics = comics.filter(c => 
          c.title.toLowerCase().includes((q as string).toLowerCase()) ||
          c.description.toLowerCase().includes((q as string).toLowerCase())
        );
        results = [...results, ...filteredComics.map(c => ({ ...c, type: 'comic' }))];
      }
      
      if (!type || type === 'users') {
        // Search users directly from Supabase
        const { data: users, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
          .limit(20);
        
        if (!error && users) {
          results = [...results, ...users.map(u => ({ ...u, type: 'user' }))];
        }
      }
      
      return res.json(results);
    }

    // GET /api/misc?action=analytics - Analytics data
    if (req.method === 'GET' && action === 'analytics') {
      const { type } = req.query;
      
      if (type === 'stats') {
        const stories = await supabaseStorage.getStories();
        const comics = await supabaseStorage.getComics();
        const totalUsers = await supabaseStorage.countUsers();
        const totalViews = Math.floor(Math.random() * 100000); // Mock data
        
        return res.json({
          totalStories: stories.length,
          totalComics: comics.length,
          totalUsers,
          totalViews
        });
      }
      
      return res.json({ message: 'Analytics endpoint' });
    }

    // GET /api/misc?action=workshops - Workshop data
    if (req.method === 'GET' && action === 'workshops') {
      const workshops = await supabaseStorage.getWorkshops();
      return res.json(workshops);
    }

    // GET /api/misc?action=upload - File upload endpoint
    if (req.method === 'POST' && action === 'upload') {
      // This would handle file uploads to Cloudinary
      return res.json({ message: 'Upload endpoint - implement file handling' });
    }

    // GET /api/misc?action=user-profile - User profile data
    if (req.method === 'GET' && action === 'user-profile') {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
      }
      
      const user = await supabaseStorage.getUser(user_id as string);
      const userStories = await supabaseStorage.getStories({ authorId: user_id as string });
      const userComics = await supabaseStorage.getComics({ authorId: user_id as string });
      
      return res.json({
        user,
        stories: userStories,
        comics: userComics
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Misc API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
