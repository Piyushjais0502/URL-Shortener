export default function handler(req, res) {
  if (req.method === "POST") {
    const { url } = req.body;
    const shortUrl = "https://short.ly/abc123"; // example
    res.status(200).json({ original: url, short: shortUrl });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
