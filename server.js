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
const brianDataPath = path.join(process.cwd(), 'site-2024', 'pages', 'api', 'brian_data.json');
let brianData;
try {
    brianData = JSON.parse(fs.readFileSync(brianDataPath, 'utf-8'));
} catch (error) {
    console.error('Error loading brian_data.json:', error);
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

