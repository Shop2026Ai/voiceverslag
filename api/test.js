export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // Test 1: API key aanwezig?
  if (!apiKey) {
    return res.status(200).json({ 
      status: 'FAIL', 
      stap: 1, 
      fout: 'Geen API key in environment variables' 
    });
  }
  
  // Test 2: Kan Anthropic bereikt worden?
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'Zeg alleen: OK' }]
      })
    });
    
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) {
      return res.status(200).json({ status: 'FAIL', stap: 2, fout: 'Response geen JSON', raw: text.substring(0, 200) });
    }
    
    if (data.error) {
      return res.status(200).json({ status: 'FAIL', stap: 3, fout: data.error });
    }
    
    const antwoord = data.content?.[0]?.text || '';
    return res.status(200).json({ 
      status: 'OK', 
      antwoord,
      model: data.model,
      tokens: data.usage 
    });
    
  } catch(e) {
    return res.status(200).json({ status: 'FAIL', stap: 2, fout: e.message });
  }
}
