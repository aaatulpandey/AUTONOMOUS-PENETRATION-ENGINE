import React, { useEffect, useState, useRef } from 'react';

const LOG_MESSAGES = [
  "MODULE: PROXY LISTENER STARTED ON 127.0.0.1:8080...",
  "MODULE: SPIDER STARTED. Crawling target scope...",
  "Spider: Parsing robots.txt...",
  "Spider: Resolving DNS...",
  "Spider: Enumerating subdomains...",
  "MODULE: SCANNER (ACTIVE) STARTED...",
  "Scanner: Analyzing WAF signatures...",
  "Scanner: Fingerprinting Tech Stack...",
  "MODULE: INTRUDER STARTED. Loading payload lists...",
  "Intruder: Fuzzing endpoints for hidden parameters...",
  "Intruder: Testing SQL injection (Time-based)...",
  "Intruder: Testing XSS (Reflected/Stored)...",
  "MODULE: REPEATER (AUTO) STARTED...",
  "Repeater: Replaying suspicious request 8923...",
  "Repeater: Validating IDOR on /user/profile...",
  "MODULE: SEQUENCER STARTED...",
  "Sequencer: Capturing 1000 tokens...",
  "Sequencer: Analyzing entropy and randomness...",
  "MODULE: COLLABORATOR (SIMULATED)...",
  "Collaborator: Polling for out-of-band interactions...",
  "ANALYSIS: Correlating attack chains...",
  "REPORTING: Calculating CVSS v3.1 scores...",
  "REPORTING: Generating dashboard analytics...",
  "COMPLETED: 14 High Severity Issues found.",
];

export const Terminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < LOG_MESSAGES.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${LOG_MESSAGES[currentIndex]}`]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400); // Speed of log appearance

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-4xl mx-auto h-96 bg-black border border-omega-700 rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono text-sm relative">
       {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-omega-accent/5 to-transparent h-[10px] w-full animate-scan-line pointer-events-none opacity-50 z-10"></div>
      
      <div className="bg-omega-800 p-2 border-b border-omega-700 flex justify-between items-center">
        <span className="text-gray-400">omega-core — root — auto-pwn</span>
        <div className="flex space-x-2">
           <div className="w-2 h-2 rounded-full bg-omega-accent animate-pulse"></div>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-1 text-green-500 font-mono"
      >
        {logs.map((log, i) => (
          <div key={i} className="break-all opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-omega-accent mr-2">{'>'}</span>
            {log}
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
};
