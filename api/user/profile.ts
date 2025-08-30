import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";
import { z } from "zod";

const updateProfileSchema = z.object({
  username: z.string().min(3).optional(),
  full_name: z.string().min(1).optional(),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  is_author: z.boolean().optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const profile = await supabaseStorage.getUserProfile(id as string);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.json(profile);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const validation = updateProfileSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const updatedProfile = await supabaseStorage.updateUserProfile(id as string, validation.data);
      
      if (!updatedProfile) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      
      return res.json(updatedProfile);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('User profile API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
