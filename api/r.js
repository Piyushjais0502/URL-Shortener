// Redirect handler using query parameters
// This handles URLs like: /r?url=https://google.com&code=abc123&exp=123456789

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
    const { url, code, exp } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Check expiration
    if (exp) {
      const expirationTime = parseInt(exp, 10);
      if (Date.now() > expirationTime) {
        return res.status(410).json({ error: 'Short link expired' });
      }
    }

    // Decode and validate the URL
    const decodedUrl = decodeURIComponent(url);
    
    try {
      new URL(decodedUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    
    console.log(`Redirecting code: ${code} to URL: ${decodedUrl}`);
    
    // Redirect to the original URL
    res.redirect(302, decodedUrl);
    
  } catch (error) {
    console.error('Error in redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}