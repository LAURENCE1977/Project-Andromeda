// ==========================================
// ANDROMEDA — DIAGNOSTIC VERSION
// Tells us EXACTLY what's wrong
// ==========================================

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

let API_KEY = localStorage.getItem("andromeda_key") || "";
let memory = [];

function setStatus(text) {
  const el = document.getElementById("status-text");
  if (el) el.textContent = text;
}

function addMessage(text, type = "ai") {
  const chat = document.getElementById("chat-container");
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function saveKey(key) {
  key = key.trim();
  if (!key.startsWith("gsk_")) {
    return "❌ Must start with gsk_";
  }
  API_KEY = key;
  localStorage.setItem("andromeda_key", API_KEY);
  setStatus("CONNECTED ✅");
  return "✅ Key saved — ready!";
}

async function sendMessage(text) {
  if (!API_KEY) return { error: "Set key first ⚙️" };
  
  memory.push({ role: "user", content: text });

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are Andromeda — warm, friendly, concise." },
          ...memory.slice(-6)
        ]
      })
    });

    console.log("STATUS:", res.status);

    if (res.status === 401) {
      return { error: "❌ Key rejected — revoked or wrong" };
    }
    if (res.status === 403) {
      return { error: "🚫 Blocked — Groq account issue" };
    }
    if (res.status === 429) {
      return { error: "⏳ Too many requests — wait a minute" };
    }
    if (!res.ok) {
      return { error: `⚠️ Groq error: ${res.status}` };
    }

    const data = await res.json();
    const reply = data.choices[0].message.content.trim();
    memory.push({ role: "assistant", content: reply });
    return { ok: true, reply };

  } catch (err) {
    console.log("BLOCKED:", err);
    return { error: "🔒 Browser blocked connection — try Safari instead" };
  }
}

// ========== UI ==========
document.addEventListener("DOMContentLoaded", () => {
  if (API_KEY) setStatus("CONNECTED ✅");

  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const settingsToggle = document.getElementById("open-settings");
  const settingsPanel = document.getElementById("settings-panel");
  const keyInput = document.getElementById("groq-key-input");
  const saveBtn = document.getElementById("save-settings");

  settingsToggle?.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
  });

  saveBtn?.addEventListener("click", async () => {
    const msg = saveKey(keyInput.value);
    addMessage(msg, "system");
    if (msg.startsWith("✅")) {
      settingsPanel.classList.remove("open");
      keyInput.value = "";
    }
  });

  async function doSend() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    
    const result = await sendMessage(text);
    if (result.ok) {
      addMessage(result.reply, "ai");
      if (window.speakText) window.speakText(result.reply);
    } else {
      addMessage(result.error, "system");
    }
  }

  sendBtn.addEventListener("click", doSend);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  });
});
