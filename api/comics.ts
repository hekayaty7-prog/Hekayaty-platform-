import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../server/supabase-storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { authorId, includeDrafts, limit, offset } = req.query;
      
      const comics = await supabaseStorage.getComics({
        authorId: authorId as string,
        includeDrafts: includeDrafts === "true",
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });
      
      return res.json(comics);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Comics API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
