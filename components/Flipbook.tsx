import React, { useState, useEffect } from 'react';
import { LeafletPage } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FlipbookProps {
  pages: LeafletPage[];
  onPageChange: (index: number) => void;
}

export const Flipbook: React.FC<FlipbookProps> = ({ pages, onPageChange }) => {
  // Current index represents the index of the sheet displayed on the RIGHT side being active.
  // 0 means cover is closed (if we had a cover) or first page is on right.
  const [currentPage, setCurrentPage] = useState(0);
  
  // Total sheets needed (2 pages per sheet)
  const totalSheets = Math.ceil(pages.length / 2);

  const handleNext = () => {
    if (currentPage < totalSheets) {
      const next = currentPage + 1;
      setCurrentPage(next);
      onPageChange(Math.min(next * 2 - 1, pages.length - 1)); 
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      onPageChange(Math.max(prev * 2 - 2, 0));
    }
  };

  // Keydown listener for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalSheets]);

  // Dynamic style for 9:16 Aspect Ratio containment
  // We ensure the single page fits within the viewport, considering a 2-page spread width.
  // max-width: 45vw ensures that 2 pages side-by-side (90vw) fit on screen horizontally.
  // height: 80vh ensures it fits vertically.
  const bookDimensions = {
    height: '80vh',
    width: 'auto',
    aspectRatio: '9/16',
    maxHeight: '850px',
    maxWidth: '45vw' 
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-3000 select-none overflow-visible py-8">
      
      {/* Controls - Floating */}
      <button 
        onClick={handlePrev} 
        disabled={currentPage === 0}
        className={`absolute left-4 lg:left-8 z-50 p-3 lg:p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all hover:scale-110 shadow-lg ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronLeft size={24} className="lg:w-8 lg:h-8" />
      </button>

      <button 
        onClick={handleNext} 
        disabled={currentPage === totalSheets}
        className={`absolute right-4 lg:right-8 z-50 p-3 lg:p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all hover:scale-110 shadow-lg ${currentPage === totalSheets ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <ChevronRight size={24} className="lg:w-8 lg:h-8" />
      </button>

      {/* The Book Stack (Represents the Right side stack) */}
      <div 
        className="relative preserve-3d"
        style={bookDimensions}
      >
        {/* Central Spine visual aid */}
        {/* Replaced white line with thinner dark grey line, maintaining shadow effect */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-800 opacity-50 shadow-[0_0_12px_rgba(0,0,0,0.5)] z-10 transform -translate-x-1/2"></div>

        {/* Render Sheets */}
        {Array.from({ length: totalSheets }).map((_, i) => {
          const index = i;
          const pageFrontIndex = index * 2; 
          const pageBackIndex = index * 2 + 1;
          
          const frontPage = pages[pageFrontIndex];
          const backPage = pages[pageBackIndex];
          
          const isFlipped = index < currentPage;
          
          // Z-Index Logic
          let zIndex = 0;
          if (index < currentPage) {
             // Left stack: Higher index is ON TOP
             zIndex = index;
          } else {
             // Right stack: Lower index is ON TOP
             zIndex = totalSheets - index;
          }

          return (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full origin-left duration-1000 preserve-3d cursor-pointer group`}
              style={{ 
                zIndex: zIndex,
                transform: isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                transitionTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)' // Smooth "page turn" feel
              }}
              onClick={() => {
                if (!isFlipped) handleNext();
                else handlePrev();
              }}
            >
              {/* Front of the sheet (Right Page) */}
              <div className="absolute inset-0 backface-hidden bg-white overflow-hidden rounded-r-[2px] border-l border-gray-200 shadow-md">
                 {frontPage ? (
                   <img 
                    src={frontPage.imageUrl} 
                    alt={`Page ${pageFrontIndex + 1}`} 
                    className="w-full h-full object-cover" 
                   />
                 ) : (
                   <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">Blank</div>
                 )}
                 
                 {/* Dynamic Lighting/Gradients */}
                 {/* Spine shadow gradient */}
                 <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none opacity-40" />
                 {/* Gloss reflection */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Back of the sheet (Left Page) */}
              <div 
                className="absolute inset-0 backface-hidden bg-white overflow-hidden rounded-l-[2px] border-r border-gray-200 shadow-md"
                style={{ transform: 'rotateY(180deg)' }}
              >
                {backPage ? (
                   <img 
                    src={backPage.imageUrl} 
                    alt={`Page ${pageBackIndex + 1}`} 
                    className="w-full h-full object-cover" 
                   />
                 ) : (
                   <div className="w-full h-full bg-white flex items-center justify-center text-gray-300 font-serif italic">End</div>
                 )}
                 
                 {/* Spine shadow gradient (on right side for left page) */}
                 <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none opacity-40" />
                 {/* Gloss reflection */}
                 <div className="absolute inset-0 bg-gradient-to-tl from-white/0 via-white/5 to-white/0 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
