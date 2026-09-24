// ==========================================
// PROJECT ANDROMEDA — AI BRAIN FINAL FIX
// Direct • Simple • Works on iPhone/iPad
// ==========================================

export const AI = {
  baseUrl: "https://api.groq.com/openai/v1",
  model: "llama-3.1-8b-instant",
  apiKey: null,
  memory: [],

  init() {
    const saved = localStorage.getItem("andromeda_key");
    if (saved) {
      this.apiKey = saved;
      this.updateStatus("CONNECTED ✅");
    }
  },

  setKey(key) {
    if (!key || !key.startsWith("gsk_")) {
      return { ok: false, error: "Key must start with gsk_" };
    }
    this.apiKey = key.trim();
    localStorage.setItem("andromeda_key", this.apiKey);
    this.updateStatus("CONNECTED ✅");
    return { ok: true };
  },

  updateStatus(text) {
    const el = document.getElementById("status-text");
    if (el) el.textContent = text;
  },

  async chat(message) {
    if (!this.apiKey) {
      return { ok: false, error: "🔐 Tap 'Set API Key' first" };
    }

    this.memory.push({ role: "user", content: message });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + this.apiKey
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: "You are Andromeda — warm, friendly, concise, speak naturally." },
            ...this.memory.slice(-8)
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("GROQ ERROR", response.status, errorText);
        return { 
          ok: false, 
          error: `Groq Error ${response.status} — check key at console.groq.com/keys` 
        };
      }

      const data = await response.json();
      const reply = data.choices[0].message.content.trim();
      this.memory.push({ role: "assistant", content: reply });
      return { ok: true, reply };

    } catch (err) {
      console.log("FETCH FAILED:", err);
      return { ok: false, error: `Cannot connect: ${err.message}` };
    }
  }
};

// ========== UI CONNECTIONS ==========
document.addEventListener("DOMContentLoaded", () => {
  AI.init();

  const chatBox = document.getElementById("chat-container");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const settingsToggle = document.getElementById("open-settings");
  const settingsPanel = document.getElementById("settings-panel");
  const keyInput = document.getElementById("groq-key-input");
  const saveBtn = document.getElementById("save-settings");

  function addMessage(text, type = "ai") {
    const div = document.createElement("div");
    div.className = `message ${type}`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Settings panel
  settingsToggle?.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
  });

  saveBtn?.addEventListener("click", () => {
    const result = AI.setKey(keyInput.value.trim());
    if (result.ok) {
      addMessage("✅ Key saved! Let's chat — say hello!", "system");
      settingsPanel.classList.remove("open");
      keyInput.value = "";
    } else {
      addMessage(`❌ ${result.error}`, "system");
    }
  });

  // Send message
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const result = await AI.chat(text);
    
    if (result.ok) {
      addMessage(result.reply, "ai");
      if (window.speakText) window.speakText(result.reply);
    } else {
      addMessage(`⚠️ ${result.error}`, "system");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
