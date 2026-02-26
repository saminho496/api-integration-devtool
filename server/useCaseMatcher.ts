import { EndpointDef } from './parser.js';

export function matchEndpointsToUseCase(endpoints: EndpointDef[], useCase: string): EndpointDef[] {
    const keywords = useCase.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    if (keywords.length === 0) return endpoints;

    // Simple scoring
    const scored = endpoints.map(ep => {
        let score = 0;
        const targetText = `${ep.path} ${ep.description} ${ep.method}`.toLowerCase();
        for (const kw of keywords) {
            if (targetText.includes(kw)) {
                score += 1;
            }
        }
        return { ep, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.filter(s => s.score > 0).map(s => s.ep);
}
