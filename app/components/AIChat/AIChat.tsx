"use client"

import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal, Loader2, ExternalLink, Bot, MinusCircle, Copy, Check, GripHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type Source = {
  title: string;
  url: string;
  similarity: number;
};

type Message = {
  type: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: number;
};

const STORAGE_KEY = 'lm-chat-history';
const WELCOME_SHOWN_KEY = 'lm-chat-welcome-shown';
const MAX_MESSAGES = 50;

const WELCOME_MESSAGE = {
  type: 'assistant' as const,
  content: `👋 Welcome to the LogicMonitor Assistant! 

I can help you find information about LogicMonitor's features, configurations, and best practices. I have access to LogicMonitor's support documentation and can assist with:

• Product features and capabilities
• Configuration and setup guides
• Troubleshooting common issues
• Best practices and recommendations
• API and integration details

Feel free to ask any questions about LogicMonitor!`,
  timestamp: Date.now()
};

export default function RAGChat() {
  // Early return if chat is disabled
  if (process.env.NEXT_PUBLIC_AI_CHAT_ENABLED !== 'true') {
    return null;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [height, setHeight] = useState(400); // Default height
  const resizeRef = useRef<HTMLDivElement>(null);
  const startHeightRef = useRef(0);
  const startYRef = useRef(0);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = height;

    const handleResizeMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.min(Math.max(300, startHeightRef.current + deltaY), window.innerHeight - 200);
      setHeight(newHeight);
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Load chat history and show welcome message if first visit
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    } else if (!welcomeShown) {
      // Show welcome message on first visit
      setMessages([WELCOME_MESSAGE]);
      localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      const messagesToStore = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
    }
  }, [messages]);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: userMessage,
      timestamp: Date.now()
    }]);
    setIsLoading(true);

    try {
      // Get the last few messages for context (e.g., last 5 messages)
      const recentHistory = messages.slice(-5).map(msg => ({
        type: msg.type,
        content: msg.content
      }));

      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMessage,
          history: recentHistory 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center border border-white/20 gap-2 px-4 py-2 bg-[#040F4B] text-white rounded-full shadow-lg hover:bg-[#0A1B6F] transition-colors duration-200"
        >
          <Bot className="w-5 h-5" />
          <span>Ask Assistant</span>
        </button>
      ) : (
        <Card className="w-[400px] shadow-xl border border-blue-200">
          <div
            ref={resizeRef}
            onMouseDown={handleResizeStart}
            className="absolute -top-3 left-0 w-full h-6 flex items-center justify-center cursor-ns-resize group"
          >
            <div className="w-12 h-1 rounded-full bg-gray-300 group-hover:bg-gray-400 transition-colors" />
          </div>

          <div className="bg-gradient-to-r from-[#040F4B] to-blue-600 p-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">LogicMonitor Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-white/80 hover:text-white text-xs px-2 py-1 rounded border border-white/20 hover:border-white/40 transition-colors"
                >
                  Clear History
                </button>
              )}
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <MinusCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <CardContent className="p-0">
            <div 
              className="overflow-y-auto p-4 space-y-4 bg-gray-50"
              style={{ height: `${height}px` }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 relative group ${
                      message.type === 'user'
                        ? 'bg-[#040F4B] text-white'
                        : 'bg-white shadow-sm border border-gray-200'
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <button
                        onClick={() => handleCopy(message.content, index)}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-50 border border-gray-200"
                        title="Copy response"
                      >
                        {copiedIndex === index ? (
                          <div className="flex items-center gap-1 px-2 py-1 text-green-600">
                            <Check className="w-3 h-3" />
                            <span className="text-xs">Copied</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 text-gray-600">
                            <Copy className="w-3 h-3" />
                            <span className="text-xs">Copy</span>
                          </div>
                        )}
                      </button>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold mb-1 text-gray-500">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="flex items-start space-x-1">
                              <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-600" />
                              <div className="text-xs">
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {source.title}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Thinking...</p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about LogicMonitor..."
                  className="flex-1 text-sm rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-[#040F4B] text-white rounded-lg px-3 py-2 hover:bg-[#0A1B6F]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}