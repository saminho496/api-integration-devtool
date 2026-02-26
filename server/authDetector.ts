export interface AuthDef {
    type: string;
    header?: string;
    key?: string;
    description?: string;
}

export function detectAuth(rawSpec?: any, htmlContent?: string): AuthDef {
    if (rawSpec && rawSpec.components && rawSpec.components.securitySchemes) {
        const schemes = rawSpec.components.securitySchemes;
        for (const [name, scheme] of Object.entries(schemes as any)) {
            if (scheme.type === 'http' && scheme.scheme === 'bearer') {
                return { type: 'Bearer', header: 'Authorization' };
            }
            if (scheme.type === 'apiKey') {
                return { type: 'API Key', header: scheme.name };
            }
            if (scheme.type === 'oauth2') {
                return { type: 'OAuth2', header: 'Authorization' };
            }
            if (scheme.type === 'http' && scheme.scheme === 'basic') {
                return { type: 'Basic', header: 'Authorization' };
            }
        }
    }

    if (htmlContent) {
        const lowerHtml = htmlContent.toLowerCase();
        if (lowerHtml.includes('bearer token') || lowerHtml.includes('authorization: bearer')) {
            return { type: 'Bearer', header: 'Authorization' };
        }
        if (lowerHtml.includes('api-key') || lowerHtml.includes('x-api-key') || lowerHtml.includes('apikey')) {
            return { type: 'API Key', header: 'x-api-key' };
        }
        if (lowerHtml.includes('oauth2') || lowerHtml.includes('oauth 2')) {
            return { type: 'OAuth2', header: 'Authorization' };
        }
        if (lowerHtml.includes('basic auth')) {
            return { type: 'Basic', header: 'Authorization' };
        }
    }

    return { type: 'None detected', description: 'Requires manual setup' };
}
