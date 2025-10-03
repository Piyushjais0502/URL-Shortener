// Simple storage solution for Vercel
// This creates a basic in-memory store that persists during the function lifecycle

let urlStore = {};

export function storeUrl(shortcode, urlData) {
  urlStore[shortcode] = urlData;
  console.log(`Stored: ${shortcode} -> ${urlData.url}`);
  return shortcode;
}

export function getUrl(shortcode) {
  const data = urlStore[shortcode];
  if (!data) {
    console.log(`Not found in store: ${shortcode}`);
    return null;
  }
  
  // Check expiration
  if (data.expiresAt && Date.now() > data.expiresAt) {
    console.log(`Expired: ${shortcode}`);
    delete urlStore[shortcode];
    return null;
  }
  
  console.log(`Retrieved: ${shortcode} -> ${data.url}`);
  return data;
}

export function listUrls() {
  return Object.keys(urlStore).length;
}