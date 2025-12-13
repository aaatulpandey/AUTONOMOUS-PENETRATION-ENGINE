import React from 'react';
import { marked } from 'marked';

interface ReportViewProps {
  reportMarkdown: string;
  platform?: string;
  onClose: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ reportMarkdown, platform, onClose }) => {
  const getHtml = () => {
    return { __html: marked.parse(reportMarkdown) as string };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex justify-center items-start overflow-y-auto p-4 md:p-10 backdrop-blur-sm animate-fade-in">
      <div className="bg-omega-900 w-full max-w-5xl border border-omega-700 shadow-2xl rounded-lg flex flex-col min-h-[80vh]">
        
        {/* Toolbar */}
        <div className="sticky top-0 bg-omega-800 border-b border-omega-700 p-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-4">
            <span className="text-omega-accent font-mono font-bold text-lg">OMEGA_REPORT_VIEWER</span>
            <div className="flex space-x-2">
                <span className="px-2 py-0.5 bg-gray-800 text-xs font-mono text-gray-400 rounded">READ_ONLY</span>
                {platform && (
                    <span className="px-2 py-0.5 bg-omega-accent/20 text-xs font-mono text-omega-accent border border-omega-accent/50 rounded uppercase">
                        {platform}_FORMAT
                    </span>
                )}
            </div>
          </div>
          <div className="flex space-x-4">
             <button 
              onClick={onClose}
              className="text-red-500 hover:text-red-400 font-mono text-sm uppercase font-bold"
            >
              [X] Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 font-mono text-gray-300 text-sm leading-relaxed">
          <div className="prose prose-invert prose-headings:text-omega-accent prose-a:text-blue-400 prose-code:text-green-400 prose-pre:bg-black prose-pre:border prose-pre:border-omega-800 max-w-none" dangerouslySetInnerHTML={getHtml()} />
        </div>
      </div>
    </div>
  );
};
