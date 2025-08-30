import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";
import { z } from "zod";

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

  try {
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

      const chapter = await supabaseStorage.createChapter(validation.data);
      
      if (!chapter) {
        return res.status(500).json({ error: 'Failed to create chapter' });
      }
      
      return res.json(chapter);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Chapter ID is required' });
      }

      const validation = createChapterSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const updatedChapter = await supabaseStorage.updateChapter(id as string, validation.data);
      
      if (!updatedChapter) {
        return res.status(500).json({ error: 'Failed to update chapter' });
      }
      
      return res.json(updatedChapter);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Chapter ID is required' });
      }

      const success = await supabaseStorage.deleteChapter(id as string);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to delete chapter' });
      }
      
      return res.json({ message: 'Chapter deleted successfully' });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Story chapters API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
