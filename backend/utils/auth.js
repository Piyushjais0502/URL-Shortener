// utils/auth.js

// ✅ TEMPORARY: Disabled real auth request
// import fetch from 'node-fetch'; // Not needed while mocking

export async function getAccessToken() {
  // ⚠️ Development-only fallback
  console.warn("⚠️ Using mock access token. Auth API call skipped.");

  // Returning a dummy token string
  return "mock-access-token-123";
}
