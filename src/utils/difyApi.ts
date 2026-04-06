export interface DifyResponse {
  answer: string;
  conversation_id: string;
}

// Blocking fallback (kept for edge cases)
export async function sendMessage(
  query: string,
  conversationId: string,
  userId: string
): Promise<DifyResponse> {
  const res = await fetch('/.netlify/functions/dify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      conversation_id: conversationId,
      user: userId,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Dify API error (${res.status}): ${errText}`);
  }

  return res.json();
}

// Streaming version — words appear in real-time
export async function sendMessageStreaming(
  query: string,
  conversationId: string,
  userId: string,
  onChunk: (partialAnswer: string) => void
): Promise<DifyResponse> {
  const res = await fetch('/api/dify-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      conversation_id: conversationId,
      user: userId,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Dify API error (${res.status}): ${errText}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let fullAnswer = '';
  let convId = conversationId;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;

      try {
        const data = JSON.parse(jsonStr);
        if (data.event === 'message' && data.answer) {
          fullAnswer += data.answer;
          onChunk(fullAnswer);
        }
        if (data.event === 'message_end') {
          if (data.conversation_id) convId = data.conversation_id;
        }
        if (data.conversation_id && !convId) {
          convId = data.conversation_id;
        }
      } catch {
        // Skip non-JSON lines
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim().startsWith('data:')) {
    const jsonStr = buffer.trim().slice(5).trim();
    try {
      const data = JSON.parse(jsonStr);
      if (data.event === 'message' && data.answer) {
        fullAnswer += data.answer;
        onChunk(fullAnswer);
      }
      if (data.conversation_id) convId = data.conversation_id;
    } catch {}
  }

  return { answer: fullAnswer, conversation_id: convId };
}
