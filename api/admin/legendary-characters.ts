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
      const characters = await supabaseStorage.getCharacters();
      // Filter for legendary characters or return all with legendary flag
      const legendaryCharacters = characters.filter(char => char.is_legendary || char.placement === 'legendary');
      return res.json(legendaryCharacters);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin legendary characters API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
