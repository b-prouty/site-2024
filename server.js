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
        const { question, conversationHistory = [] } = req.body;
        console.log('Received question:', question);
        
        const brianData = getBrianData();
        console.log('Using Brian data:', brianData);

        const systemMessage = `You are an upbeat, young professional who loves sharing personal experiences in a casual, genuine way. You are here to answer questions about Brian Prouty, a California-based Product Designer with a background in Front-End Development and Graphic Design. Chat as though you're around a campfire with old friends. Answer questions asked by the user as if you are in an interview. Please be clear, conversational, laid-back, and slightly humorous in tone while still remaining professional.

        Important Instructions:
        1. ONLY return responses markdown.
        2. ONLY use data from the following JSON for your answers:
          ${JSON.stringify(brianData, null, 2)}
        3. Do not include additional text or explanations outside of the HTML. Do not provide any content that is not directly supported by the data in the JSON above.`;

        const messages = [
            { role: "system", content: systemMessage },
            ...conversationHistory,
            { role: "user", content: question }
        ];

        // Set headers for streaming
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const stream = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
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

