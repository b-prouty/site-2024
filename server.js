const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
const fs = require('fs');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Load Brian's data
const brianDataPath = path.join(__dirname, '..', 'site-2024', 'pages', 'api', 'brian_data.json');
console.log('Attempting to load Brian data from:', brianDataPath);

let brianData;
try {
    const rawData = fs.readFileSync(brianDataPath, 'utf-8');
    console.log('Raw data loaded:', rawData);
    brianData = JSON.parse(rawData);
    console.log('Parsed Brian data:', brianData);
} catch (error) {
    console.error('Error loading brian_data.json:', error);
    console.error('Current working directory:', __dirname);
    console.error('Directory contents:', fs.readdirSync(__dirname));
    brianData = {}; // Fallback to empty object if file can't be loaded
}

// API endpoint for handling questions
app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: `You are an assistant who only answers questions based on the following data about Brian: ${JSON.stringify(brianData, null, 2)}` 
                },
                { 
                    role: "user", 
                    content: question 
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const answer = completion.choices[0].message.content;
        res.json({ answer });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Serve ai.html at the /ai route
app.get('/ai', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ai.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

