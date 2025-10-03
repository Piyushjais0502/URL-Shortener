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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Shortcode is required' });
    }

    // For demo purposes, redirect to a placeholder
    // In production, you'd look up the URL in your database
    console.log(`Direct redirect request for ID: ${id}`);
    
    // Temporary redirect to show it works
    // You can replace this with actual database lookup
    const demoUrls = {
      'demo': 'https://www.google.com',
      'test': 'https://www.github.com',
      'example': 'https://www.vercel.com',
      'anubhav123': 'https://www.google.com'
    };
    
    const destination = demoUrls[id] || 'https://www.google.com';
    
    console.log(`Redirecting ID: ${id} to URL: ${destination}`);
    
    // Redirect to the original URL
    res.redirect(302, destination);
    
  } catch (error) {
    console.error('Error in direct redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}