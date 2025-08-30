import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabase } from "../../server/supabase-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get users from profiles table directly since getAllUsers doesn't exist
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ message: 'Failed to fetch users' });
      }
      
      return res.json(users || []);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
