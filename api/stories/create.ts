import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const validation = createStorySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const storyData = {
        ...validation.data,
        is_published: true, // Auto-publish for now
        status: 'published'
      };

      const story = await supabaseStorage.createStory(storyData);
      
      if (!story) {
        return res.status(500).json({ error: 'Failed to create story' });
      }
      
      return res.json(story);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Create story API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
