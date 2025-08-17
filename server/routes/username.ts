import { Router } from 'express';

const router = Router();

// Simple in-memory storage for usernames (for demo purposes)
// In production, this would be a proper database
const usernames = new Set<string>();

// Get all usernames (for testing)
router.get('/usernames', (req, res) => {
  res.json(Array.from(usernames));
});

// Check if username exists
router.get('/usernames/:username', (req, res) => {
  const { username } = req.params;
  const exists = usernames.has(username);
  res.json({ exists, username });
});

// Create new username
router.post('/usernames', (req, res) => {
  const { username } = req.body;
  
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 3-20 characters' });
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

export default router;