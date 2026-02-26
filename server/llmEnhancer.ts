import axios from 'axios';

export interface EnhancePayload {
    endpoints: any[];
    auth: any;
    integrationPath: string;
    wrapperCode: {
        typescript: string;
        python: string;
        go: string;
    };
    useCase: string;
    apiKey: string;
}

export interface EnhanceResponse {
    rankedEndpoints: any[];
    workflowSteps: string[];
    explanation: string;
    enhancedWrapperCode: {
        typescript: string;
        python: string;
        go: string;
    };
}

export async function enhanceWithLlm(payload: EnhancePayload): Promise<EnhanceResponse> {
    const prompt = `
You are an expert developer helping a user integrate an API.
The user's goal is: ${payload.useCase}
Integration Path Requested: ${payload.integrationPath}
Auth Method Detected: ${JSON.stringify(payload.auth)}

Endpoints Extracted Deterministically:
${JSON.stringify(payload.endpoints, null, 2)}

Raw Wrapper Code Generated:
${JSON.stringify(payload.wrapperCode, null, 2)}

Your task as an LLM Enhancer:
A) Intelligent Endpoint Ranking: Rank the provided endpoints in order of semantic relevance to achieving the user's specific use case. Return the full endpoint objects.
B) Integration Workflow: Provide a step-by-step logic sequence (array of strings) detailing exactly how to use the endpoints sequentially to solve the user's use case.
C) Developer-Friendly Explanation: A conversational, helpful explanation of the integration path and how to handle the auth.
D) Code Enhancement: Enhance the provided raw wrapper code by adding comprehensive inline comments, docstrings explaining parameters, and a small usage example at the bottom. DO NOT change the core structure of the wrapper, just comment and document it thoroughly.

Respond ONLY with valid JSON matching this exact schema:
{
  "rankedEndpoints": [ { "method": "...", "path": "...", "description": "..." } ],
  "workflowSteps": [ "Step 1: ...", "Step 2: ..." ],
  "explanation": "string details...",
  "enhancedWrapperCode": {
    "typescript": "string",
    "python": "string",
    "go": "string"
  }
}
`;

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${payload.apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                }
            },
            { validateStatus: () => true }
        );

        if (response.status !== 200) {
            throw new Error(response.data?.error?.message || "Failed to reach LLM API");
        }

        const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
            throw new Error("No content returned from LLM");
        }

        return JSON.parse(content) as EnhanceResponse;
    } catch (error: any) {
        throw new Error(`LLM Enhancement failed: ${error.message}`);
    }
}
