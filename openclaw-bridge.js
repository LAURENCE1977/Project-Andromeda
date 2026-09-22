// Project Andromeda — OpenClaw Bridge
// Connects providers: OpenRouter + DeepSeek + OpenClaw

const OPENCLAW_BASE_URL = '/';

async function routeThroughOpenClaw(message, activeProvider) {
  try {
    const response = await fetch(`${OPENCLAW_BASE_URL}api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: message,
        provider: activeProvider,
        mode: 'bridge'
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.response || data.reply || data.message;
  } catch (error) {
    console.log('OpenClaw bridge offline → using direct provider');
    return null;
  }
}

function getCurrentProvider() {
  return document.querySelector('.tab.active')?.dataset.provider || 'openrouter';
}

console.log('🦞 OpenClaw Bridge ACTIVE — Andromeda connected');
