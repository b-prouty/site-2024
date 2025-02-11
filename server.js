const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const fs = require('fs');


const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve static frontend files from 'public' folder

// Log the API key to ensure it's loaded correctly
console.log('API Key:', process.env.OPENAI_API_KEY);

//debugs
console.log('OpenAI instance:', openai);
console.log('API Key:', process.env.OPENAI_API_KEY);


// Load Brian's data
const brianData = JSON.parse(fs.readFileSync('./brian_data.json', 'utf-8'));

// Endpoint to handle user questions
app.post('/ask', async (req, res) => {
  const { question } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are an assistant who only answers questions based on the following data about Brian: ${JSON.stringify(brianData, null, 2)}` },
        { role: 'user', content: question },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    res.json({ answer: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).json({ error: 'Something went wrong with the OpenAI API.' });
  }
});

// Serve ai.html at the /ai route
app.get('/ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ai.html'));
});

// Start the server
const PORT = process.env.PORT || 5001; // Use a different port
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

