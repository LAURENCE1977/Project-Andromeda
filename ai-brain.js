// ==========================================
// PROJECT ANDROMEDA — AI BRAIN CORE
// Free forever • No secrets in repo • v2.0
// ==========================================

export const AI = {
  config: {
    provider: null,
    apiKey: null,
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    maxTokens: 2048,
    memory: []
  },

  init() {
    const savedKey = localStorage.getItem("andromeda_groq_key");
    if (savedKey) {
      this.config.apiKey = savedKey;
      this.config.provider = "groq";
      this.updateStatus("CONNECTED ✅");
    }
    this.loadMemory();
  },

  setKey(key) {
    if (!key || !key.startsWith("gsk_")) {
      return { ok: false, error: "Invalid key format — must start with gsk_" };
    }
    this.config.apiKey = key.trim();
    this.config.provider = "groq";
    localStorage.setItem("andromeda_groq_key", this.config.apiKey);
    this.updateStatus("CONNECTED ✅");
    return { ok: true };
  },

  clearKey() {
    localStorage.removeItem("andromeda_groq_key");
    this.config.apiKey = null;
    this.config.provider = null;
    this.updateStatus("OFFLINE");
  },

  updateStatus(text) {
    const el = document.getElementById("status-text");
    if (el) el.textContent = text;
  },

  async sendMessage(userText) {
    if (!this.config.apiKey) {
      return {
        ok: false,
        error: "🔐 Please set your Groq API key first — tap ⚙️ above"
      };
    }

    this.addToMemory("user", userText);

    const messages = [
      { role: "system", content: "You are Andromeda — warm, helpful, concise, friendly. Speak naturally." },
      ...this.config.memory.slice(-10)
    ];

    try {
      const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          ok: false,
          error: `API Error ${res.status} — ${err.error?.message || "Check your key"}`
        };
      }

      const data = await res.json();
      const reply = data.choices[0].message.content.trim();
      this.addToMemory("assistant", reply);
      return { ok: true, reply };

    } catch (err) {
      return { ok: false, error: `Network error: ${err.message}` };
    }
  },

  addToMemory(role, content) {
    this.config.memory.push({ role, content });
    this.saveMemory();
  },

  saveMemory() {
    localStorage.setItem("andromeda_memory", JSON.stringify(this.config.memory));
  },

  loadMemory() {
    const saved = localStorage.getItem("andromeda_memory");
    if (saved) {
      try { this.config.memory = JSON.parse(saved); }
      catch { this.config.memory = []; }
    }
  },

  clearMemory() {
    this.config.memory = [];
    localStorage.removeItem("andromeda_memory");
  }
};

// UI BINDINGS
document.addEventListener("DOMContentLoaded", () => {
  AI.init();

  const chat = document.getElementById("chat-container");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const openSettings = document.getElementById("open-settings");
  const settingsPanel = document.getElementById("settings-panel");
  const keyInput = document.getElementById("groq-key-input");
  const saveBtn = document.getElementById("save-settings");

  function addMessage(text, type = "ai") {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  openSettings?.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
  });

  saveBtn?.addEventListener("click", () => {
    const result = AI.setKey(keyInput.value.trim());
    if (result.ok) {
      addMessage("✅ Key saved! Ready to chat — ask me anything!", "system");
      settingsPanel.classList.remove("open");
      keyInput.value = "";
    } else {
      addMessage(`❌ ${result.error}`, "system");
    }
  });

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, "user");
    input.value = "";
    
    const result = await AI.sendMessage(text);
    
    if (result.ok) {
      addMessage(result.reply, "ai");
      // Trigger voice
      window.speakText?.(result.reply);
    } else {
      addMessage(`⚠️ ${result.error}`, "system");
    }
  }

  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
});
