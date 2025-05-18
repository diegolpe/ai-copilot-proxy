const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ✅ HOME ROUTE: Shows basic status for public access
app.get('/', (req, res) => {
  res.send('🛩️ AI Copilot Proxy is live');
});

// ✅ AI Copilot route
app.post('/ask', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  // Simulated AI response (can replace with real OpenAI later)
  const reply = `🧠 Copilot AI response to: "${message}"\n\n- Suggested route\n- Fuel tips\n- Weather alerts\n- Checklist ready`;

  res.json({ reply });
});

// ✅ METAR proxy route
app.get('/metar', async (req, res) => {
  const { icao, format = 'decoded' } = req.query;
  if (!icao) return res.status(400).send('Missing ICAO code');

  try {
    const weatherRes = await fetch(`https://aviationweather.gov/api/data/metar.php?ids=${icao}&format=${format}`);
    const text = await weatherRes.text();
    res.send(text);
  } catch (err) {
    console.error('Weather fetch failed:', err);
    res.status(500).send('Weather fetch failed');
  }
});

app.listen(port, () => {
  console.log(`✅ AI Copilot Proxy running on port ${port}`);
});