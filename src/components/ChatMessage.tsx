import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Play, User, Bot, Sparkles, Edit2, Share2, MoreHorizontal } from 'lucide-react';

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
    <div className={`message-wrapper ${role}`}>
      <div className={`message-content-container ${role}`}>
        <div className={`message-body ${role}`}>
          <div className="message-actions" style={{ justifyContent: role === 'user' ? 'flex-end' : 'flex-start' }}>
            {role === 'user' ? (
              <>
                <button onClick={onEdit} className="btn-action user">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => copyToClipboard(content)} className="btn-action user">
                  {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => copyToClipboard(content)} className="btn-action">
                  {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
                </button>
                <button className="btn-action">
                  <Share2 size={14} />
                </button>
              </>
            )}
          </div>

          <div className={`message-bubble ${role}`}>
            {content === "" && role === 'assistant' ? (
              <div className="thinking-indicator">
                <Sparkles size={14} />
                <span>Thinking...</span>
              </div>
            ) : (
              <div className="prose prose-invert">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      const code = String(children).replace(/\n$/, '');
                      
                      if (!inline && match) {
                        return (
                          <div className="relative my-6 rounded-xl overflow-hidden border border-border text-left">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#171717] border-b border-border">
                              <span className="text-xs font-mono text-neutral-400 uppercase">{language}</span>
                              <div className="flex items-center gap-2">
                                {['html', 'css', 'javascript', 'typescript', 'jsx', 'tsx'].includes(language) && onPreview && (
                                  <button
                                    onClick={() => onPreview(code, language)}
                                    className="btn-action"
                                    title="Preview"
                                  >
                                    <Play size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => copyToClipboard(code)}
                                  className="btn-action"
                                >
                                  {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
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
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => <p>{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
                    h1: ({ children }) => <h1 className="text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-white">{children}</h3>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}

            {imageUrl && (
              <div className="generated-image-container">
                <img 
                  src={imageUrl} 
                  alt="Generated content" 
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
