# Smart DevTool for API Integration

A beautifully designed, automated developer tool to streamline the process of API integration. Provide an API Documentation URL and your intended use case, and the tool will automatically extract the key endpoints, determine authentication methods, suggest integration paths, and generate a ready-to-use SDK wrapper class.

This project was built as part of a Hackathon challenge to showcase a premium, standard UI and advanced tool functionality.

## Features

- **Automated Endpoint Extraction**: Rapidly extracts important endpoints relevant to your use case.
- **Authentication Discovery**: Determines the correct authorization headers or tokens required.
- **SDK & Path Suggestions**: Recommends the smartest approach (e.g., existing SDKs or REST).
- **Code Wrapper Generation**: Auto-generates boilerplate wrapper classes in your preferred language to interact with the API seamlessly.
- **Premium UI**: Built with React, Tailwind-like vanilla CSS, and sleek modern aesthetics, including micro-animations and "glassmorphism" effects.

## Solution Approach

The goal was to demonstrate how an AI-powered agent could automate standard integration drudgery. Rather than just returning plain text, the solution is wrapped in a highly polished user interface with loading states simulating the agent's extraction and code-generation process. Under the hood, the application is built as a Single Page Application (SPA) using React and Vite, structured cleanly to easily wire up to a real LLM-backed backend in the future.

## Setup and Usage Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd api-integration-devtool
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`. Provide an API URL and a use case to see the extraction process in action!

## Tech Stack
- **Framework**: Vite + React + TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
- **Icons**: Lucide React
