import React, { useState, useEffect, useRef } from 'react';
import { Upload, Sparkles, MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { LeafletPage, ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';

interface SidebarProps {
  pages: LeafletPage[];
  currentPageIndex: number;
  onUpload: (files: FileList) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ pages, currentPageIndex, onUpload }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'ai'>('upload');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Clear analysis when page changes (optional, depends on UX preference)
  useEffect(() => {
    // We could auto-analyze here, but let's keep it user triggered to save tokens/api calls
    setAnalysisText(null); 
  }, [currentPageIndex]);

  const handleAnalyze = async () => {
    if (pages.length === 0) return;
    
    setIsAnalyzing(true);
    const activePage = pages[currentPageIndex] || pages[0];
    
    if (activePage) {
      const result = await geminiService.analyzePage(activePage.file);
      setAnalysisText(result);
    }
    setIsAnalyzing(false);
  };

  const handleSendChat = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    
    // Add placeholder for loading
    const loadingMsgId = (Date.now() + 1).toString();
    setChatHistory(prev => [...prev, { id: loadingMsgId, role: 'model', text: '', isLoading: true }]);

    const activePage = pages[currentPageIndex] || pages[0];
    const responseText = await geminiService.chatWithPage(chatHistory, userMsg.text, activePage ? activePage.file : null);

    setChatHistory(prev => prev.map(msg => 
      msg.id === loadingMsgId ? { ...msg, text: responseText, isLoading: false } : msg
    ));
  };

  return (
    <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl z-20">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Upload size={16} /> Source Files
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Sparkles size={16} /> AI Companion
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 custom-scrollbar">
        
        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
              <input 
                type="file" 
                multiple 
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => e.target.files && onUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload size={24} />
              </div>
              <h3 className="font-medium text-gray-900">Upload Pages</h3>
              <p className="text-sm text-gray-500 mt-1">Export your InDesign/Illustrator files as JPG or PNG and drop them here.</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pages ({pages.length})</h4>
              {pages.map((page, idx) => (
                <div key={page.id} className={`flex items-center gap-3 p-2 rounded-lg border ${idx === currentPageIndex ? 'bg-brand-50 border-brand-200' : 'bg-white border-gray-200'}`}>
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-500 bg-gray-100 rounded-full">{idx + 1}</span>
                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={page.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{page.file.name}</p>
                    <p className="text-xs text-gray-500">{(page.file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  {idx === currentPageIndex && <div className="w-2 h-2 rounded-full bg-brand-500"></div>}
                </div>
              ))}
              {pages.length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-4">No pages uploaded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full">
             {pages.length === 0 ? (
               <div className="text-center py-10 px-4">
                 <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Sparkles size={24} />
                 </div>
                 <h3 className="text-gray-900 font-medium">No Content to Analyze</h3>
                 <p className="text-gray-500 text-sm mt-2">Please upload your leaflet pages first.</p>
               </div>
             ) : (
               <>
                 {/* Quick Action: Analyze Page */}
                 <div className="mb-6">
                   <button 
                     onClick={handleAnalyze}
                     disabled={isAnalyzing}
                     className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                     {isAnalyzing ? 'Analyzing Page...' : 'Analyze Current Page'}
                   </button>
                   
                   {analysisText && (
                     <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100 text-sm text-gray-800 prose prose-sm max-w-none">
                       <div className="flex justify-between items-start mb-2">
                         <h5 className="font-bold text-purple-900 text-xs uppercase">Page Analysis</h5>
                         <button onClick={() => setAnalysisText(null)} className="text-purple-400 hover:text-purple-700"><X size={14}/></button>
                       </div>
                       <div className="whitespace-pre-wrap text-xs leading-relaxed">
                         {analysisText}
                       </div>
                     </div>
                   )}
                 </div>

                 <div className="flex-1 flex flex-col min-h-0">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MessageSquare size={12}/> Chat with this page
                    </h4>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar mb-4 min-h-[200px]">
                      {chatHistory.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          Ask specific questions about prices, dates, or design details on this page.
                        </div>
                      )}
                      {chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                            {msg.isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : msg.text}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="Ask about this page..."
                        className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
                      />
                      <button 
                        onClick={handleSendChat}
                        disabled={!input.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                 </div>
               </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
