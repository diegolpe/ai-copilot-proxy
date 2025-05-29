const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get('/', (req, res) => {
  res.send('🛩️ Pilot Copilot AI backend is live!');
});

app.post('/ask', async (req, res) => {
  const { origin, destination, aircraft, vx, vy, va } = req.body;

  if (!origin || !destination || !aircraft) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const message = `
You're an AI flight assistant. Given:
- Aircraft: ${aircraft}
- Origin: ${origin}
- Destination: ${destination}
- Custom Speeds (if any): Vx=${vx || 'N/A'}, Vy=${vy || 'N/A'}, Va=${va || 'N/A'}

Provide:
- A suggested route
- Current METAR (simulated)
- Takeoff and landing distances
- Fuel burn per waypoint
- Recommended alternates
- Places to stop (cheap fuel, museums, restaurants)
- Go/no-go recommendation
- Waypoint breakdown
`;

  try {
    const aiResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = aiResponse.data.choices[0].message.content;
    res.json({ flightPlan: reply });
  } catch (error) {
    console.error('OpenAI Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get flight plan.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Pilot Copilot AI server running on port ${port}`);
});
