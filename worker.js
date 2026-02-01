// Cloudflare Worker - ElevenLabs TTS Proxy
// Deploy: npx wrangler deploy

const ELEVEN_API_KEY = 'sk_c4b9ed81e88c515822504d79339b36d39becdcd7b9cc1975';
const ELEVEN_VOICE_ID = 'bIHbv24MWmeRgasZH58o'; // Will - Relaxed Optimist

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { text } = await request.json();
      
      if (!text || text.length > 500) {
        return new Response('Invalid text', { status: 400 });
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVEN_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return new Response(error, { 
          status: response.status,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      const audioBuffer = await response.arrayBuffer();
      
      return new Response(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response('Server error: ' + error.message, { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  },
};
