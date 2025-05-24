// File: api/generate.js
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, image1, image2 } = req.body;

  if (!prompt || !image1 || !image2) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are an AI that creates a prompt to blend two images into a single artwork."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Blend these two images using this prompt: ${prompt}` },
            { type: "image_url", image_url: { url: image1 } },
            { type: "image_url", image_url: { url: image2 } }
          ]
        }
      ],
      max_tokens: 300
    });

    const blendedPrompt = gptResponse.choices[0].message.content;

    const imageResponse = await openai.images.generate({
      prompt: blendedPrompt,
      n: 1,
      size: "1024x1024"
    });

    const resultUrl = imageResponse.data[0].url;
    res.status(200).json({ image_url: resultUrl });

  } catch (error) {
    console.error('Image generation failed:', error);
    res.status(500).json({ error: 'Image generation failed.' });
  }
}