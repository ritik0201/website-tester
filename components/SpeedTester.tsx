'use client';

import { useState, useEffect } from 'react';
import ScoreCard from './ScoreCard';
import MetricsGrid from './MetricsGrid';
import ChatBot from './ChatBot';
import Link from 'next/link';

export default function SpeedTester() {
  const [url, setUrl] = useState('');
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ mobile: any; desktop: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const [mobileRes, desktopRes] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, strategy: 'mobile' }),
        }),
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, strategy: 'desktop' }),
        })
      ]);

      const mobileData = await mobileRes.json();
      const desktopData = await desktopRes.json();

      if (!mobileRes.ok || !desktopRes.ok) {
        throw new Error(mobileData.error || desktopData.error || 'Failed to analyze website');
      }

      setResults({
        mobile: mobileData,
        desktop: desktopData,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentResult = results ? results[strategy] : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20">
      <section className="text-center space-y-4 pt-10">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Optimize your <span className="text-indigo-600">Web Performance</span>
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Analyze any website for both Mobile and Desktop. Get instant feedback on performance, accessibility, and SEO.
        </p>
      </section>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 backdrop-blur-xl bg-opacity-80">
        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full h-14 pl-6 pr-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-none ring-1 ring-zinc-200 dark:ring-zinc-700 focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : 'Analyze URL'}
          </button>
        </form>



        {results && (
          <div className="mt-8 flex justify-center">
            <div className="flex bg-zinc-50 dark:bg-zinc-800 p-1 rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-700">
              <button
                type="button"
                onClick={() => setStrategy('mobile')}
                className={`px-8 py-2 rounded-xl text-sm font-medium transition-all ${
                  strategy === 'mobile' 
                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Mobile Results
              </button>
              <button
                type="button"
                onClick={() => setStrategy('desktop')}
                className={`px-8 py-2 rounded-xl text-sm font-medium transition-all ${
                  strategy === 'desktop' 
                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Desktop Results
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-center">
            {error}
          </div>
        )}
      </div>

      {currentResult && (
        <div key={strategy} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            <ScoreCard label="Performance" score={currentResult.scores.performance} color="emerald" />
            <ScoreCard label="Accessibility" score={currentResult.scores.accessibility} color="indigo" />
            <ScoreCard label="Best Practices" score={currentResult.scores.bestPractices} color="amber" />
            <ScoreCard label="SEO" score={currentResult.scores.seo} color="rose" />
            <ScoreCard label="Security Health" score={currentResult.security?.score} color="cyan" />
          </div>

          <div className="flex justify-center">
            <Link href="/docs" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              Learn how these scores are calculated
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {currentResult.insights && (
                <div className="p-1 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-200/50 dark:shadow-none">
                  <div className="bg-white dark:bg-zinc-900 rounded-[1.9rem] p-6 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Recommendations
                    </div>
                    <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {currentResult.insights}
                    </div>
                  </div>
                </div>
              )}

              
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 px-2">Core Web Vitals ({strategy})</h2>
                <MetricsGrid metrics={currentResult.metrics} />
              </div>

              {currentResult.techStack && currentResult.techStack.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Technology Stack</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {currentResult.techStack.map((tech: any, i: number) => (
                      <div key={i} className="group p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                        <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">{tech.category || 'Tool'}</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{tech.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-8">
              {currentResult.urlSecurity && (
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Security Health</h3>
                      <p className="text-sm text-zinc-500">
                        {currentResult.security?.organization && currentResult.security.organization !== 'Unknown' 
                          ? `Owned by ${currentResult.security.organization}` 
                          : 'Based on DetectZeStack analysis'}
                      </p>
                    </div>
                    <div className={`text-4xl font-black px-6 py-3 rounded-[1.5rem] ${
                      currentResult.urlSecurity.grade?.startsWith('A') ? 'bg-emerald-500/10 text-emerald-500' :
                      currentResult.urlSecurity.grade?.startsWith('B') ? 'bg-indigo-500/10 text-indigo-500' :
                      'bg-rose-500/10 text-rose-500'
                    }`}>
                      {currentResult.urlSecurity.grade}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {currentResult.urlSecurity.ssl && (
                      <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">SSL Certificate</p>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{currentResult.urlSecurity.ssl.issuer}</p>
                          <p className="text-xs text-zinc-500 mt-1">Status: Valid until {currentResult.urlSecurity.ssl.valid_to}</p>
                        </div>
                      </div>
                    )}

                    {currentResult.urlSecurity.headers?.length > 0 && (
                      <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Active Security Headers
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {currentResult.urlSecurity.headers.slice(0, 6).map((h: any, i: number) => (
                            <div key={i} className="px-3 py-2 bg-white dark:bg-zinc-900 rounded-xl text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800 truncate">
                              {h}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {currentResult.urlSecurity.warnings?.length > 0 && (
                      <div className="p-5 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-widest">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Security Warnings
                        </div>
                        <ul className="space-y-1">
                          {currentResult.urlSecurity.warnings.map((w: string, i: number) => (
                            <li key={i} className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-2">
                              <span className="w-1 h-1 bg-rose-400 rounded-full" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Site Preview</h2>
                </div>
                {currentResult.screenshot ? (
                  <div className="rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl">
                    <img src={currentResult.screenshot} alt="Website Screenshot" className="w-full h-auto" />
                  </div>
                ) : (
                  <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-400 gap-2">
                    <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>No preview available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && !results && (

        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded-3xl" />
            ))}
          </div>
          <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem]" />
        </div>
      )}

      <ChatBot reportData={currentResult} />
    </div>
  );
}
