import React, { useState } from 'react';
import { Bot, Link as LinkIcon, FileText, ArrowRight, Activity, Shield, Code2, Copy, Check } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { generateApiIntegration } from './services/aiService';

export default function App() {
  const [url, setUrl] = useState('');
  const [useCase, setUseCase] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'python' | 'go'>('typescript');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !useCase || !apiKey) return;

    setLoading(true);
    try {
      const result = await generateApiIntegration(apiKey, url, useCase);
      setResults(result);
    } catch (error: any) {
      console.error(error);
      alert('Failed to generate integration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (results?.snippets?.[selectedLanguage]?.code) {
      navigator.clipboard.writeText(results.snippets[selectedLanguage].code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <header className="header animate-slide-up">
        <div className="header-icon-wrapper">
          <Bot size={32} />
        </div>
        <h1>API Integration DevTool</h1>
        <p>Automate your API discovery and code generation workflow</p>
      </header>

      {!results && !loading ? (
        <section className="form-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-panel">
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="input-group">
                <label htmlFor="apiKey" className="input-label flex gap-2 items-center">
                  <Shield size={16} className="text-accent-primary" />
                  Gemini API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  className="input"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>

              <div className="input-group mt-2">
                <label htmlFor="url" className="input-label flex gap-2 items-center">
                  <LinkIcon size={16} className="text-accent-primary" />
                  API Documentation URL
                </label>
                <input
                  id="url"
                  type="url"
                  className="input"
                  placeholder="https://docs.example.com/api"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>

              <div className="input-group mt-2">
                <label htmlFor="useCase" className="input-label flex gap-2 items-center">
                  <FileText size={16} className="text-accent-primary" />
                  Intended Use Case
                </label>
                <textarea
                  id="useCase"
                  className="textarea"
                  placeholder="Describe what you want to build. E.g., 'I want to sync user data from this API into my local database every hour.'"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary mt-6">
                Analyze & Generate
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 animate-pulse w-full">
          <div className="header-icon-wrapper mb-6">
            <Bot size={32} className="animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-xl">Analyzing API Documentation...</h2>
          <p className="text-center max-w-md mt-2">
            Extracting endpoints, determining authentication methods, and writing your wrapper class. Please wait.
          </p>
        </div>
      )}

      {results && !loading && (
        <div className="w-full max-w-5xl animate-slide-up space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="!mb-0 text-2xl">Integration Strategy</h2>
            <button
              onClick={() => {
                setResults(null);
                setUrl('');
                setUseCase('');
                setApiKey('');
              }}
              className="btn" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Endpoints & Auth */}
            <div className="flex flex-col gap-6">
              <div className="card w-full">
                <h3 className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4 mb-4">
                  <Activity size={20} className="text-accent-primary" />
                  Key Endpoints
                </h3>
                <div className="flex flex-col gap-3">
                  {results.endpoints.map((ep: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-1 p-3 rounded bg-[var(--bg-input)] border border-[rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono text-gray-300">{ep.path}</code>
                      </div>
                      <p className="text-sm mt-1 text-gray-400">{ep.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card w-full">
                <h3 className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4 mb-4">
                  <Shield size={20} className="text-accent-primary" />
                  Authentication Method
                </h3>
                <div className="p-3 rounded bg-[var(--bg-input)] border border-[rgba(255,255,255,0.05)]">
                  <code className="text-sm font-mono text-emerald-400">{results.auth}</code>
                </div>
              </div>
            </div>

            {/* SDK & Code Generation */}
            <div className="flex flex-col gap-6">
              <div className="card w-full h-full flex flex-col">
                <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-4 mb-4">
                  <h3 className="flex items-center gap-2 !mb-0">
                    <Code2 size={20} className="text-accent-primary" />
                    Generated Wrapper
                  </h3>
                  <div className="flex items-center gap-3">
                    <select
                      className="bg-[var(--bg-input)] border border-[rgba(255,255,255,0.1)] text-sm rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-accent-primary"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as any)}
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="go">Go</option>
                    </select>
                    <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded transition-colors" title="Copy code">
                      {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="mb-4 text-sm text-gray-400">
                  <span className="font-semibold text-gray-300">Recommended Path: </span>
                  {results.snippets[selectedLanguage].sdk}
                </div>

                <div className="relative flex-1 bg-[#0d0e12] rounded-lg border border-[rgba(255,255,255,0.05)] p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                  <Highlight theme={themes.vsDark} code={results.snippets[selectedLanguage].code} language={selectedLanguage === 'go' ? 'go' : selectedLanguage === 'python' ? 'python' : 'typescript'}>
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre className={className} style={{ ...style, backgroundColor: 'transparent' }}>
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line })}>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token })} />
                            ))}
                          </div>
                        ))}
                      </pre>
                    )}
                  </Highlight>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
