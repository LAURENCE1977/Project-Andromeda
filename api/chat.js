// PROJECT ANDROMEDA — LIVE CONFIG
// Edit ONLY here → all keys stay private

const CONFIG = {
  GROQ: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: "PASTE-YOUR-GROQ-KEY-HERE",
    model: "llama-3.3-70b-versatile"
  },
  OMNI: {
    url: "https://cloud.omniroute.online/v1/chat/completions",
    key: "PASTE-YOUR-OMNI-KEY-HERE",
    model: "auto/best-free"
  },
  OPENROUTER: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    key: "PASTE-YOUR-OR-KEY-HERE",
    model: "stealth/ox-alpha"
  },
  GEMINI: {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    key: "PASTE-YOUR-GEMINI-KEY-HERE",
    model: "gemini-2.0-flash"
  },
  PRIORITY: ["GROQ", "OMNI", "GEMINI", "OPENROUTER"]
};

async function getResponse(userMessage) {
  for (const provider of CONFIG.PRIORITY) {
    const { url, key, model } = CONFIG[provider];
    if (!key || key.includes("PASTE")) continue;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: userMessage }],
          temperature: 0.7
        })
      });

      if (!res.ok) continue;
      const data = await res.json();
      return {
        reply: data.choices?.[0]?.message?.content || data.content || "Working...",
        from: provider
      };
    } catch { continue; }
  }
  return { reply: "Checking connections...", from: "system" };
}

if (typeof module !== "undefined") module.exports = { getResponse, CONFIG };
