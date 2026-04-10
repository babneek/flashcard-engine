/**
 * Keep-Alive Service for Render Backend
 * Pings the backend every 10 minutes to prevent spin-down
 */

const BACKEND_URL = 'https://flashcard-engine-api-gfzf.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

async function pingBackend() {
  try {
    const startTime = Date.now();
    const response = await fetch(`${BACKEND_URL}/health`);
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      console.log(`✅ [${new Date().toISOString()}] Backend is alive (${duration}ms)`);
    } else {
      console.log(`⚠️ [${new Date().toISOString()}] Backend responded with status ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Failed to ping backend:`, error.message);
  }
}

// Initial ping
console.log('🚀 Keep-Alive Service Started');
console.log(`📡 Pinging ${BACKEND_URL} every 10 minutes`);
pingBackend();

// Set up interval
setInterval(pingBackend, PING_INTERVAL);
