import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";
import { z } from "zod";

const bookmarkSchema = z.object({
  user_id: z.string(),
  story_id: z.string()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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

      const bookmark = await supabaseStorage.createBookmark(validation.data);
      
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
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Story bookmarks API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
