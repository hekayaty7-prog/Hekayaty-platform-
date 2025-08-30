import type { VercelRequest, VercelResponse } from '@vercel/node';
import "dotenv/config";
import { supabaseStorage } from "../server/supabase-storage";
import { supabase } from "../server/supabase-auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
  fullName: z.string().min(1)
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    // POST /api/auth?action=login - User login
    if (req.method === 'POST' && action === 'login') {
      const validation = loginSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const { email, password } = validation.data;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Login error:', authError);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!authData.user) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      const profile = await supabaseStorage.getUser(authData.user.id);

      return res.json({
        user: authData.user,
        profile,
        session: authData.session
      });
    }

    // POST /api/auth?action=register - User registration
    if (req.method === 'POST' && action === 'register') {
      const validation = registerSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const { email, password, username, fullName } = validation.data;

      const existingUser = await supabaseStorage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName
          }
        }
      });

      if (authError) {
        console.error('Registration error:', authError);
        return res.status(400).json({ error: authError.message });
      }

      return res.json({
        user: authData.user,
        session: authData.session,
        message: 'Registration successful'
      });
    }

    // POST /api/auth?action=logout - User logout
    if (req.method === 'POST' && action === 'logout') {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'Logout failed' });
      }

      return res.json({ message: 'Logged out successfully' });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
