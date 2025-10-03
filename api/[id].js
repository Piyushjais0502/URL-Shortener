// Direct redirect handler for short URLs
// This makes URLs like: https://your-domain.vercel.app/abc123

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not found' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Shortcode is required' });
    }

    console.log(`Direct redirect request for ID: ${id}`);
    
    try {
      // Decode the shortcode back to URL data
      // First, restore the base64 padding and special characters
      let base64 = id;
      
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }
      
      // Restore special characters
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
      
      // Decode from base64
      const decoded = Buffer.from(base64, 'base64').toString('utf8');
      const urlData = JSON.parse(decoded);
      
      console.log(`Decoded URL data:`, urlData);
      
      // Check if expired
      if (urlData.expiresAt && Date.now() > urlData.expiresAt) {
        console.log(`URL expired for ID: ${id}`);
        return res.status(410).json({ error: 'Short link expired' });
      }

      const destination = urlData.url;

      // Validate destination URL
      try {
        new URL(destination);
      } catch {
        console.log(`Invalid URL decoded for ID: ${id}`);
        return res.status(400).json({ error: 'Invalid redirect URL' });
      }
      
      console.log(`Redirecting ID: ${id} to URL: ${destination}`);
      
      // Redirect to the original URL
      res.redirect(302, destination);
      
    } catch (decodeError) {
      console.error('Failed to decode shortcode:', decodeError);
      
      // Fallback for some demo codes
      const demoUrls = {
        'demo': 'https://www.google.com',
        'test': 'https://www.github.com',
        'example': 'https://www.vercel.com',
        'google': 'https://www.google.com',
        'github': 'https://www.github.com'
      };
      
      if (demoUrls[id]) {
        console.log(`Using demo URL for ID: ${id}`);
        res.redirect(302, demoUrls[id]);
      } else {
        return res.status(404).json({ error: 'URL not found or invalid shortcode' });
      }
    }
    
  } catch (error) {
    console.error('Error in direct redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}