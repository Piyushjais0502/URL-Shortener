import { getOriginalUrl } from '../../utils/urlShortener.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Shortcode is required' });
    }

    // Use shared business logic
    const destination = getOriginalUrl(id);
    
    console.log(`Redirecting ID: ${id} to URL: ${destination}`);
    
    // Redirect to the original URL
    res.redirect(302, destination);
    
  } catch (error) {
    console.error('Error in /api/redirect:', error);
    
    if (error.message === 'URL not found') {
      return res.status(404).json({ error: 'URL not found' });
    } else if (error.message === 'Short link expired') {
      return res.status(410).json({ error: 'Short link expired' });
    } else if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}