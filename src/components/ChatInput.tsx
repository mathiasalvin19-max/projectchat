import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ArrowUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || files.length > 0) && !isLoading) {
      onSend(input.trim(), files);
      setInput('');
      setFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="fixed bottom-8 left-0 right-0 px-4 flex justify-center z-50">
      <form 
        onSubmit={handleSubmit}
        className={cn(
          "w-full max-w-3xl bg-[#171717] border border-[#262626] rounded-2xl p-2 shadow-2xl transition-all duration-300",
          isLoading ? "opacity-80" : "opacity-100"
        )}
      >
        <div className="relative flex flex-col">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-2">
              {files.map((file, i) => (
                <div key={i} className="bg-neutral-800 text-xs text-neutral-300 px-2 py-1 rounded-md border border-neutral-700 flex items-center gap-2">
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-white">×</button>
                </div>
              ))}
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask lineAi anything..."
            className="w-full bg-transparent text-white placeholder-neutral-500 resize-none py-3 px-4 focus:outline-none min-h-[56px] max-h-[200px] text-lg"
          />
          
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                title="Attach File"
              >
                <Paperclip size={20} />
              </button>
            </div>
            
            <button
              type="submit"
              disabled={(!input.trim() && files.length === 0) || isLoading}
              className={cn(
                "p-2 rounded-xl transition-all duration-200",
                (input.trim() || files.length > 0) && !isLoading 
                  ? "bg-white text-black hover:bg-neutral-200" 
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp size={20} />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
