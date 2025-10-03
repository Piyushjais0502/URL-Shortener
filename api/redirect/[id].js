// Note: This is a simplified version for Vercel deployment
// In a real production app, you'd use a shared database

// For demo purposes, we'll use a simple approach
// In production, you'd want to use a database like Redis, MongoDB, or PostgreSQL

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
    console.log(`Redirect request for ID: ${id}`);
    
    // Temporary redirect to show it works
    // You can replace this with actual database lookup
    const demoUrls = {
      'demo': 'https://www.google.com',
      'test': 'https://www.github.com',
      'example': 'https://www.vercel.com'
    };
    
    const destination = demoUrls[id] || 'https://www.google.com';
    
    console.log(`Redirecting ID: ${id} to URL: ${destination}`);
    
    // Redirect to the original URL
    res.redirect(302, destination);
    
  } catch (error) {
    console.error('Error in /api/redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}