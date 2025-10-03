import { shortenUrl } from '../utils/urlShortener.js';

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

    // Use shared business logic
    const result = shortenUrl(url, shortcode, validity);
    
    // Get the base URL for the shortened link
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `https://${req.headers.host}`;
    
    const shortUrl = `${baseUrl}/api/redirect/${result.shortcode}`;
    
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
