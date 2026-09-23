// PROJECT ANDROMEDA — AI BRAIN
// Groq = unlimited free, no cut-off

window.AndromedaAI = {
  KEYS: {
    GROQ: "PASTE-YOUR-GROQ-KEY-HERE"
  },

  async chat(message) {
    if (!this.KEYS.GROQ || this.KEYS.GROQ.includes("PASTE")) {
      return "System ready. Add your Groq key to connect.";
    }

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.KEYS.GROQ}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: message }],
          temperature: 0.7
        })
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      return data.choices[0].message.content;

    } catch (err) {
      return "Connection busy — try again in a moment.";
    }
  }
};
