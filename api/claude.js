export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key ontbreekt in Vercel omgeving' });

  // Beperk max_tokens om timeout te voorkomen
  const body = { ...req.body, max_tokens: Math.min(req.body.max_tokens || 2000, 2000) };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    
    const text = await response.text();
    
    // Probeer te parsen als JSON
    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      // Als het geen JSON is, stuur de ruwe tekst terug als error
      res.status(500).json({ error: 'Onverwachte response van Anthropic', raw: text.substring(0, 500) });
    }
  } catch (err) {
    res.status(500).json({ error: 'Fetch fout: ' + err.message });
  }
}
