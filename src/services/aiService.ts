export interface AuthDef {
    type: string;
    header?: string;
}

export interface ApiResponse {
    endpoints: Array<{ method: string; path: string; description: string; parameters: any[] }>;
    auth: AuthDef;
    integrationPath: string;
    recommendedSdk: string;
    wrapperCode: {
        typescript: string;
        python: string;
        go: string;
    };
}

export interface EnhanceResponse {
    rankedEndpoints: Array<{ method: string; path: string; description: string }>;
    workflowSteps: string[];
    explanation: string;
    enhancedWrapperCode: {
        typescript: string;
        python: string;
        go: string;
    };
}

export async function generateApiIntegration(
    url: string,
    useCase: string
): Promise<ApiResponse> {
    const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, useCase }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to analyze API: ${response.statusText}`);
    }

    const data = await response.json();
    return data as ApiResponse;
}

export async function enhanceIntegration(
    apiKey: string,
    payload: any
): Promise<EnhanceResponse> {
    const response = await fetch('http://localhost:3001/enhance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey, ...payload }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate AI insights: ${response.statusText}`);
    }

    return await response.json() as EnhanceResponse;
}
