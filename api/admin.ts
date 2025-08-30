import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../server/supabase-storage";
import { supabase } from "../server/supabase-auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // GET /api/admin?action=stats - Admin statistics
    if (req.method === 'GET' && action === 'stats') {
      const genres = await supabaseStorage.getAllGenres();
      const stories = await supabaseStorage.getStories();
      const featuredStories = await supabaseStorage.getFeaturedStories();
      const topRatedStories = await supabaseStorage.getTopRatedStories();
      const users = await supabaseStorage.countUsers();
      const lords = await supabaseStorage.countSubscribers();
      const revenue_month = 0;
      
      return res.json({ 
        users, 
        stories: stories.length, 
        lords, 
        revenue_month, 
        genres, 
        featuredStories, 
        topRatedStories 
      });
    }

    // GET /api/admin?action=users - User management
    if (req.method === 'GET' && action === 'users') {
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

    // GET /api/admin?action=stories - Story management
    if (req.method === 'GET' && action === 'stories') {
      const stories = await supabaseStorage.getStories();
      return res.json(stories);
    }

    // GET /api/admin?action=reports - Admin reports
    if (req.method === 'GET' && action === 'reports') {
      const reports = [];
      return res.json(reports);
    }

    // GET /api/admin?action=legendary-characters - Legendary characters
    if (req.method === 'GET' && action === 'legendary-characters') {
      const characters = await supabaseStorage.getCharacters();
      const legendaryCharacters = characters.filter(char => char.is_legendary || char.placement === 'legendary');
      return res.json(legendaryCharacters);
    }

    // GET /api/admin?action=subscription-codes - Subscription codes
    if (req.method === 'GET' && action === 'subscription-codes') {
      const codes = [];
      return res.json(codes);
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
