const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const aircraftProfiles = {
  'Cessna 172': { vx: '62 KIAS', vy: '74 KIAS', va: '90 KIAS', gph: 8, takeoff: 865, landing: 520 },
  'Piper PA-28': { vx: '63 KIAS', vy: '79 KIAS', va: '96 KIAS', gph: 9, takeoff: 1040, landing: 600 },
  'Diamond DA40': { vx: '66 KIAS', vy: '78 KIAS', va: '108 KIAS', gph: 8.5, takeoff: 870, landing: 580 },
  'Cirrus SR22': { vx: '83 KIAS', vy: '96 KIAS', va: '118 KIAS', gph: 13, takeoff: 1500, landing: 1050 },
};

app.get('/', (req, res) => {
  res.send('🛩️ Pilot Copilot AI backend is live!');
});

app.post('/ask', async (req, res) => {
  const { origin, destination, aircraft, customSpeeds = {} } = req.body;

  if (!origin || !destination || !aircraft) {
    return res.status(400).json({ error: 'Missing origin, destination, or aircraft' });
  }

  const baseProfile = aircraftProfiles[aircraft] || {
    vx: 'Unknown', vy: 'Unknown', va: 'Unknown', gph: 10, takeoff: 1000, landing: 800
  };

  const profile = {
    vx: customSpeeds.vx || baseProfile.vx,
    vy: customSpeeds.vy || baseProfile.vy,
    va: customSpeeds.va || baseProfile.va,
    gph: customSpeeds.gph || baseProfile.gph,
    takeoff: customSpeeds.takeoff || baseProfile.takeoff,
    landing: customSpeeds.landing || baseProfile.landing,
  };

  let metarData = 'Unavailable';
  const metarUrl = `https://aviationweather.gov/api/data/metar?ids=${origin},${destination}&format=json`;

  try {
    const metarRes = await fetch(metarUrl);
    metarData = await metarRes.text();
  } catch (err) {
    console.error('METAR fetch failed:', err.message);
  }

  const prompt = `
You are planning a VFR flight from ${origin} to ${destination} in a ${aircraft}.

Use the following aircraft performance:
- Vx: ${profile.vx}
- Vy: ${profile.vy}
- Va: ${profile.va}
- Fuel Burn: ${profile.gph} GPH
- Takeoff Distance: ${profile.takeoff} ft
- Landing Distance: ${profile.landing} ft

Include:
- Suggested VFR route
- Live METAR summary (see below)
- Fuel estimate
- Performance summary
- Alternate airport
- Notable landmarks near destination

METAR Data:
${metarData}
`;

  try {
    const aiResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const flightPlan = aiResponse.data.choices[0].message.content;
    res.json({ flightPlan });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'AI failed to generate flight plan' });
  }
});

app.listen(port, () => {
  console.log(`✅ Pilot Copilot AI server running on port ${port}`);
});
