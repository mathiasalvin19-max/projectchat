import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Play, User, Bot, Sparkles, Edit2, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  onPreview?: (code: string, language: string) => void;
  onEdit?: () => void;
}

export function ChatMessage({ role, content, imageUrl, onPreview, onEdit }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "w-full py-6 flex",
      role === 'user' ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "w-full px-6 sm:px-12 flex flex-col gap-2",
        role === 'user' ? "max-w-3xl" : "max-w-none w-full"
      )}>
        <div className={cn(
          "flex-1 min-w-0 space-y-2",
          role === 'user' ? "text-right" : "text-left w-full"
        )}>
          <div className="flex items-center gap-3 mb-2 transition-opacity" style={{ justifyContent: role === 'user' ? 'flex-end' : 'flex-start' }}>
            {role === 'user' ? (
              <>
                <button onClick={onEdit} className="p-2 text-neutral-500 hover:text-white transition-colors bg-neutral-900/50 rounded-md border border-neutral-800">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => copyToClipboard(content)} className="p-2 text-neutral-500 hover:text-white transition-colors bg-neutral-900/50 rounded-md border border-neutral-800">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => copyToClipboard(content)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                  <Share2 size={14} />
                </button>
              </>
            )}
          </div>

          <div className={cn(
            "inline-block rounded-3xl",
            role === 'user' 
              ? "bg-neutral-900/80 border border-neutral-800 p-5 sm:p-6 ml-12" 
              : "bg-transparent w-full p-2"
          )}>
            {content === "" && role === 'assistant' ? (
              <div className="flex items-center gap-2 text-neutral-500 text-sm animate-pulse">
                <Sparkles size={14} />
                <span>Thinking...</span>
              </div>
            ) : (
              <div className={cn(
                "prose prose-invert max-w-none",
                role === 'user' ? "text-right" : "text-left w-full"
              )}>
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      const code = String(children).replace(/\n$/, '');
                      
                      if (!inline && match) {
                        return (
                          <div className="relative group my-6 rounded-xl overflow-hidden border border-[#262626] text-left">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#171717] border-b border-[#262626]">
                              <span className="text-xs font-mono text-neutral-400 uppercase">{language}</span>
                              <div className="flex items-center gap-2">
                                {['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx'].includes(language) && onPreview && (
                                  <button
                                    onClick={() => onPreview(code, language)}
                                    className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                                    title="Preview"
                                  >
                                    <Play size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => copyToClipboard(code)}
                                  className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                                >
                                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              className="!m-0 !bg-[#0d0d0d] !p-4"
                              {...props}
                            >
                              {code}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      return (
                        <code className={cn("bg-neutral-800 px-1.5 py-0.5 rounded text-sm", className)} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => <p className="text-neutral-200 leading-relaxed mb-4 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-200">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-200">{children}</ol>,
                    h1: ({ children }) => <h1 className="text-2xl font-semibold mb-4 text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-white">{children}</h3>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}

            {imageUrl && (
              <div className={cn(
                "mt-4 rounded-2xl overflow-hidden border border-[#262626] max-w-lg shadow-xl",
                role === 'user' ? "ml-auto" : "mr-auto"
              )}>
                <img 
                  src={imageUrl} 
                  alt="Generated content" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
