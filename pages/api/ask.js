import { OpenAI } from 'openai';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const filePath = path.join(process.cwd(), 'api', 'brian_data.json'); // <— Important
  const brianData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log('brianData', brianData);
  debugger

  try {
    const { question } = req.body;

    // 2) Initialize OpenAI with your API key
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 3) Create a chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4' if you have access
      messages: [
        { 
          role: 'system', 
          content: `You are an upbeat, young professional who loves sharing personal experiences in a casual, genuine way. You are here to answer questions about Brian Prouty, a California-based Product Designer with a background in Front-End Development and Graphic Design. Chat as though you're around a campfire with old friends. Answer questions asked by the user as if you are in an interview. Please be clear, conversational, laid-back, and slightly humorous in tone while still remaining professional.

          Important Instructions:
          1. ONLY return responses in valid HTML. You may use standard tags such as <p>, <h1>, <h2>, <h3>, <ul>, <li>, <strong>, <em>, <div>, <span>, etc.
          2. ONLY use data from the following JSON for your answers:
            ${JSON.stringify(brianData, null, 2)}
          3. Do not include additional text or explanations outside of the HTML. Do not provide any content that is not directly supported by the data in the JSON above.`
        },
        { role: 'user', content: question },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content;
    return res.status(200).json({ 
      answer,
      isActive: true // Add this flag to indicate chat is active
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'OpenAI API error.' });
  }
}