export interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerperResponse {
  organic: SerperResult[];
  searchParameters?: {
    q: string;
    location: string;
  };
}

export async function searchJobs(
  query: string,
  location: string = 'India'
): Promise<SerperResponse> {
  const res = await fetch('/.netlify/functions/serper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      location,
      num: 10,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Serper API error (${res.status}): ${errText}`);
  }

  return res.json();
}
