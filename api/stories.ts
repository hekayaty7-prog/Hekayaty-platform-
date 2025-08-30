import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../server/supabase-storage";
import { z } from "zod";

const createStorySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  author_id: z.string(),
  cover_url: z.string().optional(),
  poster_url: z.string().optional(),
  soundtrack_url: z.string().optional(),
  is_premium: z.boolean().default(false),
  is_short_story: z.boolean().default(false),
  placement: z.string().optional(),
  genre: z.array(z.string()).optional()
});

const ratingSchema = z.object({
  user_id: z.string(),
  story_id: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional()
});

const bookmarkSchema = z.object({
  user_id: z.string(),
  story_id: z.string()
});

const createChapterSchema = z.object({
  story_id: z.string(),
  title: z.string().min(1),
  content: z.string().optional(),
  file_url: z.string().optional(),
  file_type: z.enum(['pdf', 'text', 'audio', 'image']).optional(),
  chapter_order: z.number().min(1)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // GET /api/stories - Get all stories
    if (req.method === 'GET' && !action) {
      const { placement, limit, author_id } = req.query;
      
      const stories = await supabaseStorage.getStories({
        placement: placement as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        authorId: author_id as string
      });
      
      const storiesWithDetails = await Promise.all(
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
      
      return res.json(storiesWithDetails);
    }

    // GET /api/stories?action=originals - Get Hekayaty Originals
    if (req.method === 'GET' && action === 'originals') {
      const stories = await supabaseStorage.getStories({
        placement: 'hekayaty_originals'
      });
      
      const originalsWithDetails = await Promise.all(
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
      
      return res.json(originalsWithDetails);
    }

    // GET /api/stories?action=special - Get special stories
    if (req.method === 'GET' && action === 'special') {
      const stories = await supabaseStorage.getStories({
        placement: 'special_stories'
      });
      
      const specialStories = await Promise.all(
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
      
      return res.json(specialStories);
    }

    // GET /api/stories?action=workshops - Get workshop stories
    if (req.method === 'GET' && action === 'workshops') {
      const stories = await supabaseStorage.getStories({
        placement: 'workshops'
      });
      
      const workshopStories = await Promise.all(
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
      
      return res.json(workshopStories);
    }

    // GET /api/stories?action=gems - Get writers' gems
    if (req.method === 'GET' && action === 'gems') {
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

    // POST /api/stories - Create story
    if (req.method === 'POST' && !action) {
      const validation = createStorySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const storyData = {
        title: validation.data.title,
        description: validation.data.description,
        content: validation.data.content,
        author_id: validation.data.author_id,
        cover_url: validation.data.cover_url,
        poster_url: validation.data.poster_url,
        soundtrack_url: validation.data.soundtrack_url,
        is_premium: validation.data.is_premium || false,
        is_short_story: validation.data.is_short_story || false,
        is_published: true,
        placement: validation.data.placement,
        genre: validation.data.genre,
        status: 'published'
      };

      const story = await supabaseStorage.createStory(storyData);
      
      if (!story) {
        return res.status(500).json({ error: 'Failed to create story' });
      }
      
      return res.json(story);
    }

    // Handle ratings
    if (action === 'ratings') {
      if (req.method === 'GET') {
        const { story_id } = req.query;
        if (!story_id) {
          return res.status(400).json({ error: 'story_id is required' });
        }
        
        const ratings = await supabaseStorage.getRatings(story_id as string);
        const averageRating = await supabaseStorage.getAverageRating(story_id as string);
        
        return res.json({ ratings, averageRating });
      }

      if (req.method === 'POST') {
        const validation = ratingSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({ 
            error: 'Invalid input', 
            details: validation.error.errors 
          });
        }

        const rating = await supabaseStorage.createRating({
          user_id: validation.data.user_id,
          story_id: validation.data.story_id,
          rating: validation.data.rating,
          review: validation.data.review
        });
        
        if (!rating) {
          return res.status(500).json({ error: 'Failed to create rating' });
        }
        
        return res.json(rating);
      }
    }

    // Handle bookmarks
    if (action === 'bookmarks') {
      if (req.method === 'GET') {
        const { user_id } = req.query;
        if (!user_id) {
          return res.status(400).json({ error: 'user_id is required' });
        }
        
        const bookmarks = await supabaseStorage.getBookmarks(user_id as string);
        return res.json(bookmarks);
      }

      if (req.method === 'POST') {
        const validation = bookmarkSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({ 
            error: 'Invalid input', 
            details: validation.error.errors 
          });
        }

        const bookmark = await supabaseStorage.createBookmark({
          user_id: validation.data.user_id,
          story_id: validation.data.story_id
        });
        
        if (!bookmark) {
          return res.status(500).json({ error: 'Failed to create bookmark' });
        }
        
        return res.json(bookmark);
      }

      if (req.method === 'DELETE') {
        const { user_id, story_id } = req.query;
        if (!user_id || !story_id) {
          return res.status(400).json({ error: 'user_id and story_id are required' });
        }

        const success = await supabaseStorage.deleteBookmark(user_id as string, parseInt(story_id as string));
        
        if (!success) {
          return res.status(500).json({ error: 'Failed to delete bookmark' });
        }
        
        return res.json({ message: 'Bookmark deleted successfully' });
      }
    }

    // Handle chapters
    if (action === 'chapters') {
      if (req.method === 'GET') {
        const { story_id } = req.query;
        if (!story_id) {
          return res.status(400).json({ error: 'story_id is required' });
        }
        
        const chapters = await supabaseStorage.getChapters(story_id as string);
        return res.json(chapters);
      }

      if (req.method === 'POST') {
        const validation = createChapterSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({ 
            error: 'Invalid input', 
            details: validation.error.errors 
          });
        }

        const chapter = await supabaseStorage.createChapter({
          story_id: validation.data.story_id,
          title: validation.data.title,
          content: validation.data.content,
          file_url: validation.data.file_url,
          file_type: validation.data.file_type,
          chapter_order: validation.data.chapter_order
        });
        
        if (!chapter) {
          return res.status(500).json({ error: 'Failed to create chapter' });
        }
        
        return res.json(chapter);
      }
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Stories API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
