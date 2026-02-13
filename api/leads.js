/**
 * Leads API with JSONBin.io storage (free, persistent)
 *
 * Setup:
 * 1. Go to https://jsonbin.io and create free account
 * 2. Create a new bin with content: []
 * 3. Copy the Bin ID and API Key
 * 4. Add to Vercel Environment Variables:
 *    - JSONBIN_BIN_ID
 *    - JSONBIN_API_KEY
 */

const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

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

// Fetch leads from JSONBin
async function getLeads() {
  try {
    const res = await fetch(JSONBIN_URL + '/latest', {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    const data = await res.json();
    return data.record || [];
  } catch (e) {
    console.error('Failed to fetch leads:', e);
    return [];
  }
}

// Save leads to JSONBin
async function saveLeads(leads) {
  try {
    await fetch(JSONBIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(leads)
    });
  } catch (e) {
    console.error('Failed to save leads:', e);
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if JSONBin is configured
  if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
    return res.status(500).json({ error: 'Storage not configured. Set JSONBIN_BIN_ID and JSONBIN_API_KEY.' });
  }

  // POST - Submit lead (public)
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

    // Get existing leads, add new one, save
    const leads = await getLeads();
    leads.push(newLead);
    await saveLeads(leads);

    console.log('New lead:', newLead.name, newLead.phone);
    return res.status(201).json({ success: true, id: newLead.id });
  }

  // GET - Fetch leads (requires auth)
  if (req.method === 'GET') {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!isValidToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const leads = await getLeads();
    const sortedLeads = leads.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json(sortedLeads);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
