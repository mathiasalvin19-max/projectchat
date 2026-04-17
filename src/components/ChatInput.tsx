import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ArrowUp, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  isLoading: boolean;
}

// Global for speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => prev + ' ' + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
    }
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
    <div className="chat-input-container">
      <form 
        onSubmit={handleSubmit}
        className={`chat-input-box ${isLoading ? 'loading' : ''}`}
      >
        <div className="relative flex flex-col">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-2">
              {files.map((file, i) => (
                <div key={i} className="file-tag">
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} 
                    className="remove-btn"
                  >
                    ×
                  </button>
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
            className="chat-input-area"
          />
          
          <div className="chat-input-actions">
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
                className="btn-action"
                title="Attach File"
              >
                <Paperclip size={20} />
              </button>
              
              <button
                type="button"
                onClick={toggleListening}
                className={`btn-action ${isListening ? 'listening' : ''}`}
                style={{ color: isListening ? '#ef4444' : undefined }}
                title={isListening ? "Stop Listening" : "Voice Input"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={(!input.trim() && files.length === 0) || isLoading}
              className={`p-2 rounded-xl transition-all duration-200 ${
                (input.trim() || files.length > 0) && !isLoading 
                  ? "bg-white text-black hover:bg-neutral-200" 
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              }`}
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
