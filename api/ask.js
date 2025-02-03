// pages/api/ask.js
import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4'
      messages: [
        { role: 'system', content: `You are an assistant who only answers questions based on the following data about Brian: ${JSON.stringify(brianData, null, 2)}` },
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