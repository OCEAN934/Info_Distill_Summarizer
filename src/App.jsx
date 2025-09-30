import React, { useState, useEffect } from 'react';

// --- Custom SVG Icons ---
const TextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9L12 3z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

// --- Custom Loader with a fancier animation ---
const Loader = () => (
  <div className="flex space-x-2">
    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce-short"></div>
    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce-short delay-150"></div>
    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce-short delay-300"></div>
  </div>
);

function App() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUI, setShowUI] = useState(false);

  // Typing effect for the summary
  useEffect(() => {
    if (summary) {
      setDisplayedSummary('');
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedSummary(prev => prev + summary.charAt(i));
        i++;
        if (i > summary.length) {
          clearInterval(interval);
        }
      }, 20); // Adjust typing speed here
      return () => clearInterval(interval);
    }
  }, [summary]);

  // Entrance animation for the UI
  useEffect(() => {
    setShowUI(true);
  }, []);

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please provide some text to summarize.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('http://127.0.0.1:5000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown server error occurred.');
      }
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
      console.error('Summarization failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Define custom animations in a style tag */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-short {
          animation: bounce-short 1s infinite ease-in-out;
        }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
      
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 min-h-screen flex items-center justify-center font-sans p-4 text-white overflow-hidden">
        <main className={`container mx-auto max-w-4xl transition-all duration-700 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 border border-white/20">
            
            <header className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                AI Text Synthesizer
              </h1>
              <p className="text-gray-400 mt-3">
                Distill long-form text into its most essential core.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="flex flex-col animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <label htmlFor="text-input" className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <TextIcon /> Your Text
                </label>
                <textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows="10"
                  className="w-full flex-grow p-4 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 ease-in-out resize-none placeholder-gray-500 text-gray-200"
                  placeholder="Paste your content here..."
                ></textarea>
              </div>

              {/* Output Section */}
              <div className="flex flex-col animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <label htmlFor="summary-output" className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <SparklesIcon /> Synthesized Summary
                  </label>
                  <div id="summary-output" className="w-full flex-grow p-4 bg-gray-900/50 border border-gray-700 rounded-lg whitespace-pre-wrap overflow-y-auto text-gray-300 min-h-[240px]">
                    {displayedSummary || <span className="text-gray-500">Your synthesized summary will appear here...</span>}
                  </div>
              </div>
            </div>
            
            <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <button
                onClick={handleSummarize}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold py-3 px-12 rounded-lg hover:from-blue-600 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 ease-in-out disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? 'Synthesizing...' : 'Synthesize Text'}
              </button>

              <div className="mt-5 h-8 flex items-center justify-center">
                {isLoading && <Loader />}
                {error && <p className="text-red-400 font-medium">{error}</p>}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

export default App;

