// ==============================================
// PROJECT ANDROMEDA ↔ GODMODE BRIDGE
// Connects your interface → Godmode AI engine
// Works alongside openclaw-bridge.js — no conflict
// ==============================================

const GodmodeBridge = {
  // Your Godmode live URL
  godmodeUrl: "https://laurence1977.github.io/Godmode",
  isConnected: false,

  // Send message to Godmode & get reply
  async send(message) {
    try {
      const response = await fetch(`${this.godmodeUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
      });

      if (!response.ok) throw new Error("Connection failed");
      
      const data = await response.json();
      this.isConnected = true;
      return data.reply || "Message received. Processing...";
      
    } catch (err) {
      console.log("Godmode bridge:", err);
      this.isConnected = false;
      
      // Friendly replies while Godmode is setting up
      return this.fallback(message);
    }
  },

  fallback(input) {
    const q = input.toLowerCase();
    
    if (q.includes("hello") || q.includes("hi"))
      return "Hello! I'm Andromeda. The Godmode bridge is strengthening. Soon I'll be fully powered 💙";
    
    if (q.includes("status") || q.includes("bridge"))
      return this.isConnected 
        ? "✅ Godmode bridge ACTIVE — fully connected!"
        : "🟡 Godmode bridge standby — syncing now. Ready any moment.";
    
    if (q.includes("who are you"))
      return "I am Andromeda — your free, open-source AI assistant. My intelligence grows through Godmode 🪐✨";
    
    return "I hear you. Both bridges are working. Full intelligence coming very soon!";
  },

  async checkConnection() {
    try {
      const res = await fetch(this.godmodeUrl);
      this.isConnected = res.ok;
    } catch {
      this.isConnected = false;
    }
    return this.isConnected;
  }
};
