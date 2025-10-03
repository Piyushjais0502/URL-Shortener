import { nanoid } from 'nanoid';

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

// Encode URL into a short code (simple approach for serverless)
function encodeUrl(url) {
  try {
    // Create a simple hash-like code from the URL
    const encoded = Buffer.from(url).toString('base64')
      .replace(/[+/=]/g, '') // Remove special chars
      .substring(0, 8); // Take first 8 chars
    return encoded;
  } catch (error) {
    return generateShortCode();
  }
}

// Decode URL from short code
function decodeUrl(code) {
  // For custom codes, we can't decode, so return null
  // This is a limitation of the simple approach
  return null;
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
    // For custom codes, we'll use a different approach
    // Store in the code itself using a prefix
    code = 'c_' + code; // Custom code prefix
  } else {
    // Generate code from URL for automatic codes
    code = encodeUrl(finalUrl);
  }

  return {
    shortcode: code,
    originalUrl: finalUrl,
    expiresAt,
    encodedUrl: finalUrl // Pass the URL for storage
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

    // Normalize URL
    let finalUrl = url.trim();
    if (!/^https?:\/\//.test(finalUrl)) {
      finalUrl = "http://" + finalUrl;
    }

    // Validate URL
    try {
      new URL(finalUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format. Please check and try again.' });
    }

    // Handle validity
    let expiresAt = null;
    if (validity !== null && validity !== undefined && validity !== '') {
      const validityNum = parseInt(validity, 10);
      if (isNaN(validityNum) || validityNum <= 0) {
        return res.status(400).json({ error: 'Validity must be a positive integer (minutes)' });
      }
      expiresAt = Date.now() + validityNum * 60 * 1000;
    }

    let code;
    
    if (shortcode && shortcode.trim()) {
      // For custom shortcodes, encode the URL data with the custom code
      const urlData = {
        url: finalUrl,
        expiresAt: expiresAt,
        custom: shortcode.trim()
      };
      
      // Encode the data as base64 and make it URL-safe
      const encoded = Buffer.from(JSON.stringify(urlData))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      code = encoded.substring(0, 12); // Keep it reasonably short
    } else {
      // For auto-generated codes, encode just the URL and expiration
      const urlData = {
        url: finalUrl,
        expiresAt: expiresAt
      };
      
      // Encode the data as base64 and make it URL-safe
      const encoded = Buffer.from(JSON.stringify(urlData))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      code = encoded.substring(0, 8); // Shorter for auto-generated
    }
    
    const baseUrl = `https://${req.headers.host}`;
    const shortUrl = `${baseUrl}/${code}`;
    
    console.log(`Shortened URL: ${finalUrl} to ID: ${code} (encoded in shortcode)`);

    res.status(200).json({ 
      shortUrl, 
      shortcode: code, 
      expiresAt: expiresAt 
    });
  
  } catch (error) {
    console.error('Error in /api/shorten:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}