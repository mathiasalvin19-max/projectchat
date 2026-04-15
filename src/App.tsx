import React, { useState, useEffect, useRef } from 'react';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { CodePreview } from './components/CodePreview';
import { chatWithLineAi, generateImage, Message } from './services/geminiService';
import { Sparkles, Command, Zap, Layers, Code, Plus, History, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export default function App() {
  const [chats, setChats] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('lineai_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<{ code: string; language: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(c => c.id === currentChatId);
  const messages = currentChat?.messages || [];

  useEffect(() => {
    localStorage.setItem('lineai_chats', JSON.stringify(chats));
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newChat: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
      timestamp: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newId);
    setShowHistory(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) setCurrentChatId(null);
  };

  const handleSend = async (content: string, files?: File[]) => {
    let chatId = currentChatId;
    let updatedChats = [...chats];

    if (!chatId) {
      const newId = Date.now().toString();
      const newChat: ChatSession = {
        id: newId,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [],
        timestamp: Date.now()
      };
      updatedChats = [newChat, ...updatedChats];
      setChats(updatedChats);
      setCurrentChatId(newId);
      chatId = newId;
    }

    let finalContent = content;
    if (files && files.length > 0) {
      finalContent += `\n\n[Attached Files: ${files.map(f => f.name).join(', ')}]`;
    }

    const newUserMessage: Message = { role: 'user', content: finalContent };
    
    setChats(prev => prev.map(c => 
      c.id === chatId ? { ...c, messages: [...c.messages, newUserMessage] } : c
    ));
    
    setIsLoading(true);

    try {
      let assistantContent = "";
      const assistantMessage: Message = { role: 'assistant', content: "" };
      
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, messages: [...c.messages, assistantMessage] } : c
      ));

      const chatMessages = updatedChats.find(c => c.id === chatId)?.messages || [];

      await chatWithLineAi(
        [...chatMessages, newUserMessage], 
        (chunk) => {
          assistantContent += chunk;
          setChats(prev => prev.map(c => 
            c.id === chatId ? {
              ...c,
              messages: c.messages.map((m, i) => 
                i === c.messages.length - 1 ? { ...m, content: assistantContent } : m
              )
            } : c
          ));
        },
        (imageUrl) => {
          setChats(prev => prev.map(c => 
            c.id === chatId ? {
              ...c,
              messages: c.messages.map((m, i) => 
                i === c.messages.length - 1 ? { ...m, imageUrl } : m
              )
            } : c
          ));
        }
      );
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = { role: 'assistant', content: "I encountered an error. Please try again." };
      setChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, messages: [...c.messages, errorMessage] } : c
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const isInitialState = !currentChatId || messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col selection:bg-white selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-black fill-black" />
            </div>
            <span className="font-semibold text-lg tracking-tight">lineAi</span>
          </div>
          
          <button 
            onClick={createNewChat}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-border text-xs font-medium text-neutral-300 transition-colors"
          >
            <Plus size={14} />
            <span>New Chat</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-neutral-400 hover:text-white transition-colors relative"
          >
            <History size={20} />
            {chats.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
            )}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 rounded-full border border-border text-xs font-medium text-neutral-400">
            <Command size={12} />
            <span>K</span>
          </div>
        </div>
      </header>

      {/* History Sidebar/Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0a0a0a] border-l border-border z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-semibold">History</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 text-neutral-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {chats.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500">
                    <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
                    <p>No chat history yet</p>
                  </div>
                ) : (
                  chats.map(chat => (
                    <div 
                      key={chat.id}
                      onClick={() => {
                        setCurrentChatId(chat.id);
                        setShowHistory(false);
                      }}
                      className={cn(
                        "group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                        currentChatId === chat.id 
                          ? "bg-white text-black border-white" 
                          : "bg-neutral-900/50 border-border hover:bg-neutral-800"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{chat.title}</p>
                        <p className={cn(
                          "text-[10px] uppercase tracking-wider mt-1",
                          currentChatId === chat.id ? "text-black/60" : "text-neutral-500"
                        )}>
                          {new Date(chat.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => deleteChat(chat.id, e)}
                        className={cn(
                          "p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                          currentChatId === chat.id ? "hover:bg-black/10 text-black" : "hover:bg-neutral-700 text-neutral-400"
                        )}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-border">
                <button 
                  onClick={createNewChat}
                  className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  <span>Start New Chat</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-500",
        isInitialState ? "justify-center items-center" : "pt-24 pb-40"
      )}>
        {isInitialState ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 w-full max-w-2xl px-4"
          >
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter">
                What can I <br /> <span className="text-neutral-500">help you build?</span>
              </h1>
              <p className="text-neutral-400 text-lg sm:text-xl max-w-md mx-auto">
                lineAi is your technical partner for coding, design, and creative tasks.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: <Code size={16} />, label: "Write a React hook" },
                { icon: <Sparkles size={16} />, label: "Design a landing page" },
                { icon: <Zap size={16} />, label: "Optimize SQL query" }
              ].map((item, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(item.label)}
                  className="flex items-center gap-2 px-4 py-3 bg-neutral-900/50 border border-border rounded-xl hover:bg-neutral-800 transition-colors text-sm text-neutral-300"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="w-full">
            {messages.map((msg, index) => (
              <ChatMessage 
                key={index}
                role={msg.role}
                content={msg.content}
                imageUrl={msg.imageUrl}
                onPreview={(code, lang) => setPreview({ code, language: lang })}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <ChatInput 
        onSend={handleSend} 
        isLoading={isLoading} 
      />

      {/* Code Preview Modal */}
      <AnimatePresence>
        {preview && (
          <CodePreview 
            code={preview.code} 
            language={preview.language} 
            onClose={() => setPreview(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
