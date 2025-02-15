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

// Function to get Brian's data
function getBrianData() {
    try {
        const dataPath = path.join(__dirname, 'public', 'brian_data.json');
        console.log('Attempting to read from:', dataPath);
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(rawData);
        console.log('Successfully loaded Brian data:', data);
        return data;
    } catch (error) {
        console.error('Error reading brian_data.json:', error);
        console.error('Current directory:', __dirname);
        console.error('Directory contents:', fs.readdirSync(__dirname));
        return {};
    }
}

// API endpoint for handling questions
app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        console.log('Received question:', question);
        
        const brianData = getBrianData();
        console.log('Using Brian data:', brianData);
        
        const systemPrompt = `You are an assistant who only answers questions based on the following data about Brian: ${JSON.stringify(brianData, null, 2)}. 
        If the question cannot be answered using this data, please respond with "I don't have that information about Brian."`;

        // Set headers for streaming
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const stream = await openai.chat.completions.create({
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
            stream: true,
            temperature: 0.7,
            max_tokens: 500
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
        
    } catch (error) {
        console.error('Error in /ask endpoint:', error);
        res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
        res.end();
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
    const initialData = getBrianData();
    console.log('Initial Brian data load:', initialData);
});

