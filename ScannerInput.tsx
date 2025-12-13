import React, { useState } from 'react';
import { ScanConfig, SubmissionPlatform } from '../types';

interface ScannerInputProps {
  onStartScan: (config: ScanConfig) => void;
  isLoading: boolean;
  initialValues?: Partial<ScanConfig>;
}

const PLATFORM_INFO: Record<SubmissionPlatform, string> = {
  generic: "Standard security assessment report suitable for internal audits and executive summaries.",
  hackerone: "Optimized for HackerOne. Includes CVSS v3.1 vectors, explicit 'Steps to Reproduce', and strict impact analysis following H1 policy.",
  bugcrowd: "Aligned with Bugcrowd VRT (Vulnerability Rating Taxonomy). Focuses on technical severity, priority (P1-P5), and reproducible PoCs.",
  synack: "Tailored for Synack Red Team. Emphasizes exploitability metrics, quality of evidence, and specific vulnerability categorization.",
  intigriti: "Formatted for Intigriti. Highlights non-theoretical impact, business risk, and strict adherence to severity guidelines."
};

export const ScannerInput: React.FC<ScannerInputProps> = ({ onStartScan, isLoading, initialValues }) => {
  const [url, setUrl] = useState(initialValues?.targetUrl || '');
  const [auth, setAuth] = useState(initialValues?.auth || '');
  const [cookies, setCookies] = useState(initialValues?.cookies || '');
  const [mode, setMode] = useState<'safe' | 'validate'>(initialValues?.mode || 'safe');
  const [platform, setPlatform] = useState<SubmissionPlatform>(initialValues?.submissionPlatform || 'generic');
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (input: string): boolean => {
    try {
      const parsedUrl = new URL(input);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setError('Protocol must be http: or https:');
        return false;
      }
      return true;
    } catch (e) {
      setError('Invalid URL format. Must include http:// or https://');
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
        setError('Target URL is required');
        return;
    }
    
    if (!validateUrl(trimmedUrl)) {
        return;
    }

    onStartScan({ targetUrl: trimmedUrl, auth, cookies, mode, submissionPlatform: platform });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-omega-800 border border-omega-700 rounded-lg shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-omega-accent font-mono text-sm ml-2">// OMEGA_TARGET_CONFIG</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-mono text-gray-400">TARGET_URL</label>
            <div className="relative">
                <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className={`w-full bg-omega-900 border ${error ? 'border-red-500 focus:border-red-500' : 'border-omega-700 focus:border-omega-accent'} text-green-400 font-mono p-3 focus:outline-none transition-colors rounded-sm`}
                disabled={isLoading}
                />
                {error && (
                    <div className="absolute top-full left-0 mt-1 z-10">
                        <span className="text-red-500 text-xs font-mono bg-omega-900 px-2 py-1 border border-red-900/50 rounded flex items-center shadow-lg">
                            <span className="mr-1">⚠️</span> {error}
                        </span>
                    </div>
                )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-mono text-gray-400">SCAN_MODE</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setMode('safe')}
                className={`flex-1 py-3 border font-mono text-sm transition-all ${
                  mode === 'safe' 
                    ? 'border-omega-accent bg-omega-accent/10 text-omega-accent' 
                    : 'border-omega-700 text-gray-500 hover:border-gray-500'
                }`}
                disabled={isLoading}
              >
                SAFE
              </button>
              <button
                type="button"
                onClick={() => setMode('validate')}
                className={`flex-1 py-3 border font-mono text-sm transition-all ${
                  mode === 'validate' 
                    ? 'border-red-500 bg-red-500/10 text-red-500' 
                    : 'border-omega-700 text-gray-500 hover:border-gray-500'
                }`}
                disabled={isLoading}
              >
                VALIDATE
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
            <label className="block text-sm font-mono text-gray-400">REPORT_FORMAT / SUBMISSION_READY</label>
            <div className="space-y-2">
              <div className="relative">
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as SubmissionPlatform)}
                    className="w-full bg-omega-900 border border-omega-700 text-omega-accent font-mono p-3 focus:outline-none focus:border-omega-accent transition-colors rounded-sm uppercase appearance-none cursor-pointer"
                    disabled={isLoading}
                >
                    <option value="generic">GENERIC (INTERNAL AUDIT)</option>
                    <option value="hackerone">HACKERONE (H1 STANDARD)</option>
                    <option value="bugcrowd">BUGCROWD (VRT COMPLIANT)</option>
                    <option value="synack">SYNACK (RED TEAM FORMAT)</option>
                    <option value="intigriti">INTIGRITI</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-omega-accent">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <div className="text-xs font-mono text-gray-500 bg-omega-900/50 p-2 border-l-2 border-omega-700">
                <span className="text-omega-accent font-bold">INFO: </span>
                {PLATFORM_INFO[platform]}
              </div>
            </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-mono text-gray-400">AUTH_HEADER (Optional)</label>
          <input
            type="text"
            value={auth}
            onChange={(e) => setAuth(e.target.value)}
            placeholder="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full bg-omega-900 border border-omega-700 text-gray-300 font-mono p-3 focus:outline-none focus:border-omega-accent transition-colors rounded-sm"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-mono text-gray-400">COOKIES (Optional)</label>
          <input
            type="text"
            value={cookies}
            onChange={(e) => setCookies(e.target.value)}
            placeholder="session_id=...; security_token=..."
            className="w-full bg-omega-900 border border-omega-700 text-gray-300 font-mono p-3 focus:outline-none focus:border-omega-accent transition-colors rounded-sm"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!url || isLoading}
          className={`w-full py-4 font-mono text-lg font-bold tracking-widest uppercase transition-all duration-300 ${
            isLoading 
              ? 'bg-omega-700 text-gray-500 cursor-not-allowed'
              : 'bg-omega-accent text-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,255,65,0.7)]'
          }`}
        >
          {isLoading ? 'INITIALIZING_MODULES...' : 'INITIATE_ATTACK_VECTOR'}
        </button>
      </form>
    </div>
  );
};