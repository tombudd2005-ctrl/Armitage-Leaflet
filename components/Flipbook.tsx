import React, { useRef, useEffect, useState, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { PageImage } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FlipbookProps {
  pages: PageImage[];
}

export const Flipbook: React.FC<FlipbookProps> = ({ pages }) => {
  const flipBook = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = pages.length;

  const handleFlip = (e: any) => {
    const page = e.data;
    setCurrentPage(page);
  };

  const handleNext = useCallback(() => {
    if (flipBook.current && currentPage < totalPages - 1) {
      flipBook.current.pageFlip().flipNext();
    }
  }, [currentPage, totalPages]);

  const handlePrev = useCallback(() => {
    if (flipBook.current && currentPage > 0) {
      flipBook.current.pageFlip().flipPrev();
    }
  }, [currentPage, totalPages]);

  // Calculate dimensions to maximize book size
  // Images are 1689×3000 (width×height), so aspect ratio is ~0.563
  const getPageSize = () => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const imageAspectRatio = 1689 / 3000; // ~0.563
    const isMobile = viewportWidth < 768; // Mobile breakpoint
    
    // Reserve space for navigation bar at bottom (80px on desktop, 70px on mobile)
    const navBarHeight = isMobile ? 70 : 80;
    const availableHeight = viewportHeight - navBarHeight;
    
    // On mobile, use more of the available height (95%), on desktop use 90%
    const heightPercentage = isMobile ? 0.95 : 0.9;
    let targetPageHeight = availableHeight * heightPercentage;
    let pageWidth = targetPageHeight * imageAspectRatio;
    
    if (isMobile) {
      // On mobile: show single page, scale to fit width
      const widthPercentage = 0.98;
      const availableWidth = viewportWidth * widthPercentage;
      
      // If single page is too wide, scale down to fit
      if (pageWidth > availableWidth) {
        const scale = availableWidth / pageWidth;
        pageWidth = pageWidth * scale;
        targetPageHeight = targetPageHeight * scale;
      }
    } else {
      // On desktop: show double-page spread
      // Total width needed = 2 * pageWidth
      const totalWidthNeeded = pageWidth * 2;
      const availableWidth = viewportWidth * 0.95;
      
      // If the double-page spread is too wide, scale down to fit
      if (totalWidthNeeded > availableWidth) {
        const scale = availableWidth / totalWidthNeeded;
        pageWidth = pageWidth * scale;
        targetPageHeight = targetPageHeight * scale;
      }
    }
    
    return {
      width: Math.floor(pageWidth),
      height: Math.floor(targetPageHeight),
    };
  };

  const [pageSize, setPageSize] = useState(getPageSize());
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setPageSize(getPageSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Flipbook Container */}
      <div className="flex-1 flex items-center justify-center">
        <HTMLFlipBook
          ref={flipBook}
          width={pageSize.width}
          height={pageSize.height}
          minWidth={200}
          maxWidth={3000}
          minHeight={300}
          maxHeight={4000}
          size="fixed"
          startPage={0}
          drawShadow={false}
          flippingTime={800}
          usePortrait={isMobile}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0}
          showCover={true}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
          onFlip={handleFlip}
          className=""
          style={{}}
        >
          {pages.map((page, index) => (
            <div key={index} className="page bg-white flex items-center justify-center">
              <img
                src={page.src}
                alt={`Page ${index + 1}`}
                style={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                }}
                draggable={false}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 py-3 px-6 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === 0
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : 'text-white hover:bg-white/10 active:bg-white/20'
            }`}
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Progress Bar and Page Info */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full max-w-md h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
              />
            </div>
            <div className="text-white text-sm">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentPage === totalPages - 1
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : 'text-white hover:bg-white/10 active:bg-white/20'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
