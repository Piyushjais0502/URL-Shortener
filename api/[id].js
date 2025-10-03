// Direct redirect handler for short URLs
// This makes URLs like: https://your-domain.vercel.app/abc123

// Use the same global storage as shorten.js
global.urlDatabase = global.urlDatabase || {};

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

    console.log(`Direct redirect request for ID: ${id}`);
    console.log(`Current DB size: ${Object.keys(global.urlDatabase).length} entries`);
    console.log(`Available codes: ${Object.keys(global.urlDatabase).join(', ')}`);
    
    // Look up the URL in our global database
    const urlData = global.urlDatabase[id];
    
    if (!urlData) {
      console.log(`URL not found for ID: ${id}`);
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if expired
    if (urlData.expiresAt && Date.now() > urlData.expiresAt) {
      console.log(`URL expired for ID: ${id}`);
      delete global.urlDatabase[id]; // Clean up expired entry
      return res.status(410).json({ error: 'Short link expired' });
    }

    const destination = urlData.url;

    // Validate destination URL
    try {
      new URL(destination);
    } catch {
      console.log(`Invalid URL stored for ID: ${id}`);
      return res.status(400).json({ error: 'Invalid redirect URL' });
    }
    
    console.log(`Redirecting ID: ${id} to URL: ${destination}`);
    
    // Redirect to the original URL
    res.redirect(302, destination);
    
  } catch (error) {
    console.error('Error in direct redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}