import React from 'react';
import { ScanHistoryItem } from '../types';

interface HistorySidebarProps {
  history: ScanHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  history, 
  isOpen, 
  onClose, 
  onSelectHistory,
  onClearHistory
}) => {
  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-omega-900 border-l border-omega-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-omega-800 flex justify-between items-center bg-omega-800/50">
          <h2 className="text-omega-accent font-mono font-bold tracking-wider">SCAN_LOGS</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-600 font-mono text-sm mt-10">
              NO_LOGS_FOUND
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className="bg-black border border-omega-800 p-3 hover:border-omega-accent cursor-pointer group transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-mono text-gray-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                   <div className="flex space-x-2">
                     <span className={`text-xs font-mono uppercase px-1 rounded ${item.mode === 'validate' ? 'bg-red-900/30 text-red-500' : 'bg-blue-900/30 text-blue-500'}`}>
                        {item.mode || 'safe'}
                     </span>
                     <span className="text-xs font-mono text-gray-600 uppercase border border-gray-800 px-1 rounded">{item.platform}</span>
                   </div>
                </div>
                <h4 className="text-gray-300 font-mono text-sm font-bold truncate mb-2 group-hover:text-omega-accent">{item.targetUrl}</h4>
                <div className="flex space-x-2">
                   {parseInt(item.stats.critical) > 0 && (
                     <span className="px-1.5 py-0.5 bg-red-900/30 text-red-500 text-[10px] border border-red-900 rounded font-mono">
                       CRIT: {item.stats.critical}
                     </span>
                   )}
                   {parseInt(item.stats.high) > 0 && (
                     <span className="px-1.5 py-0.5 bg-orange-900/30 text-orange-500 text-[10px] border border-orange-900 rounded font-mono">
                       HIGH: {item.stats.high}
                     </span>
                   )}
                   {(parseInt(item.stats.critical) === 0 && parseInt(item.stats.high) === 0) && (
                     <span className="px-1.5 py-0.5 bg-green-900/30 text-green-500 text-[10px] border border-green-900 rounded font-mono">
                       CLEAN
                     </span>
                   )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-omega-800">
           <button 
             onClick={onClearHistory}
             className="w-full py-2 border border-red-900/50 text-red-700 hover:bg-red-900/20 hover:text-red-500 font-mono text-xs uppercase transition-colors"
           >
             PURGE_LOGS
           </button>
        </div>
      </div>
    </div>
  );
};