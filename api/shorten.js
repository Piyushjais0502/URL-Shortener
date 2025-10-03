import { nanoid } from 'nanoid';

// In-memory storage (for demo - in production you'd use a database)
let urlDatabase = {};

// Utility functions
const isValidShortcode = (code) => /^[a-zA-Z0-9]{4,32}$/.test(code);

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

function normalizeUrl(url) {
  let finalUrl = url.trim();
  if (!/^https?:\/\//.test(finalUrl)) {
    finalUrl = "http://" + finalUrl;
  }
  return finalUrl;
}

function generateShortCode() {
  return nanoid(6); // Shorter codes: 6 characters instead of 8
}

// Main business logic
function shortenUrl(url, shortcode = '', validity = null) {
  // Normalize URL
  const finalUrl = normalizeUrl(url);
  
  // Validate URL
  if (!isValidUrl(finalUrl)) {
    throw new Error('Invalid URL format. Please check and try again.');
  }

  // Handle validity - no default expiration unless specified
  let expiresAt = null;
  if (validity !== null && validity !== undefined) {
    if (typeof validity !== 'number' || validity <= 0) {
      throw new Error('Validity must be a positive integer (minutes)');
    }
    expiresAt = Date.now() + validity * 60 * 1000;
  }

  // Handle shortcode
  let code = shortcode;
  if (code) {
    if (!isValidShortcode(code)) {
      throw new Error('Custom shortcode must be alphanumeric and 4-32 characters');
    }
    if (urlDatabase[code] && (!urlDatabase[code].expiresAt || urlDatabase[code].expiresAt > Date.now())) {
      throw new Error('Custom shortcode already in use');
    }
  } else {
    do {
      code = generateShortCode();
    } while (urlDatabase[code] && (!urlDatabase[code].expiresAt || urlDatabase[code].expiresAt > Date.now()));
  }

  // Store the URL
  urlDatabase[code] = { 
    url: finalUrl, 
    expiresAt, 
    createdAt: Date.now() 
  };

  return {
    shortcode: code,
    originalUrl: finalUrl,
    expiresAt
  };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, shortcode, validity } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Use business logic
    const result = shortenUrl(url, shortcode, validity);
    
    // Get the base URL for the shortened link - MUCH SHORTER!
    const baseUrl = `https://${req.headers.host}`;
    const shortUrl = `${baseUrl}/${result.shortcode}`;
    
    console.log(`Shortened URL: ${result.originalUrl} to ID: ${result.shortcode}${result.expiresAt ? ` (expires: ${new Date(result.expiresAt).toISOString()})` : ' (no expiration)'}`);

    res.status(200).json({ 
      shortUrl, 
      shortcode: result.shortcode, 
      expiresAt: result.expiresAt 
    });
  
  } catch (error) {
    console.error('Error in /api/shorten:', error);
    
    if (error.message.includes('Invalid URL') || 
        error.message.includes('Custom shortcode') || 
        error.message.includes('Validity must be') ||
        error.message.includes('already in use')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}