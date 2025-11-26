export default async function handler(req, res) {
  try {
    // Só aceita POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Recebe o prompt e opções da Lazy
    const { prompt, options } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Chama a OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // sem $ aqui, só concatenação normal:
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: (options && options.model) || "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: (options && options.max_tokens) || 500,
        temperature: (options && options.temperature) != null
          ? options.temperature
          : 0.7
      })
    });

    const data = await response.json();
    const text =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content
        : "Erro na resposta da OpenAI";

    return res.status(200).json({ text, raw: data });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
