import React from 'react';

interface BookCoverProps {
  title?: string;
  subtitle?: string;
  color?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({ 
  title = "Leaflet Preview", 
  subtitle = "Interactive View",
  color = "bg-brand-900"
}) => {
  return (
    <div className={`w-full h-full ${color} flex flex-col items-center justify-center p-8 text-white shadow-inner border-l-8 border-white/10`}>
      <div className="border-2 border-white/30 w-full h-full flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-20 mix-blend-overlay"></div>
        <h1 className="font-serif text-4xl font-bold text-center mb-4 tracking-wider">{title}</h1>
        <div className="w-16 h-1 bg-white/50 mb-4"></div>
        <p className="font-sans text-sm uppercase tracking-widest opacity-80">{subtitle}</p>
      </div>
    </div>
  );
};