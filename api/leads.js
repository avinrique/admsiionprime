/**
 * Leads API - Stores lead data from the college predictor
 *
 * For production, integrate with Upstash Redis or MongoDB
 * This version uses in-memory storage (resets on cold start)
 */

// In-memory storage (for demo/testing)
// In production on Vercel, use Upstash Redis: https://vercel.com/marketplace/upstash
let leads = [];

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'POST') {
    try {
      const lead = req.body;

      if (!lead.name || !lead.phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }

      const newLead = {
        id: Date.now().toString(),
        ...lead,
        createdAt: new Date().toISOString(),
      };

      leads.push(newLead);

      return res.status(201).json({ success: true, id: newLead.id });
    } catch (error) {
      console.error('Failed to save lead:', error);
      return res.status(500).json({ error: 'Failed to save lead' });
    }
  }

  if (req.method === 'GET') {
    // Sort by most recent first
    const sortedLeads = [...leads].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json(sortedLeads);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
