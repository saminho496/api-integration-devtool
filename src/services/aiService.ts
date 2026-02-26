export interface ApiResponse {
    endpoints: Array<{ method: string; path: string; desc: string }>;
    auth: string;
    snippets: {
        typescript: { sdk: string; code: string };
        python: { sdk: string; code: string };
        go: { sdk: string; code: string };
    };
}

export async function generateApiIntegration(
    apiKey: string,
    url: string,
    useCase: string
): Promise<ApiResponse> {
    const prompt = `
You are an expert developer building an API Integration DevTool.
The user wants to integrate with the API documented at: ${url}
Their specific use case is: ${useCase}

Analyze the URL (or use your general knowledge of this API) and the use case.
Return a JSON object strictly matching this TypeScript interface:
interface ApiResponse {
  endpoints: Array<{ method: string; path: string; desc: string }>; // Key endpoints for the use case
  auth: string; // Description of the authentication method and how to set it up
  snippets: {
    typescript: { sdk: string; code: string }; // 'sdk' is the recommended package/path, 'code' is the ready-to-use wrapper function
    python: { sdk: string; code: string };
    go: { sdk: string; code: string };
  };
}

Respond ONLY with valid JSON. Do not include markdown blocks like \`\`\`json.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to generate response: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
        throw new Error('No content returned from AI');
    }

    try {
        return JSON.parse(content) as ApiResponse;
    } catch (e) {
        throw new Error('Failed to parse AI response as JSON');
    }
}
