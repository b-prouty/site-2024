const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Function to fetch Brian's data
async function getBrianData() {
    try {
        // First try to read from the API endpoint
        const response = await fetch('https://staging.brianprouty.com/api/brian_data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Successfully loaded Brian data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching Brian data:', error);
        try {
            // Fallback to direct file read if API fails
            const fs = require('fs');
            const path = require('path');
            const dataPath = path.join(process.cwd(), 'site-2024', 'pages', 'api', 'brian_data.json');
            const rawData = fs.readFileSync(dataPath, 'utf8');
            const data = JSON.parse(rawData);
            console.log('Successfully loaded Brian data from file:', data);
            return data;
        } catch (fallbackError) {
            console.error('Error reading local file:', fallbackError);
            return {};
        }
    }
}

// API endpoint for handling questions
app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        console.log('Received question:', question);
        
        // Fetch fresh data for each request
        const brianData = await getBrianData();
        console.log('Using Brian data:', brianData);
        
        const systemPrompt = `You are an assistant who only answers questions based on the following data about Brian: ${JSON.stringify(brianData, null, 2)}. 
        If the question cannot be answered using this data, please respond with "I don't have that information about Brian."`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: systemPrompt
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
        console.log('Generated answer:', answer);
        res.json({ answer });
        
    } catch (error) {
        console.error('Error in /ask endpoint:', error);
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
    // Test the data loading on startup
    getBrianData().then(data => {
        console.log('Initial Brian data load:', data);
    });
});

