import "./App.css";
import { useState, useEffect } from "react";
import { shortenUrl, checkApiHealth } from "./config/api.js";

function App() {
  const [longURL, setLongURL] = useState("");
  const [shortURL, setShortURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [validity, setValidity] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [recentUrls, setRecentUrls] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');
  const [darkMode, setDarkMode] = useState(() => {
    // Prefer system dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    // Or saved preference
    return localStorage.getItem('darkMode') === 'true';
  });

  // Typing animation effect
  useEffect(() => {
    if (longURL) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [longURL]);

  // Load recent URLs and check API health on component mount
  useEffect(() => {
    const saved = localStorage.getItem('recentUrls');
    if (saved) {
      setRecentUrls(JSON.parse(saved));
    }
    
    // Check API health
    checkApiHealth().then(health => {
      if (health) {
        setApiStatus('healthy');
        console.log('API is healthy:', health);
      } else {
        setApiStatus('unavailable');
        console.warn('API is unavailable');
      }
    });
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const validateURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    setError("");
    setSuccess("");
    setShortURL("");
    setCopied(false);
    setExpiresAt(null);
    
    if (!longURL) {
      setError("Please enter a URL to shorten.");
      return;
    }

    if (!validateURL(longURL)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setLoading(true);
    try {
      const data = await shortenUrl(longURL, customCode, validity);
      
      setShortURL(data.shortUrl);
      setSuccess("URL shortened successfully! ✨");
      setExpiresAt(data.expiresAt);
      
      // Save to recent URLs
      const newUrl = {
        original: longURL,
        shortened: data.shortUrl,
        timestamp: new Date().toISOString()
      };
      const updated = [newUrl, ...recentUrls.slice(0, 4)];
      setRecentUrls(updated);
      localStorage.setItem('recentUrls', JSON.stringify(updated));
      
    } catch (error) {
      console.error('Shortening error:', error);
      
      // Better error handling
      if (error.message.includes('fetch')) {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else if (error.message.includes('CORS')) {
        setError("Connection blocked. Please check server configuration.");
      } else {
        setError(error.message || "Error shortening URL. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shortURL) {
      navigator.clipboard.writeText(shortURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    // Add a subtle animation class
    e.target.classList.add('input-active');
    setTimeout(() => e.target.classList.remove('input-active'), 200);
  };

  const clearHistory = () => {
    setRecentUrls([]);
    localStorage.removeItem('recentUrls');
  };

  const handleToggleDark = () => setDarkMode((d) => !d);

  return (
    <div className={`app-container${darkMode ? ' dark' : ''}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <img src="https://cdn.iconscout.com/icon/premium/png-512-thumb/url-33-965674.png?f=webp&w=512" alt="URL Shortener Logo" className="logo-img" />
            <span>URL SHORTENER</span>
          </div>
          <button className="dark-toggle" onClick={handleToggleDark} aria-label="Toggle light/dark mode">
            {darkMode ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="#6366f1" strokeWidth="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="app-bg">
        <div className="shortener-card">
          <h1>Shorten Your URLs</h1>
          <p className="subtitle">Create short, memorable links in seconds</p>
          
          {/* API Status Indicator */}
          {apiStatus === 'checking' && (
            <div className="api-status checking">
              <span className="status-dot"></span>
              Connecting to server...
            </div>
          )}
          {apiStatus === 'healthy' && (
            <div className="api-status healthy">
              <span className="status-dot"></span>
              Server connected
            </div>
          )}
          {apiStatus === 'unavailable' && (
            <div className="api-status unavailable">
              <span className="status-dot"></span>
              Server unavailable - Please start the backend
            </div>
          )}
          
          <form className="shortener-form" onSubmit={e => { e.preventDefault(); handleShorten(); }}>
            <label htmlFor="long-url">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Long URL
            </label>
            <input
              id="long-url"
              type="text"
              placeholder="https://example.com/very-long-url-that-needs-shortening"
              value={longURL}
              onChange={(e) => handleInputChange(e, setLongURL)}
              autoComplete="off"
              className={isTyping ? 'typing' : ''}
            />
            <label htmlFor="custom-code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Custom Shortcode <span>(optional)</span>
            </label>
            <input
              id="custom-code"
              type="text"
              placeholder="e.g. mycode123"
              value={customCode}
              onChange={(e) => handleInputChange(e, setCustomCode)}
              maxLength={32}
              autoComplete="off"
            />
            <label htmlFor="validity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Validity (minutes) <span>(optional)</span>
            </label>
            <input
              id="validity"
              type="number"
              min="1"
              placeholder="Leave empty for no expiration"
              value={validity}
              onChange={(e) => handleInputChange(e, setValidity)}
              autoComplete="off"
            />
            <button 
              type="submit" 
              disabled={loading}
              className={loading ? 'loading' : ''}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Shortening...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Shorten URL
                </>
              )}
            </button>
          </form>
          
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          
          {shortURL && (
            <div className="result-section">
              <h2>Shortened URL:</h2>
              <div className="short-url-row">
                <a href={shortURL} target="_blank" rel="noopener noreferrer">
                  {shortURL}
                </a>
                <button 
                  className={`copy-btn ${copied ? 'copied' : ''}`} 
                  onClick={handleCopy} 
                  aria-label={copied ? "Copied!" : "Copy"}
                >
                  {copied ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polyline points="20,6 9,17 4,12" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="expiry-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {expiresAt ? `Expires at: ${new Date(expiresAt).toLocaleString()}` : 'No expiration - Link is permanent'}
              </div>
            </div>
          )}

          {/* Recent URLs Section */}
          {recentUrls.length > 0 && (
            <div className="recent-section">
              <div className="recent-header">
                <h3>Recent URLs</h3>
                <button onClick={clearHistory} className="clear-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Clear
                </button>
              </div>
              <div className="recent-list">
                {recentUrls.map((url, index) => (
                  <div key={index} className="recent-item">
                    <div className="recent-original">
                      <span className="recent-label">Original:</span>
                      <span className="recent-url">{url.original}</span>
                    </div>
                    <div className="recent-shortened">
                      <span className="recent-label">Shortened:</span>
                      <a href={url.shortened} target="_blank" rel="noopener noreferrer" className="recent-url">
                        {url.shortened}
                      </a>
                    </div>
                    <div className="recent-time">
                      {new Date(url.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Custom shortcodes</li>
              <li>Expiration dates</li>
              <li>Analytics tracking</li>
              <li>QR code generation</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#api">API Documentation</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; URL Shortener.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;