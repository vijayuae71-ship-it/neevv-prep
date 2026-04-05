export interface DifyResponse {
  answer: string;
  conversation_id: string;
}

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
