import axios from 'axios';
import * as cheerio from 'cheerio';
import SwaggerParser from '@apidevtools/swagger-parser';

export interface EndpointDef {
    path: string;
    method: string;
    parameters: any[];
    description: string;
}

export interface ParsedDocs {
    endpoints: EndpointDef[];
    rawSpec?: any;
    htmlContent?: string;
}

export async function parseDocumentation(url: string): Promise<ParsedDocs> {
    const response = await axios.get(url, { responseType: 'text', validateStatus: () => true });

    if (response.status >= 400) {
        throw new Error(`Failed to fetch documentation. Status code: ${response.status}`);
    }

    const content = response.data;

    let isJson = false;
    let jsonObj = null;

    try {
        jsonObj = typeof content === 'string' ? JSON.parse(content) : content;
        isJson = true;
    } catch (e) { }

    if (isJson && (jsonObj.openapi || jsonObj.swagger)) {
        try {
            // Must clone object as SwaggerParser mutates it
            const api = await SwaggerParser.parse(JSON.parse(JSON.stringify(jsonObj)));
            return {
                endpoints: extractOpenAPIEndpoints(api),
                rawSpec: api
            };
        } catch (err) {
            console.warn("Swagger parsing failed, falling back to string match", err);
        }
    }

    // Fallback to HTML scraping
    return {
        endpoints: scrapeHtmlEndpoints(typeof content === 'string' ? content : JSON.stringify(content)),
        htmlContent: typeof content === 'string' ? content : JSON.stringify(content)
    };
}

function extractOpenAPIEndpoints(api: any): EndpointDef[] {
    const endpoints: EndpointDef[] = [];
    const paths = api.paths || {};

    for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods as any)) {
            if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
                endpoints.push({
                    path,
                    method: method.toUpperCase(),
                    parameters: details.parameters || [],
                    description: details.summary || details.description || ''
                });
            }
        }
    }
    return endpoints;
}

function scrapeHtmlEndpoints(html: string): EndpointDef[] {
    const $ = cheerio.load(html);
    const endpoints: EndpointDef[] = [];
    const text = $('body').text();

    // Regex looking for GET /path/here
    const regex = /(GET|POST|PUT|DELETE|PATCH)\s+(\/[a-zA-Z0-9\-\/_]+)/g;
    let match;
    const seen = new Set();

    while ((match = regex.exec(text)) !== null) {
        const method = match[1];
        const path = match[2];
        const key = `${method} ${path}`;

        if (!seen.has(key)) {
            endpoints.push({
                path,
                method,
                parameters: [],
                description: 'Extracted via deterministic regex'
            });
            seen.add(key);
        }
    }

    return endpoints;
}
