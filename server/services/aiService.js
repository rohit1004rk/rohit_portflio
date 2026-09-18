/**
 * AI service.
 *
 * All AI calls happen here, server-side only: the API key is read from the
 * environment and never reaches the browser. If no key is configured the
 * caller falls back to the built-in rule-based assistant, so the chatbot
 * keeps working 24/7 without an external dependency.
 */
const DEFAULT_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = 15000;

export const isAiConfigured = () => Boolean(process.env.AI_API_KEY);

/**
 * Ask the configured LLM for a reply.
 * @returns {Promise<string|null>} reply text, or null when unavailable.
 */
export const generateChatReply = async ({ message, knowledge }) => {
  if (!isAiConfigured()) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(process.env.AI_API_URL || DEFAULT_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              `You are the assistant for ${knowledge.name}, a ${knowledge.role}. ` +
              'Answer only from the knowledge provided. If something is not in it, ' +
              'say you are not sure and point the visitor to the contact form. ' +
              `Be concise. Knowledge: ${JSON.stringify(knowledge)}`,
          },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(`AI request failed with status ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.warn(`AI request error: ${error.message}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export default { isAiConfigured, generateChatReply };
