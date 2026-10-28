import { send, readBody, methodNotAllowed } from '../lib/http.js';
import { GEMINI_API_KEY } from '../lib/env.js';
import { STUDIO_SYSTEM_PROMPT, generateSmartFallback } from '../lib/studioChat.js';

/**
 * POST /api/chat — Phoenix AI studio assistant.
 *
 * Uses Gemini when GEMINI_API_KEY is set, otherwise answers from the built-in
 * studio knowledge base so the widget always replies (same behaviour as the
 * original Express endpoint).
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const { message, history } = readBody(req);

    if (!message || typeof message !== 'string') {
      send(res, 400, { error: 'Message is required' });
      return;
    }

    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({
          apiKey: GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item?.role === 'user' || item?.role === 'model') {
              contents.push({ role: item.role, parts: [{ text: String(item.text) }] });
            }
          }
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: STUDIO_SYSTEM_PROMPT,
            temperature: 0.7,
            topP: 0.95,
          },
        });

        send(res, 200, {
          reply: response.text || generateSmartFallback(message),
          model: 'gemini-3.8-flash (Free)',
          status: 'success',
        });
        return;
      } catch (err: any) {
        console.warn('[chat] Gemini failed, using knowledge base:', err?.message || err);
        send(res, 200, {
          reply: generateSmartFallback(message),
          model: 'gemini-3.8-flash (Studio Knowledge Fallback)',
          status: 'fallback',
        });
        return;
      }
    }

    send(res, 200, {
      reply: generateSmartFallback(message),
      model: 'gemini-3.8-flash (Studio Free Tier Engine)',
      status: 'offline_mode',
    });
  } catch (error: any) {
    console.error('[chat] error:', error);
    send(res, 500, { error: 'Failed to process chat message', details: error?.message || 'Unknown error' });
  }
}
