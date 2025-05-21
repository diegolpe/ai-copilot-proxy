const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // ✅ This is the correct body parser

app.get('/', (req, res) => {
  res.send('🛩️ Pilot Copilot AI backend is live!');
});

app.post('/ask', async (req, res) => {
  console.log("Request body received:", req.body); // 👀 Should now show the message

  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Missing message' });
  }

  const data = {
    route: "KISP DCT CCC V308 MAD V374 GON",
    departureTime: "14:30 EST",
    weather: "Winds 250° at 12 kt, visibility 10 miles, scattered clouds at 3000 ft.",
    performance: {
      takeoff: "865 ft",
      landing: "520 ft",
      vx: "62 KIAS",
      vy: "74 KIAS",
      va: "90 KIAS"
    },
    fuel: {
      start: "48 gal",
      burn: "8 gal",
      remaining: "40 gal",
      perWaypoint: {
        "CCC": "2 gal",
        "MAD": "3 gal",
        "GON": "3 gal"
      }
    },
    notes: [
      "Alternate: KHVN",
      "Fuel stop: KOXC",
      "Nearby museum: Submarine Force Library & Museum"
    ]
  };

  res.json({ data });
});

app.listen(port, () => {
  console.log(`✅ Pilot Copilot AI server running on port ${port}`);
});
