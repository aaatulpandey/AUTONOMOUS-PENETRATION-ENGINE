import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { ScannerInput } from './components/ScannerInput';
import { Terminal } from './components/Terminal';
import { Dashboard } from './components/Dashboard';
import { ReportView } from './components/ReportView';
import { HistorySidebar } from './components/HistorySidebar';
import { ChatInterface } from './components/ChatInterface';
import { runOmegaScan } from './services/geminiService';
import { AppState, ScanConfig, FullScanResult, ScanHistoryItem } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [scanResult, setScanResult] = useState<FullScanResult | null>(null);
  const [lastConfig, setLastConfig] = useState<ScanConfig | undefined>(undefined);
  const [showReport, setShowReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New State for Features
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load History on Mount
  useEffect(() => {
    const saved = localStorage.getItem('omega_scan_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (config: ScanConfig, result: FullScanResult) => {
    const newItem: ScanHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      targetUrl: config.targetUrl,
      mode: config.mode,
      platform: config.submissionPlatform,
      stats: result.dashboard.overview,
      result: result
    };
    
    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('omega_scan_history', JSON.stringify(newHistory));
  };

  const handleStartScan = async (config: ScanConfig) => {
    setLastConfig(config);
    setAppState(AppState.SCANNING);
    setErrorMsg(null);
    setScanResult(null);
    setIsChatOpen(false); // Reset chat

    try {
      // Run the actual API call
      // We run this concurrently with the simulated terminal duration to ensure smooth UX
      const [result] = await Promise.all([
        runOmegaScan(config),
        // Force a minimum wait time so the user can enjoy the "hacking" terminal visuals
        new Promise(resolve => setTimeout(resolve, 8000))
      ]);

      setScanResult(result);
      setAppState(AppState.COMPLETE);
      saveToHistory(config, result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unknown error occurred during the scan.");
      setAppState(AppState.ERROR);
    }
  };

  const handleBack = () => {
    if (appState === AppState.COMPLETE || appState === AppState.ERROR) {
      setAppState(AppState.IDLE);
    }
  };

  const handleForward = () => {
    if (appState === AppState.IDLE && scanResult) {
      setAppState(AppState.COMPLETE);
    }
  };

  const handleLoadHistory = (item: ScanHistoryItem) => {
      setScanResult(item.result);
      setLastConfig({ 
          targetUrl: item.targetUrl, 
          auth: '', 
          cookies: '', 
          mode: item.mode || 'safe', 
          submissionPlatform: item.platform 
      });
      setAppState(AppState.COMPLETE);
      setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
      setHistory([]);
      localStorage.removeItem('omega_scan_history');
  };

  const handleDownloadReport = () => {
    if (!scanResult) return;
    const blob = new Blob([scanResult.markdown_report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMEGA_SCAN_REPORT_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPDF = () => {
    if (!scanResult) return;
    
    const htmlContent = marked.parse(scanResult.markdown_report);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
            <head>
                <title>OMEGA SCAN REPORT</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 40px; color: #111; max-width: 900px; margin: 0 auto; }
                    h1 { border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 0; }
                    h2 { color: #333; margin-top: 30px; border-bottom: 1px solid #ccc; }
                    h3 { color: #444; margin-top: 20px; }
                    code { background: #eee; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
                    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; border: 1px solid #ddd; }
                    blockquote { border-left: 4px solid #333; padding-left: 15px; color: #555; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .meta { font-size: 0.8em; color: #666; text-align: right; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>OMEGA WEB HUNTER REPORT</h1>
                    <p>CONFIDENTIAL SECURITY ASSESSMENT</p>
                </div>
                <div class="meta">Generated: ${new Date().toLocaleString()}</div>
                <hr/>
                ${htmlContent}
                <script>
                  window.onload = () => { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-omega-900 text-gray-200 font-sans selection:bg-omega-accent selection:text-black overflow-x-hidden">
      {/* Top Navigation / Branding */}
      <nav className="border-b border-omega-800 bg-omega-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <span className="text-2xl font-bold font-mono tracking-tighter text-white cursor-pointer" onClick={() => setAppState(AppState.IDLE)}>
                OMEGA<span className="text-omega-accent">.WEB_HUNTER</span>
              </span>
              
              <div className="hidden md:flex items-center space-x-2 border-l border-omega-800 pl-6">
                 <button 
                  onClick={handleBack}
                  disabled={appState === AppState.IDLE || appState === AppState.SCANNING}
                  className={`p-2 rounded border border-omega-800 transition-colors ${
                    appState !== AppState.IDLE && appState !== AppState.SCANNING
                      ? 'text-white hover:border-omega-accent hover:text-omega-accent' 
                      : 'text-gray-700 cursor-not-allowed'
                  }`}
                  title="Back to Configuration"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                 </button>
                 <button 
                  onClick={handleForward}
                  disabled={appState === AppState.COMPLETE || !scanResult || appState === AppState.SCANNING}
                  className={`p-2 rounded border border-omega-800 transition-colors ${
                    appState === AppState.IDLE && scanResult 
                      ? 'text-white hover:border-omega-accent hover:text-omega-accent' 
                      : 'text-gray-700 cursor-not-allowed'
                  }`}
                  title="Forward to Results"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                 </button>
              </div>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="text-gray-400 hover:text-omega-accent font-mono text-xs flex items-center space-x-1 uppercase"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>Logs ({history.length})</span>
              </button>
              
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-4">
                  <span className="text-xs font-mono text-gray-500">v3.2.0-RC1 // AI_CORE: ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <HistorySidebar 
        history={history} 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onSelectHistory={handleLoadHistory}
        onClearHistory={handleClearHistory}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-fade-in">
             <div className="text-center space-y-4">
               <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                 AUTONOMOUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-omega-accent to-blue-500">PENETRATION</span> ENGINE
               </h1>
               <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                 Replaces legacy scanners with AI-driven logic analysis. 
                 Enter target details below to initialize the kill chain.
               </p>
             </div>
             <ScannerInput 
                onStartScan={handleStartScan} 
                isLoading={false} 
                initialValues={lastConfig}
             />
          </div>
        )}

        {appState === AppState.SCANNING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-fade-in">
            <h2 className="text-2xl font-mono text-omega-accent mb-6 animate-pulse">
              EXECUTING_ATTACK_PROTOCOLS...
            </h2>
            <Terminal />
          </div>
        )}

        {appState === AppState.COMPLETE && scanResult && (
          <div className="relative">
            <Dashboard 
              data={scanResult.dashboard} 
              onViewReport={() => setShowReport(true)}
              onDownloadReport={handleDownloadReport}
              onDownloadPDF={handleDownloadPDF}
            />
            {/* Chat Trigger Button */}
            {!isChatOpen && (
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="fixed bottom-8 right-8 bg-omega-accent text-black p-4 rounded-full shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:scale-110 transition-transform z-40 group"
                  title="Ask Omega Advisor"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                  <span className="absolute right-full mr-4 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                    TACTICAL ADVISOR
                  </span>
                </button>
            )}
            
            {isChatOpen && (
                <ChatInterface scanResult={scanResult} onClose={() => setIsChatOpen(false)} />
            )}
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h2 className="text-3xl font-mono text-white">SYSTEM_FAILURE</h2>
            <p className="text-red-400 font-mono bg-red-900/10 p-4 border border-red-900 rounded">
              {errorMsg}
            </p>
            <button 
              onClick={() => setAppState(AppState.IDLE)}
              className="px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors font-mono uppercase"
            >
              Reset System
            </button>
          </div>
        )}

        {/* Report Modal Overlay */}
        {showReport && scanResult && (
          <ReportView 
            reportMarkdown={scanResult.markdown_report} 
            platform={lastConfig?.submissionPlatform}
            onClose={() => setShowReport(false)} 
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-omega-800 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600 font-mono">
            OMEGA WEB HUNTER IS A SIMULATION TOOL POWERED BY ATUL PANDEY. 
            USE RESPONSIBLY. DO NOT TARGET SYSTEMS WITHOUT AUTHORIZATION.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;