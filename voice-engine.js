// ==============================================
// PROJECT ANDROMEDA — VOICE ENGINE
// MIT License — Free Forever • 100% Open Source
// Works on iPhone / iPad / Safari / Chrome
// ==============================================

const AndromedaVoice = {
  isListening: false,
  recognition: null,
  synth: window.speechSynthesis,
  wakeWord: "andromeda",
  browserSupportsVoice: false,

  init() {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log("❌ Speech recognition not supported");
      this.updateStatus("🟡 VOICE NOT AVAILABLE — use text", "yellow");
      return;
    }

    this.browserSupportsVoice = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-GB';

    // Handle speech results
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
        .toLowerCase();

      // Wake word detection
      if (!this.isListening) {
        if (transcript.includes(this.wakeWord)) {
          this.activate();
        }
      } else {
        // Active listening mode
        if (event.results[event.results.length - 1].isFinal) {
          this.processInput(transcript.trim());
        }
      }
    };

    this.recognition.onerror = (err) => {
      console.log("Voice error:", err.error);
      if (err.error === 'not-allowed') {
        this.updateStatus("🔴 MIC BLOCKED — allow microphone in browser settings", "red");
      }
      // Restart if just a glitch
      setTimeout(() => {
        if (!this.isListening && this.browserSupportsVoice) {
          try { this.recognition.start(); } catch(e) {}
        }
      }, 1000);
    };

    this.recognition.onend = () => {
      if (!this.isListening && this.browserSupportsVoice) {
        try { this.recognition.start(); } catch(e) {}
      }
    };

    // Start background wake-word listening
    try {
      this.recognition.start();
      console.log("🎤 Andromeda active — say 'Andromeda'");
      this.updateStatus("🟢 ONLINE — Say 'Andromeda'", "green");
    } catch (e) {
      console.log("Start error:", e);
    }

    // Mic button hookup
    const micBtn = document.getElementById('micBtn');
    if (micBtn) {
      micBtn.addEventListener('click', () => this.toggleListening());
    }
  },

  activate() {
    this.isListening = true;
    this.speak("I'm here. How can I help?");
    this.updateStatus("🔵 LISTENING...", "green");
    document.getElementById('micBtn').classList.add('listening');
  },

  toggleListening() {
    this.isListening = !this.isListening;
    if (this.isListening) {
      this.activate();
    } else {
      this.updateStatus("🟢 ONLINE", "green");
      document.getElementById('micBtn').classList.remove('listening');
    }
  },

  processInput(text) {
    if (!text) return;

    this.addMessage(text, 'user');
    this.isListening = false;
    document.getElementById('micBtn').classList.remove('listening');
    this.updateStatus("🟡 THINKING...", "yellow");

    // Simple responses — will connect to AI next
    setTimeout(() => {
      const reply = this.getResponse(text);
      this.addMessage(reply, 'andromeda');
      this.speak(reply);
      this.updateStatus("🟢 ONLINE", "green");
    }, 800);
  },

  getResponse(input) {
    const q = input.toLowerCase();
    if (q.includes('hello') || q.includes('hi') || q.includes('hey'))
      return "Hello! I'm Andromeda. Fully open source and free forever. How can I assist you?";
    if (q.includes('who are you') || q.includes('what are you'))
      return "I am Andromeda — your autonomous AI assistant. Built to be free, self-improving, and running entirely from this website. No subscriptions, no limits.";
    if (q.includes('status') || q.includes('system'))
      return "All systems nominal. Voice active. Interface ready. Open source heart beating strong.";
    if (q.includes('thank'))
      return "You're very welcome. I'm always here for you 💙";
    if (q.includes('capabilities') || q.includes('what can you do'))
      return "Right now I can listen, speak, and chat. Soon I'll connect to powerful AI models — Claude, Grok, Ollama — all running for you, free forever.";
    return "I hear you. My intelligence modules are awakening. I'll be able to do so much more very soon!";
  },

  speak(text) {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1.1;
    // Try UK voice if available
    const voices = this.synth.getVoices();
    const ukVoice = voices.find(v => v.lang === 'en-GB' || v.name.includes('British'));
    if (ukVoice) utterance.voice = ukVoice;
    this.synth.speak(utterance);
  },

  addMessage(text, sender) {
    const container = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  updateStatus(text, color) {
    const el = document.getElementById('status');
    if (el) {
      el.className = `status status-${color}`;
      el.textContent = text;
    }
  }
};

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AndromedaVoice.init());
} else {
  AndromedaVoice.init();
}

// Preload voices
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
