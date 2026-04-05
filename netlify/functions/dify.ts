import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const DIFY_URL = "https://api.dify.ai/v1/chat-messages";

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.DIFY_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "DIFY_API_KEY not configured" }) };
  }

  try {
    const { query, conversation_id, user } = JSON.parse(event.body || "{}");

    const res = await fetch(DIFY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: query || "",
        response_mode: "blocking",
        conversation_id: conversation_id || "",
        user: user || "neevv-user",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: data.message || "Dify API error" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        answer: data.answer,
        conversation_id: data.conversation_id,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
};

export { handler };
