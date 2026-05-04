import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Send, Upload, ChevronLeft, MessageSquare, FileText, Layout, Share2, Plus, Zap, Cpu, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type Message = {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  documentName?: string;
};

type Mode = 'QA' | 'Summary' | 'Slides' | 'Viz';
type SummarySubMode = 'Snapshot' | 'Overview' | 'Deep Dive';

export default function ChatApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'ai', text: `Hello ${user?.displayName || 'there'}! I'm SmartDoc. Upload a PDF and I'll help you analyze it. What would you like to do?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('QA');
  const [summarySubMode, setSummarySubMode] = useState<SummarySubMode>('Overview');
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
      documentName: activeFileIndex !== null ? files[activeFileIndex].name : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: getMockResponse(input, mode, summarySubMode),
        timestamp: new Date(),
        documentName: activeFileIndex !== null ? files[activeFileIndex].name : undefined
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const getMockResponse = (query: string, currentMode: Mode, subMode: SummarySubMode) => {
    if (currentMode === 'Summary') {
      if (subMode === 'Snapshot') return "Snapshot Summary: This document explores the intersection of AI and document intelligence, focusing on 3 key pillars: RAG, Semantic Search, and LLM orchestration.";
      if (subMode === 'Deep Dive') return "Detailed Analysis (Deep Dive):\n\nChapter 1 highlights the historical context of PDF processing...\n\nChapter 2 introduces the 'SmartDoc' architecture which solves the CTRL+F limitation by using vector embeddings...\n\nConclusion: The future of document intelligence lies in conversational agents that reason over grounded data.";
      return "Overview: The text focuses on the strategic implementation of AI in enterprise workflows, highlighting efficiency gains of 30% while noting initial integration challenges.";
    }
    if (currentMode === 'Slides') return "I've generated a slide outline for you: \n1. Executive Summary\n2. The Core Problem\n3. Our AI Solution\n4. Implementation Roadmap\n5. Q&A Session";
    if (currentMode === 'Viz') return "Generating Diagram...\n\n[Mermaid Chart Created: Process flow from Data Input -> Cleaning -> Vector Storage -> Querying]";
    return `I found information related to "${query}" in Section 3.2. It states that the primary objectives are aligned with the 2025 sustainability goals.`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      const newFile = { name: file.name, size: sizeStr };
      setFiles(prev => {
        const next = [...prev, newFile];
        setActiveFileIndex(next.length - 1);
        return next;
      });
      setMessages(prev => [...prev, {
        id: 'upload-' + Date.now(),
        type: 'ai',
        text: `I've successfully indexed '${file.name}'. I'm ready to answer questions or generate summaries based on its content.`,
        timestamp: new Date()
      }]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen bg-[#0f1117] text-[#e5e7eb] font-sans overflow-hidden"
    >
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf"
        className="hidden" 
      />
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#111318] border-r border-white/5 flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link to="/" className="text-xl font-black text-white tracking-tighter">
            Smart<span className="text-[#2563eb]">Doc</span>
          </Link>
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors md:hidden"
          >
            <X size={16} className="text-[#6b7280]" />
          </button>
        </div>

        <div className="flex-1 p-4 flex flex-col gap-8 overflow-y-auto">
          <div>
             <button 
               type="button"
               onClick={triggerFileUpload}
               className="w-full flex items-center gap-3 px-4 py-3 bg-[#2563eb] text-white rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-blue-900/10 mb-2"
              >
              <Plus size={18} /> New Document
             </button>
             <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest px-4 mt-6 mb-4">Files</p>
             {files.length > 0 ? (
               files.map((f, i) => (
                 <div 
                   key={i} 
                   onClick={() => setActiveFileIndex(i)}
                   className={`flex items-center gap-3 px-4 py-3 rounded-xl border group cursor-pointer transition-colors ${activeFileIndex === i ? 'bg-[#2563eb]/10 border-[#2563eb]/50 ring-1 ring-[#2563eb]/30' : 'bg-white/5 border-white/5 hover:border-[#2563eb]/50'}`}
                 >
                   <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold leading-none ${activeFileIndex === i ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'bg-red-500/20 text-red-500'}`}>PDF</div>
                   <div className="flex-1 overflow-hidden">
                     <p className={`text-xs font-bold truncate ${activeFileIndex === i ? 'text-white' : 'text-[#6b7280] group-hover:text-white'}`}>{f.name}</p>
                     <p className="text-[10px] text-[#6b7280]">{f.size}</p>
                   </div>
                 </div>
               ))
             ) : (
               <div className="px-4 py-8 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                 <Upload size={24} className="text-[#6b7280] mb-3 opacity-50" />
                 <p className="text-xs text-[#6b7280] font-medium leading-relaxed">Drag & drop PDF here<br/>to start analyzing</p>
               </div>
             )}
          </div>

          <div>
             <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-widest px-4 mb-4">Operations</p>
             <div className="space-y-1">
                {[
                  { id: 'QA', label: 'Semantic QA', icon: MessageSquare },
                  { id: 'Summary', label: 'Summary Engine', icon: FileText },
                  { id: 'Slides', label: 'Slide Generator', icon: Layout },
                  { id: 'Viz', label: 'Visualizer', icon: Share2 },
                ].map((item) => (
                  <div key={item.id}>
                    <button 
                      type="button"
                      onClick={() => setMode(item.id as Mode)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${mode === item.id ? 'bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20' : 'text-[#6b7280] hover:bg-white/5'}`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </button>
                    
                    {/* Summary Sub-options */}
                    {mode === 'Summary' && item.id === 'Summary' && (
                      <div className="mt-2 ml-4 flex flex-col gap-1 border-l border-white/5 pl-4 py-1">
                        {(['Snapshot', 'Overview', 'Deep Dive'] as SummarySubMode[]).map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSummarySubMode(sub);
                            }}
                            className={`text-left text-[11px] py-1.5 px-2 rounded-lg transition-colors ${summarySubMode === sub ? 'text-[#2563eb] bg-[#2563eb]/5 font-bold' : 'text-[#6b7280] hover:text-white'}`}
                          >
                            • {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
           <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#7c3aed] flex items-center justify-center text-white text-[10px] font-bold">
                  {user?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.displayName || 'User'}</p>
                <p className="text-[10px] text-[#6b7280] truncate">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-white/5 rounded-lg text-[#6b7280] hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-[70px] border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0f1117]/80 backdrop-blur-md sticky top-0 z-30">
           <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-[#6b7280] hover:text-white md:hidden"
              >
                <Menu size={24} />
              </button>
              <Link to="/" className="hidden md:block text-lg font-black text-white pr-4 border-r border-white/5">SD</Link>
              <div className="flex flex-col">
                <h2 className="text-sm font-bold text-white">
                  {activeFileIndex !== null ? files[activeFileIndex].name : 'No Document Selected'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeFileIndex !== null ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-tighter">
                    {activeFileIndex !== null ? 'Gemini-2.0 Flash Active' : 'System Ready'}
                  </span>
                </div>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold hover:bg-white/10 transition-colors">
                <Zap size={12} className="text-[#2563eb]" /> 
                UPGRADE PRO
              </button>
              <button 
                type="button"
                className="p-2 bg-white/5 rounded-lg border border-white/5 text-[#6b7280] hover:text-white transition-colors">
                <Share2 size={16} />
              </button>
           </div>
        </header>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
           <div className="max-w-3xl mx-auto space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 ${msg.type === 'ai' ? 'bg-[#1a1d25]' : 'bg-[#2563eb]'}`}>
                    {msg.type === 'ai' ? <Cpu size={20} className="text-[#2563eb]" /> : <MessageSquare size={20} className="text-white" />}
                  </div>
                  <div className={`flex-1 flex flex-col ${msg.type === 'user' ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed border ${
                      msg.type === 'ai' 
                        ? 'bg-[#111318] border-white/5 text-[#e5e7eb] rounded-tl-none' 
                        : 'bg-[#2563eb] border-[#2563eb] text-white rounded-tr-none'
                    }`}>
                      {msg.text}
                      {msg.documentName && (
                        <div className={`mt-3 pt-2 border-t border-white/10 text-[9px] font-bold uppercase tracking-[0.1em] ${msg.type === 'ai' ? 'text-[#2563eb]' : 'text-blue-200 opacity-80'}`}>
                          Ref: {msg.documentName}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6b7280] mt-2 font-mono">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1d25] border border-white/5 flex items-center justify-center">
                    <Cpu size={20} className="text-[#2563eb]" />
                  </div>
                  <div className="bg-[#111318] border border-white/5 px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#6b7280] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#6b7280] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#6b7280] rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
           </div>
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-white/5 bg-[#0f1117]">
          <div className="max-w-3xl mx-auto group">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'Summary' ? `Explain with ${summarySubMode}...` : `Type your request for ${mode} mode...`}
                className="w-full bg-[#1a1d25] border border-white/5 rounded-2xl pl-14 pr-16 py-4 text-sm focus:outline-none focus:border-[#2563eb]/50 transition-all shadow-2xl"
              />
              <div 
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg text-[#6b7280] transition-colors cursor-pointer flex items-center justify-center"
                onClick={triggerFileUpload}
              >
                <Upload size={20} />
              </div>
              <button 
                type="button"
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#2563eb] text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-blue-900/20"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-4 flex justify-between items-center px-2">
              <div className="flex gap-4">
                <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest flex items-center gap-1 focus-within:text-[#2563eb]">
                  <Zap size={10} /> Active Tokens: 1,402
                </span>
                <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest flex items-center gap-1">
                  <FileText size={10} /> Page 14 Reference
                </span>
              </div>
              <p className="text-[10px] text-[#6b7280] font-medium italic">Shift + Enter for new line</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2563eb]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
    </motion.div>
  );
}
