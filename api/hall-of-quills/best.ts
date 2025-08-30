import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../../server/supabase-storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
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
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Hall of Quills best API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
