import { Handler } from '@netlify/functions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Deepgram API key not configured' }),
    };
  }

  try {
    const { audio, mimetype } = JSON.parse(event.body || '{}');

    if (!audio) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing audio data' }),
      };
    }

    const audioBuffer = Buffer.from(audio, 'base64');
    const contentType = mimetype || 'audio/webm';

    const dgResponse = await fetch(
      'https://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&punctuate=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': contentType,
        },
        body: audioBuffer,
      }
    );

    if (!dgResponse.ok) {
      const errText = await dgResponse.text();
      console.error('Deepgram API error:', dgResponse.status, errText);
      return {
        statusCode: dgResponse.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: `Deepgram error: ${dgResponse.status}`, details: errText }),
      };
    }

    const dgData = await dgResponse.json();
    const transcript =
      dgData?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    };
  } catch (err: any) {
    console.error('Deepgram function error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};
