"use client"

import React, { useState, useEffect, useRef } from 'react';
import { SendHorizontal, Loader2, ExternalLink, Bot, MinusCircle, Copy, Check, GripHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { useAuth } from '../../hooks/useAuth';

type Source = {
  title: string;
  url: string;
  similarity: number;
  type?: string;
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

const INTRO_MESSAGE = {
  type: 'assistant' as const,
  content: `I'm here to help you find information about LogicMonitor! You can ask me about:

• Product features and capabilities
• Configuration and setup guides
• Troubleshooting common issues
• Best practices and recommendations
• API and integration details

What would you like to know?`,
  timestamp: Date.now()
};

export default function RAGChat() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [height, setHeight] = useState(400);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startHeightRef = useRef(0);
  const startYRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Load chat history and show welcome message if first visit
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AI_CHAT_ENABLED !== 'true') return;
    
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    } else if (!welcomeShown) {
      setMessages([WELCOME_MESSAGE]);
      localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AI_CHAT_ENABLED !== 'true') return;
    if (messages.length > 0) {
      const messagesToStore = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
    }
  }, [messages]);

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

  const handleCopy = async (text: string | React.ReactNode[], index: number) => {
    try {
      let copyText = '';
      if (Array.isArray(text)) {
        copyText = text
          .map(node => (typeof node === 'string' ? node : ''))
          .join('')
          .replace(/\n\s*\n/g, '\n'); // Clean up extra newlines
      } else {
        copyText = String(text);
      }
      await navigator.clipboard.writeText(copyText);
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
    setMessages([INTRO_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  // Scroll when messages change or chat is opened
  useEffect(() => {
    scrollToBottom();
  }, [messages, isMinimized]);

  // Early return if not authenticated or on landing page
  if (!isAuthenticated || 
      process.env.NEXT_PUBLIC_AI_CHAT_ENABLED !== 'true' || 
      window.location.pathname === '/') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] sm:max-w-none">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center border border-white/20 gap-2 px-4 py-2 bg-[#040F4B] text-white rounded-full shadow-lg hover:bg-[#0A1B6F] transition-colors duration-200"
        >
          <Bot className="w-5 h-5" />
          <span className="text-sm">Ask Assistant</span>
        </button>
      ) : (
        <Card className="w-full sm:w-[600px] shadow-xl border border-blue-200">
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
              className="overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-50"
              style={{ height: `${height}px` }}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[95%] sm:max-w-[85%] rounded-lg p-2 sm:p-3 relative group ${
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
                    {message.type === 'assistant' ? (
                      <div className="prose prose-xs max-w-none dark:prose-invert 
                        /* Base text sizes */
                        [&>*]:text-sm 
                        [&_p]:text-sm 
                        [&_li]:text-sm 
                        
                        /* Heading styling */
                        [&_h1]:text-lg
                        [&_h1]:font-semibold
                        [&_h1]:mt-6
                        [&_h1]:mb-4
                        
                        [&_h2]:text-base
                        [&_h2]:font-semibold
                        [&_h2]:mt-5
                        [&_h2]:mb-3
                        
                        [&_h3]:text-base
                        [&_h3]:font-semibold
                        [&_h3]:mt-4
                        [&_h3]:mb-2
                        
                        [&_h4]:text-sm
                        [&_h4]:font-semibold
                        [&_h4]:mt-3
                        [&_h4]:mb-1
                        
                        /* Paragraph spacing */
                        [&_p]:my-2
                        [&_p]:leading-relaxed
                        
                        /* List styling */
                        [&_ul]:list-disc 
                        [&_ul]:pl-6 
                        [&_ul]:my-2
                        [&_ol]:list-decimal
                        [&_ol]:pl-6
                        [&_ol]:my-2
                        [&_li]:list-item
                        [&_li]:ml-4
                        [&_li]:pl-0
                        [&_li]:my-1
                        
                        /* Code styling */
                        [&_pre]:bg-gray-900
                        [&_pre]:rounded-lg
                        [&_pre]:my-3
                        [&_code:not(pre code)]:text-sm
                        [&_code:not(pre code)]:bg-gray-100
                        [&_code:not(pre code)]:px-1.5
                        [&_code:not(pre code)]:py-0.5
                        [&_code:not(pre code)]:rounded
                        
                        /* Blockquote styling */
                        [&_blockquote]:border-l-2
                        [&_blockquote]:border-blue-500
                        [&_blockquote]:pl-4
                        [&_blockquote]:my-3
                        [&_blockquote]:italic
                        [&_blockquote]:text-gray-600
                        
                        /* Section spacing */
                        [&>*:first-child]:mt-0
                        [&>*:last-child]:mb-0">
                        <ReactMarkdown
                          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                          components={{
                            code: ({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeText = React.Children.toArray(children)
                                .map(child => {
                                  if (typeof child === 'string') return child;
                                  if (React.isValidElement(child)) return child.props.children;
                                  return '';
                                })
                                .join('')
                                .trim();

                              return !inline && match ? (
                                <div className="relative group">
                                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCopy(codeText, -1);
                                        setCopiedCodeIndex(index);
                                        setTimeout(() => setCopiedCodeIndex(null), 2000);
                                      }}
                                      className="bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-xs text-white/80"
                                    >
                                      {copiedCodeIndex === index ? (
                                        <span className="flex items-center gap-1">
                                          <Check className="w-3 h-3" />
                                          Copied
                                        </span>
                                      ) : (
                                        'Copy'
                                      )}
                                    </button>
                                  </div>
                                  <div className="overflow-x-auto max-w-full">
                                    <code className={`${className} block p-6 rounded-lg m-2`} {...props}>
                                      {children}
                                    </code>
                                  </div>
                                </div>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        {process.env.NODE_ENV === 'development' && (
                          <details className="mt-4 p-2 bg-gray-100 rounded text-xs">
                            <summary className="cursor-pointer hover:text-blue-600">Raw Response</summary>
                            <pre className="whitespace-pre-wrap mt-2 px-3 py-2 bg-white rounded border border-gray-200">
                              {message.content}
                            </pre>
                          </details>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    )}
                    
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold mb-1 text-gray-500">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <ExternalLink className="w-3 h-3 mt-1 flex-shrink-0 text-blue-600" />
                              <div className="flex flex-wrap items-center gap-2">
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {source.title}
                                </a>
                                {source.type && (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium whitespace-nowrap">
                                    {source.type}
                                  </span>
                                )}
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

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-2 sm:p-3 border-t border-gray-200 bg-white">
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
                  className="bg-[#040F4B] text-white rounded-lg px-3 py-2 hover:bg-[#0A1B6F]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px]"
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