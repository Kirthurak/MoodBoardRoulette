import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Sentiment from 'sentiment';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(bodyParser.json()); 

const sentiment = new Sentiment();

const moodPrompts = {
  positive: 'a vibrant sunny field with wildflowers and butterflies, warm joyful colors',
  negative: 'a rainy city street at night, neon reflections, moody and introspective',
  neutral: 'a minimalist workspace with coffee and books, calm and focused vibe',
};

// Image generation using DeepAI (free with API key)
const DEEP_AI_API_KEY = 'fbe5d389-e68f-44ca-8d50-4036f1fe333f'; // <- get it from https://deepai.org/

app.post('/analyze', async (req, res) => {
  const { text } = req.body;
  const result = sentiment.analyze(text);

  const moodType = result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral';
  const imagePrompt = moodPrompts[moodType];

  try {
    const response = await fetch('https://api.deepai.org/api/text2img', {
      method: 'POST',
      headers: {
        'Api-Key': DEEP_AI_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ text: imagePrompt }),
    });

    const imageData = await response.json();

    res.json({
      result: {
        type: moodType,
        polarity: result.comparative,
        image: imageData.output_url,
        prompt: imagePrompt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate image.' });
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
