import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";
import { z } from "zod";

const ratingSchema = z.object({
  user_id: z.string(),
  story_id: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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

      const rating = await supabaseStorage.createRating(validation.data);
      
      if (!rating) {
        return res.status(500).json({ error: 'Failed to create rating' });
      }
      
      return res.json(rating);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Rating ID is required' });
      }

      const validation = ratingSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const updatedRating = await supabaseStorage.updateRating(id as string, validation.data);
      
      if (!updatedRating) {
        return res.status(500).json({ error: 'Failed to update rating' });
      }
      
      return res.json(updatedRating);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Story ratings API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
