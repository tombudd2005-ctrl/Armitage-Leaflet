import React, { useState } from 'react';
import { Flipbook } from './components/Flipbook';
import { Sidebar } from './components/Sidebar';
import { LeafletPage } from './types';
import { BookOpen, Menu, Share2, X, Copy, Check, Mail } from 'lucide-react';

const ShareModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  // In a real app, this would be the actual deployment URL + a generated ID
  const demoUrl = "https://leaflet-ai.demo/view/share-x9k2m";

  const handleCopy = () => {
    navigator.clipboard.writeText(demoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 px-4 animation-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 scale-100 transition-transform">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-serif font-bold text-gray-900">Share Leaflet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Public Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 truncate font-mono select-all">
                {demoUrl}
              </div>
              <button 
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${copied ? 'bg-green-100 text-green-700' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
             <h4 className="text-blue-800 font-medium text-sm mb-1">Ready to send</h4>
             <p className="text-blue-600 text-xs">
               This link allows your client to view the interactive page-turn experience on any device.
             </p>
          </div>

          <a 
            href={`mailto:?subject=Interactive Leaflet Preview&body=Hi,%0D%0A%0D%0AI wanted to share this interactive leaflet design with you. You can view the flipbook experience here:%0D%0A%0D%0A${demoUrl}`}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
          >
            <Mail size={18} />
            Send via Email
          </a>

          <p className="text-[10px] text-center text-gray-400">
            Note: For this demo, the link is a placeholder. In production, this would link to your hosted deployment.
          </p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [pages, setPages] = useState<LeafletPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleUpload = (files: FileList) => {
    const newPages: LeafletPage[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: URL.createObjectURL(file),
      file: file,
    }));
    
    // Append new pages
    setPages(prev => [...prev, ...newPages]);
  };

  const handlePageChange = (index: number) => {
    // The flipbook returns the visual index, we want to track it for AI context
    // We map visual sheet index to data index vaguely.
    // Since our simplistic "Chat" wants to know which image is visible.
    // If index is 0 (Cover), pages[0] is visible.
    // If index is 2 (Sheet 2), pages[1] and pages[2] are visible.
    // We will just track the "Primary" page (the one on the right usually, or just the index passed up)
    setCurrentPageIndex(index);
  };

  return (
    <div className="flex h-screen w-screen bg-[#1a1a1a] overflow-hidden font-sans text-gray-900">
      
      {/* Main Content Area (Flipbook) */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg">
               <BookOpen className="text-white" size={24} />
             </div>
             <div>
               <h1 className="text-white font-serif text-xl tracking-wide">LeafletAI</h1>
               <p className="text-white/60 text-xs uppercase tracking-widest">Dynamic Viewer</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3 pointer-events-auto">
            <button 
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-full font-medium text-sm hover:bg-brand-500 transition-all shadow-lg shadow-brand-900/20 group"
            >
              <Share2 size={16} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Flipbook Canvas */}
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#2a2a2a] to-[#111] relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          {pages.length > 0 ? (
            <Flipbook pages={pages} onPageChange={handlePageChange} />
          ) : (
            <div className="text-center text-white/50 max-w-md px-6">
              <div className="mb-6 inline-block p-6 rounded-full bg-white/5 border border-white/10">
                 <BookOpen size={48} className="text-white/30" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Your Leaflet is Empty</h2>
              <p className="mb-8">Upload your exported JPEG/PNG pages from InDesign or Illustrator to see the magic happen.</p>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-medium transition-all shadow-lg shadow-brand-900/50"
              >
                Open Upload Panel
              </button>
            </div>
          )}
        </main>
        
        {/* Footer Info */}
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/30 text-xs">Powered by Gemini 2.5 Flash • React • Tailwind</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 h-full flex flex-row`}>
        {/* Close button for mobile only */}
        <button 
           onClick={() => setIsSidebarOpen(false)}
           className="lg:hidden absolute -left-12 top-6 p-2 bg-white text-gray-900 rounded-l-md shadow-lg"
        >
          <Menu size={20} />
        </button>
        
        <Sidebar 
          pages={pages} 
          currentPageIndex={currentPageIndex} 
          onUpload={handleUpload} 
        />
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Share Modal */}
      {isShareOpen && <ShareModal onClose={() => setIsShareOpen(false)} />}

    </div>
  );
};

export default App;