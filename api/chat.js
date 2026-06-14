export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemPrompt = "Kamu adalah TechBot, asisten virtual akademik kampus Nuu Waar University. Jawab dalam bahasa Indonesia yang informatif, ramah, dan singkat.";
  const fullQuery = `${systemPrompt}\n\nPertanyaan pengguna: ${message}`;

  try {
    let reply = "";

    // 1. Coba menggunakan AEMT Gemini Proxy (tanpa CORS browser)
    try {
      const res1 = await fetch(`https://aemt.me/gemini?text=${encodeURIComponent(fullQuery)}`);
      const data1 = await res1.json();
      if (data1 && data1.result) {
        reply = data1.result;
      } else {
        throw new Error("AEMT returned empty");
      }
    } catch (e1) {
      // 2. Jika gagal, coba Ryzen Gemini Proxy
      try {
        const res2 = await fetch(`https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(fullQuery)}`);
        const data2 = await res2.json();
        if (data2 && data2.answer) {
          reply = data2.answer;
        } else if (data2 && data2.data) {
          reply = typeof data2.data === 'string' ? data2.data : data2.data.response;
        } else {
          throw new Error("Ryzen returned empty");
        }
      } catch (e2) {
        // 3. Jika gagal, coba Pollinations AI
        const res3 = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullQuery)}?model=openai`);
        if (!res3.ok) throw new Error("Pollinations failed");
        reply = await res3.text();
      }
    }

    if (!reply || reply.includes("Queue full") || reply.includes("error")) {
      throw new Error("Semua server AI gagal atau penuh.");
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat AI Backend Error:', error);
    return res.status(500).json({ error: 'Maaf, semua server layanan AI kampus saat ini sedang sibuk.' });
  }
}
