import express from 'express';
import cors from 'cors';
import { parseDocumentation } from './parser.js';
import { detectSdk } from './sdkDetector.js';
import { generateWrappers } from './wrapperGenerator.js';
import { matchEndpointsToUseCase } from './useCaseMatcher.js';
import { detectAuth } from './authDetector.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', async (req, res) => {
    try {
        const { url, useCase } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Documentation URL is required' });
        }

        // 1. Fetch and Parse Documentation
        const parsedDocs = await parseDocumentation(url);
        if (!parsedDocs || parsedDocs.endpoints.length === 0) {
            return res.status(400).json({ error: 'No valid endpoints found at URL' });
        }

        // 2. Intelligent Use-Case Filtering
        let endpoints = parsedDocs.endpoints;
        if (useCase) {
            endpoints = matchEndpointsToUseCase(endpoints, useCase);
            // Fallback
            if (endpoints.length === 0) endpoints = parsedDocs.endpoints.slice(0, 5);
        } else {
            endpoints = endpoints.slice(0, 10);
        }

        // 3. Detect Authentication
        const auth = detectAuth(parsedDocs.rawSpec, parsedDocs.htmlContent);

        // 4. SDK Detection Layer
        const domainMatch = url.match(/https?:\/\/(?:www\.)?([^.]+)\./);
        const apiName = domainMatch ? domainMatch[1] : 'unknown';
        const sdkInfo = await detectSdk(apiName);

        // 5. Generate Wrapper Code
        const wrapperCode = generateWrappers(endpoints, auth);

        const responsePayload = {
            endpoints,
            auth,
            integrationPath: sdkInfo.sdkAvailable ? 'SDK' : 'REST',
            recommendedSdk: sdkInfo.recommendedSdk || '',
            wrapperCode
        };

        res.json(responsePayload);
    } catch (error: any) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message || 'Failed to analyze documentation' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
