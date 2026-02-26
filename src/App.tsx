import React, { useState, useEffect } from 'react';
import { Bot, Link as LinkIcon, FileText, ArrowRight, Activity, Shield, Code2, Copy, Check, Download, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';
import { generateApiIntegration } from './services/aiService';

interface SearchHistory {
  url: string;
  useCase: string;
  date: string;
}

const loadingMessages = [
  "Parsing API documentation...",
  "Extracting endpoints and parameters...",
  "Determining authentication schemas...",
  "Drafting integration strategy...",
  "Generating multi-language SDK wrappers..."
];

export default function App() {
  const [url, setUrl] = useState('');
  const [useCase, setUseCase] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'python' | 'go'>('typescript');
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('api-devtool-recent');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !useCase || !apiKey) return;

    setLoading(true);
    setResults(null);
    try {
      const result = await generateApiIntegration(url, useCase);
      setResults(result);

      const newSearch = { url, useCase, date: new Date().toLocaleDateString() };
      const updatedSearches = [newSearch, ...recentSearches.filter(s => s.url !== url || s.useCase !== useCase)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('api-devtool-recent', JSON.stringify(updatedSearches));
      showToast('Successfully generated integration!', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to generate integration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (results?.wrapperCode?.[selectedLanguage]) {
      navigator.clipboard.writeText(results.wrapperCode[selectedLanguage]);
      setCopied(true);
      showToast('Code copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!results?.wrapperCode?.[selectedLanguage]) return;

    let extension = 'ts';
    if (selectedLanguage === 'python') extension = 'py';
    if (selectedLanguage === 'go') extension = 'go';

    const element = document.createElement("a");
    const file = new Blob([results.wrapperCode[selectedLanguage]], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `api_wrapper.${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloaded api_wrapper.${extension}`, 'success');
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen relative overflow-x-hidden">
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

          {recentSearches.length > 0 && (
            <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="flex items-center gap-2 text-sm text-gray-400 mb-4 uppercase tracking-wider font-semibold">
                <Clock size={16} />
                Recent Integrations
              </h3>
              <div className="flex flex-col gap-3">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUrl(search.url);
                      setUseCase(search.useCase);
                    }}
                    className="flex flex-col text-left p-4 rounded-xl bg-[var(--bg-card)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(59,130,246,0.5)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-center w-full mb-1">
                      <span className="font-medium text-sm text-gray-200 truncate pr-4 group-hover:text-accent-primary transition-colors">{search.url}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{search.date}</span>
                    </div>
                    <span className="text-xs text-gray-400 line-clamp-1">{search.useCase}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {loading && (
        <div className="w-full max-w-5xl animate-fade-in space-y-8 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center py-8 w-full max-w-md">
            <div className="header-icon-wrapper mb-8 relative bg-transparent border-0 shadow-none">
              <Bot size={48} className="text-accent-primary animate-bounce-slow z-10 relative" />
              <div className="absolute inset-0 bg-accent-primary rounded-full blur-xl opacity-20 animate-pulse"></div>
            </div>
            <h2 className="text-lg text-center h-8 text-gray-200 font-medium transition-opacity duration-300">
              {loadingMessages[loadingStep]}
            </h2>
            <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full mt-6 overflow-hidden border border-[rgba(255,255,255,0.05)] relative">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-accent-primary transition-all duration-700 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full opacity-40 pointer-events-none mt-8">
            <div className="flex flex-col gap-6">
              <div className="card w-full h-48 skeleton-shimmer border-transparent"></div>
              <div className="card w-full h-32 skeleton-shimmer border-transparent"></div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="card w-full h-full min-h-[400px] skeleton-shimmer border-transparent"></div>
            </div>
          </div>
        </div>
      )}

      {results && !loading && (
        <div className="w-full max-w-5xl animate-slide-up space-y-6 pb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="!mb-0 text-2xl font-bold">Integration Strategy</h2>
            <button
              onClick={() => {
                setResults(null);
                setLoadingStep(0);
              }}
              className="btn text-sm px-4 py-2 hover:bg-white/5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Endpoints & Auth (Sidebar) */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              <div className="card w-full">
                <h3 className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4 mb-4 text-sm uppercase tracking-wider text-gray-300">
                  <Activity size={18} className="text-accent-primary" />
                  Key Endpoints
                </h3>
                <div className="flex flex-col gap-3">
                  {results.endpoints?.map((ep: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--bg-input)] border border-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.1)] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                          {ep.method}
                        </span>
                        <code className="text-xs font-mono text-gray-300 break-all">{ep.path}</code>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{ep.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card w-full">
                <h3 className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4 mb-4 text-sm uppercase tracking-wider text-gray-300">
                  <Shield size={18} className="text-accent-primary" />
                  Auth Method
                </h3>
                <code className="text-xs font-mono text-emerald-400 break-words">
                  {results.auth?.type} {results.auth?.header ? `(Header: ${results.auth.header})` : ''}
                </code>
              </div>
            </div>

            {/* SDK & Code Generation (Main Content) */}
            <div className="flex flex-col gap-6 lg:col-span-8">
              <div className="card w-full h-full flex flex-col p-0 overflow-hidden">
                <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] p-4 bg-[var(--bg-card-hover)]">
                  <h3 className="flex items-center gap-2 !mb-0 text-sm uppercase tracking-wider text-gray-300">
                    <Code2 size={18} className="text-accent-primary" />
                    Wrapper Code
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-[#0f1115] border border-[rgba(255,255,255,0.1)] text-xs rounded px-3 py-1.5 text-gray-300 focus:outline-none focus:border-accent-primary cursor-pointer transition-colors hover:border-[rgba(255,255,255,0.2)]"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value as any)}
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="go">Go</option>
                    </select>

                    <div className="h-4 w-px bg-white/10 mx-1"></div>

                    <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded-md transition-colors" title="Copy code">
                      {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-gray-400" />}
                    </button>
                    <button onClick={handleDownload} className="p-1.5 hover:bg-white/10 rounded-md transition-colors" title="Download file">
                      <Download size={16} className="text-blue-400" />
                    </button>
                  </div>
                </div>

                <div className="p-4 text-xs text-gray-400 bg-[var(--bg-card)] border-b border-[rgba(255,255,255,0.05)]">
                  <span className="font-semibold text-gray-300 mr-2">{results.integrationPath === 'SDK' ? 'Recommended SDK:' : 'Integration Path:'}</span>
                  <code className="bg-[#0f1115] px-2 py-0.5 rounded text-emerald-400">{results.recommendedSdk || results.integrationPath}</code>
                </div>

                <div className="relative flex-1 bg-[#0d0e12] overflow-x-auto p-4 text-sm font-mono leading-relaxed custom-scrollbar">
                  <Highlight theme={themes.vsDark} code={results.wrapperCode?.[selectedLanguage] || ''} language={selectedLanguage === 'go' ? 'go' : selectedLanguage === 'python' ? 'python' : 'typescript'}>
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre className={className} style={{ ...style, backgroundColor: 'transparent', margin: 0 }}>
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line })} className="table-row">
                            <span className="table-cell text-right pr-4 select-none opacity-30 text-xs w-8">{i + 1}</span>
                            <span className="table-cell">
                              {line.map((token, key) => (
                                <span key={key} {...getTokenProps({ token })} />
                              ))}
                            </span>
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

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification animate-slide-up-fade ${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={20} className="min-w-[20px]" /> : <CheckCircle2 size={20} className="min-w-[20px]" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
