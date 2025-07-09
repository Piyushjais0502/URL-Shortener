import "./App.css";
import { useState } from "react";

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
    setLoading(true);
    try {
      const body = { url: longURL };
      if (customCode.trim()) body.shortcode = customCode.trim();
      if (validity.trim()) body.validity = parseInt(validity, 10);
      const res = await fetch("http://localhost:3000/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setShortURL(data.shortUrl);
        setSuccess("URL shortened successfully!");
        setExpiresAt(data.expiresAt);
      } else {
        setError(data.error || "Error shortening URL. Please try again.");
      }
    } catch (error) {
      setError("Error shortening URL. Please try again.");
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

  return (
    <div className="app-bg">
      <div className="shortener-card">
        <h1>URL Shortener</h1>
        <form className="shortener-form" onSubmit={e => { e.preventDefault(); handleShorten(); }}>
          <label htmlFor="long-url">Long URL</label>
          <input
            id="long-url"
            type="text"
            placeholder="Enter URL to shorten"
            value={longURL}
            onChange={(e) => setLongURL(e.target.value)}
            autoComplete="off"
          />
          <label htmlFor="custom-code">Custom Shortcode <span style={{color:'#94a3b8', fontWeight:400}}>(optional)</span></label>
          <input
            id="custom-code"
            type="text"
            placeholder="e.g. mycode123"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            maxLength={32}
            autoComplete="off"
          />
          <label htmlFor="validity">Validity (minutes) <span style={{color:'#94a3b8', fontWeight:400}}>(optional)</span></label>
          <input
            id="validity"
            type="number"
            min="1"
            placeholder="Default: 30"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Shorten URL"}
          </button>
        </form>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        {shortURL && (
          <div className="result-section">
            <h2 style={{fontSize:'1.1rem',margin:'0 0 0.2rem 0',fontWeight:500}}>Shortened URL:</h2>
            <div className="short-url-row">
              <a href={shortURL} target="_blank" rel="noopener noreferrer">
                {shortURL}
              </a>
              <button className="copy-btn" onClick={handleCopy} aria-label={copied ? "Copied!" : "Copy"}>
                {copied ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 10.5L9 14.5L15 7.5" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="6" width="9" height="9" rx="2" stroke="#111827" strokeWidth="1.7"/>
                    <rect x="3" y="3" width="9" height="9" rx="2" stroke="#a0aec0" strokeWidth="1.3"/>
                  </svg>
                )}
              </button>
            </div>
            {expiresAt && (
              <div className="expiry-info">
                Expires at: {new Date(expiresAt).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;