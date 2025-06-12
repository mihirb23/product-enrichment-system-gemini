
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // Changed from OPENAI_API_KEY

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${prompt}

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{"category": "main_category", "googleCategory": "detailed > hierarchy"}

No additional text, explanations, or markdown formatting.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Gemini API error' });
    }

    const data = await response.json();
    
    // Transform Gemini response to match OpenAI format for compatibility
    const transformedData = {
      choices: [
        {
          message: {
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          }
        }
      ]
    };

    return res.status(200).json(transformedData);

  } catch (error) {
    console.error('Gemini API proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
