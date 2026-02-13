/**
 * Leads API
 * Note: In-memory storage won't persist on Vercel serverless.
 * For production, use Vercel KV, Upstash Redis, or a database.
 */

// In-memory storage (resets on each cold start in serverless)
let leads = [];

// Simple auth check
function isValidToken(token) {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [username, timestamp] = decoded.split(':');
    const age = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000;
    return username && age < maxAge;
  } catch (e) {
    return false;
  }
}

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST - Submit lead (public, no auth required)
  if (req.method === 'POST') {
    const lead = req.body || {};

    if (!lead.name || !lead.phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const newLead = {
      id: Date.now().toString(),
      ...lead,
      createdAt: new Date().toISOString(),
    };

    leads.push(newLead);
    console.log('New lead:', newLead.name, newLead.phone);

    return res.status(201).json({ success: true, id: newLead.id });
  }

  // GET - Fetch leads (requires auth)
  if (req.method === 'GET') {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!isValidToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sortedLeads = [...leads].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json(sortedLeads);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
