import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Simple in-memory storage for usernames and week plans (for demo purposes)
const usernames = new Set<string>();
const weekPlans = new Map<string, any>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Username management API endpoints
  
  // Get all usernames (for testing)
  app.get('/api/usernames', (req, res) => {
    res.json(Array.from(usernames));
  });

  // Check if username exists
  app.get('/api/usernames/:username', (req, res) => {
    const { username } = req.params;
    const exists = usernames.has(username);
    res.json({ exists, username });
  });

  // Create new username
  app.post('/api/usernames', (req, res) => {
    const { username } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be 3-50 characters' });
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters and numbers' });
    }
    
    if (usernames.has(username)) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    usernames.add(username);
    res.json({ success: true, username });
  });

  // Week Plan management API endpoints (fallback for Firebase)

  // Get week plan for username
  app.get('/api/weekplan/:username', (req, res) => {
    const { username } = req.params;
    const weekPlan = weekPlans.get(username);
    
    if (weekPlan) {
      res.json(weekPlan);
    } else {
      // Return empty week plan structure
      res.json({
        uid: username,
        slots: {
          monday: {},
          tuesday: {},
          wednesday: {},
          thursday: {},
          friday: {},
          saturday: {},
          sunday: {},
        },
        updatedAt: new Date(),
      });
    }
  });

  // Save week plan for username
  app.post('/api/weekplan/:username', (req, res) => {
    const { username } = req.params;
    const weekPlanData = req.body;
    
    // Store the week plan data
    weekPlans.set(username, {
      ...weekPlanData,
      updatedAt: new Date(),
    });
    
    res.json({ success: true, username });
  });

  const httpServer = createServer(app);

  return httpServer;
}
