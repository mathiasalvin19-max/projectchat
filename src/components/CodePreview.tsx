import React, { useEffect, useState } from 'react';
import { X, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CodePreviewProps {
  code: string;
  language: string;
  onClose: () => void;
}

export function CodePreview({ code, language, onClose }: CodePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    // Basic logic to wrap code in HTML if it's just JS/CSS
    let doc = '';
    if (language === 'html') {
      doc = code;
    } else if (language === 'css') {
      doc = `<html><head><style>${code}</style></head><body></body></html>`;
    } else if (['javascript', 'typescript', 'jsx', 'tsx'].includes(language)) {
      doc = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; margin: 0; padding: 20px; background: white; color: black; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="module">
              try {
                ${code}
              } catch (err) {
                document.body.innerHTML = '<pre style="color: red">' + err.message + '</pre>';
              }
            </script>
          </body>
        </html>
      `;
    } else {
      doc = `<html><body><pre>${code}</pre></body></html>`;
    }
    setSrcDoc(doc);
  }, [code, language]);

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300",
      isFullscreen ? "p-0" : "p-4 sm:p-8"
    )}>
      <div className={cn(
        "bg-[#0a0a0a] border border-[#262626] shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
        isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-5xl h-[80vh] rounded-2xl"
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
            </div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Preview: {language}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSrcDoc(prev => prev + ' ')} // Force reload
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-white">
          <iframe
            title="preview"
            srcDoc={srcDoc}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-modals"
          />
        </div>
      </div>
    </div>
  );
}
