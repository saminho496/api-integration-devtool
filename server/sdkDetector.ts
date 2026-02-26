import axios from 'axios';

export interface SdkInfo {
    sdkAvailable: boolean;
    recommendedSdk?: string;
}

export async function detectSdk(apiName: string): Promise<SdkInfo> {
    // Check NPM
    try {
        const npmRes = await axios.get(`https://registry.npmjs.org/${apiName}`, { validateStatus: () => true });
        if (npmRes.status === 200 && npmRes.data.name) {
            return { sdkAvailable: true, recommendedSdk: npmRes.data.name };
        }
    } catch (e) { }

    // Check PyPI
    try {
        const pypiRes = await axios.get(`https://pypi.org/pypi/${apiName}/json`, { validateStatus: () => true });
        if (pypiRes.status === 200 && pypiRes.data.info) {
            return { sdkAvailable: true, recommendedSdk: pypiRes.data.info.name };
        }
    } catch (e) { }

    return { sdkAvailable: false };
}
