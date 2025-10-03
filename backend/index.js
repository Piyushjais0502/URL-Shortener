import express from 'express';
import cors from 'cors';
import { log } from './middleware/logger.js';
import { shortenUrl, getOriginalUrl, getStats } from './utils/urlShortener.js';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      'http://localhost:4173', // Vite preview
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173'
    ];
    
    // In production, add your actual domain
    if (NODE_ENV === 'production') {
      allowedOrigins.push(
        process.env.FRONTEND_URL || 'https://your-domain.vercel.app'
      );
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow for now, but log the warning
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'}`);
  next();
});

// Get production domain from environment or use localhost for development
const getBaseUrl = () => {
  if (NODE_ENV === 'production') {
    return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : BASE_URL;
  }
  return BASE_URL;
};

app.post('/shorten', async (req, res) => {
  try {
    const { url, shortcode, validity } = req.body;
    
    if (!url) {
      await log("backend", "error", "handler", "URL shortening failed: URL is required");
      return res.status(400).json({ error: 'URL is required' });
    }

    // Use shared business logic
    const result = shortenUrl(url, shortcode, validity);
    
    const baseUrl = getBaseUrl();
    const shortUrl = `${baseUrl}/${result.shortcode}`;
    
    await log("backend", "info", "handler", `Shortened URL: ${result.originalUrl} to ID: ${result.shortcode}${result.expiresAt ? ` (expires: ${new Date(result.expiresAt).toISOString()})` : ' (no expiration)'}`);

    res.json({ 
      shortUrl, 
      shortcode: result.shortcode, 
      expiresAt: result.expiresAt 
    });
  
  } catch (error) {
    console.error('Error in /shorten endpoint:', error);
    await log("backend", "error", "handler", `Shorten endpoint error: ${error.message}`);
    
    if (error.message.includes('Invalid URL') || 
        error.message.includes('Custom shortcode') || 
        error.message.includes('Validity must be') ||
        error.message.includes('already in use')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use shared business logic
    const destination = getOriginalUrl(id);
    
    await log("backend", "info", "handler", `Redirecting ID: ${id} to URL: ${destination}`);
    return res.redirect(destination);
    
  } catch (error) {
    console.error('Error in redirect endpoint:', error);
    await log("backend", "error", "handler", `Redirect endpoint error: ${error.message}`);
    
    if (error.message === 'URL not found') {
      return res.status(404).json({ error: 'URL not found' });
    } else if (error.message === 'Short link expired') {
      return res.status(410).json({ error: 'Short link expired' });
    } else if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'URL Shortener API',
    status: 'healthy',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  const stats = getStats();
  res.json({
    status: 'healthy',
    environment: NODE_ENV,
    baseUrl: getBaseUrl(),
    timestamp: new Date().toISOString(),
    ...stats
  });
});

// Handle 404 for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  log("backend", "error", "handler", `Global error: ${err.message}`);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on ${BASE_URL}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: ${BASE_URL}/api/status`);
});
