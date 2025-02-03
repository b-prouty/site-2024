// pages/api/ask.js
import { OpenAI } from 'openai';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  const filePath = path.join(process.cwd(), 'api', 'brian_data.json');
  const brianData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
          content: `You are an assistant who only answers questions based on the following data about Brian: ${JSON.stringify(brianData, null, 2)}`
        },
        { role: 'user', content: question },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const answer = response.choices[0].message.content;
    return res.status(200).json({ answer });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'OpenAI API error.' });
  }
}