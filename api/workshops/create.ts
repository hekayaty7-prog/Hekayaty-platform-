import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";
import { z } from "zod";

const createWorkshopSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  owner_id: z.string(),
  max_participants: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().default(true)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const workshops = await supabaseStorage.getWorkshops();
      return res.json(workshops);
    }

    if (req.method === 'POST') {
      const validation = createWorkshopSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const workshop = await supabaseStorage.createWorkshop(validation.data);
      
      if (!workshop) {
        return res.status(500).json({ error: 'Failed to create workshop' });
      }
      
      return res.json(workshop);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Workshop API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
