import { nanoid } from 'nanoid';

// In-memory storage (for demo - in production you'd use a database)
let urlDatabase = {};

// Utility functions
export const isValidShortcode = (code) => /^[a-zA-Z0-9]{4,32}$/.test(code);

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

export function normalizeUrl(url) {
  let finalUrl = url.trim();
  if (!/^https?:\/\//.test(finalUrl)) {
    finalUrl = "http://" + finalUrl;
  }
  return finalUrl;
}

export function generateShortCode() {
  return nanoid(6); // Shorter codes: 6 characters instead of 8
}

// Main business logic
export function shortenUrl(url, shortcode = '', validity = null) {
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

export function getOriginalUrl(shortcode) {
  if (!shortcode || shortcode.length < 4 || shortcode.length > 32) {
    throw new Error('Invalid shortcode format');
  }

  const entry = urlDatabase[shortcode];
  if (!entry) {
    throw new Error('URL not found');
  }

  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    throw new Error('Short link expired');
  }

  if (!isValidUrl(entry.url)) {
    throw new Error('Invalid redirect URL');
  }

  return entry.url;
}

export function getStats() {
  return {
    totalUrls: Object.keys(urlDatabase).length,
    activeUrls: Object.values(urlDatabase).filter(entry =>
      !entry.expiresAt || entry.expiresAt > Date.now()
    ).length
  };
}

// For debugging/development
export function getDatabase() {
  return urlDatabase;
}

export function setDatabase(db) {
  urlDatabase = db;
}