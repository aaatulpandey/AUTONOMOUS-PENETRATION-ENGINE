import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, FullScanResult } from '../types';
import { Chat } from '@google/genai';
import { createReportChat } from '../services/geminiService';

interface ChatInterfaceProps {
  scanResult: FullScanResult;
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ scanResult, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: 'OMEGA TACTICAL ADVISOR ONLINE. Awaiting queries regarding the scan report.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    if (!chatRef.current) {
      chatRef.current = createReportChat(scanResult);
    }
  }, [scanResult]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text || "NO_DATA_RECEIVED";

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "CONNECTION_ERROR: Advisor offline. " + (error as Error).message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-black border border-omega-accent shadow-[0_0_20px_rgba(0,255,65,0.2)] rounded-lg flex flex-col z-50 animate-fade-in font-mono overflow-hidden">
      {/* Header */}
      <div className="bg-omega-accent text-black p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
          <span className="font-bold text-sm tracking-widest">TACTICAL_ADVISOR</span>
        </div>
        <button onClick={onClose} className="hover:text-white transition-colors font-bold">
          [X]
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-90 bg-black"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3 rounded text-xs ${
              msg.role === 'user' 
                ? 'bg-omega-800 text-gray-200 border border-gray-700' 
                : 'bg-omega-accent/10 text-green-400 border border-omega-accent/30'
            }`}>
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-600 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        {isTyping && (
           <div className="flex items-center space-x-1 text-omega-accent text-xs animate-pulse pl-2">
             <span>Thinking</span>
             <span>...</span>
           </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-omega-900 border-t border-omega-800 flex">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query intelligence database..."
          className="flex-1 bg-black border border-omega-700 text-omega-accent text-xs p-2 focus:outline-none focus:border-omega-accent rounded-l"
        />
        <button 
          type="submit"
          className="bg-omega-800 border-y border-r border-omega-700 text-gray-300 hover:text-white hover:bg-omega-700 px-3 py-2 text-xs font-bold uppercase rounded-r transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};
