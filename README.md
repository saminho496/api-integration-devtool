# Smart DevTool for API Integration

A beautifully designed, full-stack automated developer tool to streamline the process of API integration. Provide an API Documentation URL and your intended use case, and the tool will programmatically extract key endpoints, parse OpenAPI/Swagger specs, determine authentication methods, suggest integration paths (REST vs SDK), and statically generate a ready-to-use Wrapper class. An optional Generative AI layer sits on top to enhance the deterministic results with ranked workflow instructions and deeply commented code.

This project was built to showcase a premium UI combined with rigorous, deterministic backend parsing.

## 🚀 Core Architecture

The architecture has been split into a React/Vite Frontend and a Node.js/Express Backend to ensure real, deterministic parsing rather than relying entirely on LLM hallucination.

### Backend Engine (Node.js & Express)
- **Real Documentation Fetching**: Uses `axios` to fetch raw HTML or JSON/YAML specs directly from the provided URL.
- **OpenAPI / Swagger Parser**: Utilizes `@apidevtools/swagger-parser` to deterministically extract endpoints, parameters, and methods from valid OpenAPI 3.x or Swagger 2.0 specs.
- **HTML Fallback Scraper**: If no valid JSON spec is found, it falls back to parsing the raw HTML using `cheerio` and sophisticated Regex logic to intelligently guess the endpoint paths!
- **Authentication Detection**: Reads the `securitySchemes` to extract API Keys, Bearer Tokens, Basic Auth, or OAuth2 requirements automatically.
- **SDK Detection Engine**: Makes live calls to the NPM Registry and PyPI API to detect if an official SDK package currently exists for the requested API.
- **Intelligent Use-Case Matching**: Filters the massive list of extracted endpoints down to the top 5 most relevant based on keyword matching against the User's "Intended Use Case".
- **Template Code Generation**: Bypasses AI completely to statically generate highly accurate TypeScript, Python, and Go wrapper classes strictly based on the parsed data.

### ✨ LLM Enhancement Layer (Google Gemini)
Built entirely decoupled from the base deterministic extraction, this service accepts a Gemini API Key to run optional AI insights:
- **Intelligent Endpoint Ranking**: Semantically ranks the top extracted endpoints strictly by relevance for the user's specific use case.
- **Workflow Generator**: Acts as a solution architect, providing a step-by-step logic sequence of exactly how to stitch the API calls together to solve the target objective.
- **Developer Integration Guide**: Outputs an executive summary and readable explanation of how the authentication mechanism works and which path to choose.
- **Code Enhancement Generator**: Accepts the pre-validated wrapper code and injects rich, comprehensive docstrings, inline comments, and mock usage examples without breaking the core structure!

### Frontend Client (React & Vite)
- **Premium UI**: Dark mode glassmorphism interfaces built purely with Tailwind CSS (v4).
- **Interactive AI Insights**: A smooth toggle slider dynamically transforms the raw Wrapper Code into deeply 'Enhanced' commented code when enabled.
- **Dynamic Loading States**: Shimmering skeleton loaders with progressive loading steps based on backend progress.
- **Developer UX**: 1-click clipboard Copy and 1-click direct File Downloads (`.ts`, `.py`, `.go`) of the generated code.
- **Local History**: Persists successful integrations into `localStorage` for instant retrieval as "Recent Searches".

## 🛠️ Setup and Usage Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or newer)
- npm or yarn

### Installation

1. Clone the repository and move to directory:
   ```bash
   git clone <your-repository-url>
   cd api-integration-devtool
   ```

2. Install all frontend and backend dependencies:
   ```bash
   npm install
   ```

3. **Start the Backend Server** (Port 3001):
   Open a terminal and run:
   ```bash
   npm run server
   ```

4. **Start the Frontend Client** (Port 5173):
   Open a *second* terminal and run:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`!

## 🧪 Testing Examples to Try
To verify the complex OpenAPI parser works deterministically, try the following test input:
- **URL**: `https://petstore.swagger.io/v2/swagger.json`
- **Use Case**: `I want to add a new pet to the store and then find pets by their status.`

## 📦 Tech Stack
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Node.js + Express + `tsx`
- **Parsing**: `swagger-parser`, `cheerio`, `axios`
- **Syntax Highlighting**: Prism React Renderer
- **Icons**: Lucide React
