import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../server/supabase-storage";
import { z } from "zod";

const createComicSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  author_id: z.string(),
  cover_url: z.string().optional(),
  pdf_url: z.string().optional(),
  workshop_id: z.string().optional(),
  is_premium: z.boolean().default(false),
  genre: z.array(z.string()).optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET /api/comics - Get all comics
    if (req.method === 'GET') {
      const { authorId, includeDrafts, limit, offset } = req.query;
      
      const comics = await supabaseStorage.getComics({
        authorId: authorId as string,
        includeDrafts: includeDrafts === "true",
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });
      
      const comicsWithDetails = await Promise.all(
        comics.map(async (comic) => {
          const author = await supabaseStorage.getUser(comic.author_id);
          const averageRating = await supabaseStorage.getAverageRating(comic.id.toString());
          
          return {
            ...comic,
            averageRating: averageRating || 0,
            author: author ? {
              id: author.id,
              username: author.username,
              fullName: author.full_name,
              avatarUrl: author.avatar_url
            } : null
          };
        })
      );
      
      return res.json(comicsWithDetails);
    }

    // POST /api/comics - Create comic
    if (req.method === 'POST') {
      const validation = createComicSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const comicData = {
        title: validation.data.title,
        description: validation.data.description,
        author_id: validation.data.author_id,
        cover_url: validation.data.cover_url,
        pdf_url: validation.data.pdf_url,
        workshop_id: validation.data.workshop_id,
        is_premium: validation.data.is_premium || false,
        is_published: true,
        genre: validation.data.genre,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const comic = await supabaseStorage.createComic(comicData);
      
      if (!comic) {
        return res.status(500).json({ error: 'Failed to create comic' });
      }
      
      return res.json(comic);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Comics API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
