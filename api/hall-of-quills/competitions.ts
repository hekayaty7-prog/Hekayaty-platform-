import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Return mock competitions data for now
      const competitions = [
        {
          id: 1,
          title: "Fantasy Writing Contest 2024",
          description: "Write your best fantasy story",
          deadline: "2024-12-31",
          prize: "1000 USD",
          participants: 156
        }
      ];
      
      return res.json(competitions);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Hall of Quills competitions API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
