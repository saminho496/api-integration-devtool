import { EndpointDef } from './parser.js';
import { AuthDef } from './authDetector.js';

export function generateWrappers(endpoints: EndpointDef[], auth: AuthDef) {
    return {
        typescript: generateTsWrapper(endpoints, auth),
        python: generatePyWrapper(endpoints, auth),
        go: generateGoWrapper(endpoints, auth)
    };
}

function generateTsWrapper(endpoints: EndpointDef[], auth: AuthDef): string {
    const methods = endpoints.map(ep => {
        const methodName = (ep.method.toLowerCase() + ep.path.replace(/[\/\-\_\{]/g, '')).replace(/\}/g, '').substring(0, 30);
        return `
  async ${methodName}() {
    return fetch(this.baseUrl + "${ep.path}", {
      method: "${ep.method}",
      headers: this.getHeaders()
    }).then(res => res.json());
  }`;
    }).join('\n');

    return `export class ApiClient {
  constructor(private apiKey: string, private baseUrl: string = '') {}

  private getHeaders() {
    return {
      ${auth.header ? `"${auth.header}": \`${auth.type === 'Bearer' ? 'Bearer ' : ''}\${this.apiKey}\`,` : ''}
      "Content-Type": "application/json"
    };
  }
${methods}
}`;
}

function generatePyWrapper(endpoints: EndpointDef[], auth: AuthDef): string {
    const methods = endpoints.map(ep => {
        const methodName = (ep.method.toLowerCase() + ep.path.replace(/[\/\-\_\{]/g, '')).replace(/\}/g, '').substring(0, 30);
        return `
    def ${methodName}(self):
        response = requests.${ep.method.toLowerCase()}(f"{self.base_url}${ep.path}", headers=self.get_headers())
        return response.json()`;
    }).join('\n');

    return `import requests

class ApiClient:
    def __init__(self, api_key: str, base_url: str = ''):
        self.api_key = api_key
        self.base_url = base_url

    def get_headers(self):
        return {
            ${auth.header ? `"${auth.header}": f"${auth.type === 'Bearer' ? 'Bearer ' : ''}{self.api_key}",` : ''}
            "Content-Type": "application/json"
        }
${methods}`;
}

function generateGoWrapper(endpoints: EndpointDef[], auth: AuthDef): string {
    const methods = endpoints.map(ep => {
        const methodName = (ep.method.toLowerCase() + ep.path.replace(/[\/\-\_\{]/g, '')).replace(/\}/g, '').substring(0, 30);
        const titleCaseMethod = methodName.charAt(0).toUpperCase() + methodName.slice(1);
        return `
func (c *ApiClient) ${titleCaseMethod}() (*http.Response, error) {
    req, err := http.NewRequest("${ep.method}", c.BaseUrl + "${ep.path}", nil)
    if err != nil {
        return nil, err
    }
    c.setHeaders(req)
    return c.client.Do(req)
}`;
    }).join('\n');

    return `package api

import (
    "net/http"
)

type ApiClient struct {
    ApiKey  string
    BaseUrl string
    client  *http.Client
}

func NewApiClient(apiKey string, baseUrl string) *ApiClient {
    return &ApiClient{
        ApiKey:  apiKey,
        BaseUrl: baseUrl,
        client:  &http.Client{},
    }
}

func (c *ApiClient) setHeaders(req *http.Request) {
    ${auth.header ? `req.Header.Add("${auth.header}", "${auth.type === 'Bearer' ? 'Bearer ' : ''}" + c.ApiKey)` : ''}
    req.Header.Add("Content-Type", "application/json")
}
${methods}`;
}
